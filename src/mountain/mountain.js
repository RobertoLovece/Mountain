import * as THREE from 'three';

export default class Mountain extends THREE.Mesh {
    constructor() {
        super();

        this.geometry = this.initGeometry();
        this.material = this.initMaterial();
        
    }

    initGeometry() {

        let geometry = new THREE.PlaneBufferGeometry(
            SIZE, 
            SIZE, 
            RESOLUTIONX, 
            RESOLUTIONZ
        );

        return geometry;
    }

    initMaterial() {



    }
}