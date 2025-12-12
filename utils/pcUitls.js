import * as THREE from 'three'
import {gsap} from 'gsap';
import { data } from '../constants/constants';
import { setTextToHitMarker } from './extra';

export function moveCameraToPosition(camera,  dummyCamera, moveToDeskop, transition) {
    const basePosition = data.baseLocationVector;
    const desktopPosition = data.desktopLocationVector;
    const initialQuaternion = camera.quaternion.clone();
    const dummyQuaternion = dummyCamera.quaternion;
    const tween = {val: 0}

    transition.state = true;

    if (!moveToDeskop) {
        gsap.to(camera.position, {
            x: basePosition.x,
            y: basePosition.y,
            z: basePosition.z,
            duration: 1.5,
            ease: 'power3.inOut',
            onComplete: () => transition.state = false
        });

    } else {
        gsap.to(tween, {
            val: 1,
            duration: 1.5,
            ease: "power3.inOut",
            onUpdate: () => {
                camera.quaternion.copy(initialQuaternion);
                camera.quaternion.slerp(dummyQuaternion, tween.val)
            }
        })
        gsap.to(camera.position, {
            x: desktopPosition.x,
            y: desktopPosition.y,
            z: desktopPosition.z,
            duration: 1.5,
            ease: 'power3.inOut',
            onComplete: () => transition.state = false
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

export function scaleIcon(newScale, oldScale, object, shrink) {
    const currentScale = object.scale;
    const scaleTween = {valX: currentScale.x, valZ: currentScale.z};

    gsap.to(scaleTween, {
        valX: shrink ? oldScale : newScale,
        valZ: shrink ? oldScale : newScale,
        onUpdate: () => {
            object.scale.set(scaleTween.valX, 1, scaleTween.valZ);
        }
    })
}

export function handleToolTips(isDesktop, object, mouse) {
    if (isDesktop) {
        const p = document.getElementById('hitmarkerText');
        const xPast75 = mouse.rawX / window.innerWidth > 0.75;
        const yPast75 = mouse.rawY / window.innerHeight > 0.75;
        console.log(yPast75)
        const xOffset = xPast75 ? '-100%' : '-50%'
        const yOffset = yPast75 ? '-100%' : '80%'
        const finalTranslate = `translate(${xOffset},${yOffset})`
        p.style.transform = `translate(${mouse.rawX}px, ${mouse.rawY}px) ${finalTranslate}`

	    p.classList.remove('opacity-0');
        setTextToHitMarker(object.name.replaceAll('%20', ' '));
    } else {
        setTextToHitMarker(object.name.replaceAll('%20', ' '));
    }
}


