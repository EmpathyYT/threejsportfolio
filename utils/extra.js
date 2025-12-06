
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
	const font = new FontFace("VT323", "url('/public/fonts/VT323.ttf')");
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