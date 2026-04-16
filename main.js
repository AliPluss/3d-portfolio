import './style.css';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

// ==========================================
// 1. Scene + Camera (FIXED — never moves)
// ==========================================
const webglContainer = document.getElementById('webgl-container');
const css3dContainer  = document.getElementById('css3d-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#050505');

const getAspect = () => window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(65, getAspect(), 0.1, 1000);
const CAM = { x: 0, y: 1.0, z: 9 };
camera.position.set(CAM.x, CAM.y, CAM.z);
camera.lookAt(0, 2, 0);

// ==========================================
// 2. Renderers
// ==========================================
const webglRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
webglRenderer.setSize(window.innerWidth, window.innerHeight);
webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
webglContainer.appendChild(webglRenderer.domElement);

const css3DRenderer = new CSS3DRenderer();
css3DRenderer.setSize(window.innerWidth, window.innerHeight);
css3dContainer.appendChild(css3DRenderer.domElement);

// ==========================================
// 3. Lighting
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(3, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.bias = -0.001;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 2.0); // white, no neon
rimLight.position.set(-6, 4, -8);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xdcdcdc, 0.5);
fillLight.position.set(5, 2, 4);
scene.add(fillLight);

// ==========================================
// 4. Card Data
// ==========================================
const cardData = [
  { img: '/Image1.png', title: 'ORIGIN',   subtitle: 'Mesopotamian Roots / Nordic Horizon' },
  { img: '/Image2.png', title: 'PRESENCE', subtitle: 'Calm Power / Silent Authority' },
  { img: '/Image3.png', title: 'VISION',   subtitle: 'Future Driven / Tech Focused' },
  { img: '/Image4.png', title: 'WORK',     subtitle: 'Selected Creations & Experiments' },
  { img: '/Image5.png', title: 'SIGNAL',   subtitle: 'Media, Content, Digital Voice' },
  { img: '/Image6.png', title: 'CONNECT',  subtitle: 'Reach, Network, Collaborate' },
];

// ==========================================
// 5. Scroll-driven Cinematic Stack State
// ==========================================
const cssCards = [];
const cardEls  = [];
let activeIndex = 0; // Starts with card exactly placed in the center focus
let isAnimating = false;

function getCardState(offset) {
  let x, y, z, opacity, filter, cardW, cardH;
  let innerScale, innerY, boxShadow;
  
  // Center Focus
  const cx = 0, cy = 1.8, cz = 3.5; 
  const cW = 560, cH = 320; 
  
  // Right Stack Base 
  const rx = 9.0, ry = 1.8, rz = 0.5;
  const sW = 280, sH = 280;
  
  // Left Stack Base 
  const lx = -9.0, ly = 1.8, lz = 0.5;
  
  // Physics logic simulating overlapped File Folders layered backwards
  const FOLDER_OFFSET_Y = 0.3; // Approx 30px dip downward between layers
  const FOLDER_OFFSET_Z = 0.6; // Push physically deep rendering properly behind each other
  
  if (offset === 0) {
    x = cx; y = cy; z = cz; opacity = 1; filter = 0; cardW = cW; cardH = cH;
    innerScale = 1.04; 
    innerY = 35; // Natively applies translateY(35px) securely without colliding with camera metrics
    boxShadow = '0 40px 80px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
  } else if (offset > 0) {
    x = rx; // Strict lock preventing wandering bounds
    y = ry - (offset - 1) * FOLDER_OFFSET_Y; // Step downward overlapping
    z = rz - (offset - 1) * FOLDER_OFFSET_Z; // dropped into background Z
    opacity = Math.max(0.0, 0.85 - (offset - 1) * 0.15); // Explicit 0.85 starting boundary 
    filter = 40;
    cardW = sW; cardH = sH;
    innerScale = 0.85; // Explicit nested floating depth boundary
    innerY = 0;
    boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.3)'; // Flush rest state identically matching border frame glass
  } else if (offset < 0) {
    const depth = Math.abs(offset) - 1;
    x = lx;
    y = ly - depth * FOLDER_OFFSET_Y; 
    z = lz - depth * FOLDER_OFFSET_Z; 
    opacity = Math.max(0.0, 0.85 - depth * 0.15); // Explicit 0.85 starting boundary 
    filter = 40;
    cardW = sW; cardH = sH;
    innerScale = 0.85; // Explicit nested floating depth boundary
    innerY = 0;
    boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.3)';
  }
  
  opacity = Math.max(0, opacity);
  
  return { x, y, z, opacity, filter, cardW, cardH, innerScale, innerY, boxShadow };
}

