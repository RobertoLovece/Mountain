import * as THREE from 'three';

export default class Shape extends THREE.Mesh {
    // takes an x and y position and size
    constructor(x, y, size) {
        super();

        // created the mesh before you assign a position
        this.geometry = new THREE.BoxGeometry(size, size, size);
        this.material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

        // assign the position now mesh is created
        this.position.x = x;
        this.position.y = y;

    }

    // contains animation logic
    update() {
        this.rotation.x += 0.01;
        this.rotation.y += 0.01;
    }
}