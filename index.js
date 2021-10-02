import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

//

import Shape from './src/utilities/shape.js';

//

require('normalize.css/normalize.css');
require("./src/css/index.css");

//

let scene, camera, renderer;
let controls, container, shapes;
let stats;

//

window.onload = function () {

    initScene();
    initStats();

    initObjects();
    initControls();

    animate();

}

//

function initScene() {

    scene = new THREE.Scene();

    container = document.getElementById('canvas');

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

    camera.position.z = 5;
    camera.position.x = 4;
    camera.position.y = 3;
    camera.lookAt(0,0,0)

}

//

function initStats() {

    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    stats = new Stats();
    document.body.appendChild(stats.dom);

}

//

function initObjects() {

    shapes = [];

    shapes.push(
        new Shape(0, 0, 2)
    );

    shapes.forEach(function (shape) {
        scene.add(shape);
    });
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

    shapes.forEach(function (shape) {
        shape.update();
    });

    controls.update();
    stats.update();

    renderer.render(scene, camera);
}

//
// EVENT LISTENERS
//

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onClick, false);

//

function onWindowResize() {
    container = document.getElementById('canvas');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);
}

//

function onClick(e) {
    console.log(geometry.attributes.normal);
}   
