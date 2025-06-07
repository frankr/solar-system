import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// Basic Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, labelRenderer.domElement);
controls.enableDamping = true;

// Add a light source
const pointLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Create and add the Sun
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('textures/sun.jpg');

const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const starVertices = [];
for (let i = 0; i < 15000; i++) {
    const x = THREE.MathUtils.randFloatSpread(1800);
    const y = THREE.MathUtils.randFloatSpread(1800);
    const z = THREE.MathUtils.randFloatSpread(1800);
    starVertices.push(x, y, z);
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

function createPlanet(size, texture, position, name, orbitSpeed) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: textureLoader.load(texture) });
    const planet = new THREE.Mesh(geometry, material);
    
    const pivot = new THREE.Object3D();
    scene.add(pivot);
    pivot.add(planet);
    
    planet.position.x = position;

    const orbitGeometry = new THREE.TorusGeometry(position, 0.03, 16, 100);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = -0.5 * Math.PI;
    scene.add(orbit);

    const text = document.createElement('div');
    text.className = 'label';
    text.textContent = name;
    const label = new CSS2DObject(text);
    label.position.set(0, size * 1.5, 0);
    planet.add(label);

    return { planet, pivot, orbitSpeed };
}

const mercury = createPlanet(1, 'textures/mercury.jpg', 10, 'Mercury', 0.04);
const venus = createPlanet(1.5, 'textures/venus.jpg', 15, 'Venus', 0.015);
const earth = createPlanet(1.6, 'textures/earth.jpg', 20, 'Earth', 0.01);
const mars = createPlanet(1.2, 'textures/mars.jpg', 25, 'Mars', 0.008);
const jupiter = createPlanet(3.5, 'textures/jupiter.jpg', 35, 'Jupiter', 0.002);

const saturnData = createPlanet(3, 'textures/saturn.jpg', 50, 'Saturn', 0.0009);
const saturn = saturnData.planet;

const ringGeometry = new THREE.RingGeometry(4, 6, 64);
const ringMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/saturn_ring.png'),
    side: THREE.DoubleSide,
    transparent: true
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = -0.5 * Math.PI;
saturn.add(ring);

const uranus = createPlanet(2.5, 'textures/uranus.jpg', 65, 'Uranus', 0.0004);
const neptune = createPlanet(2.4, 'textures/neptune.jpg', 75, 'Neptune', 0.0001);
const pluto = createPlanet(0.8, 'textures/pluto.jpg', 85, 'Pluto', 0.00005);

camera.position.set(0, 31, 116);

// Implement a basic animation loop
function animate() {
    requestAnimationFrame(animate);

    // Add rotation to the Sun and planets
    sun.rotation.y += 0.001;
    mercury.planet.rotation.y += 0.0005;
    venus.planet.rotation.y += 0.0002;
    earth.planet.rotation.y += 0.005;
    mars.planet.rotation.y += 0.005;
    jupiter.planet.rotation.y += 0.012;
    saturn.rotation.y += 0.011;
    uranus.planet.rotation.y += 0.007;
    neptune.planet.rotation.y += 0.0075;
    pluto.planet.rotation.y += 0.002;

    // Add orbital rotation
    mercury.pivot.rotation.y += mercury.orbitSpeed;
    venus.pivot.rotation.y += venus.orbitSpeed;
    earth.pivot.rotation.y += earth.orbitSpeed;
    mars.pivot.rotation.y += mars.orbitSpeed;
    jupiter.pivot.rotation.y += jupiter.orbitSpeed;
    saturnData.pivot.rotation.y += saturnData.orbitSpeed;
    uranus.pivot.rotation.y += uranus.orbitSpeed;
    neptune.pivot.rotation.y += neptune.orbitSpeed;
    pluto.pivot.rotation.y += pluto.orbitSpeed;

    controls.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}); 