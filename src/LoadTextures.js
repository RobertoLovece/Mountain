import * as THREE from 'three';

//

import Rock from './mountain/texture/volcanic/base/Rock-Cliff-Volcanic-1K.png';
import RockAO from './mountain/texture/volcanic/ao/Rock-Cliff-Volcanic-1K-ao.png';
import RockHeight from './mountain/texture/volcanic/height/Rock-Cliff-Volcanic-1K-height.png';
import RockNormal from './mountain/texture/volcanic/normal/Rock-Cliff-Volcanic-1K-normal.png';
import RockRoughness from './mountain/texture/volcanic/roughness/Rock-Cliff-Volcanic-1K-roughness.png';

//

import Snow from './mountain/texture/snow/dunes/Snow-Dunes-1K.png';

//

export default class LoadTextures {
    constructor() {

        const loader = new THREE.TextureLoader();

        this.rock = loader.load(Rock);
        this.rockAO = loader.load(RockAO);
        this.rockHeight = loader.load(RockHeight);
        this.rockNormal = loader.load(RockNormal);
        this.rockRoughness = loader.load(RockRoughness);

        this.snow = loader.load(Snow);
        
    }
}
