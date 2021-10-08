import * as THREE from 'three';

//

import Rock from './mountain/texture/volcanic/base/Rock-Cliff-Volcanic-1K.png';
import RockAO from './mountain/texture/volcanic/ao/Rock-Cliff-Volcanic-1K-ao.png';
import RockHeight from './mountain/texture/volcanic/height/Rock-Cliff-Volcanic-1K-height.png';
import RockNormal from './mountain/texture/volcanic/normal/Rock-Cliff-Volcanic-1K-normal.png';
import RockRoughness from './mountain/texture/volcanic/roughness/Rock-Cliff-Volcanic-1K-roughness.png';

//

import Snow from './mountain/texture/mountain_snow/dunes/Snow-Dunes-1K.png';

//

export default class LoadTextures {
    constructor() {

        this.loader = new THREE.TextureLoader();
        
    }
    
    load() {

        this.rock = this.loader.load(Rock);
        this.rockAO = this.loader.load(RockAO);
        this.rockHeight = this.loader.load(RockHeight);
        this.rockNormal = this.loader.load(RockNormal);
        this.rockRoughness = this.loader.load(RockRoughness);

        this.snow = this.loader.load(Snow);

    }
}
