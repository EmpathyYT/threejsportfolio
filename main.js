import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import {
	setUpChairModel,
	setUpComputerModel,
	setUpHitBoxes,
	setUpRoomModel,
	setUpTableModel,
	setUpScene,
} from "./components";
import { loadAssets } from "./utils/extra.js";
import { setUpHooks } from "./hooks/hooks.js";

let renderer, mouse, scene, camera, controls;
setUpSpace();
render();

async function setUpSpace() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	mouse = new THREE.Vector2();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	controls = new PointerLockControls(camera, renderer.domElement);

	setUpHooks(controls, mouse, camera, scene, renderer);
	await loadAssets();
	setUpScene(scene, renderer, controls, camera);
	setUpChairModel(scene);
	setUpTableModel(scene);
	setUpRoomModel(scene);
	setUpComputerModel(scene);
	setUpHitBoxes(scene);
}

function render() {
	renderer.render(scene, camera);
	window.existingLoopId = requestAnimationFrame(render);
}
