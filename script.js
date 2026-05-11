gsap.registerPlugin(ScrollTrigger);

// === 0. LENIS SMOOTH SCROLL ===
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

window.addEventListener('load', () => {
    gsap.from('.hero-header', { opacity: 0, y: 10, duration: 1, ease: 'power2.out', delay: 0.8 });
});

// === 1. NAVBAR ===
const menuBtn = document.getElementById('menuBtn');
const navOverlay = document.getElementById('navOverlay');
const navCloseBtn = document.getElementById('navCloseBtn');
const navLinks = document.querySelectorAll('#navLinks a');

function openNav() {
    navOverlay.classList.add('open');
    document.body.classList.add('nav-open');
    menuBtn.style.opacity = '0'; menuBtn.style.pointerEvents = 'none';
    navLinks.forEach((link, i) => {
        setTimeout(() => link.classList.add('nav-visible'), 120 + i * 100);
    });
}
function closeNav() {
    // Fade out links with blur before closing panel
    navLinks.forEach((l, i) => {
        l.style.transition = 'opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease';
        l.style.opacity = '0'; l.style.filter = 'blur(8px)'; l.style.transform = 'translateX(20px)';
    });
    setTimeout(() => {
        navLinks.forEach(l => { l.classList.remove('nav-visible'); l.style.transition = ''; l.style.opacity = ''; l.style.filter = ''; l.style.transform = ''; });
        navOverlay.classList.remove('open');
        document.body.classList.remove('nav-open');
        menuBtn.style.opacity = '1'; menuBtn.style.pointerEvents = 'auto';
    }, 350);
}
menuBtn.addEventListener('click', openNav);
navCloseBtn.addEventListener('click', closeNav);
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault(); closeNav();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) setTimeout(() => lenis.scrollTo(target, { offset: 0, duration: 1.2 }), 500);
    });
});

// === 2. CURSOR ===
const cursorCanvas = document.getElementById('cursor-trail');
const cCtx = cursorCanvas.getContext('2d');
cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight;
let trailParticles = [], ambientParticles = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
for (let i = 0; i < 100; i++) ambientParticles.push({ x: Math.random() * cursorCanvas.width, y: Math.random() * cursorCanvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 1.5 + 0.5 });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; trailParticles.push({ x: mouse.x, y: mouse.y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 1.0, size: Math.random() * 2 + 1 }); });
function animateCursor() {
    cCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    cCtx.fillStyle = "rgba(220,181,88,0.35)";
    for (let p of ambientParticles) { p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = cursorCanvas.width; if (p.x > cursorCanvas.width) p.x = 0; if (p.y < 0) p.y = cursorCanvas.height; if (p.y > cursorCanvas.height) p.y = 0; let dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.sqrt(dx * dx + dy * dy); if (d < 120) { let f = (120 - d) / 120; p.x -= (dx / d) * f * 2; p.y -= (dy / d) * f * 2; } cCtx.beginPath(); cCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2); cCtx.fill(); }
    cCtx.beginPath(); cCtx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2); cCtx.fillStyle = "rgba(220,181,88,0.8)"; cCtx.shadowBlur = 15; cCtx.shadowColor = "#dcb558"; cCtx.fill(); cCtx.shadowBlur = 0;
    for (let i = 0; i < trailParticles.length; i++) { let p = trailParticles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.02; if (p.life <= 0) { trailParticles.splice(i, 1); i--; continue; } cCtx.beginPath(); cCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); cCtx.fillStyle = `rgba(220,181,88,${p.life})`; cCtx.fill(); }
    requestAnimationFrame(animateCursor);
}
animateCursor();

