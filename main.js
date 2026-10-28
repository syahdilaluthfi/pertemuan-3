import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, orbit;
const controllers = [];
const interactables = []; // Daftar objek yang boleh berinteraksi
const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();
const pointer = new THREE.Vector2();
const logBox = document.getElementById('log');
const lines = [];

// Variabel tambahan untuk pengayaan Drop Zone
let dropZone;
let isInsideDropZone = false;

// Fungsi Log ke layar dan console
function log(msg) {
  console.log(msg);
  lines.unshift(msg);
  lines.length = Math.min(lines.length, 5);
  logBox.textContent = lines.join(' | ');
}
// Inisialisasi Scene, Objek, dan Renderer
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b1f2a);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.set(0, 1.6, 2);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(2, 4, 2);
  scene.add(sun);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x2e3447 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  scene.add(new THREE.GridHelper(10, 20, 0x555a6e, 0x3a3f52));

  // Menambahkan tiga objek interaktif (Box, Sphere, Cone)
  addObject(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0xe74c3c, -0.6, 1.2, -1);
  addObject(new THREE.SphereGeometry(0.18, 32, 16), 0x3498db, 0, 1.2, -1);
  addObject(new THREE.ConeGeometry(0.16, 0.35, 32), 0x2ecc71, 0.6, 1.2, -1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // Aktifkan WebXR

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(VRButton.createButton(renderer));

  // OrbitControls untuk navigasi kamera mode Desktop
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(0, 1.2, -1);
  orbit.update();

  setupControllers();

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.setAnimationLoop(render);
}

function addObject(geometry, color, x, y, z) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
  mesh.position.set(x, y, z);
  scene.add(mesh);
  interactables.push(mesh);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Menyiapkan Controller Virtual dan Sinar Raycast
function setupControllers() {
  const modelFactory = new XRControllerModelFactory();

  for (let i = 0; i < 2; i++) {
    const controller = renderer.xr.getController(i);

    controller.addEventListener('connected', (e) => {
      controller.userData.gamepad = e.data.gamepad; // Untuk haptic dan thumbstick
      log('Controller ' + i + ' terhubung (' + e.data.handedness + ')');
    });

    controller.add(buildRay());
    controller.addEventListener('disconnected', () => controller.clear());
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
    controller.addEventListener('squeezestart', onSqueezeStart);

    scene.add(controller);
    controllers.push(controller);

    const grip = renderer.xr.getControllerGrip(i);
    grip.add(modelFactory.createControllerModel(grip));
    scene.add(grip);
  }
}

function buildRay() {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
  ]);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
  line.name = 'ray';
  line.scale.z = 5; // Panjang sinar 5 meter
  return line;
}

// Menghitung objek yang terkena raycast dari controller
function getIntersections(controller) {
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  return raycaster.intersectObjects(interactables, false);
}

// Efek Getaran Haptic pada Controller
function pulse(controller, strength = 0.5, ms = 80) {
  const gp = controller.userData.gamepad;
  const actuator = gp && gp.hapticActuators && gp.hapticActuators[0];
  if (actuator && actuator.pulse) {
    actuator.pulse(strength, ms);
  }
}

// Handler Trigger Ditekan (GRAB)
function onSelectStart(event) {
  const controller = event.target;
  const hits = getIntersections(controller);

  if (hits.length > 0) {
    const obj = hits[0].object;
    controller.attach(obj); // Mempertahankan posisi dunia objek
    controller.userData.selected = obj;
    pulse(controller);
    log('GRAB: ' + obj.geometry.type);
  }
}

// Handler Trigger Dilepas (RELEASE)
function onSelectEnd(event) {
  const controller = event.target;
  const obj = controller.userData.selected;

  if (obj) {
    scene.attach(obj); // Mengembalikan objek ke scene
    controller.userData.selected = undefined;
    log('RELEASE: ' + obj.geometry.type);
  }
}

// Handler Grip Ditekan (SQUEEZE - Ubah Warna)
function onSqueezeStart(event) {
  const controller = event.target;
  const hits = getIntersections(controller);

  if (hits.length > 0) {
    hits[0].object.material.color.setHex(Math.floor(Math.random() * 0xffffff));
    pulse(controller, 0.3, 50);
    log('SQUEEZE: warna diubah');
  }
}

// Frame Animation Loop (Hover, Scale via Thumbstick, & Render)
function render() {
  // Reset sorotan emissive semua objek
  interactables.forEach((o) => o.material.emissive.setHex(0x000000));

  controllers.forEach((c) => {
    const held = c.userData.selected;

    if (held) {
      // Sorot objek yang sedang digenggam
      held.material.emissive.setHex(0x222222);

      // Skala objek menggunakan Thumbstick (Sumbu Y)
      const gp = c.userData.gamepad;
      if (gp && gp.axes.length >= 4) {
        const y = gp.axes[3]; // Sumbu Y thumbstick
        if (Math.abs(y) > 0.15) { // Abaikan drift kecil
          held.scale.multiplyScalar(1 - y * 0.02).clampScalar(0.3, 3);
        }
      }
    } else if (c.children.length > 0) {
      // Hover sorotan emissive jika sinar menunjuk objek
      const hits = getIntersections(c);
      if (hits.length > 0) {
        hits[0].object.material.emissive.setHex(0x444444);
      }
    }
  });

  if (!renderer.xr.isPresenting) {
    orbit.update();
  }

  renderer.render(scene, camera);
}

// Fallback Interaksi Mode Desktop (Klik Mouse)
function onPointerDown(e) {
  if (renderer.xr.isPresenting) return;

  pointer.set(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(interactables, false);

  if (hits.length > 0) {
    hits[0].object.material.color.setHex(Math.floor(Math.random() * 0xffffff));
    log('CLICK (desktop): warna diubah');
  }
}

// Jalankan aplikasi
init();
