import { RGBELoader } from '../third_party/RGBELoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


let gCamera;
let gScene;
let gRenderer;
let gControls;
let gWalls;
let gRaycaster;
let gSphereGeometry; // 用于创建球体的几何体
let gSphereMaterial; // 用于创建球体的材质
// let gRender2;


let loader = new RGBELoader();
loader.load("./image/rotunda_8k.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  console.log(gScene);
  gScene.background = texture;

    gScene.environment = texture;
    gSphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: texture }); // 创建球体的材质

});


function random(min, max) {
  return min + Math.random() * (max - min);
}

function map(value, inMin, inMax, outMin, outMax) {
  // Convert a value to 0.0 - 1.0
  value = (value - inMin) / (inMax - inMin);
  // Convert to output range
  value = outMin + value * (outMax - outMin);
  return value;
}


   
function setup() {

//   const gui = new GUI();
  

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


  const light1 = new THREE.HemisphereLight(0xffffff, 0x000088, 0.8);
  light1.position.set(-1, 1.5, 1);
  gScene.add(light1);

  const light2 = new THREE.HemisphereLight(0xffffff, 0x000088, 0.2);
  light2.position.set(1, 1.5, 1);
  gScene.add(light2);

  gSphereGeometry = new THREE.SphereGeometry(0.5, 20, 20); // 创建球体的几何体
  gSphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: gScene.environment }); // 创建球体的材质
 // const material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );

  const gui = new GUI();

  
  const params = {
    sphereSize: 0.5
  };

  
  gui.add(params, 'sphereSize', 0.1, 2).onChange(updateSphereSize);
  function updateSphereSize() {
    gSphereMaterial.dispose();
    gSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, envMap: gScene.environment });
    gSphereMaterial.needsUpdate = true;

    gScene.traverse(function (object) {
      if (object instanceof THREE.Mesh && object.geometry === gSphereGeometry) {
        object.scale.set(params.sphereSize, params.sphereSize, params.sphereSize);
      }
    });
  }
 
  gui.add({ resetScene: resetScene }, 'resetScene').name('Reset Scene');

  function resetScene() {
    // 删除所有球体
    gScene.remove(...gScene.children.filter(child => child instanceof THREE.Mesh && child.geometry === gSphereGeometry));
  
    // 重置相机位置和控制器状态
    gCamera.position.set(cameraDistance, cameraDistance, cameraDistance);
    gCamera.lookAt(0, 0, 0);
    gControls.reset();
  
    // 恢复默认的墙体设置
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
    // wall.position.set(i * 10 - 50, 0, i * 10 - 50); // 设置更小的间距

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
  // console.log(e.clientX, e.clientY);
  const mouseX = map(e.clientX, 0, window.innerWidth, -1, 1);
  const mouseY = map(e.clientY, 0, window.innerHeight, 1, -1);
  const mouseVector = new THREE.Vector3(mouseX, mouseY, 0.5);

  gRaycaster.setFromCamera(mouseVector, gCamera);
  const intersects = gRaycaster.intersectObjects(gWalls.children);
  // console.log(intersects);
  if (intersects.length > 0) {
    const firstIntersection = intersects[0];
    const sphere = new THREE.Mesh(gSphereGeometry, gSphereMaterial); // 使用球体的几何体和材质创建球体
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


