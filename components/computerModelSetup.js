import { wait } from "../utils/extra.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {bootSequence, monitorHeight, monitorWidth, monitorPxSize} from "../constants/constants.js";
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

export function setUpBootText(scene) {
	const canvas = document.createElement("canvas");

	const context = canvas.getContext("2d");
	setCanvasSizes(canvas);

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
	plane.name = "screen";
	plane.position.set(0.0, 0.67, 0.9);
	plane.rotation.y = -Math.PI;
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "white";
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;

	context.imageSmoothingEnabled = false;

	texture.needsUpdate = true;
	
	context.font = `${monitorPxSize}px VT323`;
	scene.add(plane);

	const abortBoot = new AbortController();

	bootTextGenerator(texture, context, canvas, abortBoot);
	return [abortBoot, plane];
}

async function bootTextGenerator(texture, context, canvas, abortBoot) {
	const buffer = [];
	let max_buffer_size = 10; // max lines on a screen

	// pre-fill the first text to avoid waiting
	let text = bootSequence[0];
	context.fillText(text, 50, monitorPxSize + 10);
	texture.needsUpdate = true;

	buffer.push({ line: text, color: context.fillStyle });

	for (let i = 0; i < bootSequence.length; i++) {
		await wait(100 + Math.random() * 2000);
		if (abortBoot.signal.aborted) return;
		let text = bootSequence[i];

		if (i >= max_buffer_size) {
			buffer.shift();
			rebuildScreen(context, canvas, buffer);
		}

		const waitTime = categorizeBootMessage(text, context);

		context.fillText(text, 50, (monitorPxSize + 10) * Math.min(i + 1, max_buffer_size));
		buffer.push({ line: text, color: context.fillStyle });
		texture.needsUpdate = true;
		await wait(waitTime);
	}
	flashCursor(context, canvas, buffer, texture, abortBoot);
}

function rebuildScreen(context, canvas, buffer) {
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	for (let k = 0; k < buffer.length; k++) {
		let data = buffer[k];
		context.fillStyle = data["color"];
		context.fillText(data["line"], 50, (monitorPxSize + 10) * k + 1);
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

async function flashCursor(context, canvas, buffer, texture, abortBoot) {
	let flashCursor = false;
	for (let i = 0; i < 5; i++) {
		await wait(500);
		if (abortBoot.signal.aborted) return;
		flashCursor = !flashCursor;
		buffer[buffer.length - 1] = {
			line: `> ${flashCursor ? "█" : "_"}`,
			color: "white",
		};
		rebuildScreen(context, canvas, buffer);
		texture.needsUpdate = true;
	}
	loadScreenOS(context, canvas, texture, abortBoot);
}

async function loadScreenOS(context, canvas, texture, abortBoot) {
	if (abortBoot.signal.aborted) return;

	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "white";
	let text = "Loading BootOS...";
	let textWidth = context.measureText(text).width;
	context.textAlign = "center";
	context.fillText(text, canvas.width / 2, canvas.height / 2);
	context.strokeStyle = "blue";
	context.lineWidth = 5;
	context.strokeRect(
		canvas.width / 2 - textWidth / 2,
		canvas.height / 2 + 50,
		textWidth,
		80
	);
	texture.needsUpdate = true;
	context.fillStyle = "blue";
	let width = 0;
	for (let i = 1; i <= 10; i++) {
		await wait(500 * Math.random());
		if (abortBoot.signal.aborted) return;

		width = (i / 10) * textWidth;
		context.fillRect(
			canvas.width / 2 - textWidth / 2,
			canvas.height / 2 + 50,
			width,
			80
		);
		texture.needsUpdate = true;
	}
}

export function setCanvasSizes(canvas) {
	let context = canvas.getContext("2d");
	const scale = window.devicePixelRatio;
	canvas.style.width = `${monitorWidth}px`;
	canvas.style.height = `${monitorHeight}px`;
	canvas.width = Math.floor(monitorWidth * scale);
	canvas.height = Math.floor(monitorHeight * scale);
	context.scale(scale, scale);
}
