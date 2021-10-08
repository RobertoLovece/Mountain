import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

//

require('normalize.css/normalize.css');
require("../src/css/index.css");

//

let scene, camera, renderer;
let controls, container;
let stats;
let geometry, material, mesh;
let count = 0;

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

    camera.position.z = 5;
    camera.position.x = 4;
    camera.position.y = 3;
    camera.lookAt(0, 0, 0)

}

//

function initStats() {

    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    stats = new Stats();
    document.body.appendChild(stats.dom);

}

//

function initObjects() {

    geometry = new THREE.PlaneBufferGeometry(5, 5, 256 * 4, 256 * 4).rotateZ(-Math.PI/2);
    // modify geometry

    var positionAttribute = geometry.attributes.position;
    console.log(positionAttribute);

    for (var i = 0; i < positionAttribute.count; i++) {

        // access single vertex (x,y,z)

        var x = positionAttribute.getX(i);
        var y = positionAttribute.getY(i);
        var z = positionAttribute.getZ(i);
        
        // console.log(x + ", " + y)
        let n = fractalBrownianMotion(new THREE.Vector2(x,y));
        z = n;

        positionAttribute.setXYZ(i, x, y, z);

    }
    
    //

    geometry.computeVertexNormals();

    //

    material = new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide, 
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.rotation.set(-Math.PI/2 , 0, 0);

}

//

function fractalBrownianMotion(vec2) {

    const OCTAVES = 10;

    var amplitude = 1.5;
    var frequency = 1.0;
    
    var value = 0.0;

    for (let i = 0; i < OCTAVES ; i++) {

        // console.log(vec2.x + ", " + vec2.y + " : " + count)
        value = value + (amplitude * Math.abs(noise(vec2)));

        vec2.multiplyScalar(2.0);

        amplitude *= 0.5;

        count++;
    }
    
    return value;
}

//

function noise(vec2) {

    let x = vec2.x;
    let y = vec2.y;

    // i floor(vec2)
    let i = vec2.clone().floor();
    // console.log(i)

    // f fract(vec2)
    let f = new THREE.Vector2(
        x - i.x,
        y - i.y
    );

    // // Four corners in 2D of a tile
    let a = random(i.x, i.y);
    let b = random(i.x + 1, i.y);
    let c = random(i.x, i.y + 1);
    let d = random(i.x + 1, i.y + 1);
    // Four corners in 2D of a tile

    // console.log(a + ", " + b + ", " + c + ", " + d);

    // f^2
    let fSquared = f.clone().multiply( f.clone() );

    let f2 = f.clone().multiplyScalar( 2.0 );
    let fEnd = new THREE.Vector2().subVectors( 
        new THREE.Vector2(3.0, 3.0), f2
    );

    // (u = f * f * (3.0 - 2.0 * f))
    let u = fSquared.multiply(fEnd);

    // mix(a, b, u.x) +
    //         (c - a)* u.y * (1.0 - u.x) +
    //         (d - b) * u.x * u.y;
    // mix(a, b, u.x) = a * (1 - u.x) + b * u.x
    let mix = (a * (1 - u.x)) + (b * u.x);
    let final = mix + ((c - a) * u.y * (1.0 - u.x) + ((d - b) * u.x * u.y));

    return final;
};

//

function random(x, y) {

    let dot = (x * 12.9898) + (y * 78.233);

    // console.log(dot)
    let sin = Math.sin((dot * 43750.5453123));

    let fract = sin - Math.floor(sin);

    return fract;

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
    container = document.getElementById('body');

    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
}

//

function onClick(e) {
    console.log(geometry.attributes.position);
}
