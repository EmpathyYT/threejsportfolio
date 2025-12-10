import { cleanScene, removeTextFromHitMarket, setTextToHitMarker } from "../utils/extra";
import { hitboxesActive } from "../components/hitboxSetup";
import * as THREE from "three";

const raycaster = new THREE.Raycaster();
let aimedAt;
let hookData = {
	abortBoot: null,
	screenMeshMaterial: null
}

export function setUpHooks(controls, mouse, camera, scene, renderer) {
	preloadHooks();
	window.addEventListener(
		"resize",
		() => window.existingResizeHandler(camera, renderer),
		false
	);
	window.addEventListener(
		"click",
		() => window.existingClickHandler(controls, mouse, camera),
		false
	);
	document.addEventListener("click", () => controlLockHook(controls));
	document.addEventListener("beforeunload", () => cleanScene(scene));
}

function preloadHooks() {
	if (window.existingLoopId) {
		cancelAnimationFrame(window.existingLoopId);
	}

	const oldCanvas = document.querySelector("canvas");
	if (oldCanvas) {
		oldCanvas.remove();
	}

	if (window.existingResizeHandler) {
		window.removeEventListener("resize", window.existingResizeHandler);
	}
	if (window.existingClickHandler) {
		window.removeEventListener("click", window.existingClickHandler);
	}
}

window.existingResizeHandler = function (camera, renderer) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.existingClickHandler = function (controls, mouse, camera) {
	if (!controls.isLocked) return;

	const intersects = raycaster.intersectObjects(hitboxesActive, true);

	if (intersects.length > 0) {
		const object = intersects[0].object;
		if (object.userData.onClick) {
			object.userData.onClick(hookData);
		}
	}
};

function controlLockHook(controls) {
	controls.lock();
}

export function checkForHitboxesAimedAt(controls, mouse, camera) {
	if (!controls.isLocked) return;

	mouse.x = 0;
	mouse.y = 0;

	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(hitboxesActive.filter(x => x.visible));
	if (intersects.length > 0) {

		const object = intersects[0].object;

		if (object === aimedAt) return;

		aimedAt = object;
		setTextToHitMarker(object.name.replaceAll('%20', ' '));
	} else if (aimedAt != null) { // logically this shouldn't work but it's a dirty short hand since the if statements run in order
		aimedAt = null;
		removeTextFromHitMarket();
	}
}

