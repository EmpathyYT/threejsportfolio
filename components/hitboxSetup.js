import { computerModelName } from "../constants/constants";
import { addChild } from "../utils/extra";
import * as hitboxes from "./hitboxes";
import generateDesktopIcons from "./hitboxes/iconHitboxGenerator";
import gsap from "gsap";
export const hitboxesActive = [];

let iconTween;

let icons = hitboxesActive.filter((x) => x.userData.isIcon);
let iconScales = icons.map((x) => x.scale);

export default function setUpHitBoxes(scene) {
	const values = Object.values(hitboxes);
	for (const value of values) {
		if (typeof value == "function") {
			hitboxesActive.push(value(scene));
		}
	}
	for (const value of generateDesktopIcons()) {
		hitboxesActive.push(value);
		addChild(scene, value, computerModelName);
	}
	iconTween = setUpIconTween();
}

export async function toggleButtonVisibility() {
	if (iconScales.some(x => x.x > 0)) {
		await hideIcons();
	} else {
		await iconTween.restart();
	}
}

async function hideIcons() {
	await gsap.to(iconScales, {
		x: 0,
		y: 0,
		z: 0,
		duration: 1,
		stagger: 0.1,
		ease: "power3.inOut",
		onComplete: () => {
			icons.forEach((x) => (x.visible = false));
		}
	});
}

function setUpIconTween() {
	icons = hitboxesActive.filter((x) => x.userData.isIcon);
	iconScales = icons.map((x) => x.scale);
	gsap.set(iconScales, { x: 0, y: 0, z: 0 });
	const tween = gsap.to(iconScales, {
		x: 1,
		y: 1,
		z: 1,
		paused: true, // they start by default
		duration: 1,
		stagger: 0.1,
		ease: "back.out(1.7)",
		onStart: () => {
			icons.forEach((x) => (x.visible = true));
		},
	});
	return tween;
}
