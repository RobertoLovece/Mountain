import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//

import vertexShader from '../src/mountain/vertexShader.glsl';
import fragmentShader from '../src/mountain/fragmentShader.glsl';

//

require('normalize.css/normalize.css');
require("../src/css/index.css");

//

let scene, camera, renderer;
let container, plane, geometry, material;
let stats, clock, controls;
let hemiLight;

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

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);

    camera.position.set(0,1,1); 

    hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
    scene.add(hemiLight);

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;

}

//

function initStats() {

    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    stats = new Stats();
    document.body.appendChild(stats.dom);

    clock = new THREE.Clock();

}

//

function initObjects() {

    geometry = new THREE.PlaneBufferGeometry( 3, 3 ,500,500);

    material = new THREE.MeshNormalMaterial( {
        side: THREE.DoubleSide,
        wireframe: true,
        // lights: true
    });

    material.onBeforeCompile = shader => {
        console.log(shader.vertexShader)
        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            `float random (in vec2 st) {
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
            
            #define OCTAVES 100
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
            
            void main() {

            `
        )

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            float z = fbm(position.xy);
            vec3 transformed = vec3( position.xy, z );
            `
        )

        console.log(shader.vertexShader)
    }

    plane = new THREE.Mesh( geometry, material );
    scene.add( plane );

    plane.rotation.set(-Math.PI/2 , 0, 0);
    plane.scale.set(1.2,1.2,2);
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
    
    renderer.setPixelRatio( window.devicePixelRatio );
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

