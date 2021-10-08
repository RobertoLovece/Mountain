import * as THREE from 'three';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';

import { FOGPARAMS, SNOW } from './const.js'

export function initGUI(scene, mountain, snow) {

    var gui = new dat.GUI();

    gui.add(FOGPARAMS, "fogDensity", 0, 1.0).onChange(function () {
        scene.fog.density = FOGPARAMS.fogDensity;
    });

    gui.addColor(FOGPARAMS, "fogHorizonColor").onChange(function () {
        scene.fog.color.set(FOGPARAMS.fogHorizonColor);
        scene.background = new THREE.Color(FOGPARAMS.fogHorizonColor);
    });

    gui.addColor(FOGPARAMS, "fogNearColor").onChange(function () {
        mountain.terrainShader.uniforms.fogNearColor = {
            value: new THREE.Color(FOGPARAMS.fogNearColor)
        };
    });

    gui.add(FOGPARAMS, "fogNoiseFreq", 0, 0.01, 0.0012).onChange(function () {
        mountain.terrainShader.uniforms.fogNoiseFreq.value = FOGPARAMS.fogNoiseFreq;
    });

    gui.add(FOGPARAMS, "fogNoiseSpeed", 0, 1000, 100).onChange(function () {
        mountain.terrainShader.uniforms.fogNoiseSpeed.value = FOGPARAMS.fogNoiseSpeed;
    });
    
    gui.add(FOGPARAMS, "fogNoiseImpact", 0, 1).onChange(function () {
        mountain.terrainShader.uniforms.fogNoiseImpact.value = FOGPARAMS.fogNoiseImpact;
    });

    gui.add(SNOW, "snowCoverage", 0, 1).onChange(function () {
        mountain.terrainShader.uniforms.snowCoverage.value = SNOW.snowCoverage;
    });

    gui.add(SNOW, "snowSize", 1, 5).onChange(function () {
        snow.material.uniforms.size_multiplier.value = SNOW.snowSize;
    });

    gui.open();
}