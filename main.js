import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import {
	setUpComputerModel,
	setUpRoomModel,
	setUpScene,
} from "./components";
import { loadAssets, fullCleanup } from "./utils/extra.js";
import { setUpHooks, checkForHitboxesAimedAt, cleanHooks } from "./hooks/hooks.js";
import { setUpDummyCamera, cleanUtils } from "./utils/pcUitls.js";
import { data } from "./constants/constants.js";
import './style.css';


let renderer, mouse, scene, camera, controls, dummyCamera, gui;

// Use a distinct global key to avoid collisions and ensure persistence across HMR
const APP_CONTEXT_KEY = '__THREE_APP_CONTEXT__';

// 1. IMMEDIATE CLEANUP
if (window[APP_CONTEXT_KEY]) {
    const ctx = window[APP_CONTEXT_KEY];
    
    // Stop loop first
    if (ctx.loopId) cancelAnimationFrame(ctx.loopId);
    
    // Clean hooks using the stored listeners
    cleanHooks(ctx.listeners);
    cleanUtils();

    // Clean Three.js
    fullCleanup(ctx.scene, ctx.renderer, ctx.controls, ctx.gui);
    
    window[APP_CONTEXT_KEY] = null;
}

// 2. SETUP NEW CONTEXT CONTAINER
window[APP_CONTEXT_KEY] = {
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    loopId: null,
    listeners: {}
};

setUpSpace();

async function setUpSpace() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
    window[APP_CONTEXT_KEY].renderer = renderer;

	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	mouse = {x:0, y:0, rawX: 0, rawY:0};
	scene = new THREE.Scene();
    window[APP_CONTEXT_KEY].scene = scene;

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
    window[APP_CONTEXT_KEY].camera = camera;

	controls = new PointerLockControls(camera, renderer.domElement);
    window[APP_CONTEXT_KEY].controls = controls;

	dummyCamera = setUpDummyCamera(data.desktopLocationVector);
	setUpHooks(controls, camera, dummyCamera, scene, renderer, mouse, window[APP_CONTEXT_KEY].listeners);
	
    render();

    await loadAssets();
	setUpScene(scene, renderer, controls, camera, dummyCamera);

    const manager = new THREE.LoadingManager();
    manager.onLoad = function () {
        window.dispatchEvent(new CustomEvent('threejs-loaded'));
    };

	setUpRoomModel(scene, manager);
	setUpComputerModel(scene, manager);
}

function render() {
	checkForHitboxesAimedAt(mouse, camera);
	renderer.render(scene, camera);
	const loopId = requestAnimationFrame(render);
    if (window[APP_CONTEXT_KEY]) {
        window[APP_CONTEXT_KEY].loopId = loopId;
    }
}
