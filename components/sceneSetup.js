import * as THREE from "three";
import * as lil from 'lil-gui'
import { data } from "../constants/constants";

export default function setUpScene(scene, renderer, controls, camera, dummyCamera) {
	scene.background = new THREE.Color(0xaaaaaa);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	controls.movementSpeed = 0;
	controls.lookSpeed = 0.1;
	controls.maxPolarAngle = (Math.PI * 3) / 4; // Limit looking up
	controls.minPolarAngle = Math.PI / 4; // Limit looking down

	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(0, 10, -2);

	const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
	hemiLight.position.set(0, 10, 0);

	scene.add(light);
	scene.add(hemiLight);
	scene.add(dummyCamera);

	camera.position.set(-8.97, 0.8, -1.95);
	dummyCamera.lookAt(data.desktopLookVector);


	camera.lookAt(-7.9, 0.8, -1.87);
}