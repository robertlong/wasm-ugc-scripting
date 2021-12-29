import { WebGLRenderer, Scene, PerspectiveCamera, Mesh, BoxGeometry, MeshBasicMaterial, Clock } from "three";
import ScriptManager from "./ScriptManager";

const scriptManager = new ScriptManager();

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const scene = new Scene();

const camera = new PerspectiveCamera(70, window.innerWidth/ window.innerHeight, 0.1, 1000);
camera.position.z = 5;
scene.add(camera);

const box = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ color: 0xff0000 }));
scene.add(box);
scriptManager.registerEntity("box", box);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);

scriptManager.load("rotate-cube.wasm");

const clock = new Clock();

renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  scriptManager.update(dt);
  renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth/ window.innerHeight;
  camera.updateProjectionMatrix();
});
