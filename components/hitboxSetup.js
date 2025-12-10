import { computerModelName } from "../constants/constants";
import { addChild } from "../utils/extra";
import * as hitboxes from "./hitboxes"
import generateDesktopIcons from "./hitboxes/iconHitboxGenerator";

export const hitboxesActive = [

];


export default function setUpHitBoxes(scene) {
	const values = Object.values(hitboxes);
	for (const value of values) {
		if (typeof value == 'function') {
			hitboxesActive.push(value(scene));
		}
	}
	for (const value of generateDesktopIcons()) {
		hitboxesActive.push(value);
		addChild(scene, value, computerModelName);
	}
	
}

export function toggleButtonVisibility() {
	for (const hitbox of hitboxesActive) {
		if (hitbox.userData.isIcon) {
			hitbox.visible = !hitbox.visible;			
		}
	}
}