// === 3. HERO THREE.JS GAME ===
/*
const heroContainer = document.getElementById('hero-webgl');
const hScene = new THREE.Scene();
hScene.fog = new THREE.FogExp2(0x030604, 0.0015);
const hCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2500);
hCamera.position.set(0, 0, 0);
const hRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
hRenderer.setSize(window.innerWidth, window.innerHeight);
hRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
heroContainer.appendChild(hRenderer.domElement);

const renderScene = new THREE.RenderPass(hScene, hCamera);
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.5, 0.2);
const composer = new THREE.EffectComposer(hRenderer);
composer.addPass(renderScene); composer.addPass(bloomPass);

hScene.add(new THREE.AmbientLight(0x204937, 0.5));
const playerLight = new THREE.PointLight(0xdcb558, 4, 1200);
hScene.add(playerLight);

// Higher poly star field that doesn't vanish
const starCount = 1200;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starVel = [];
for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 400;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 400;
    starPos[i * 3 + 2] = -Math.random() * 2500;
    starVel.push(0.3 + Math.random() * 1.2);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0xefe7d8, size: 2.0, transparent: true, opacity: 0.8, sizeAttenuation: true });
const stars = new THREE.Points(starGeo, starMat);
hScene.add(stars);

// Higher poly obstacles and rings
const artifactMat = new THREE.MeshPhysicalMaterial({ color: 0x112b1d, metalness: 0.8, roughness: 0.2, clearcoat: 1.0, emissive: 0x112b1d, emissiveIntensity: 0.15 });
const ringMat = new THREE.MeshPhysicalMaterial({ color: 0xdcb558, emissive: 0xdcb558, emissiveIntensity: 0.8, metalness: 0.3, roughness: 0.1, clearcoat: 1.0 });
// Higher detail geometry (more segments)
const artifactGeo = new THREE.OctahedronGeometry(6, 2);
const ringGeo = new THREE.TorusGeometry(12, 1.0, 32, 100);
const objects = [];
const tunnelLength = 2500;

for (let i = 0; i < 30; i++) {
    const m = new THREE.Mesh(artifactGeo, artifactMat);
    const r = Math.random() * 90;
    m.position.set(Math.cos(Math.random() * Math.PI * 2) * r, (Math.random() - 0.5) * 90, -Math.random() * tunnelLength);
    m.rotation.set(Math.random(), Math.random(), 0);
    hScene.add(m); objects.push({ mesh: m, type: 'bg', hurtTriggered: false });
}
for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(ringGeo, ringMat);
    m.position.set(Math.cos(Math.random() * Math.PI * 2) * (Math.random() * 50), (Math.random() - 0.5) * 50, -Math.random() * tunnelLength);
    hScene.add(m); objects.push({ mesh: m, type: 'ring', collected: false });
}

let snitchObj = { mesh: null, type: 'snitch', collected: false };
const gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('nimbus2000.glb', gltf => {
    const model = gltf.scene; model.scale.set(5, 5, 5); model.position.set(20, 10, -900);
    model.traverse(c => { if (c.isMesh && c.material) { c.material.metalness = 0.8; c.material.roughness = 0.2; } });
    hScene.add(model); snitchObj.mesh = model; objects.push(snitchObj);
}, undefined, err => console.error("GLB error:", err));

let targetX = 0, targetY = 0, lastTargetX = 0;
const cameraRoll = { hurt: 0, bank: 0 };
let score = 0;
let gameSpeedMultiplier = 1.0;
const scoreNum = document.getElementById('scoreNum');
const scoreBox = document.getElementById('scoreBox');

window.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = -(e.clientY / window.innerHeight) * 2 + 1;
});

let currentSpeed = 0, heroTime = 0, heroVisible = true;
ScrollTrigger.create({ trigger: "#hero", start: "top bottom", end: "bottom top", onToggle: self => heroVisible = self.isActive });

function updateSpeedFromScore() {
    const tier = Math.floor(score / 10);
    gameSpeedMultiplier = 1.0 + (tier * 0.10);
}

function animateHero() {
    requestAnimationFrame(animateHero);
    if (!heroVisible) return;
    heroTime += 0.01;

    const baseSpeed = 1.0 * gameSpeedMultiplier;
    currentSpeed += (baseSpeed - currentSpeed) * 0.03;
    hCamera.position.z -= currentSpeed;
    playerLight.position.copy(hCamera.position);

    hCamera.position.x += (targetX * 55 - hCamera.position.x) * 0.025;
    hCamera.position.y += (targetY * 40 - hCamera.position.y) * 0.025;
    hCamera.rotation.y = -hCamera.position.x * 0.004;
    hCamera.rotation.x = hCamera.position.y * 0.004;

    let targetVelX = targetX - lastTargetX;
    cameraRoll.bank += (targetVelX * 2.5 - cameraRoll.bank) * 0.05;
    lastTargetX = targetX;
    hCamera.rotation.z = cameraRoll.bank + cameraRoll.hurt;

    // Stars — always recycle relative to camera, never vanish
    const sp = starGeo.attributes.position.array;
    const tf = gameSpeedMultiplier;
    starMat.size = 2.0 + (tf - 1) * 4;  // Trails get bigger with speed
    starMat.opacity = Math.min(1.0, 0.7 + (tf - 1) * 0.3);
    for (let i = 0; i < starCount; i++) {
        sp[i * 3 + 2] += currentSpeed * starVel[i];
        // Recycle stars that pass behind the camera
        if (sp[i * 3 + 2] > hCamera.position.z + 200) {
            sp[i * 3 + 2] = hCamera.position.z - 2000 - Math.random() * 500;
            sp[i * 3] = (Math.random() - 0.5) * 400;
            sp[i * 3 + 1] = (Math.random() - 0.5) * 400;
        }
    }
    starGeo.attributes.position.needsUpdate = true;
    bloomPass.strength = 1.2 + (tf - 1) * 1.0;

    // Nimbus bob
    if (snitchObj.mesh && !snitchObj.collected) {
        snitchObj.mesh.position.x += Math.sin(heroTime * 2) * 0.3;
        snitchObj.mesh.position.y += Math.cos(heroTime * 3) * 0.2;
        snitchObj.mesh.rotation.z = Math.sin(heroTime * 2) * 0.1;
    }

    objects.forEach(obj => {
        const mesh = obj.mesh; if (!mesh) return;
        if (obj.type === 'bg') {
            mesh.rotation.x += 0.003; mesh.rotation.y += 0.003;
            if (hCamera.position.z < mesh.position.z && hCamera.position.z > mesh.position.z - 18) {
                let dx = hCamera.position.x - mesh.position.x, dy = hCamera.position.y - mesh.position.y;
                if (Math.sqrt(dx * dx + dy * dy) < 14 && !obj.hurtTriggered) {
                    obj.hurtTriggered = true; score = 0; updateSpeedFromScore();
                    scoreNum.innerText = score;
                    gsap.fromTo(scoreBox, { scale: 1.2, color: "#f00" }, { scale: 1, color: "var(--beige)", duration: 0.4 });
                    const flash = document.getElementById('hurt-flash');
                    if (flash) gsap.fromTo(flash, { opacity: 0.25 }, { opacity: 0, duration: 0.5, ease: "power2.out" });
                    gsap.fromTo(cameraRoll, { hurt: (Math.random() > 0.5 ? 0.2 : -0.2) }, { hurt: 0, duration: 0.6, ease: "elastic.out(1,0.3)" });
                }
            } else obj.hurtTriggered = false;
        }
        if ((obj.type === 'ring' || obj.type === 'snitch') && !obj.collected) {
            if (hCamera.position.z < mesh.position.z && hCamera.position.z > mesh.position.z - 18) {
                let dx = hCamera.position.x - mesh.position.x, dy = hCamera.position.y - mesh.position.y;
                if (Math.sqrt(dx * dx + dy * dy) < (obj.type === 'ring' ? 20 : 16)) {
                    obj.collected = true; score += obj.type === 'snitch' ? 5 : 1; updateSpeedFromScore();
                    scoreNum.innerText = score;
                    gsap.fromTo(scoreBox, { scale: 1.2, color: "#fff" }, { scale: 1, color: "var(--beige)", duration: 0.4 });
                    if (obj.type === 'ring') { const fm = mesh.material.clone(); fm.emissiveIntensity = 4; mesh.material = fm; }
                    gsap.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 0.4, ease: "power2.in" });
                    setTimeout(() => mesh.visible = false, 400);
                }
            }
        }
        // Recycle objects
        if (mesh.position.z > hCamera.position.z + 80) {
            mesh.position.z -= tunnelLength;
            if (obj.type === 'ring' || obj.type === 'snitch') {
                obj.collected = false; mesh.visible = true;
                if (obj.type === 'ring') { mesh.scale.set(1, 1, 1); mesh.material = ringMat; } else mesh.scale.set(5, 5, 5);
                mesh.position.x = Math.cos(Math.random() * Math.PI * 2) * (Math.random() * 50);
                mesh.position.y = (Math.random() - 0.5) * 50;
            }
            if (obj.type === 'bg') {
                obj.hurtTriggered = false; const r = Math.random() * 90;
                mesh.position.x = Math.cos(Math.random() * Math.PI * 2) * r;
                mesh.position.y = (Math.random() - 0.5) * 90;
            }
        }
    });
    composer.render();
}
animateHero();
*/

