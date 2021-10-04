import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import State from 'controls-state'
import wrapGUI from 'controls-gui'

//

import { noise, monkeyPatch, fbm } from './src/utilities/util.js';

//

require('normalize.css/normalize.css');
require("./src/css/index.css");

// init three.js
const webgl = initWebGLApp()

// init stats.js
const stats = initStats()

// init the controls-state panel
const controls = initControls({
    diffuse: '#5B82A6',
    roughness: 0.5,
    noise: {
        amplitude: 0.4,
        frequency: State.Slider(0.5, { max: 2 }),
        speed: State.Slider(0.3, { max: 2 }),
    }
})


const SIZE = 4
const RESOLUTION = 256

const geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE, RESOLUTION, RESOLUTION).rotateX(-Math.PI / 2)

const material = new THREE.ShaderMaterial({
    lights: true,
    side: THREE.DoubleSide,
    extensions: {
        derivatives: true,
    },

    defines: {
        STANDARD: '',
        PHYSICAL: '',
    },

    uniforms: {
        ...THREE.ShaderLib.physical.uniforms,
        ...controls.toUniforms,
        ...controls.noise.toUniforms,
        time: { value: 0 },
    },

    vertexShader: monkeyPatch(THREE.ShaderChunk.meshphysical_vert, {
        header: `
      uniform float time;
      uniform float amplitude;
      uniform float speed;
      uniform float frequency;

      ${noise()}
      ${fbm()}
      
      // the function which defines the displacement
      float displace(vec3 point) {
        // return noise(vec3(point.x * frequency, point.z * frequency, time * speed)) * amplitude;
        return fbm(point.xy);
      }
      
      // http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
      vec3 orthogonal(vec3 v) {
        return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
        : vec3(0.0, -v.z, v.y));
      }
    `,
        // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
        main: `
      vec3 displacedPosition = position + normal * vec3(1.0, displace(position), 1.0);


      float offset = ${SIZE / RESOLUTION};
      vec3 tangent = orthogonal(normal);
      vec3 bitangent = normalize(cross(normal, tangent));
      vec3 neighbour1 = position + tangent * offset;
      vec3 neighbour2 = position + bitangent * offset;
      vec3 displacedNeighbour1 = neighbour1 + normal * displace(neighbour1);
      vec3 displacedNeighbour2 = neighbour2 + normal * displace(neighbour2);

      // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
      vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
      vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;

      // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
      vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
    `,

        '#include <defaultnormal_vertex>': THREE.ShaderChunk.defaultnormal_vertex.replace(
            // transformedNormal will be used in the lighting calculations
            'vec3 transformedNormal = objectNormal;',
            `vec3 transformedNormal = displacedNormal;`
        ),

        // transformed is the output position
        '#include <displacementmap_vertex>': `
      transformed = displacedPosition;
    `,
    }),

    fragmentShader: THREE.ShaderChunk.meshphysical_frag,
})


const plane = new THREE.Mesh(geometry, material)
webgl.scene.add(plane)

// LIGHTS
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.position.set(-0.5, 10, -10)
webgl.scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
webgl.scene.add(ambientLight)


function update(ms) {
    const time = ms * 0.001
    stats.begin()

    // update the time uniform
    plane.material.uniforms.time.value = time


    webgl.render()
    webgl.orbitControls.update()

    stats.end()
    requestAnimationFrame(update)
}
requestAnimationFrame(update)

//------------------------
// BOILERPLATE BELOW
//------------------------

function initWebGLApp() {
    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
    })

    renderer.setClearColor('#111', 1)

    const fov = 45
    const near = 0.01
    const far = 100
    const camera = new THREE.PerspectiveCamera(fov, 1, near, far)

    // move the camera back
    camera.position.set(-2, 3, 5)

    const scene = new THREE.Scene()

    const orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.enableDamping = true

    function resize() {
        const width = window.innerWidth
        const height = window.innerHeight

        renderer.setSize(width, height)
        renderer.setPixelRatio(window.devicePixelRatio) // 2 in case of retinas

        if (camera.isPerspectiveCamera) {
            camera.aspect = width / height
        }
        camera.updateProjectionMatrix()
    }

    function render() {
        renderer.render(scene, camera)
    }

    // initial resize and render
    resize()
    render()

    // add resize listener
    window.addEventListener('resize', resize)

    return {
        canvas,
        renderer,
        camera,
        orbitControls,
        scene,
        resize,
        render,
    }
}

function initStats() {
    const stats = new Stats()
    stats.showPanel(0)
    document.body.appendChild(stats.dom)
    return stats
}


function initControls(controlsObject, options = {}) {
    const controls = wrapGUI(State(controlsObject), { expanded: !options.closeControls })

    // add the custom controls-gui styles
    const styles = `
    [class^="controlPanel-"] [class*="__field"]::before {
      content: initial !important;
    }
    [class^="controlPanel-"] [class*="__labelText"] {
      text-indent: 6px !important;
    }
    [class^="controlPanel-"] [class*="__field--button"] > button::before {
      content: initial !important;
    }
    `

    const style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = styles
    document.head.appendChild(style)

    // add .toUniforms property to be used in materials
    Object.keys(controlsObject).forEach((key) => {
        if (controls[key].$field?.type !== 'section') {
            return
        }

        const section = controls[key]

        // make it non-enumerable
        Object.defineProperty(section, 'toUniforms', {
            value: {},
        })

        Object.keys(section).forEach((property) => {
            section.toUniforms[property] = { value: section[property] }
        })

        section.$onChange((event) => {
            section.toUniforms[event.name].value = event.value
        })
    })


    // add .toUniforms property at the root level
    Object.defineProperty(controls, 'toUniforms', {
        value: {},
    })

    Object.keys(controlsObject).forEach((key) => {
        if (controls[key].$field?.type === 'section') {
            return
        }

        // support only colors and numbers for now
        const value = typeof controls[key] === 'string' ? new THREE.Color(controls[key]) : controls[key]

        controls.toUniforms[key] = { value }
    })

    controls.$onChange((event) => {
        // return if it's a child
        if (event.fullPath.includes('.')) {
            return
        }

        // support only colors and numbers for now
        const value = typeof event.value === 'string' ? new THREE.Color(event.value) : event.value

        controls.toUniforms[event.name].value = value
    })

    return controls
}