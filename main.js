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

// Fungsi Log ke layar dan console
function log(msg) {
  console.log(msg);
  lines.unshift(msg);
  lines.length = Math.min(lines.length, 5);
  logBox.textContent = lines.join(' | ');
}
