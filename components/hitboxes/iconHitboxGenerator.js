const iconsData = import.meta.glob("/src/icons/*", { eager: true });
import * as THREE from "three";
import pagingInstance from "../../paging/pagingController.js";
import gsap from "gsap";

export default function* generateDesktopIcons() {
	const icons = Object.values(iconsData);
	reorderIcons(icons);
	for (const [index, icon] of icons.entries()) {
		const iconPath = icon.default;
		const iconName = iconPath.split("/").at(-1).split(".")[0];
		const texture = new THREE.TextureLoader().load(iconPath);

		const objSize = 22;

		const iconMesh = generateMesh(iconName, texture, objSize);
		iconMesh.userData.isIcon = true;
		iconMesh.userData.onClick = handleIconOnClick(
			iconName.replaceAll("%20", " ")
		);
		iconMesh.name = iconName;

		const [x, z] = calculatePosition(index, 15, objSize, 4);
		iconMesh.position.set(x, -17, z);

		iconMesh.visible = false;
        iconMesh.userData.scaleTween = setUpScalingTween(iconMesh, 1, 1.2)
		yield iconMesh;
	}
}

function generateMesh(file, texture, objSize) {
	const material = new THREE.MeshStandardMaterial({
		color: 0x91c7b1,
		map: texture,
		emissiveMap: texture,
		emissive: 0xffffff,
		emissiveIntensity: 0.75,
	});

	const geometry = new THREE.BoxGeometry(objSize, objSize, objSize);

	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = file;
	return mesh;
}

function calculatePosition(index, padding, boxSize, maxItemsZ) {
	const topZ = 220;
	const leftX = -135;
	const step = padding + boxSize; // full length since when you add the 2 halfs (front of current obj and rear of the other) that extend between this distance, you'll end up with a full length

	const zOffset = step * (index % maxItemsZ); //fast growing
	const z = topZ - zOffset;

	const coldIndex = Math.floor(index / maxItemsZ); //slow growing
	const x = coldIndex * step + leftX;

	return [x, z];
}

function handleIconOnClick(name) {
	if (name === "Power") {
		return () => window.dispatchEvent(new CustomEvent("toggle-desktop"));
	} else {
		return () => pagingInstance.openPage(name);
	}
}

function reorderIcons(icons) {
	const powerIndex = icons.indexOf((x) => x.default.contains("Power"));
	const power = icons.splice(powerIndex, 1)[0];
	icons.push(power);
}

function setUpScalingTween(obj, normal, scaled) {
	const tween = gsap.fromTo(
		obj.scale,
		{
			x: normal,
			z: normal,
		},
		{
			paused: true,
			x: scaled,
			z: scaled,
		}
	);

    return tween;
}