// ==========================================
// 6. Wheel Handler — Discrete Staggered Event Matrix
// ==========================================
window.addEventListener('wheel', (e) => {
  if (cssCards.length === 0 || isAnimating) return;
  e.preventDefault();

  if (e.deltaY > 0 && activeIndex < cardData.length - 1) {
    goToNext();
  } else if (e.deltaY < 0 && activeIndex > -1) {
    goToPrev();
  }
}, { passive: false });

function updateCardGeo(i, target, tl, startTime) {
    tl.to(cssCards[i].position, {
        x: target.x, y: target.y, z: target.z,
        duration: 0.9,
        ease: "cubic-bezier(0.16, 1, 0.3, 1)"
    }, startTime);
    
    tl.to(cardEls[i], {
        width: target.cardW, height: target.cardH, opacity: target.opacity,
        boxShadow: target.boxShadow,
        duration: 0.9,
        ease: "cubic-bezier(0.16, 1, 0.3, 1)",
        onUpdate: function() {
            cardEls[i].style.filter = `grayscale(${target.filter}%) blur(0px)`;
            cardEls[i].style.pointerEvents = target.opacity > 0.1 ? 'auto' : 'none';
        }
    }, startTime);

    // Independently track Apple Vision internal float bounds ensuring native DOM renders smoothly inside the 3D grid
    const scaler = cardEls[i].querySelector('.card-scaler');
    if (scaler) {
        tl.to(scaler, {
            scale: target.innerScale,
            y: target.innerY, 
            x: 0, // Enforces 0 strictly tracking X map
            duration: 0.9,
            ease: "cubic-bezier(0.16, 1, 0.3, 1)"
        }, startTime);
    }
}

function goToNext() {
  isAnimating = true;
  const tl = gsap.timeline({ onComplete: () => { isAnimating = false; } });
  
  const oldIndex = activeIndex;
  
  // Stage 1: Current active exits to Left (offset -1) alongside existing left stack adjusting depth
  for (let i = 0; i <= oldIndex; i++) {
    const target = getCardState(i - (oldIndex + 1));
    updateCardGeo(i, target, tl, 0);
  }

  activeIndex++;
  
  // Mandatory exact 400ms physical buffer
  const stage2Start = 0.6 + 0.4;
  
  // Stage 2: Next card enters from Right (offset 0) alongside completely shifting right deck 
  for (let i = activeIndex; i < cardData.length; i++) {
    const target = getCardState(i - activeIndex);
    updateCardGeo(i, target, tl, stage2Start);
  }
}

function goToPrev() {
  isAnimating = true;
  const tl = gsap.timeline({ onComplete: () => { isAnimating = false; } });

  const oldIndex = activeIndex;
  
  // Stage 1: Reverse Current active returning Right alongside completely shifting right deck back
  for (let i = oldIndex; i < cardData.length; i++) {
    const target = getCardState(i - (oldIndex - 1));
    updateCardGeo(i, target, tl, 0);
  }

  activeIndex--;
  
  // Mandatory explicit pause
  const stage2Start = 0.6 + 0.4;
  
  // Stage 2: Return previous card out off Left Stack returning precisely to Center
  for (let i = 0; i <= activeIndex; i++) {
    const target = getCardState(i - activeIndex);
    updateCardGeo(i, target, tl, stage2Start);
  }
}

// ==========================================
// 7. Per-card float parameters
// ==========================================
// ==========================================
// 7. Per-card float parameters (DISABLED)
// ==========================================

// ==========================================
// 8. Card Reveal (called after landing)
// ==========================================
function showCards() {
  cardData.forEach((data, index) => {
    const el = document.createElement('div');
    el.className = 'identity-card';

    const scaler = document.createElement('div');
    scaler.className = 'card-scaler';
    scaler.innerHTML = `
      <img src="${data.img}" alt="${data.title}">
      <div class="text-content">
        <h3>${data.title}</h3>
        <p class="subtitle">${data.subtitle}</p>
      </div>
    `;
    el.appendChild(scaler);

    const cssObj = new CSS3DObject(el);
    scene.add(cssObj);
    cssCards.push(cssObj);
    cardEls.push(el);

    // Initialize cleanly natively onto CSS DOM mapping specific index boundaries upfront
    const target = getCardState(index - activeIndex);
    
    // Bind position statically on spawn locking them without lerping matrices
    cssObj.position.set(target.x, target.y, target.z);
    cssObj.scale.setScalar(0.01);
    
    el.style.width = target.cardW + 'px';
    el.style.height = target.cardH + 'px';
    el.style.opacity = target.opacity;
    el.style.boxShadow = target.boxShadow;
    el.style.filter = `grayscale(${target.filter}%) blur(0px)`;
    el.style.pointerEvents = target.opacity > 0.1 ? 'auto' : 'none';

    // Set fallback initialization cleanly
    const innerScalerNode = el.querySelector('.card-scaler');
    if (innerScalerNode) {
        innerScalerNode.style.transform = `translate(0px, ${target.innerY}px) scale(${target.innerScale})`;
    }
  });
}

