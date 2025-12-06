import { GLTFLoader } from "three/examples/jsm/Addons.js";


export default function setUpRoomModel(scene) {
    const loader = new GLTFLoader();
    loader.load("models/empty_office_space/office.glb", function (gltf) {
        const room = gltf.scene;
        room.position.set(-8.2, -0.5, -1.7);
        scene.add(room);
    });
}