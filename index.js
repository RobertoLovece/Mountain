import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//

import vertexShader from './src/shader/vertexShader.glsl';
import defaultNormalVertex from './src/shader/defaultnormal_vertex.glsl';
import fragmentShader from './src/shader/fragmentShader.glsl';

//

require('normalize.css/normalize.css');
require("./src/css/index.css");

//

// scene
let scene, camera, renderer, composer;
// general
let container, stats, clock, controls;
// objects
let plane, geometry, material;
// lights
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
    const RESOLUTION = 1024;

    geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE, RESOLUTION, RESOLUTION);

    material = new THREE.MeshNormalMaterial({
        side: THREE.FrontSide,
        // wireframe: true,
    });

    material.onBeforeCompile = shader => {

        // for debugging uncomment the top and bottom logs to see what glsl is injected
        // into the default planes shaders
        // console.log(shader.vertexShader)

        // uniforms
        shader.uniforms.size = { value: SIZE };
        shader.uniforms.resolution = { value: RESOLUTION };
        shader.vertexShader = (
            'uniform float size;\n' + 
            'uniform float resolution;\n' + 
            shader.vertexShader
        );

        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            vertexShader
        )

        shader.vertexShader = shader.vertexShader.replace(
            '#include <defaultnormal_vertex>',
            defaultNormalVertex
        )

        shader.vertexShader = shader.vertexShader.replace(
            '#include <displacementmap_vertex>',
            `transformed = displacedPosition;`
        )

        // console.log(shader.vertexShader)
    }

    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    plane.castShadows = true;
    plane.recieveShadows = true;

    plane.rotation.set(-Math.PI / 2, 0, 0);
    plane.scale.set(1.2, 1.2, 2);

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

