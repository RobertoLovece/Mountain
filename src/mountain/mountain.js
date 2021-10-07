import * as THREE from 'three';

import {SIZE, RESOLUTIONX, RESOLUTIONZ} from '../const.js'

//

import vertexShader from './shader/vertexShader.glsl';
import defaultNormalVertex from './shader/defaultnormal_vertex.glsl';
import mapFragment from './shader/map_fragment.glsl';

//

export default class Mountain extends THREE.Mesh {
    constructor(textures) {

        super();

        this.geometry = this.initGeometry();
        this.material = this.initMaterial(textures);

        this.castShadows = true;
        this.recieveShadows = true;

        this.rotation.set(-Math.PI / 2, 0, 0);
        this.scale.set(1.2, 1.2, 2.);

    }

    initGeometry() {

        let geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE, RESOLUTIONX, RESOLUTIONZ);

        return geometry;
    }

    initMaterial(textures) {

        // rock, rockAO, rockHeight, rockNormal, rockRoughness 
        let material = new THREE.MeshStandardMaterial({
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

        return material;

    }
}