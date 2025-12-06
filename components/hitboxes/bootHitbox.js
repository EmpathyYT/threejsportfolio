import * as THREE from "three";

export default function setUpPowerOnHitBox(scene) {
	const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
	const material = new THREE.MeshBasicMaterial({
		color: 0x00ff00,
		visible: false,
	});
	const hitbox = new THREE.Mesh(geometry, material);
	hitbox.name = powerHitboxName;
	hitbox.position.set(0.7, 0.55, 0.65);
	scene.add(hitbox);
}

export const powerHitboxName = "power_on_hitbox";