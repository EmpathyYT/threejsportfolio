import * as THREE from "three";


export default function setUpScene(scene, renderer, controls, camera) {
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

	camera.position.set(0, 0.75, 0);
	camera.lookAt(0, 0.5, 0.9);
}