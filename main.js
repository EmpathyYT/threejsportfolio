import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { wait } from "./extra.js";

let isPcOn = false;

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

const renderer = new THREE.WebGLRenderer({ antialias: true });
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
const controls = new PointerLockControls(camera, renderer.domElement);

await loadAssets();
setUpScene();
setUpChairModel();
setUpTableModel();
setUpRoomModel();
setUpComputerModel();
setUpHitBoxes();

function setUpScene() {
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

function render() {
	renderer.render(scene, camera);
	window.existingLoopId = requestAnimationFrame(render);
}

function setUpChairModel() {
	const loader = new GLTFLoader();
	loader.load("models/office_chair/scene.glb", function (gltf) {
		const chair = gltf.scene.children[0];
		scene.add(gltf.scene);
	});
}

function setUpTableModel() {
	const loader = new GLTFLoader();
	loader.load("models/industrial_table/scene.gltf", function (gltf) {
		const table = gltf.scene.children[0];
		table.position.set(0.25, -0.5, 0.9);
		scene.add(gltf.scene);
	});
}

function setUpRoomModel() {
	const loader = new GLTFLoader();
	loader.load("models/empty_office_space/office.glb", function (gltf) {
		const room = gltf.scene;
		room.position.set(-8.2, -0.5, -1.7);
		scene.add(room);
	});
}

function setUpComputerModel() {
	const loader = new GLTFLoader();
	loader.load("models/personal_computer/pc.glb", function (gltf) {
		const computer = gltf.scene.children[0];
		computer.position.set(0, 0.2, 1.2);
		computer.rotation.z = Math.PI;
		scene.add(computer);
	});
}

function setUpHitBoxes() {
	setUpPowerOnHitBox();
}

function setUpPowerOnHitBox() {
	const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
	const material = new THREE.MeshBasicMaterial({
		color: 0x00ff00,
		visible: false,
	});
	const hitbox = new THREE.Mesh(geometry, material);
	hitbox.name = "power_on_hitbox";
	hitbox.position.set(0.7, 0.55, 0.65);
	scene.add(hitbox);
}

async function loadAssets() {
	const font = new FontFace("VT323", "url('/public/fonts/VT323.ttf')", {
		style: "normal",
		weight: "400",
	});
	await font.load();
	document.fonts.add(font);
}

async function setUpBootText() {
  isPcOn = true;
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	canvas.width = 2048;
	canvas.height = 1170;
	const texture = new THREE.CanvasTexture(canvas);
	texture.anisotropy = 24;

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
	await bootTextGenerator();

	async function bootTextGenerator() {
		const bootSequence = [
			"> [INIT]  Powering up main renderer...",
			"> [GPU]   Allocating WebGL 2.0 Context...",
			"> [VRAM]  Memory integrity check... STABLE",
			"> [WARN]  High-poly geometry detected in sector 7",
			"> [SYS]   Overriding safety protocols...",
			"> [LOAD]  Compiling Fragment Shaders...",
			"> [CRIT]  Shader complexity exceeds standard limits",
			"> [FIX]   Rerouting via auxiliary buffers...",
			"> [LGT]   Baking global illumination...",
			"> [PHYS]  Initializing OIMO.js physics engine...",
			"> [NET]   Fetching portfolio data from local_storage",
			"> [SEC]   Bypassing CORS restriction...",
			"> [CAM]   Calibrating focal length to 50mm...",
			"> [RNDR]  Frame loop initiated.",
			"> _", //15 entries
		];
		const buffer = [];
		let max_buffer_size = 10;
		let flashCursor = false;
		let text = bootSequence[0];
		context.fillText(text, 50, 90);
		texture.needsUpdate = true;
		buffer.push({ line: text, color: context.fillStyle });

		for (let i = 1; i < bootSequence.length; i++) {
			await wait(100 + Math.random() * 2000);
			let text = bootSequence[i];
			let event_code = text.slice(3, text.indexOf("]"));

			if (i >= max_buffer_size) {
				buffer.shift();
				rebuildScreen(false);
			}

			switch (event_code) {
				case "WARN":
					context.fillStyle = "#ff9100ff";
					break;
				case "CRIT":
					context.fillStyle = "red";
					break;
				case "FIX":
					context.fillStyle = "green";
					break;
				default:
					context.fillStyle = "white";
			}

			context.fillText(text, 50, 90 * Math.min(i + 1, max_buffer_size));
			buffer.push({ line: text, color: context.fillStyle });
			texture.needsUpdate = true;
			if (event_code == "WARN" || event_code == "CRIT") await wait(700);
		}

		for (let i = 0; i < 10; i++) {
			await wait(500);
			flashCursor = !flashCursor;
			buffer[buffer.length - 1] = {
				line: `> ${flashCursor ? "█" : "_"}`,
				color: "white",
			};
			rebuildScreen(true);
			texture.needsUpdate = true;
		}

		function rebuildScreen(cursor) {
			context.fillStyle = "black";
			context.fillRect(0, 0, canvas.width, canvas.height);
			let max_iter = cursor ? max_buffer_size + 1 : max_buffer_size;
			for (let k = 1; k < max_iter; k++) {
				let data = buffer[k - 1];
				context.fillStyle = data["color"];
				context.fillText(data["line"], 50, 90 * k);
			}
		}
	}
}

window.existingResizeHandler = function () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", window.existingResizeHandler, false);

window.existingClickHandler = function (event) {
	if (!controls.isLocked) return;

	mouse.x = 0;
	mouse.y = 0;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children);

	if (intersects.length > 0) {
		if (intersects[0].object.name === "power_on_hitbox") {
			setUpBootText();
		}
	}
};
window.addEventListener("click", window.existingClickHandler, false);

document.addEventListener("click", () => {
	controls.lock();
});

function cleanMaterial(material) {
	material.dispose(); // Dispose the shader program

	// Dispose textures (The heavy stuff!)
	for (const key of Object.keys(material)) {
		const value = material[key];
		if (value && typeof value === "object" && "minFilter" in value) {
			console.log(`Disposing texture: ${key}`);
			value.dispose();
		}
	}
}

document.addEventListener("beforeunload", () => {
	scene.traverse((x) => {
		if (x.isMesh) {
			x.geometry.dispose();
			if (x.material.isMaterial) {
				cleanMaterial(x.material);
			} else {
				for (const material in x.material) {
					cleanMaterial(material);
				}
			}
		}
	});
	scene.clear();
});

render();
