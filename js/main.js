import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let gCamera;
let gScene;
let gRenderer;
let gControls;
let gWalls;
let gRaycaster;
let gSphereGeometry;
let gSphereMaterial;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function map(value, inMin, inMax, outMin, outMax) {
  value = (value - inMin) / (inMax - inMin);
  value = outMin + value * (outMax - outMin);
  return value;
}

function setup() {
  const cameraDistance = 6;
  gCamera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  gCamera.position.set(cameraDistance, cameraDistance, cameraDistance);
  gCamera.lookAt(0, 0, 0);

  gScene = new THREE.Scene();

  // 创建一个点光源，模拟光源照射
  const pointLight = new THREE.PointLight(0xffffff, 1, 100); // 颜色，强度，距离
  pointLight.position.set(5, 5, 5); // 点光源的位置
  gScene.add(pointLight);

  // 创建一个环境光，提供场景的基本亮度
  const ambientLight = new THREE.AmbientLight(0x404040, 1); // 颜色和强度
  gScene.add(ambientLight);

  const light1 = new THREE.HemisphereLight(0xffffff, 0x000088, 0.8);
  light1.position.set(-1, 1.5, 1);
  gScene.add(light1);

  const light2 = new THREE.HemisphereLight(0xffffff, 0x000088, 0.2);
  light2.position.set(1, 1.5, 1);
  gScene.add(light2);

  gSphereGeometry = new THREE.SphereGeometry(0.5, 20, 20);

  gSphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000ff,  // 设置球体颜色为蓝色
    roughness: 0.5,
    metalness: 0.5,
    shadowSide: THREE.FrontSide // 使小球能够投射阴影
  });

  // 创建小球并设置其投射阴影
  const sphere = new THREE.Mesh(gSphereGeometry, gSphereMaterial);
  sphere.castShadow = true; // 小球可以投射阴影
  gScene.add(sphere);

  // 添加GUI控制器
  const gui = new GUI();
  const params = {
    sphereSize: 0.5,  // 默认球体尺寸
    sphereColor: gSphereMaterial.color.getHex()  // 当前颜色值
  };

  // 添加球体尺寸控制器
  gui.add(params, 'sphereSize', 0.1, 2).onChange(updateSphereSize);

  // 添加颜色控制器
  gui.addColor(params, 'sphereColor').name('Sphere Color').onChange((value) => {
    gSphereMaterial.color.set(value); // 更新小球的颜色
  });

  function updateSphereSize() {
    gScene.traverse(function (object) {
      if (object instanceof THREE.Mesh && object.geometry === gSphereGeometry) {
        object.scale.set(params.sphereSize, params.sphereSize, params.sphereSize);
      }
    });
  }

  gui.add({ resetScene: resetScene }, 'resetScene').name('Reset Scene');

  function resetScene() {
    gScene.remove(...gScene.children.filter(child => child instanceof THREE.Mesh && child.geometry === gSphereGeometry));
    gCamera.position.set(cameraDistance, cameraDistance, cameraDistance);
    gCamera.lookAt(0, 0, 0);
    gControls.reset();
    gWalls.children.forEach(wall => {
      wall.material.opacity = 0;
    });
  }

  const wallMaterial = new THREE.MeshBasicMaterial({ color: "white", transparent: true, opacity: 0 });
  const wallGeometry = new THREE.BoxGeometry();

  gWalls = new THREE.Group();
  for (let i = 0; i < 25; i++) {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.scale.set(1200, 5, 1);
    wall.rotation.set(0, random(0, Math.PI * 2), 0);
    wall.position.set(random(-10, 10), 0, random(-10, 10));
    gWalls.add(wall);
  }
  gScene.add(gWalls);

  gRenderer = new THREE.WebGLRenderer({ antialias: true });
  gRenderer.setPixelRatio(window.devicePixelRatio);
  gRenderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(gRenderer.domElement);

  gControls = new THREE.OrbitControls(gCamera, gRenderer.domElement);
  gControls.mouseButtons = {
    LEFT: null,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE,
  };

  gRaycaster = new THREE.Raycaster();
}


function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  gRenderer.render(gScene, gCamera);
}

function onResize() {
  gCamera.aspect = window.innerWidth / window.innerHeight;
  gCamera.updateProjectionMatrix();
  gRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseDown(e) {
  if (e.button !== 0) return;
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e) {
  const mouseX = map(e.clientX, 0, window.innerWidth, -1, 1);
  const mouseY = map(e.clientY, 0, window.innerHeight, 1, -1);
  const mouseVector = new THREE.Vector3(mouseX, mouseY, 0.5);

  gRaycaster.setFromCamera(mouseVector, gCamera);
  const intersects = gRaycaster.intersectObjects(gWalls.children);

  if (intersects.length > 0) {
    const firstIntersection = intersects[0];
    const sphere = new THREE.Mesh(gSphereGeometry, gSphereMaterial);
    sphere.position.copy(firstIntersection.point);
    sphere.scale.multiplyScalar(firstIntersection.distance * 0.05);
    gScene.add(sphere);
  }
}

function onMouseUp() {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
}

setup();
animate();
window.addEventListener("resize", onResize);
window.addEventListener("mousedown", onMouseDown);

document.querySelector("#hideButton").addEventListener("click", () => {
  document.querySelector(".popup").style.display = "none";
});
document.querySelector("#user2Button").addEventListener("click", () => {
  document.querySelector(".popup").style.display = "none";
});
