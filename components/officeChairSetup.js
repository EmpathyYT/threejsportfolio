import { GLTFLoader } from "three/examples/jsm/Addons.js";

export default function setUpChairModel(scene) {
    const loader = new GLTFLoader();
    loader.load("models/office_chair/scene.glb", function (gltf) {
        gltf.scene.children[0];
        scene.add(gltf.scene);
    });
}