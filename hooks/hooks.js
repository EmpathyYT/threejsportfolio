import {
	cleanScene,
	removeTextFromHitMarker,
	setUpToolTips,
} from "../utils/extra";
import { hitboxesActive } from "../components/hitboxSetup";
import {
	handleToolTips,
	moveCameraToPosition,
	scaleIcon,
	turnOffPc,
} from "../utils/pcUitls";
import pagingInstance from "../paging/pagingController.js";
import * as THREE from "three";

const raycaster = new THREE.Raycaster();
let aimedAt;
let hookData = {
	abortBoot: null,
	screenMeshMaterial: null,
	isOnDesktop: false,
};
let isOnDesktop = hookData.isOnDesktop;
let transition = {
	state: false,
};

export function setUpHooks(
	controls,
	camera,
	dummyCamera,
	scene,
	renderer,
	mouse
) {
	preloadHooks();
	window.addEventListener(
		"resize",
		() => window.existingResizeHandler(camera, renderer),
		false
	);
	window.addEventListener(
		"click",
		(event) => window.existingClickHandler(event, controls, renderer),
		false
	);
	document.addEventListener("click", () => controlLockHook(controls));
	document.addEventListener("beforeunload", () => cleanScene(scene));
	window.addEventListener("toggle-desktop", () =>
		handleChangeDesktopMode(camera, dummyCamera, controls)
	);
	window.addEventListener("mousemove", (mouseEvent) =>
		trackMousePosition(mouseEvent, mouse,)
	);
	handleXButtonInSlide();
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

window.existingClickHandler = function (event, controls, renderer) {
	if (!controls.isLocked && !isOnDesktop) return;
	if (event.target != renderer.domElement) return;
	if (transition.state) return;
	const intersects = raycaster.intersectObjects(hitboxesActive, true);

	if (intersects.length > 0) {
		const object = intersects[0].object;
		if (object.userData.onClick) {
			object.userData.onClick(hookData);
		}
	}
};

function controlLockHook(controls) {
	if (!isOnDesktop) {
		controls.lock();
	}
}

function trackMousePosition(mouseEvent, data) {
	data.rawX = mouseEvent.clientX;
	data.rawY = mouseEvent.clientY;

	if (!isOnDesktop) {
		data.x = 0;
		data.y = 0;
	} else {
		data.x = (mouseEvent.clientX / window.innerWidth) * 2 - 1; // turn from 0,width to 0,1 then 0,2 then -1,1
		data.y = -((mouseEvent.clientY / window.innerHeight) * 2 - 1); // y is flipped in dom
	}
}

async function handleChangeDesktopMode(camera, dummyCamera, controls) {
	isOnDesktop = !isOnDesktop;
	hookData.abortBoot = null;
	transition.state = true;
	if (isOnDesktop) {
		removeTextFromHitMarker();
		controls.unlock();
	} else {
		await turnOffPc(hookData.screenMeshMaterial, true);
		controls.lock();
	}

	setUpToolTips(isOnDesktop);
	moveCameraToPosition(camera, dummyCamera, isOnDesktop, transition);
}

function handleXButtonInSlide() {
	const xButton = document.getElementById("xButton");
	xButton.addEventListener("click", () => pagingInstance.closePage());
}

export function checkForHitboxesAimedAt(mouse, camera) {
	if (transition.state || window.isOnSlide) return;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(
		hitboxesActive.filter((x) => x.visible)
	);
	if (intersects.length > 0) {
		const object = intersects[0].object;
		if (object === aimedAt) {
			if (!isOnDesktop) return;
			removeTextFromHitMarker();
			handleToolTips(isOnDesktop, object, mouse);
			return;
		}

		if (isOnDesktop) scaleIcon(object);

		aimedAt = object;
		handleToolTips(isOnDesktop, object, mouse);
	} else if (aimedAt != null) {
		// logically this shouldn't work but it's a dirty short hand since the if statements run in order
		shrinkIcons();
		aimedAt = null;
	}
}

export function shrinkIcons() {
	if (isOnDesktop) scaleIcon(aimedAt, true);
	removeTextFromHitMarker();
}
