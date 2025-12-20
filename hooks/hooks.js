import {
	fullCleanup,
	removeTextFromHitMarker,
	setUpToolTips,
	wait,
} from "../utils/extra";
import { hitboxesActive } from "../components/hitboxSetup";
import {
	handleToolTips,
	moveCameraToPosition,
	scaleIcon,
	turnOffPc,
} from "../utils/pcUitls";
import pagingInstance from "../paging/pagingController.js";
import scrambleCode from "../utils/wordScrambler.js";
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
	mouse,
    storedListeners = {}
) {
    // If storedListeners has content, clean it first just in case
	cleanHooks(storedListeners); 

	storedListeners.resize = () => window.existingResizeHandler(camera, renderer);
	storedListeners.click = (event) => window.existingClickHandler(event, controls, renderer);
	storedListeners.controlLock = () => controlLockHook(controls);
	storedListeners.beforeUnload = () => fullCleanup(scene, renderer, controls);
	storedListeners.toggleDesktop = () => handleChangeDesktopMode(camera, dummyCamera, controls);
	storedListeners.mousemove = (mouseEvent) => trackMousePosition(mouseEvent, mouse);
	storedListeners.loaded = () => finishedLoading();

	window.addEventListener("resize", storedListeners.resize, false);
	window.addEventListener("click", storedListeners.click, false);
	document.addEventListener("click", storedListeners.controlLock);
	document.addEventListener("beforeunload", storedListeners.beforeUnload);
	window.addEventListener("toggle-desktop", storedListeners.toggleDesktop);
	window.addEventListener("mousemove", storedListeners.mousemove);
	window.addEventListener('threejs-loaded', storedListeners.loaded);
	
	handleXButtonInSlide();
    
    return storedListeners;
}

async function finishedLoading() {
	const el = document.getElementById('loading-screen');
	el.classList.add('opacity-0');
	await wait(800);
	el.remove();
	showToast();
}

async function showToast() {
	await wait(1500);
	document.getElementById('toast').classList.remove('translate-x-full')
	document.getElementById('countdown').classList.add('animate-toast');
	await wait(400);
	scrambleCode('You are here to leak redacted data. Make it quick.', 'transmission')
	document.getElementById('countdown').addEventListener('animationend', (event) => {
		const toast = event.target.parentElement;
		toast.classList.add('translate-x-full'); 
		
		setTimeout(() => toast.remove(), 800); 
	});
}

export function cleanHooks(listenersToClean) {
	if (window.existingLoopId) {
		cancelAnimationFrame(window.existingLoopId);
	}

    if (hookData.abortBoot) {
        hookData.abortBoot.abort();
        hookData.abortBoot = null;
    }

	const oldCanvas = document.querySelector("canvas");
	if (oldCanvas) {
		oldCanvas.remove();
	}

    if (listenersToClean) {
        if (listenersToClean.resize) window.removeEventListener("resize", listenersToClean.resize);
        if (listenersToClean.click) window.removeEventListener("click", listenersToClean.click);
        if (listenersToClean.controlLock) document.removeEventListener("click", listenersToClean.controlLock);
        if (listenersToClean.beforeUnload) document.removeEventListener("beforeunload", listenersToClean.beforeUnload);
        if (listenersToClean.toggleDesktop) window.removeEventListener("toggle-desktop", listenersToClean.toggleDesktop);
        if (listenersToClean.mousemove) window.removeEventListener("mousemove", listenersToClean.mousemove);
        if (listenersToClean.loaded) window.removeEventListener("threejs-loaded", listenersToClean.loaded);
        // Clear properties
        for (const key in listenersToClean) delete listenersToClean[key];
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
	aimedAt = null;

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