// ==========================================
// 9. Load Models & Run Cinematic Sequence
// ==========================================
let avatar, rockBase;
const gltfLoader = new GLTFLoader();

const loadModel = (path) => new Promise((resolve, reject) => {
  console.log(`[GLTF] Loading: ${path}`);
  gltfLoader.load(
    path,
    (gltf) => { console.log(`[GLTF] OK: ${path}`); resolve(gltf); },
    (xhr) => {
      if (xhr.lengthComputable)
        console.log(`[GLTF] ${path} ${Math.round(xhr.loaded / xhr.total * 100)}%`);
    },
    (err) => { console.error(`[GLTF] FAILED: ${path}`, err); reject(err); }
  );
});

Promise.all([
  loadModel('/avatar2.glb'), // rock
  loadModel('/avatar.glb')   // character
]).then(([rockGltf, avatarGltf]) => {

  // — ROCK —
  rockBase = rockGltf.scene;
  rockBase.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
      child.castShadow    = true;
    }
  });

  const rockBox   = new THREE.Box3().setFromObject(rockBase);
  const rockSize  = rockBox.getSize(new THREE.Vector3());
  const rockScale = 12 / Math.max(rockSize.x, rockSize.z);
  rockBase.scale.set(rockScale, rockScale, rockScale);
  rockBase.position.set(0, -2, 0);
  scene.add(rockBase);
  console.log('[SCENE] Rock added. scale:', rockScale.toFixed(2));

  const afterRockBox = new THREE.Box3().setFromObject(rockBase);
  const rockTopY     = afterRockBox.max.y;
  console.log('[SCENE] Rock top Y:', rockTopY.toFixed(2));

  // — AVATAR —
  avatar = avatarGltf.scene;
  avatar.traverse((child) => {
    if (child.isMesh) {
      child.castShadow    = true;
      child.receiveShadow = true;
    }
  });

  const avatarBox       = new THREE.Box3().setFromObject(avatar);
  const avatarSize      = avatarBox.getSize(new THREE.Vector3());
  const avatarScale     = 6.5 / Math.max(avatarSize.x, avatarSize.y, avatarSize.z);
  avatar.scale.set(avatarScale, avatarScale, avatarScale);

  const afterAvatarBox   = new THREE.Box3().setFromObject(avatar);
  const avatarBottomOff  = afterAvatarBox.min.y;
  const landingY         = rockTopY - avatarBottomOff;

  avatar.position.set(0, 15, 0); // start above screen
  scene.add(avatar);
  console.log('[SCENE] Avatar added. scale:', avatarScale.toFixed(3), '| landingY:', landingY.toFixed(2));

  // Camera already at final position — no tweens
  camera.position.set(CAM.x, CAM.y, CAM.z);
  camera.lookAt(0, 2, 0);

  // Landing timeline (avatar only)
  const tl = gsap.timeline();
  tl.to(avatar.position, { y: landingY,        duration: 4.5, ease: 'power3.inOut' })
    .to(avatar.position, { y: landingY - 0.08, duration: 0.1, ease: 'power1.out'   }) // micro compression
    .to(avatar.position, { y: landingY,         duration: 0.15, ease: 'power1.out' }); // settle

  // Subtle ambient dip at impact
  tl.to(ambientLight, { intensity: '-=0.15', duration: 0.05, yoyo: true, repeat: 3 }, '-=0.25');

  // Reveal cards 0.4s after landing
  tl.add(showCards, '+=0.4');

}).catch((err) => {
  console.error('[CRITICAL] Model loading failed:', err);
});

// ==========================================
// 10. Render Loop — momentum lerp + float + billboard
// ==========================================
const clock = new THREE.Clock();
// Loop explicitly tracks pure WebGL/CSS3DRenderer matrices relying directly on GSAP properties for coordinates.
function animate() {
  requestAnimationFrame(animate);

  // Billboard — all cards always face camera independently
  cssCards.forEach((card) => card.quaternion.copy(camera.quaternion));

  webglRenderer.render(scene, camera);
  css3DRenderer.render(scene, camera);
}
animate();

// ==========================================
// 11. Resize
// ==========================================
window.addEventListener('resize', () => {
  camera.aspect = getAspect();
  camera.updateProjectionMatrix();
  webglRenderer.setSize(window.innerWidth, window.innerHeight);
  css3DRenderer.setSize(window.innerWidth, window.innerHeight);
});
