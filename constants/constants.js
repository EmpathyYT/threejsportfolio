import * as THREE from 'three';

export const bootSequence = [
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

export const monitorWidth = 2048;
export const monitorHeight = 1170;
export const monitorPxSize = 90;
export const computerModelName = 'computer';
export const data = {
	baseLocationVector: new THREE.Vector3(0, 0.75, 0),
	desktopLocationVector: new THREE.Vector3(0, 0.7, 0.5),
	desktopLookVector: new THREE.Vector3(0, 0.7, 1),
};