// === 4. ABOUT ME PARALLAX ===
const aboutC = document.getElementById('aboutImageContainer');
const aboutImg = document.getElementById('aboutImageMain');
if (aboutC && aboutImg) {
    aboutC.addEventListener('mousemove', e => {
        const r = aboutC.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        aboutImg.style.transform = `translate(${x * 20}px, ${y * 20}px) scale(1.05)`;
    });
    aboutC.addEventListener('mouseleave', () => { aboutImg.style.transform = 'translate(0,0) scale(1)'; });
}

// === 5. STITCHING — scroll-linked left/right movement ===
const stitchLine = document.getElementById('stitchLine');
const stitchLineBottom = document.getElementById('stitchLineBottom');
if (stitchLine) {
    ScrollTrigger.create({
        trigger: '#stitchStrip', start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate: self => { stitchLine.style.transform = `translateY(-50%) translateX(${-self.progress * 10}%)`; }
    });
}
if (stitchLineBottom) {
    ScrollTrigger.create({
        trigger: '#stitchStripBottom', start: 'top bottom', end: 'bottom top', scrub: true,
        onUpdate: self => { stitchLineBottom.style.transform = `translateY(-50%) translateX(${-self.progress * 10}%)`; }
    });
}

// === 5.1. LOGO MARQUEE — scroll-speed modulation ===
(function initMarquee() {
    const wrapper = document.getElementById('logo-marquee');
    if (!wrapper) return;
    const BASE_SPEED = 22; // seconds for a full loop at rest
    const MIN_SPEED  =  6; // seconds at max scroll velocity
    let currentSpeed = BASE_SPEED;
    let lastScrollY = window.scrollY;
    let raf;

    function tick() {
        const scrollY = window.scrollY;
        const velocity = Math.abs(scrollY - lastScrollY); // px/frame
        lastScrollY = scrollY;

        // Map velocity → duration (faster scroll = lower duration = faster strip)
        const targetSpeed = Math.max(MIN_SPEED, BASE_SPEED - velocity * 0.4);
        currentSpeed += (targetSpeed - currentSpeed) * 0.08; // smooth lerp

        wrapper.style.setProperty('--marquee-speed', `${currentSpeed.toFixed(2)}s`);
        raf = requestAnimationFrame(tick);
    }

    // Only run the loop when the marquee is visible
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { raf = requestAnimationFrame(tick); }
        else { cancelAnimationFrame(raf); }
    }, { threshold: 0 });
    observer.observe(wrapper);
})();

