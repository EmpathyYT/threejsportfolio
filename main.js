import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import {
	setUpChairModel,
	setUpComputerModel,
	setUpRoomModel,
	setUpTableModel,
	setUpScene,
} from "./components";
import { loadAssets } from "./utils/extra.js";
import { setUpHooks, checkForHitboxesAimedAt } from "./hooks/hooks.js";
import { setUpDummyCamera } from "./utils/pcUitls.js";
import { data } from "./constants/constants.js";

let renderer, mouse, scene, camera, controls, dummyCamera;

setUpSpace();
render();

async function setUpSpace() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	mouse = {x:0, y:0, rawX: 0, rawY:0};
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	controls = new PointerLockControls(camera, renderer.domElement);
	dummyCamera = setUpDummyCamera(data.desktopLocationVector);
	setUpHooks(controls, camera, dummyCamera, scene, renderer, mouse);
	await loadAssets();
	setUpScene(scene, renderer, controls, camera, dummyCamera);
	setUpChairModel(scene);
	setUpTableModel(scene);
	setUpRoomModel(scene);
	setUpComputerModel(scene);
}

function render() {
	checkForHitboxesAimedAt(mouse, camera);
	renderer.render(scene, camera);
	window.existingLoopId = requestAnimationFrame(render);
}
