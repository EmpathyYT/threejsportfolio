import { bootSequence } from "../constants/constants.js";
import { wait } from "../utils/extra.js"
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

export default function setUpComputerModel(scene) {
	const loader = new GLTFLoader();
	loader.load("models/personal_computer/pc.glb", function (gltf) {
		const computer = gltf.scene.children[0];
		computer.position.set(0, 0.2, 1.2);
		computer.rotation.z = Math.PI;
		scene.add(computer);
	});
}

export async function setUpBootText(scene) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 2048;
	canvas.height = 1170;
	const texture = new THREE.CanvasTexture(canvas);
	texture.anisotropy = 16;

	const geometry = new THREE.PlaneGeometry(0.7, 0.35);
	const material = new THREE.MeshStandardMaterial({
		map: texture,
		emissive: 0x000000,
		emissiveIntensity: 5,
		emissiveMap: texture,
		color: 0xffffff,
		side: THREE.DoubleSide,
	});

	const plane = new THREE.Mesh(geometry, material);
	plane.position.set(0.0, 0.67, 0.9);
	plane.rotation.y = -Math.PI;
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "white";
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;

	context.imageSmoothingEnabled = false;

	texture.needsUpdate = true;

	context.font = "80px VT323";
	scene.add(plane);
	await bootTextGenerator(texture, context, canvas);
}

async function bootTextGenerator(texture, context, canvas) {
	const buffer = [];
	let max_buffer_size = 10; // max lines on a screen

	// pre-fill the first text to avoid waiting
	let text = bootSequence[0];
	context.fillText(text, 50, 90);
	texture.needsUpdate = true;
	buffer.push({ line: text, color: context.fillStyle });

	for (let i = 0; i < bootSequence.length; i++) {
		await wait(100 + Math.random() * 2000);
		let text = bootSequence[i];

		if (i >= max_buffer_size) {
			buffer.shift();
			rebuildScreen(context, canvas, buffer);
		}

		const waitTime = categorizeBootMessage(text, context);

		context.fillText(text, 50, 90 * Math.min(i + 1, max_buffer_size));
		buffer.push({ line: text, color: context.fillStyle });
		texture.needsUpdate = true;
		await wait(waitTime);
	}
    flashCursor(context, canvas, buffer, texture);
}

function rebuildScreen(context, canvas, buffer) {
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	for (let k = 0; k < buffer.length; k++) {
		let data = buffer[k];
		context.fillStyle = data["color"];
		context.fillText(data["line"], 50, 90 * k + 1);
	}
}

function categorizeBootMessage(line, context) {
	let event_code = line.slice(3, line.indexOf("]"));
	switch (event_code) {
		case "WARN":
			context.fillStyle = "#ff9100ff";
			return 700;
		case "CRIT":
			context.fillStyle = "red";
			return 700;
		case "FIX":
			context.fillStyle = "green";
			return 0;
		default:
			context.fillStyle = "white";
			return 0;
	}
}

async function flashCursor(context, canvas, buffer, texture) {
    let flashCursor = false;
    for (let i = 0; i < 10; i++) {
		await wait(500);
		flashCursor = !flashCursor;
		buffer[buffer.length - 1] = {
			line: `> ${flashCursor ? "█" : "_"}`,
			color: "white",
		};
		rebuildScreen(context, canvas, buffer);
		texture.needsUpdate = true;
	}
}