// === 5.5. RECENT WORKS CAROUSEL ===
const rwSlider = document.querySelector('.carousel-container');
const customCursor = document.querySelector('.custom-cursor');
const carouselItems = document.querySelectorAll('.carousel-item');

if (rwSlider) {
    let rwIsDragging = false;

    rwSlider.addEventListener('mousedown', (e) => {
        rwIsDown = true;
        rwIsDragging = false;
        rwStartX = e.pageX - rwSlider.offsetLeft;
        rwScrollLeft = rwSlider.scrollLeft;
        rwSlider.style.scrollSnapType = 'none';
    });

    rwSlider.addEventListener('mouseleave', () => {
        rwIsDown = false;
        rwSlider.style.scrollSnapType = 'x mandatory';
    });

    rwSlider.addEventListener('mouseup', () => {
        rwIsDown = false;
        rwSlider.style.scrollSnapType = 'x mandatory';
    });

    rwSlider.addEventListener('mousemove', (e) => {
        if (!rwIsDown) return;
        e.preventDefault();
        rwIsDragging = true;
        const x = e.pageX - rwSlider.offsetLeft;
        const walk = (x - rwStartX) * 2;
        rwSlider.scrollLeft = rwScrollLeft - walk;
    });

    // Prevent clicks on links while dragging
    rwSlider.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', e => {
            if (rwIsDragging) e.preventDefault();
        });
    });

    // Set video speeds
    const rwVideos = rwSlider.querySelectorAll('video');
    rwVideos.forEach(v => {
        v.playbackRate = 0.75;
        const item = v.closest('.carousel-item');
        if (item) {
            item.addEventListener('mouseenter', () => { v.playbackRate = 1.0; });
            item.addEventListener('mouseleave', () => { v.playbackRate = 0.75; });
        }
    });

    // Wheel Scroll Logic
    rwSlider.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            rwSlider.style.scrollSnapType = 'none';
            rwSlider.scrollLeft += e.deltaY;

            clearTimeout(rwSlider.scrollTimeout);
            rwSlider.scrollTimeout = setTimeout(() => {
                rwSlider.style.scrollSnapType = 'x mandatory';
            }, 150);
        }
    }, { passive: false });

    // Custom Cursor Pill Toggle
    if (customCursor) {
        carouselItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                customCursor.classList.add('active');
            });
            item.addEventListener('mouseleave', () => {
                customCursor.classList.remove('active');
            });
        });
    }
}

// === GLOBAL CURSOR TRACKING ===
document.addEventListener('mousemove', (e) => {
    if(customCursor) {
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
    }
    
    let shouldShowTriangle = false;
    if (document.body.classList.contains('nav-open')) {
        shouldShowTriangle = true;
    } else if (window.scrollY > window.innerHeight * 0.8) {
        shouldShowTriangle = true;
    } else {
        const target = e.target;
        if (target && target.closest && (target.closest('.hero-logo') || target.closest('.menu-btn'))) {
            shouldShowTriangle = true;
        }
    }
    
    if (shouldShowTriangle) {
        document.body.classList.add('show-triangle');
        if(cursorCanvas) cursorCanvas.style.opacity = '0';
    } else {
        document.body.classList.remove('show-triangle');
        if(cursorCanvas) cursorCanvas.style.opacity = '1';
    }
});

// Update cursor state on scroll too
window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.8) {
        document.body.classList.add('show-triangle');
        if(cursorCanvas) cursorCanvas.style.opacity = '0';
    } else if (!document.body.classList.contains('nav-open')) {
        document.body.classList.remove('show-triangle');
        if(cursorCanvas) cursorCanvas.style.opacity = '1';
    }
});

