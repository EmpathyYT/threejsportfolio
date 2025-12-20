import { wait, setCanvasSizes, applyTextureRelease } from "../utils/extra.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {
	bootSequence,
	monitorPxSize,
	computerModelName,
} from "../constants/constants.js";
import setUpHitBoxes, {toggleButtonVisibility } from "./hitboxSetup.js";
import * as THREE from "three";
let screenMeshMaterial;

export default function setUpComputerModel(scene, manager) {
	const loader = new GLTFLoader(manager);
	loader.load("models/personal_computer/pc.glb", function (gltf) {
		const computer = gltf.scene.children[0];
		computer.name = computerModelName;
		computer.position.set(-7.9, 0.35, -1.87);
		computer.rotation.z = -Math.PI /2;

		scene.add(computer);
		applyTextureRelease(computer);

		computer.traverse((x) => {
			if (x.isMesh && x.material.name === "Screen") {
				setUpScreenMaterial(x);
			}
		});
		setUpHitBoxes(scene);
	});
}

export async function setUpBootText() {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	setCanvasSizes(canvas);

	const texture = new THREE.CanvasTexture(canvas);

	screenMeshMaterial.color = new THREE.Color(0xffffff);
	screenMeshMaterial.emissive = new THREE.Color(0xffffff);

	screenMeshMaterial.map.dispose(); //the emissive map is the same texture so no need to dispose both

	screenMeshMaterial.map = texture;
	screenMeshMaterial.emissiveMap = texture;

	texture.colorSpace = THREE.SRGBColorSpace;
	texture.flipY = false;
	texture.anisotropy = 16;

	resetCanvas(canvas);

	context.fillStyle = "white";

	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;

	context.imageSmoothingEnabled = false;
	context.font = `${monitorPxSize}px VT323`;

	const abortBoot = new AbortController();

	texture.needsUpdate = true;
	bootTextGenerator(texture, context, canvas, abortBoot);
	// setUpDesktop(abortBoot)
	return [abortBoot, screenMeshMaterial];
}

async function bootTextGenerator(texture, context, canvas, abortBoot) {
	const buffer = [];
	let max_buffer_size = 14; // max lines on a screen

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

		context.fillText(
			text,
			50,
			(monitorPxSize + 10) * Math.min(i + 1, max_buffer_size)
		);
		buffer.push({ line: text, color: context.fillStyle });
		texture.needsUpdate = true;
		await wait(waitTime);
	}
	flashCursor(context, canvas, buffer, texture, abortBoot);
}

function rebuildScreen(context, canvas, buffer) {
	resetCanvas(canvas);
	for (let k = 0; k < buffer.length; k++) {
		let data = buffer[k];
		context.fillStyle = data["color"];
		context.fillText(data["line"], 50, (monitorPxSize + 10) * k + 1);
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

	resetCanvas(canvas);
	context.fillStyle = "white";
	let text = "Loading StrikeOS...";
	let textWidth = context.measureText(text).width;
	context.textAlign = "center";
	context.fillText(text, canvas.width / 2, canvas.height / 2);
	context.strokeStyle = "cyan";
	context.lineWidth = 5;
	context.strokeRect(
		canvas.width / 2 - textWidth / 2,
		canvas.height / 2 + 50,
		textWidth,
		80
	);
	texture.needsUpdate = true;
	context.fillStyle = "cyan";
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
	await setUpDesktop(abortBoot);

}

async function setUpDesktop() {
	const desktopImg = await new THREE.TextureLoader().loadAsync("/pictures/pic.jpg");
	desktopImg.flipY = false;
	screenMeshMaterial.map = desktopImg;
	screenMeshMaterial.emissiveMap = desktopImg;

	toggleButtonVisibility();
	window.dispatchEvent(new CustomEvent('toggle-desktop'));
}


function setUpScreenMaterial(object) {
	/* 
	since the shader program actually optimizes the textures and materials we need to 
	add a dummy texture otherwise no matter what it won't accept a texture map.

	even though it's technically mutable, after creation it kinda becomes immutable

	just wanna lyk it took me 4 hours to find out why switching the map didn't work
	*/
	const dummyTexture = new THREE.Texture();
	const material = new THREE.MeshPhysicalMaterial({
		map: dummyTexture,
		emissiveMap: dummyTexture,
		emissive: 0x000000,
		emissiveIntensity: 0.3,
		color: 0x000000,
		side: THREE.DoubleSide,
		clearcoat: 0.5,
	});

	object.material = material;
	screenMeshMaterial = material;
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

function resetCanvas(canvas) {
	const context = canvas.getContext("2d");
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
}
