import {monitorWidth, monitorHeight} from "../constants/constants.js";

export function wait(time) {
  return new Promise((resolve) => setTimeout(() => {resolve()}, time));
}

export function cleanMaterial(material) {
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

export async function loadAssets() {
	const font = new FontFace("VT323", "url('/fonts/VT323.ttf')");
	await font.load();
	document.fonts.add(font);

}

export function cleanMemory(object3d) {
	object3d.traverse((x) => {
		if (x.isMesh) {
			x.geometry.dispose();
			if (x.material.isMaterial) {
				cleanMaterial(x.material);
			} else {
				for (const material of x.material) {
					cleanMaterial(material);
				}
			}
		}
	});
}

export function cleanScene(scene) {
	cleanMemory(scene);
	scene.clear();
}

export function setCanvasSizes(canvas) {
	const textureResolution = 1024 * 2;
	canvas.width = textureResolution;
	canvas.height = textureResolution;
}

export function addChild(scene, objtoAdd, nameOfParent) {
	const children = scene.children;
	for (const child of children) {
		if (child.name === nameOfParent) {
			child.add(objtoAdd);
		}
	}
}

export function setTextToHitMarker(text) {
	const p = document.getElementById('hitmarkerText');
	p.textContent = text;
	p.classList.remove('opacity-0');
}

export function removeTextFromHitMarker() {
	const text = document.getElementById('hitmarkerText');
	text.classList.add('opacity-0');
}

export function setUpToolTips(goingToDesktop) {
	const baseViewClasses = 'absolute top-full left-1/2 -translate-x-1/2'.split(' ');
	const desktopViewClasses = 'fixed top-0 left-0'.split(' ');

	if (goingToDesktop) {
		const p = document.getElementById('hitmarkerText');
		const div = document.getElementById('hitmarker');

		div.classList.add('invisible');
		p.parentElement.removeChild(p);

		p.classList.remove(...baseViewClasses)
		p.classList.add(...desktopViewClasses);

		document.body.append(p);
	} else {
		const p = document.getElementById('hitmarkerText');
		const div = document.getElementById('hitmarker');

		div.classList.remove('invisible');
		document.body.removeChild(p);

		p.classList.add(...baseViewClasses)
		p.classList.remove(...desktopViewClasses);

		div.append(p);
	}
}