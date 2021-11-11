import * as THREE from 'three';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';

import { FOGPARAMS, SNOW } from './const.js'

export function initGUI(scene, mountain, snow) {

    const gui = new dat.GUI();
    const fogFolder = gui.addFolder('Fog')

    fogFolder.add(FOGPARAMS, "fogDensity", 0, 1.0).onChange(function () {
        scene.fog.density = FOGPARAMS.fogDensity;
    }); 

    fogFolder.add(FOGPARAMS, "fogNoiseFreq", 0, 0.01, 0.0012).onChange(function () {
        mountain.terrainShader.uniforms.fogNoiseFreq.value = FOGPARAMS.fogNoiseFreq;
    });

    fogFolder.add(FOGPARAMS, "fogNoiseSpeed", 0, 1000, 100).onChange(function () {
        mountain.terrainShader.uniforms.fogNoiseSpeed.value = FOGPARAMS.fogNoiseSpeed;
    });
    
    fogFolder.add(FOGPARAMS, "fogNoiseImpact", 0, 1).onChange(function () {
        mountain.terrainShader.uniforms.fogNoiseImpact.value = FOGPARAMS.fogNoiseImpact;
    });

    fogFolder.addColor(FOGPARAMS, "fogHorizonColor").onChange(function () {
        scene.fog.color.set(FOGPARAMS.fogHorizonColor);
        scene.background = new THREE.Color(FOGPARAMS.fogHorizonColor);
    });

    fogFolder.addColor(FOGPARAMS, "fogNearColor").onChange(function () {
        mountain.terrainShader.uniforms.fogNearColor = {
            value: new THREE.Color(FOGPARAMS.fogNearColor)
        };
    });

    const snowFolder = gui.addFolder('Snow')

    snowFolder.add(SNOW, "snowCoverage", 0, 1).onChange(function () {
        mountain.terrainShader.uniforms.snowCoverage.value = SNOW.snowCoverage;
    });

    snowFolder.add(SNOW, "snowSize", 1, 5).onChange(function () {
        snow.material.uniforms.size_multiplier.value = SNOW.snowSize;
    });

    gui.open();
}