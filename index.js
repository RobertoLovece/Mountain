import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// composer
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

//

import vertexShader from './src/mountain/shader/vertexShader.glsl';
import defaultNormalVertex from './src/mountain/shader/defaultnormal_vertex.glsl';
import mapFragment from './src/mountain/shader/map_fragment.glsl';

//

import {SIZE, RESOLUTIONX, RESOLUTIONZ} from './src/const.js'

//

import LoadTextures from './src/LoadTextures.js'

require('normalize.css/normalize.css');
require("./src/css/index.css");

//

// scene
let scene, camera, renderer, composer;
// general
let container, stats, clock, controls, textures;
// objects
let mountain, geometry, material;
// lights
let hemiLight, directionalLight, spotLight;

//

window.onload = function () {

    textures = new LoadTextures();

    initScene();
    initLights();

    initPostProcessing();

    initStats();
    initObjects(); // makes this execute after loadTextures
    initControls();
    onWindowResize();
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

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);

}

//

function initLights() {

    renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping; //decent with exposure of 0.3 darker
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;

    // hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4); //orange
    hemiLight = new THREE.HemisphereLight(0x9db4ff, 0xedeeff, 4); // blue
    // hemiLight = new THREE.HemisphereLight(0xFF4C4C, 0x4c0000, 4); // red
    scene.add(hemiLight);

    spotLight = new THREE.SpotLight(0xffa95c, 4);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize = new THREE.Vector2(1024*2,1024*2);
    scene.add(spotLight);
}

//

function initPostProcessing() {

    composer = new EffectComposer(renderer);

    var renderPass = new RenderPass(scene, camera);

    var smaaPass = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio() );

    renderPass.renderToScreen = false;
    smaaPass.renderToScreen = true;

    composer.addPass(renderPass);
    composer.addPass(smaaPass);

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

    geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE, RESOLUTIONX, RESOLUTIONZ);

    textures.rock.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // rock, rockAO, rockHeight, rockNormal, rockRoughness 
    material = new THREE.MeshStandardMaterial({
        side: THREE.FrontSide,
        map: textures.rock,
        aoMap: textures.rockAO,
        displacementMap: textures.rockHeight,
        normalMap: textures.rockNormal, 
        roughnessMap: textures.rockRoughness,
        roughness: 0.7,
        // wireframe: true,
    });

    material.onBeforeCompile = shader => {

        // for debugging uncomment the top and bottom logs to see what glsl is injected
        // into the default planes shaders

        // vertex shader

        // console.log(shader.vertexShader)

        // uniforms
        shader.uniforms.size = { value: SIZE };
        shader.uniforms.resolution = { value: RESOLUTIONX }; // does fact both aspects of RESOLUTION
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

        // fragment shader

        // console.log(shader.fragmentShader);

        shader.uniforms.snowAmount = { value: 0.3 };
        shader.uniforms.snowTexture = { type: "t", value: textures.snow };

        shader.fragmentShader = (
            'uniform float snowAmount;\n' + 
            'uniform sampler2D snowTexture;\n' + 
            shader.fragmentShader
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>', 
            mapFragment
        );

        // console.log(shader.fragmentShader);

    }

    mountain = new THREE.Mesh(geometry, material);
    scene.add(mountain);

    mountain.castShadows = true;
    mountain.recieveShadows = true;

    mountain.rotation.set(-Math.PI / 2, 0, 0);
    mountain.scale.set(1.2, 1.2, 2.);

}

//

function initControls() {

    controls = new OrbitControls(camera, renderer.domElement);

    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;

    // camera.lookAt(0, 0, 0);
    controls.target = new THREE.Vector3(0, 1.1, 0);
    camera.position.set(-0.7, 1.6, -0.3);

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

    // renderer.render(scene, camera);
    composer.render(scene, camera);
    controls.update();
}

//

// Event Listeners
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('onmousemove', onMouseMove, false);
window.addEventListener('click', onClick, false);

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
    console.log("Camera Looking: " + controls.target.x + ", " + controls.target.y + ", " + controls.target.z );
}

//

