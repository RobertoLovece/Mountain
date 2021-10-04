import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//

import vertexShader from './src/mountain/vertexShader.glsl';
import fragmentShader from './src/mountain/fragmentShader.glsl';

//

require('normalize.css/normalize.css');
require("./src/css/index.css");

//

let scene, camera, renderer;
let container, plane, geometry, material;
let stats, clock, controls;
let hemiLight, directionalLight, spotLight;

//

window.onload = function () {

    initScene();

    initStats();
    initObjects();
    initControls();

    onWindowResize();
    animate();

}

//

function initScene() {

    scene = new THREE.Scene();

    container = document.getElementById('body');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
    );

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);

    camera.position.set(0, 1, 1);

    // hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
    // scene.add(hemiLight);

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;

    spotLight = new THREE.SpotLight(0xffa95c, 4);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize = new THREE.Vector2(1024*4,1024*4);
    scene.add(spotLight);

}

//

function initStats() {

    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    clock = new THREE.Clock();

}

//

function initObjects() {

    const SIZE = 3;
    const RESOLUTION = 256 * 2;

    geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE, RESOLUTION, RESOLUTION);

    // material = new THREE.MeshStandardMaterial({
    //     side: THREE.FrontSide,
    //     // wireframe: true,
    // });
    material = new THREE.MeshNormalMaterial({
        side: THREE.FrontSide,
        // wireframe: true,
    });

    material.onBeforeCompile = shader => {
        console.log(shader.vertexShader)
        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            `
            // float random (in vec2 st) {
            //     return fract(sin(dot(st.xy,
            //                          vec2(12.9898,78.233)))*
            //         43758.5453123);
            // }
            float random (in vec2 st) {
                return fract(sin(dot(st.xy,
                                     vec2(12.9898,78.233)))*
                    43758.5453123);
            }

            // Based on Morgan McGuire @morgan3d
            // https://www.shadertoy.com/view/4dS3Wd
            float noise (in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
            
                // Four corners in 2D of a tile
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
            
                vec2 u = f * f * (vec2(3.0) - 2.0 * f);
            
                return mix(a, b, u.x) +
                        (c - a)* u.y * (1.0 - u.x) +
                        (d - b) * u.x * u.y;
            }
            
            #define OCTAVES 50
            float fbm (in vec2 st) {
                // Initial values
            
                float value = 0.0;
                float amplitude = .5;
                float frequency = 1.;
            
                // Loop of octaves
                for (int i = 0; i < OCTAVES; i++) {
                    value += amplitude * abs(noise(st));
                    st *= 2.;
                    amplitude *= .5;
                }
            
                return value;
            }  
            
            // the function which defines the displacement
            float displace(vec3 point) {
                return fbm(point.xy);
            }

            vec3 orthogonal(vec3 v) {
                return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
                : vec3(0.0, -v.z, v.y));
            }
            
            void main() {
                vec3 displacedPosition = vec3(position.x, position.y, displace(position));

                float offset = ${SIZE / RESOLUTION};
                vec3 tangent = orthogonal(normal);
                vec3 bitangent = normalize(cross(normal, tangent));
                vec3 neighbour1 = position + tangent * offset;
                vec3 neighbour2 = position + bitangent * offset;
                vec3 displacedNeighbour1 = vec3(neighbour1.x, neighbour1.y, displace(neighbour1));
                vec3 displacedNeighbour2 = vec3(neighbour2.x, neighbour2.y, displace(neighbour2));
          
                // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
                vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
                vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
          
                // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
                vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
            
            `
        )

        shader.vertexShader = shader.vertexShader.replace(
            '#include <defaultnormal_vertex>',
            `vec3 transformedNormal = displacedNormal;
            
            #ifdef USE_INSTANCING
	        // this is in lieu of a per-instance normal-matrix
	        // shear transforms in the instance matrix are not supported
	        mat3 m = mat3( instanceMatrix );
	        transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	        transformedNormal = m * transformedNormal;
            #endif
            
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`
        )

        shader.vertexShader = shader.vertexShader.replace(
            '#include <displacementmap_vertex>',
            `transformed = displacedPosition;`
        )

        console.log(shader.vertexShader)
    }

    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    plane.castShadows = true;
    plane.recieveShadows = true;

    plane.rotation.set(-Math.PI / 2, 0, 0);
    plane.scale.set(1.2, 1.2, 2);
    geometry.computeFaceNormals();
    console.log(geometry.attributes.normal);

}

//

function initControls() {

    controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;

}

//

function animate() {
    requestAnimationFrame(animate);

    stats.update();

    spotLight.position.set(
        camera.position.x + 1,
        camera.position.y + 1,
        camera.position.z + 1,
    );

    renderer.render(scene, camera);
    controls.update();
}

//

// Event Listeners
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('onmousemove', onMouseMove, false);
window.addEventListener('click', onClick, false);

//

function onWindowResize() {
    container = document.getElementById('body');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

}

//

function onMouseMove(e) {
    //console.log();
}

//

function onClick(e) {
    // console.log(material.shader);
}

//

