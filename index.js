import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// composer
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

//

import vertexShader from './src/shader/vertexShader.glsl';
import defaultNormalVertex from './src/shader/defaultnormal_vertex.glsl';
import mapFragment from './src/shader/map_fragment.glsl';

//

// import Rock from './src/texture/rock.png';
// import Rock from './src/texture/Rock-Cliff-1K.png';
// import Rock from './src/texture/Rock-Cliff-Snow-1K.png';
import Rock from './src/texture/Rock-Cliff-Volcanic-4K.png';
import Cloth from './src/texture/fabric_85_basecolor-1K.png';

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

const loader = new THREE.TextureLoader();
const rock = loader.load(Rock);
const cloth = loader.load(Cloth);

//

window.onload = function () {

    initScene();
    initLights();

    initPostProcessing();

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

}

//

function initLights() {

    renderer.toneMapping = THREE.ReinhardToneMapping;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping; //decent with exposure of 0.3 darker
    renderer.toneMappingExposure = 0.8;
    renderer.shadowMap.enabled = true;

    // hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4); //orange
    hemiLight = new THREE.HemisphereLight(0x9db4ff, 0xedeeff, 4); // blue
    // hemiLight = new THREE.HemisphereLight(0xFF4C4C, 0x4c0000, 4); // red
    scene.add(hemiLight);

    spotLight = new THREE.SpotLight(0xffa95c, 4);
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize = new THREE.Vector2(1024*4,1024*4);
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

    const SIZE = 3;
    const RESOLUTION = 256 * 4;

    geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE, RESOLUTION, RESOLUTION);

    rock.anisotropy = renderer.capabilities.getMaxAnisotropy();

    material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        map: rock,
        // roughness: 0.4,
        // map: cloth,
        // wireframe: true,
    });

    material.onBeforeCompile = shader => {

        // for debugging uncomment the top and bottom logs to see what glsl is injected
        // into the default planes shaders

        // vertex shader

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

        // fragment shader

        // console.log(shader.fragmentShader);

        shader.uniforms.snowAmount = { value: 0.3 };
        shader.fragmentShader = (
            'uniform float snowAmount;\n' + 
            shader.fragmentShader
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>', 
            mapFragment
        );

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
    container = document.getElementById('body');

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
    console.log(material.shader);
}

//