// === 6. VIDEO CAROUSEL ===
const videoFiles = [
    "https://res.cloudinary.com/devodfvpg/video/upload/v1777833870/vid_6_rsor4d.mp4", "https://res.cloudinary.com/devodfvpg/video/upload/v1777833853/vid_5_dydn6k.mp4",
    "https://res.cloudinary.com/devodfvpg/video/upload/v1777833849/vid_2_lvomec.mp4",
    "https://res.cloudinary.com/devodfvpg/video/upload/v1777833848/vid_8_iz3cpy.mp4", "https://res.cloudinary.com/devodfvpg/video/upload/v1777833846/vid_7_gv7zok.mp4",
    "https://res.cloudinary.com/devodfvpg/video/upload/v1777833834/vid_4_t3vqxz.mp4",
    "https://res.cloudinary.com/devodfvpg/video/upload/v1777833837/vid_1_ehju5n.mp4", "https://res.cloudinary.com/devodfvpg/video/upload/v1777833827/vid_3_kjsf8d.mp4",
    "https://res.cloudinary.com/devodfvpg/video/upload/v1777834715/vid_9_nprjnw.mp4", "https://res.cloudinary.com/devodfvpg/video/upload/v1777835015/vid_11_dzvcx8.mp4"

];
const track = document.getElementById('track');
const viewport = document.getElementById('viewport');
if (track && viewport) {
    const cardW = 320, gap = 20, step = cardW + gap, totalOrig = videoFiles.length, setW = totalOrig * step, copies = 3, totalCards = totalOrig * copies, cardsData = [];
    function loopSeg(v, s, e) { v.addEventListener('timeupdate', () => { if (v.currentTime >= e) v.currentTime = s; }); v.currentTime = s; }
    for (let i = 0; i < totalCards; i++) {
        const oi = i % totalOrig, card = document.createElement('div'); card.className = 'video-card';
        const v = document.createElement('video'); v.src = videoFiles[oi]; v.loop = true; v.controls = true; v.playsInline = true;
        if (oi === 0) loopSeg(v, 12, 18);
        card.appendChild(v); track.appendChild(card);
        const ox = i - Math.floor(totalCards / 2); cardsData.push({ element: card, video: v, initialX: ox * step, isHovered: false, currentVolume: 0 });
        card.addEventListener('mouseenter', () => cardsData[i].isHovered = true);
        card.addEventListener('mouseleave', () => cardsData[i].isHovered = false);
    }
    let vSX = 0, vTX = 0, vV = 0, vD = false, vLM = 0;
    viewport.addEventListener('mousedown', e => { vD = true; vLM = e.clientX; cardsData.forEach(c => { c.video.muted = false; c.video.play().catch(() => { }); }); }, { once: true });
    viewport.addEventListener('mousedown', e => { vD = true; vLM = e.clientX; });
    window.addEventListener('mousemove', e => { if (!vD) return; const dx = e.clientX - vLM; vTX += dx; vV = dx; vLM = e.clientX; });
    window.addEventListener('mouseup', () => { vD = false; });
    function updateCarousel() {
        requestAnimationFrame(updateCarousel);
        if (!vD) { vV *= 0.95; vTX += vV; } vSX += (vTX - vSX) * 0.15;
        if (vSX > setW) { vSX -= setW; vTX -= setW; } else if (vSX < -setW) { vSX += setW; vTX += setW; }
        cardsData.forEach(item => {
            let xP = item.initialX + vSX; const mD = setW * 1.5;
            if (xP > mD) xP -= totalCards * step; if (xP < -mD) xP += totalCards * step;
            const dist = Math.abs(xP), tZ = Math.pow(dist * 0.018, 2), rY = xP * -0.025;
            const sat = Math.max(0.1, 1 - (dist * 0.0008)), br = Math.max(0.4, 1 - (dist * 0.0006));
            item.element.style.transform = `translateX(-50%) translateX(${xP}px) translateZ(${tZ}px) rotateY(${rY}deg)`;
            item.element.style.filter = `saturate(${sat}) brightness(${br})`;
            if (dist > window.innerWidth) { if (!item.video.paused) item.video.pause(); } else { if (item.video.paused) item.video.play().catch(() => { }); }
            const dV = Math.max(0, 1 - (dist / 800)); const tV = (item.isHovered ? dV : 0) * 0.3;
            item.currentVolume += (tV - item.currentVolume) * (item.isHovered ? 0.3 : 0.05);
            item.video.volume = Math.max(0, Math.min(1, item.currentVolume));
        });
    }
    updateCarousel();
}

