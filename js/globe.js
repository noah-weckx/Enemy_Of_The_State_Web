/**
 * globe.js — Three.js 3D Security Globe
 * Lazy-loaded, auto-rotating, Fresnel atmosphere, continent point cloud
 */
import * as THREE from 'three';

const GLOBE_R  = 1.8;
const POINT_R  = 1.83;
const ATMO_R   = 1.97;

// Approximate continent regions [latMin, latMax, lngMin, lngMax, count]
const REGIONS = [
    [ 25,  72, -130,  -60, 65],  // North America
    [  7,  25,  -90,  -65, 20],  // Central America
    [-55,  12,  -80,  -35, 50],  // South America
    [ 36,  71,  -10,   40, 60],  // Europe
    [-35,  37,  -18,   52, 60],  // Africa
    [ 12,  40,   35,   65, 35],  // Middle East
    [  5,  35,   65,   95, 45],  // South Asia
    [ 18,  53,   95,  145, 50],  // East / SE Asia
    [ 50,  75,   40,  180, 35],  // Russia / Siberia
    [-45, -10,  114,  154, 35],  // Australia
    [ 60,  85,  -60,   90, 20],  // Greenland / Arctic
];

// City/node locations for bright highlight points [lat, lng]
const NODES = [
    [ 40.7, -74.0],   // New York
    [ 51.5,  -0.1],   // London
    [ 48.9,   2.3],   // Paris
    [ 55.8,  37.6],   // Moscow
    [ 31.2, 121.5],   // Shanghai
    [ 35.7, 139.7],   // Tokyo
    [-33.9,  18.4],   // Cape Town
    [-23.5, -46.6],   // São Paulo
    [ 28.6,  77.2],   // New Delhi
    [  1.3, 103.8],   // Singapore
    [ 37.8, -122.4],  // San Francisco
    [-33.9, 151.2],   // Sydney
];

function latLngToVec3(lat, lng, r) {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
         r * Math.cos(phi),
         r * Math.sin(phi) * Math.sin(theta)
    );
}

function buildContinentCloud() {
    const pos = [];
    for (const [latMin, latMax, lngMin, lngMax, count] of REGIONS) {
        for (let i = 0; i < count; i++) {
            const lat = latMin + Math.random() * (latMax - latMin);
            const lng = lngMin + Math.random() * (lngMax - lngMin);
            const v = latLngToVec3(lat, lng, POINT_R);
            pos.push(v.x, v.y, v.z);
        }
    }
    return new Float32Array(pos);
}

function buildNodeCloud() {
    const pos = [];
    for (const [lat, lng] of NODES) {
        const v = latLngToVec3(lat, lng, POINT_R + 0.01);
        pos.push(v.x, v.y, v.z);
    }
    return new Float32Array(pos);
}

function buildConnectionLines() {
    const pairs = [[0,1],[1,2],[2,4],[4,6],[1,3],[3,8],[7,6],[8,9],[9,10],[10,0],[11,9],[5,8]];
    const positions = [];
    for (const [a, b] of pairs) {
        const va = latLngToVec3(NODES[a][0], NODES[a][1], POINT_R + 0.02);
        const vb = latLngToVec3(NODES[b][0], NODES[b][1], POINT_R + 0.02);
        // Arc: interpolate via sphere surface
        for (let t = 0; t <= 1; t += 0.05) {
            const pt = va.clone().lerp(vb, t).normalize().multiplyScalar(POINT_R + 0.05);
            positions.push(pt.x, pt.y, pt.z);
        }
    }
    return new Float32Array(positions);
}

function createScanlineTexture() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 4) {
        const alpha = (Math.random() * 0.05 + 0.02).toFixed(3);
        ctx.fillStyle = `rgba(0, 180, 120, ${alpha})`;
        ctx.fillRect(0, y, size, 1);
    }
    return new THREE.CanvasTexture(c);
}

const ATMO_VERT = `
varying vec3 vNormal;
void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ATMO_FRAG = `
uniform vec3 glowColor;
varying vec3 vNormal;
void main() {
    float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.8);
    gl_FragColor = vec4(glowColor, clamp(intensity * 0.8, 0.0, 1.0));
}`;

export function initGlobe(canvasEl) {
    const W = canvasEl.clientWidth  || 300;
    const H = canvasEl.clientHeight || 300;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.z = 5.4;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const keyLight = new THREE.DirectionalLight(0x00ffcc, 0.7);
    keyLight.position.set(-2, 2, 3);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x8B8FCC, 0.3);
    rimLight.position.set(3, -1, -2);
    scene.add(rimLight);

    // Globe sphere
    const globeMat = new THREE.MeshPhongMaterial({
        color:       0x002518,
        specular:    new THREE.Color(0x008069).multiplyScalar(0.6),
        shininess:   50,
        map:         createScanlineTexture(),
        transparent: true,
        opacity:     0.96,
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 64, 64), globeMat);
    scene.add(globe);

    // Continent point cloud
    const contGeo = new THREE.BufferGeometry();
    contGeo.setAttribute('position', new THREE.BufferAttribute(buildContinentCloud(), 3));
    const contMat = new THREE.PointsMaterial({ color: 0x00cc88, size: 0.022, transparent: true, opacity: 0.75, sizeAttenuation: true });
    const contPoints = new THREE.Points(contGeo, contMat);
    scene.add(contPoints);

    // City nodes (brighter, larger)
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(buildNodeCloud(), 3));
    const nodeMat = new THREE.PointsMaterial({ color: 0x00ffaa, size: 0.06, transparent: true, opacity: 1.0, sizeAttenuation: true });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodePoints);

    // Connection arcs (LineSegments)
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(buildConnectionLines(), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00cc88, transparent: true, opacity: 0.25 });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    // Fresnel atmosphere
    const atmoMat = new THREE.ShaderMaterial({
        vertexShader:   ATMO_VERT,
        fragmentShader: ATMO_FRAG,
        uniforms: { glowColor: { value: new THREE.Color(0x008069) } },
        blending:    THREE.AdditiveBlending,
        side:        THREE.BackSide,
        transparent: true,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(ATMO_R, 64, 64), atmoMat));

    // Mouse parallax
    let mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth  - 0.5) *  0.5;
        my = (e.clientY / window.innerHeight - 0.5) * -0.35;
    }, { passive: true });

    // Resize
    window.addEventListener('resize', () => {
        const W = canvasEl.clientWidth;
        const H = canvasEl.clientHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    }, { passive: true });

    // Animation loop
    const GROUP = [globe, contPoints, nodePoints];
    const Y_SPEED = 0.0025;

    (function animate() {
        requestAnimationFrame(animate);
        tx += (mx - tx) * 0.04;
        ty += (my - ty) * 0.04;
        GROUP.forEach(o => {
            o.rotation.y += Y_SPEED;
            o.rotation.x = ty;
            o.rotation.z = tx * 0.25;
        });
        renderer.render(scene, camera);
    })();
}
