import * as THREE from "three";
import { gsap } from "gsap";
import { data } from "../constants/constants";
import { setTextToHitMarker } from "./extra";
import { toggleButtonVisibility } from "../components/hitboxSetup";
let cameraTween;

export function moveCameraToPosition(
	camera,
	dummyCamera,
	moveToDeskop,
	transition
) {
	const desktopPosition = data.desktopLocationVector;
	const initialQuaternion = camera.quaternion.clone();
	const dummyQuaternion = dummyCamera.quaternion;
	const tween = { val: 0 };

	if (!moveToDeskop) {
		cameraTween.reverse().then((_) => cameraTween.kill());
	} else {
		gsap.to(tween, {
			val: 1,
			duration: 1.5,
			ease: "power3.inOut",
			onUpdate: () => {
				camera.quaternion.copy(initialQuaternion);
				camera.quaternion.slerp(dummyQuaternion, tween.val);
			},
		});
		cameraTween = gsap.to(camera.position, {
			x: desktopPosition.x,
			y: desktopPosition.y,
			z: desktopPosition.z,
			duration: 1.5,
			ease: "power3.inOut",
			onComplete: () => (transition.state = false),
			onReverseComplete: () => (transition.state = false),
		});
	}
}

export function setUpDummyCamera(location) {
	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	camera.position.copy(location);

	return camera;
}

export function scaleIcon(object, shrink) {
    let scaleTween = object.userData.scaleTween;

    if (shrink) {
        scaleTween.reverse();
    } else {
        if (scaleTween.progress() === 1) {
            scaleTween.restart()
        } else {
            scaleTween.play()
        } 
    }
    
}

export function handleToolTips(isDesktop, object, mouse) {
	if (isDesktop) {
		const p = document.getElementById("hitmarkerText");
		const xPast75 = mouse.rawX / window.innerWidth > 0.75;
		const yPast75 = mouse.rawY / window.innerHeight > 0.75;
		const xOffset = xPast75 ? "-100%" : "-50%";
		const yOffset = yPast75 ? "-100%" : "80%";
		const finalTranslate = `translate(${xOffset},${yOffset})`;
		p.style.transform = `translate(${mouse.rawX}px, ${mouse.rawY}px) ${finalTranslate}`;

		p.classList.remove("opacity-0");
		setTextToHitMarker(object.name.replaceAll("%20", " "));
	} else {
		setTextToHitMarker(object.name.replaceAll("%20", " "));
	}
}

export async function turnOffPc(screenMeshMaterial, isOnDesktop) {
	if (isOnDesktop) {
		await toggleButtonVisibility();
	}
	const dummyTexture = new THREE.Texture();

	screenMeshMaterial.color = new THREE.Color(0x000000);
	screenMeshMaterial.emissive = new THREE.Color(0x000000);

	screenMeshMaterial.map.dispose();

	screenMeshMaterial.map = dummyTexture;
	screenMeshMaterial.emissiveMap = dummyTexture;
}