// === 7. GLOBE (Social Links) ===
const globeLinks = [
    { text: "YT Jobs", url: "https://ytjobs.co/talent/profile/366909", class: "small" },
    { text: "YouTube", url: "https://www.youtube.com/channel/UCsCdwBb52kMkD_w94Mn2Y8A?sub_confirmation=1", class: "large" },
    { text: "Instagram", url: "https://www.instagram.com/itsehtishaam", class: "small" },
    { text: "LinkedIn", url: "https://www.linkedin.com/in/ehtishaam-shaikh/", class: "large" },
    { text: "Behance", url: "https://www.behance.net/EhtishaamShaikh", class: "small" },
    { text: "Pinterest", url: "https://in.pinterest.com/itsehtishaam/", class: "medium" }
];
const gContainer = document.getElementById('globe-container');
if (gContainer) {
    const globeElements = [], gRadius = 190;
    let gRotX = 0, gRotY = 0, gTargetRotX = 0, gTargetRotY = 0, gDragging = false, gPrevMouse = { x: 0, y: 0 };
    const phi = Math.PI * (3 - Math.sqrt(5));
    const echoLayers = 4, echoDelay = 4, rotHistory = [];

    // Add canvas for web lines
    const gCanvas = document.createElement('canvas');
    gCanvas.style.position = 'absolute';
    gCanvas.style.top = '0';
    gCanvas.style.left = '0';
    gCanvas.style.width = '100%';
    gCanvas.style.height = '100%';
    gCanvas.style.pointerEvents = 'none';
    gContainer.appendChild(gCanvas);

    const gCtx = gCanvas.getContext('2d');
    function updateCanvasSize() {
        gCanvas.width = gContainer.offsetWidth;
        gCanvas.height = gContainer.offsetHeight;
    }
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    for (let layer = 0; layer < echoLayers; layer++) {
        const layerEls = [];
        globeLinks.forEach((item, i) => {
            const el = document.createElement('a');
            el.className = 'globe-word footer-social-link ' + item.class;
            el.innerText = item.text;
            if (layer === 0) {
                el.href = item.url;
                el.target = "_blank";
                el.style.pointerEvents = 'auto';
                el.addEventListener('mouseenter', () => el.isHovered = true);
                el.addEventListener('mouseleave', () => el.isHovered = false);
                el.addEventListener('click', e => { if (gWasDragged) e.preventDefault(); });
                el.addEventListener('dragstart', e => e.preventDefault());
            } else {
                el.style.pointerEvents = 'none';
            }
            gContainer.appendChild(el);
            const y = 1 - (i / (globeLinks.length - 1)) * 2, r = Math.sqrt(1 - y * y), theta = phi * i;
            layerEls.push({ el, x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
        });
        globeElements.push(layerEls);
    }

    let gWasDragged = false;
    gContainer.addEventListener('mousedown', e => { 
        gDragging = true; 
        gWasDragged = false;
        gPrevMouse = { x: e.clientX, y: e.clientY }; 
    });
    window.addEventListener('mouseup', () => { 
        setTimeout(() => gDragging = false, 0); 
    });
    window.addEventListener('mousemove', e => {
        if (gDragging) {
            if(Math.abs(e.clientX - gPrevMouse.x) > 2 || Math.abs(e.clientY - gPrevMouse.y) > 2) gWasDragged = true;
            gTargetRotY += (e.clientX - gPrevMouse.x) * 0.01;
            gTargetRotX += (e.clientY - gPrevMouse.y) * 0.01;
            gPrevMouse = { x: e.clientX, y: e.clientY };
        }
    });

    function animateGlobe() {
        requestAnimationFrame(animateGlobe);
        if (!gDragging) gTargetRotY -= 0.002;
        gRotX += (gTargetRotX - gRotX) * 0.1; gRotY += (gTargetRotY - gRotY) * 0.1;
        rotHistory.unshift({ x: gRotX, y: gRotY });
        if (rotHistory.length > echoLayers * echoDelay + 1) rotHistory.pop();

        gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
        const cx = gCanvas.width / 2;
        const cy = gCanvas.height / 2;
        const layer0Points = [];

        for (let layer = 0; layer < echoLayers; layer++) {
            let hi = layer * echoDelay; if (hi >= rotHistory.length) hi = rotHistory.length - 1;
            const cRX = rotHistory[hi].x, cRY = rotHistory[hi].y;
            const cosX = Math.cos(cRX), sinX = Math.sin(cRX), cosY = Math.cos(cRY), sinY = Math.sin(cRY);
            globeElements[layer].forEach(item => {
                let y1 = item.y * cosX - item.z * sinX, z1 = item.y * sinX + item.z * cosX;
                let x2 = item.x * cosY + z1 * sinY, z2 = -item.x * sinY + z1 * cosY;
                const scale = (z2 + 1) / 2, depthOp = Math.max(0.1, scale);
                const layerOp = layer === 0 ? 1 : (1 / (layer * 1.5 + 1));
                item.el.style.transform = `translate3d(${x2 * gRadius}px, ${y1 * gRadius}px, ${z2 * gRadius}px)`;
                item.el.style.opacity = depthOp * layerOp;

                if (layer === 0) {
                    layer0Points.push({ x: cx + x2 * gRadius, y: cy + y1 * gRadius, z: z2 });
                }

                // Keep sizes proportional to original classes
                let baseSize = 1.0;
                if (item.el.classList.contains('large')) baseSize = 1.5;
                if (item.el.classList.contains('small')) baseSize = 0.65;
                item.el.style.fontSize = `${scale * baseSize + (baseSize / 2)}rem`;

                if (layer === 0) {
                    if (item.el.isHovered) {
                        item.el.style.color = 'var(--forest-green)';
                    } else {
                        item.el.style.color = z2 > 0 ? 'var(--dark-void)' : 'rgba(3, 6, 4, 0.4)';
                    }
                    item.el.style.filter = '';
                } else {
                    item.el.style.color = z2 > 0 ? 'rgba(3, 6, 4, 0.2)' : 'rgba(3, 6, 4, 0.05)';
                    item.el.style.filter = `blur(${layer}px)`;
                }
                item.el.style.zIndex = Math.round(z2 * 100) - layer;
            });
        }

        // Draw connecting lines for the web effect
        gCtx.lineWidth = 1.5;
        for (let i = 0; i < layer0Points.length; i++) {
            for (let j = i + 1; j < layer0Points.length; j++) {
                const p1 = layer0Points[i];
                const p2 = layer0Points[j];
                const avgZ = (p1.z + p2.z) / 2;

                // Opacity is higher when points are in front (z > 0)
                const opacity = Math.max(0.02, (avgZ + 1) / 2 * 0.15);
                gCtx.strokeStyle = `rgba(3, 6, 4, ${opacity})`;
                gCtx.beginPath();
                gCtx.moveTo(p1.x, p1.y);
                gCtx.lineTo(p2.x, p2.y);
                gCtx.stroke();
            }
        }
    }
    animateGlobe();
}

// === 8. FOOTER ===
initSplashCursor('footer-webgl');
gsap.fromTo('.footer-content', { y: -150 }, { y: 0, ease: "none", scrollTrigger: { trigger: "footer", start: "top bottom", end: "bottom bottom", scrub: true } });
gsap.to('.footer-large-text', { y: 15, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });

// === 9. SCROLL ANIMATIONS ===
gsap.from('.about-text', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.about-section', start: 'top 75%' } });
gsap.from('.about-image-container', { y: 80, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.about-section', start: 'top 70%' } });
gsap.from('.work-card', { y: 100, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.2, scrollTrigger: { trigger: '.works-section', start: 'top 75%' } });

const sigTl = gsap.timeline({ scrollTrigger: { trigger: '.about-section', start: 'top 75%' } });
sigTl.fromTo('#signature',
    { strokeDashoffset: 1, fill: 'transparent' },
    { strokeDashoffset: 0, duration: 3, ease: 'power2.out' }
).to('#signature', { fill: '#204937', duration: 1 }, "-=1.5");

// === RESIZE ===
window.addEventListener('resize', () => {
    if (typeof hCamera !== 'undefined' && typeof hRenderer !== 'undefined' && typeof composer !== 'undefined') {
        hCamera.aspect = window.innerWidth / window.innerHeight; hCamera.updateProjectionMatrix();
        hRenderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
    }
    cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight;
});

// === 10. TESTIMONIALS CAROUSEL ===
const rawTestimonials = [
    {
        name: "ayzz.designer",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is."
    },
    {
        name: "ayzz.designer",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is."
    },
    {
        name: "ayzz.designer",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is."
    },
    {
        name: "ayzz.designer",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is."
    },
    {
        name: "ayzz.designer",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is."
    }
];

// Duplicate the testimonials array many times to create a seamless infinite loop effect
const testimonialsData = [...rawTestimonials];
for (let i = 0; i < 20; i++) {
    testimonialsData.push(...rawTestimonials);
}

const tTrack = document.getElementById('testimonial-track');
if (tTrack) {
    let tCurrentIndex = Math.floor(testimonialsData.length / 2); // Start with the middle card

    function initTCarousel() {
        // Render Cards
        tTrack.innerHTML = '';
        testimonialsData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = `testimonial-card ${index === tCurrentIndex ? 'active' : ''}`;
            card.onclick = () => goToTSlide(index);

            card.innerHTML = `
                <div class="testimonial-card-header">
                    <img src="${item.image}" alt="${item.name}" class="testimonial-profile-img">
                    <div class="testimonial-user-info">
                        <h3>${item.name}</h3>
                    </div>
                </div>
                <div class="testimonial-text">
                    ${item.text}
                </div>
            `;
            tTrack.appendChild(card);
        });

        // Initial positioning
        setTimeout(updateTCarouselPosition, 50); // slight delay to allow rendering
    }

    function updateTCarouselPosition() {
        const cards = tTrack.querySelectorAll('.testimonial-card');
        if (cards.length === 0) return;

        const cardElement = cards[0];
        const cardWidth = cardElement.offsetWidth;
        const style = window.getComputedStyle(cardElement);
        const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        const totalCardWidth = cardWidth + margin;

        const centerIndex = (testimonialsData.length - 1) / 2;
        const indexDiff = centerIndex - tCurrentIndex;
        const offset = indexDiff * totalCardWidth;

        tTrack.style.transform = `translateX(calc(-50% + ${offset}px))`;

        const targetGap = 20;
        const desiredX = [];
        desiredX[tCurrentIndex] = 0;

        const scales = [];
        const translateYs = [];

        for (let i = 0; i < cards.length; i++) {
            const dist = Math.abs(i - tCurrentIndex);
            scales[i] = dist === 0 ? 1.05 : 0.85 - (0.15 * dist);
            translateYs[i] = dist === 0 ? -30 : Math.pow(dist, 1.4) * 60;
        }

        for (let i = tCurrentIndex + 1; i < cards.length; i++) {
            const prevWidth = cardWidth * scales[i - 1];
            const currWidth = cardWidth * scales[i];
            desiredX[i] = desiredX[i - 1] + (prevWidth / 2) + targetGap + (currWidth / 2);
        }

        for (let i = tCurrentIndex - 1; i >= 0; i--) {
            const nextWidth = cardWidth * scales[i + 1];
            const currWidth = cardWidth * scales[i];
            desiredX[i] = desiredX[i + 1] - (nextWidth / 2) - targetGap - (currWidth / 2);
        }

        cards.forEach((card, index) => {
            const distance = Math.abs(index - tCurrentIndex);
            const scale = scales[index];
            const translateY = translateYs[index];

            if (distance === 0) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }

            const flexX = (index - tCurrentIndex) * totalCardWidth;
            const shiftX = desiredX[index] - flexX;

            card.style.transform = `translateX(${shiftX}px) scale(${scale}) translateY(${translateY}px)`;
            card.style.opacity = 1;
            card.style.zIndex = 20 - distance;
        });
    }

    function goToTSlide(index) {
        if (index < 0) index = 0;
        if (index >= testimonialsData.length) index = testimonialsData.length - 1;

        tCurrentIndex = index;
        updateTCarouselPosition();
    }

    initTCarousel();
    window.addEventListener('resize', updateTCarouselPosition);

    let tStartX = 0;
    let tIsDragging = false;

    tTrack.addEventListener('mousedown', (e) => {
        tStartX = e.pageX;
        tIsDragging = true;
        tTrack.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!tIsDragging) return;
        // Optionally update track position here for immediate drag feel
    });

    window.addEventListener('mouseup', (e) => {
        if (!tIsDragging) return;
        tIsDragging = false;
        tTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

        const diff = e.pageX - tStartX;
        if (Math.abs(diff) > 100) {
            if (diff > 0) goToTSlide(tCurrentIndex - 1);
            else goToTSlide(tCurrentIndex + 1);
        } else {
            updateTCarouselPosition();
        }
    });

    tTrack.addEventListener('touchstart', (e) => {
        tStartX = e.touches[0].clientX;
        tIsDragging = true;
        tTrack.style.transition = 'none';
    });

    window.addEventListener('touchend', (e) => {
        if (!tIsDragging) return;
        tIsDragging = false;
        tTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

        const diff = e.changedTouches[0].clientX - tStartX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToTSlide(tCurrentIndex - 1);
            else goToTSlide(tCurrentIndex + 1);
        } else {
            updateTCarouselPosition();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToTSlide(tCurrentIndex - 1);
        else if (e.key === 'ArrowRight') goToTSlide(tCurrentIndex + 1);
    });
}

// === 11. SCROLL MARQUEE ===
const curvedTextPath = document.getElementById('curved-marquee-text');
if (curvedTextPath) {
    const phrase = "• Mohammed Ehtishaam Shaikh • Video Editor & Motion Graphics Designer  ";
    curvedTextPath.textContent = phrase.repeat(50);
    let baseOffset = -2000;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const speed = 0.5;
        const currentOffset = baseOffset - (scrollY * speed);
        curvedTextPath.setAttribute('startOffset', currentOffset + 'px');
    });

    curvedTextPath.setAttribute('startOffset', baseOffset + 'px');
}

// === 12. LOGO MARQUEE SCROLL ===
const logoMarquee = document.getElementById('logo-marquee');
if (logoMarquee) {
    logoMarquee.style.animation = 'none';
    let currentOffset = 0;
    let lastScrollY = window.scrollY;

    function animateLogoMarquee() {
        requestAnimationFrame(animateLogoMarquee);
        
        // Scroll response
        const scrollY = window.scrollY;
        const delta = scrollY - lastScrollY;
        currentOffset -= delta * 0.5; 
        lastScrollY = scrollY;

        const trackWidth = logoMarquee.scrollWidth / 2;
        if (trackWidth > 0) {
            let normalizedOffset = currentOffset % trackWidth;
            if (normalizedOffset > 0) normalizedOffset -= trackWidth;
            logoMarquee.style.transform = `translateX(${normalizedOffset}px)`;
        }
    }
    animateLogoMarquee();
}
