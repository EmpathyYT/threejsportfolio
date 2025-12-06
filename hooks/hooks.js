import { powerHitboxName } from "../components/hitboxes/bootHitbox";
import { setUpBootText } from "../components/computerModelSetup";
import { cleanMaterial } from "../utils/extra";
import * as THREE from "three";

const raycaster = new THREE.Raycaster();

export function setUpHooks(controls, mouse, camera, scene, renderer) {
	preloadHooks();
	window.addEventListener("resize", () => window.existingResizeHandler(camera, renderer), false);
	window.addEventListener("click", () => window.existingClickHandler(controls, mouse, camera, scene), false);
	document.addEventListener("click", () => controlLockHook(controls));
	document.addEventListener("beforeunload", cleanMemory);
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
};

window.existingClickHandler = function (controls, mouse, camera, scene) {
	if (!controls.isLocked) return;

	mouse.x = 0;
	mouse.y = 0;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);

	if (intersects.length > 0) {
		if (intersects[0].object.name === powerHitboxName) {
			setUpBootText(scene);
		}
	}
};

function controlLockHook(controls) {
	controls.lock();
}

function cleanMemory() {
	scene.traverse((x) => {
		if (x.isMesh) {
			x.geometry.dispose();
			if (x.material.isMaterial) {
				cleanMaterial(x.material);
			} else {
				for (const material in x.material) {
					cleanMaterial(material);
				}
			}
		}
	});
	scene.clear();
}
