import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { applyTextureRelease } from "../utils/extra.js";

const baseUrl = import.meta.env.BASE_URL;

export default function setUpRoomModel(scene, manager) {
    const loader = new GLTFLoader(manager);
    loader.load(baseUrl + "models/empty_office_space/office.glb", function (gltf) {
        const room = gltf.scene;
        room.position.set(-8.2, -0.5, -1.7);
        scene.add(room);
        applyTextureRelease(room);
    });
}