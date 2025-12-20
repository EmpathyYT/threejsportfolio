import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { applyTextureRelease } from "../utils/extra.js";


export default function setUpRoomModel(scene, manager) {
    const loader = new GLTFLoader(manager);
    loader.load("models/empty_office_space/office.glb", function (gltf) {
        const room = gltf.scene;
        room.position.set(-8.2, -0.5, -1.7);
        scene.add(room);
        applyTextureRelease(room);
    });
}