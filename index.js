import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// composer
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

// non libary js
import { FOGPARAMS } from './src/const.js'
import { initGUI } from './src/GUI.js'
import LoadTextures from './src/LoadTextures.js'
import Mountain from './src/mountain/mountain.js'
import Snow from './src/snow/snow.js'

require('normalize.css/normalize.css');
require("./src/css/index.css");

//

// scene
let scene, camera, renderer, composer;
// general
let container, stats, clock, controls;
// objects
let mountain, snow, textures;
// lights
let hemiLight, directionalLight, spotLight;

//

window.onload = function () {

    textures = new LoadTextures();

    const promises = [textures.load()];

    initScene();
    initPostProcessing();
    initFog();
    initLights();
    initControls();
    initStats();

    // ensure textures are fully loaded
    Promise.all(promises).then(() => {
        initObjects();
        initGUI(scene, composer, mountain, snow);
    
        initEventListeners();
        onWindowResize();

        animate();
    });

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

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);

}

//

function initPostProcessing() {

    composer = new EffectComposer(renderer);

    var renderPass = new RenderPass(scene, camera);

    var smaaPass = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());

    renderPass.renderToScreen = false;
    smaaPass.renderToScreen = true;

    composer.addPass(renderPass);
    composer.addPass(smaaPass);

}

//

function initLights() {

    renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping; //decent with exposure of 0.3 darker
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;

    // hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4); //orange
    hemiLight = new THREE.HemisphereLight(0x9db4ff, 0xedeeff, 4); // blue
    scene.add(hemiLight);

    spotLight = new THREE.SpotLight(0xffa95c, 4);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);
    scene.add(spotLight);

    directionalLight = new THREE.DirectionalLight( 0xffa95c, 2 );
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);
    
    directionalLight.position.x = -0.5;
    directionalLight.position.y = 0.5;
    directionalLight.position.z = -1;
    
    // scene.add(directionalLight);
}

function initFog() {

    scene.background = new THREE.Color(FOGPARAMS.fogHorizonColor);
    scene.fog = new THREE.FogExp2(FOGPARAMS.fogHorizonColor, FOGPARAMS.fogDensity);

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

    textures.rock.anisotropy = renderer.capabilities.getMaxAnisotropy();

    mountain = new Mountain(textures);
    scene.add(mountain);

    snow = new Snow();
    scene.add(snow)
}

//

function initControls() {

    controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;

    camera.position.set(-0.53, 1.6, -0.38);
    controls.target = new THREE.Vector3(0.0, 1.15, 0.02);

}

//

function animate() {
    requestAnimationFrame(animate);

    let deltaTime = clock.getDelta();

    stats.update();

    spotLight.position.set(
        camera.position.x + 1,
        camera.position.y + 1,
        camera.position.z + 1,
    );

    mountain.update(deltaTime);
    snow.update(deltaTime);

    // renderer.render(scene, camera);
    composer.render(scene, camera);
    controls.update();
}

//

// Event Listeners

function initEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('onmousemove', onMouseMove, false);
    window.addEventListener('click', onClick, false);
}

//

function onWindowResize() {
    container = document.getElementById('canvas');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    composer.setPixelRatio(window.devicePixelRatio);
    composer.setSize(width, height);

}

//

function onMouseMove(e) {
    //console.log();
}

//

function onClick(e) {
    console.log("Camera Pos: " + camera.position.x + ", " + camera.position.y + ", " + camera.position.z)
    console.log("Camera Looking: " + controls.target.x + ", " + controls.target.y + ", " + controls.target.z);
}

//

