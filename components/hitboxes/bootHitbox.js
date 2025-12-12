import * as THREE from "three";
import { setUpBootText } from "../computerModelSetup";
import { addChild } from "../../utils/extra";
import { computerModelName } from "../../constants/constants";
import { toggleButtonVisibility } from "../hitboxSetup";

export default function setUpPowerOnHitBox(scene) {
	const geometry = new THREE.BoxGeometry(25, 25, 25);
	const material = new THREE.MeshBasicMaterial({
		color: 0x00ff00,
		visible: false,
	});
	const hitbox = new THREE.Mesh(geometry, material);
	hitbox.name = powerHitboxName;	
	hitbox.position.set(-250, -176, 119);
	
	hitbox.userData.onClick = bootLoadingHook;
	addChild(scene, hitbox, computerModelName);
	return hitbox;
}


async function bootLoadingHook(obj) {
	let screenMeshMaterial = obj.screenMeshMaterial;

	if (obj.abortBoot == null) {
		[obj.abortBoot, obj.screenMeshMaterial] = await setUpBootText();
	} else {
		const dummyTexture = new THREE.Texture();

		obj.abortBoot.abort();
		screenMeshMaterial.color = new THREE.Color(0x000000);
		screenMeshMaterial.emissive = new THREE.Color(0x000000);
		
		screenMeshMaterial.map.dispose();

		screenMeshMaterial.map = dummyTexture;
		screenMeshMaterial.emissiveMap = dummyTexture;
		if (obj.isOnDesktop) {
			toggleButtonVisibility();
		}
		obj.abortBoot = null;
	}
}

export const powerHitboxName = "Power Button";