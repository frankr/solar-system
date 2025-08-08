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
sun.userData.name = 'Sun';
scene.add(sun);

// Add label to the sun
const sunText = document.createElement('div');
sunText.className = 'label';
sunText.textContent = 'Sun';
const sunLabel = new CSS2DObject(sunText);
sunLabel.position.set(0, 7.5, 0);
sun.add(sunLabel);

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
    planet.userData.name = name;
    
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

const initialCameraPosition = new THREE.Vector3(0, 31, 116);
camera.position.copy(initialCameraPosition);

const planetData = {
    Sun: { description: "The Sun is a massive ball of hydrogen and helium that provides light and heat to our solar system. It's so large that about 1.3 million Earths could fit inside it, and it contains 99.86% of the solar system's mass." },
    Mercury: { description: "The smallest planet in our solar system and nearest to the Sun, Mercury is only slightly larger than Earth's Moon." },
    Venus: { description: "Venus spins slowly in the opposite direction from most planets. A thick atmosphere traps heat in a runaway greenhouse effect, making it the hottest planet in our solar system." },
    Earth: { description: "Our home planet is the only place we know of so far that's inhabited by living things. It's also the only planet in our solar system with liquid water on the surface." },
    Mars: { description: "Mars is a dusty, cold, desert world with a very thin atmosphere. There is strong evidence Mars was—billions of years ago—wetter and warmer, with a thicker atmosphere." },
    Jupiter: { description: "Jupiter is more than twice as massive than the other planets of our solar system combined. The giant planet's Great Red Spot is a centuries-old storm bigger than Earth." },
    Saturn: { description: "Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system. The other giant planets have rings, but none are as spectacular as Saturn's." },
    Uranus: { description: "Uranus—seventh planet from the Sun—rotates at a nearly 90-degree angle from the plane of its orbit. This unique tilt makes Uranus appear to spin on its side." },
    Neptune: { description: "Neptune—the eighth and most distant major planet orbiting our Sun—is dark, cold, and whipped by supersonic winds. It was the first planet located through mathematical calculation." },
    Pluto: { description: "Pluto is a dwarf planet in the Kuiper Belt, a donut-shaped region of icy bodies beyond the orbit of Neptune. Pluto was the first Kuiper Belt object to be discovered." }
};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedPlanet = null;

function onMouseClick(event) {
    // If we are zoomed in on a planet, any click should zoom out (except on the info panel)
    if (selectedPlanet) {
        // Only prevent zoom out if clicking directly on the info panel content
        if (event.target.closest('#info-panel') && !event.target.closest('#close-button')) {
            return;
        }
        closeInfoPanel();
        return;
    }
    
    // If we are zoomed out, check for a planet to click on
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.name) {
            selectedPlanet = object;
            focusOnPlanet(object);
        }
    }
}

function focusOnPlanet(planet) {
    const planetName = planet.userData.name;
    const info = planetData[planetName];
    document.getElementById('planet-name').innerText = planetName;
    document.getElementById('planet-description').innerText = info.description;
    document.getElementById('info-panel').classList.remove('hidden');
    controls.enabled = false;
}

function closeInfoPanel() {
    document.getElementById('info-panel').classList.add('hidden');
    selectedPlanet = null;
    controls.enabled = true;
    
    // Animate camera back to initial position
    const animateBack = () => {
        camera.position.lerp(initialCameraPosition, 0.05);
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        
        // Continue animation until we're close enough to initial position
        if (camera.position.distanceTo(initialCameraPosition) > 0.1) {
            requestAnimationFrame(animateBack);
        }
    };
    animateBack();
}

window.addEventListener('click', onMouseClick);
document.getElementById('close-button').addEventListener('click', closeInfoPanel);

// Implement a basic animation loop
function animate() {
    requestAnimationFrame(animate);

    if (selectedPlanet) {
        const targetPosition = new THREE.Vector3();
        selectedPlanet.getWorldPosition(targetPosition);
        const targetFocus = new THREE.Vector3().copy(targetPosition);
        
        // Get the radius from the geometry parameters
        const radius = selectedPlanet.geometry.parameters.radius || 5;
        
        camera.position.lerp(targetPosition.add(new THREE.Vector3(0, 1, radius + 5)), 0.05);
        controls.target.lerp(targetFocus, 0.05);
    }
    // Removed the else block that was resetting camera position

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