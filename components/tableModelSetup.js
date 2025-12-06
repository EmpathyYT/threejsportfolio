import { GLTFLoader } from "three/examples/jsm/Addons.js";


export default function setUpTableModel(scene) {
    const loader = new GLTFLoader();
    loader.load("models/industrial_table/scene.gltf", function (gltf) {
        const table = gltf.scene.children[0];
        table.position.set(0.25, -0.5, 0.9);
        scene.add(gltf.scene);
    });
}