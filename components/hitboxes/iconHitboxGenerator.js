const iconsData = import.meta.glob('/src/icons/*', {eager: true})
import * as THREE from 'three';

export default function* generateDesktopIcons() {
    const icons = Object.values(iconsData);
    for (const [index, icon] of icons.entries()) {
        const iconPath = icon.default;
        const iconName = iconPath.split('/').at(-1).split('.')[0];
        const texture = new THREE.TextureLoader().load(iconPath);

        const objSize = 22;

        const iconMesh = generateMesh(iconName, texture, objSize);
        iconMesh.userData.isIcon = true;
        iconMesh.name = iconName;

        const [x,z] = calculatePosition(index, 15, objSize, 4);
        iconMesh.position.set(x, -17, z);

        
        iconMesh.visible = false;

        yield iconMesh;
    }
    
}

function generateMesh(file, texture, objSize) {
    const material = new THREE.MeshStandardMaterial({
        color: 0x91C7B1,
        map: texture,
        emissiveMap: texture,
        emissive: 0xffffff,
        emissiveIntensity: 0.75
    })

    const geometry = new THREE.BoxGeometry(objSize, objSize, objSize);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = file;
    return mesh;
}

function calculatePosition(index, padding, boxSize, maxItemsZ) {
    const topZ = 220;
    const leftX = -135;
    const step = padding + boxSize; // full length since when you add the 2 halfs (front of current obj and rear of the other) that extend between this distance, you'll end up with a full length

    const zOffset = step * (index % maxItemsZ); //fast growing
    const z = topZ - zOffset;

    const coldIndex = Math.floor(index / maxItemsZ) //slow growing
    const x = (coldIndex * step) + leftX;

    return [x, z];
    
}