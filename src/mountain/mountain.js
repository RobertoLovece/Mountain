import * as THREE from 'three';

import {SIZE, RESOLUTIONX, RESOLUTIONZ, FOGPARAMS, SNOW, MOUNTAINROUGHNESS} from '../const.js';
import { fogParsVert, fogVert, fogParsFrag, fogFrag } from '../fog/shader/fogShader.js';

//

import vertexShader from './shader/vertexShader.glsl';
import defaultNormalVertex from './shader/defaultnormal_vertex.glsl';
import mapFragment from './shader/map_fragment.glsl'

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

    //

    initGeometry() {

        let geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE, RESOLUTIONX, RESOLUTIONZ);

        return geometry;
    }

    //

    initMaterial(textures) {

        // rock, rockAO, rockHeight, rockNormal, rockRoughness 
        let material = new THREE.MeshStandardMaterial({
            wireframe: true,
            side: THREE.FrontSide,
            roughness: MOUNTAINROUGHNESS,
            map: textures.rock,
            aoMap: textures.rockAO,
            displacementMap: textures.rockHeight,
            normalMap: textures.rockNormal,
            roughnessMap: textures.rockRoughness,
        });

        material.onBeforeCompile = shader => {
    
            // console.log(shader.vertexShader)

            // fbm
    
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

            // fog

            shader.vertexShader = shader.vertexShader.replace(
                '#include <fog_pars_vertex>',
                fogParsVert
            );
            shader.vertexShader = shader.vertexShader.replace(
                '#include <fog_vertex>',
                fogVert
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <fog_pars_fragment>',
                fogParsFrag
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <fog_fragment>',
                fogFrag
            );
    
            shader.uniforms.fogNearColor = { value: new THREE.Color( FOGPARAMS.fogNearColor ) };
            shader.uniforms.fogNoiseFreq = { value: FOGPARAMS.fogNoiseFreq };
            shader.uniforms.fogNoiseSpeed = { value: FOGPARAMS.fogNoiseSpeed };
            shader.uniforms.fogNoiseImpact = { value: FOGPARAMS.fogNoiseImpact };
            shader.uniforms.time = { value: 0 };

            // snow
            
            shader.uniforms.snowCoverage = { value: SNOW.snowCoverage };
            shader.uniforms.snowTexture = { type: "t", value: textures.snow };
    
            shader.fragmentShader = (
                'uniform float snowCoverage;\n' + 
                'uniform sampler2D snowTexture;\n' + 
                shader.fragmentShader
            );
    
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>', 
                mapFragment
            );

            this.terrainShader = shader;
    
        }

        return material;

    }

    //

    update(deltaTime) {
        if (this.terrainShader) {
            this.terrainShader.uniforms.time.value += deltaTime;
        }
    }
}