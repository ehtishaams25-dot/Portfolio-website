/* JUSTHERO.JS — Game + GhostCursor */

// ─── AUDIO ───
let ac = null;
let acReady = false;

function unlockAudio() {
    if (!ac) {
        try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    }
    if (ac.state === 'suspended') {
        ac.resume().then(() => { acReady = (ac.state === 'running'); });
    } else {
        acReady = (ac.state === 'running');
    }
}
// Unlock on any gesture
['click', 'mousedown', 'touchstart', 'keydown', 'mousemove'].forEach(ev =>
    document.addEventListener(ev, unlockAudio)
);

function snd(type) {
    unlockAudio();
    if (!ac || !acReady) return;
    const t = ac.currentTime;
    if (type === 'collect') {
        [880, 1320].forEach(f => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.type = 'sine'; o.frequency.value = f;
            g.gain.setValueAtTime(0.4, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            o.start(t); o.stop(t + 0.15);
        });
    } else if (type === 'levelup') {
        [523, 659, 784, 1047].forEach((f, i) => {
            const o = ac.createOscillator(), g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.type = 'square'; o.frequency.value = f;
            g.gain.setValueAtTime(0.25, t + i * 0.08);
            g.gain.linearRampToValueAtTime(0, t + i * 0.08 + 0.2);
            o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.2);
        });
    } else if (type === 'damage') {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(30, t + 0.4);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        o.start(t); o.stop(t + 0.4);
    }
}

// Textures no longer needed

// ─── GAME SCENE ───
const container = document.getElementById('hero-webgl');
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x030604, 0.007);
const cam = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 6000);
const isMobile = window.innerWidth < 768;
const ren = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
ren.setSize(innerWidth, innerHeight); ren.setPixelRatio(isMobile ? 1 : Math.min(devicePixelRatio, 2));
container.appendChild(ren.domElement);
const rp = new THREE.RenderPass(scene, cam);
const comp = new THREE.EffectComposer(ren); comp.addPass(rp);
const bp = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.35, 0.2, 0.6);
if (!isMobile) comp.addPass(bp);
scene.add(new THREE.AmbientLight(0xffffff, 1.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 2); dirLight.position.set(0, 50, 50); scene.add(dirLight);
const pLight = new THREE.PointLight(0xdcb558, 3, 2000); scene.add(pLight);

// Stars — time-warp hyperspace
const SN = isMobile ? 1500 : 4000, sGeo = new THREE.CylinderGeometry(0.25, 0.25, 1, 6); sGeo.rotateX(Math.PI / 2);
const sIM = new THREE.InstancedMesh(sGeo, new THREE.MeshBasicMaterial({ color: 0xefe7d8 }), SN);
const dum = new THREE.Object3D(), sArr = [];
for (let i = 0; i < SN; i++)sArr.push({ x: (Math.random() - 0.5) * 800, y: (Math.random() - 0.5) * 800, z: -Math.random() * 5000, v: 0.4 + Math.random() * 2 });
scene.add(sIM);

const TUN = 5000, allObj = [];

// ─── 3D OBSTACLES via GLTFLoader ───
/*
const gltfLoader = new THREE.GLTFLoader();
const MODELS = [
    { path: '3d assets/extracted/zoro_stumble_guys/scene.gltf', scale: 8, copies: 7 },
    { path: '3d assets/extracted/lol_rig/scene.gltf', scale: 6, copies: 7 },
    { path: '3d assets/extracted/lego_iron_man/scene.gltf', scale: 1.2, copies: 7 }, // Iron Man geometry is inherently huge
    { path: '3d assets/extracted/among_us_astronaut_-_clay/scene.gltf', scale: 7, copies: 7 }
];

MODELS.forEach(md => {
    gltfLoader.load(md.path, gltf => {
        const proto = gltf.scene;
        proto.traverse(n => { if (n.isMesh) { n.castShadow = false; n.receiveShadow = false; } });
        for (let j = 0; j < md.copies; j++) {
            const clone = proto.clone(true);
            // ±50% scale variation so no two look the same size
            const sv = md.scale * (0.5 + Math.random() * 1.0);
            clone.scale.setScalar(sv);
            // Spawn close to center path (r=5-35) so they actually obstruct
            const r = 5 + Math.random() * 30, a = Math.random() * 6.28;
            clone.position.set(
                Math.cos(a) * r,
                (Math.random() - 0.5) * 50,
                -(800 + Math.random() * TUN)
            );
            clone.rotation.set(
                Math.random() * 6.28,
                Math.random() * 6.28,
                Math.random() * 6.28
            );
            clone.userData = {
                // Slow space drift — lazy tumble like zero gravity
                rx: (Math.random() - 0.5) * 0.003,
                ry: 0.001 + Math.random() * 0.003,
                rz: (Math.random() - 0.5) * 0.002,
                bobS: 0.0005 + Math.random() * 0.001,
                bobO: Math.random() * 6.28,
                baseY: clone.position.y
            };
            scene.add(clone);
            allObj.push({ mesh: clone, kind: 'bad', hit: false });
        }
    }, undefined, err => console.warn('GLTF load error:', err));
});
*/

// Rings (Organized path)
const ringG = new THREE.TorusGeometry(12, 1.5, 16, 50);
const ringM = new THREE.MeshStandardMaterial({ color: 0xdcb558, emissive: 0xdcb558, emissiveIntensity: 0.7, metalness: 0.4, roughness: 0.15 });
let lastRX = 0, lastRY = 0, lastRZ = -300;
for (let i = 0; i < 44; i++) { 
    const m = new THREE.Mesh(ringG, ringM); 
    let jumpX = Math.random() > 0.85 ? (Math.random() - 0.5) * 100 : (Math.random() - 0.5) * 30;
    lastRX += jumpX;
    lastRX *= 0.85; // gently pull back to center
    if (lastRX > 60) lastRX = 60; if (lastRX < -60) lastRX = -60;
    
    let jumpY = (Math.random() - 0.5) * 30;
    lastRY += jumpY;
    lastRY *= 0.85; // gently pull back to center
    if (lastRY > 40) lastRY = 40; if (lastRY < -40) lastRY = -40;
    lastRZ -= (100 + Math.random() * 120);
    m.position.set(lastRX, lastRY, lastRZ); 
    m.userData.rx = 0; m.userData.ry = 0; 
    scene.add(m); 
    allObj.push({ mesh: m, kind: 'ring', got: false, missed: false }); 
}

// Floating Texts
function createTextPlane(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.font = 'italic 117px "Instrument Serif", serif';
    ctx.fillStyle = '#efe7d8';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
    return new THREE.Mesh(new THREE.PlaneGeometry(78, 19.5), mat);
}
document.fonts.ready.then(() => {
    const texts = ["200+ Projects completed", "500+ videos edited", "worked with 30+ brands"];
    for (let i = 0; i < 9; i++) {
        const mesh = createTextPlane(texts[i % texts.length]);
        let tx = (Math.random() - 0.5) * 160;
        if (Math.abs(tx) < 40) tx = tx > 0 ? tx + 40 : tx - 40; // Avoid dead center
        mesh.position.set(tx, (Math.random() - 0.5) * 100, cam.position.z - 800 - Math.random() * TUN);
        mesh.rotation.set(0, 0, 0); // Keep readable
        mesh.userData = { rx: 0, ry: 0, rz: 0 };
        scene.add(mesh);
        allObj.push({ mesh: mesh, kind: 'text' });
    }
});

// Death drops
const drops = [], dG = new THREE.SphereGeometry(1.5, 8, 8), dM = new THREE.MeshBasicMaterial({ color: 0xdcb558 });
function deathDrop(p) { for (let i = 0; i < 20; i++) { const d = new THREE.Mesh(dG, dM); d.position.copy(p); d.userData = { vx: (Math.random() - 0.5) * 4, vy: 1 + Math.random() * 4, vz: (Math.random() - 0.5) * 4, ttl: 80 + Math.random() * 40 }; scene.add(d); drops.push(d); } }

// State
let targetX = 0, targetY = 0, lastTX = 0; const cRoll = { hurt: 0, bank: 0 };
let score = 0, lvl = 0, speedMult = 1.0, curSpeed = 0, lives = 3;
const scoreEl = document.getElementById('scoreNum'), scoreBoxEl = document.getElementById('scoreBox'), toastEl = document.getElementById('level-up-toast');
const livesEl = document.getElementById('livesContainer');
const nameEl = document.getElementById('center-name');

function updateLives() {
    if (livesEl) livesEl.innerHTML = '❤️'.repeat(lives);
}
updateLives();
let pointerInteracted = false;
let lastInteractTime = performance.now();
let isIdleSweeping = false;

function updatePointer(clientX, clientY) {
    pointerInteracted = true;
    lastInteractTime = performance.now();
    isIdleSweeping = false;
    const w = container.clientWidth || innerWidth;
    targetX = (clientX / w) * 2 - 1; targetY = -(clientY / innerHeight) * 2 + 1;
    if (nameEl) { const r = nameEl.getBoundingClientRect(); nameEl.style.setProperty('--mx', (clientX - r.left) + 'px'); nameEl.style.setProperty('--my', (clientY - r.top) + 'px'); }
}
addEventListener('mousemove', e => updatePointer(e.clientX, e.clientY));
addEventListener('touchmove', e => { if (typeof isMobileMode === 'function' && isMobileMode() && !isMobileGameMode) return; if (e.touches.length > 0) updatePointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
addEventListener('touchstart', e => { if (typeof isMobileMode === 'function' && isMobileMode() && !isMobileGameMode) return; if (e.touches.length > 0) updatePointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

// Auto-sweep name spotlight if no interaction yet OR idle for 30 seconds
let sweepTime = 0;
function autoSweep() {
    const now = performance.now();
    if (pointerInteracted && (now - lastInteractTime > 30000)) {
        isIdleSweeping = true;
    }

    if (!pointerInteracted || isIdleSweeping) {
        sweepTime += 0.035; // slightly faster sweep for edge light effect
        if (nameEl) {
            const r = nameEl.getBoundingClientRect();
            nameEl.style.setProperty('--mx', (Math.sin(sweepTime) * 0.6 + 0.5) * r.width + 'px');
            nameEl.style.setProperty('--my', (Math.cos(sweepTime * 0.4) * 0.5 + 0.5) * r.height + 'px');
        }
    }
    requestAnimationFrame(autoSweep);
}
autoSweep();
function checkLevel() { speedMult = 1.0 + score * 0.03; const nl = Math.floor(score / 10); if (nl > lvl) { lvl = nl; snd('levelup'); toastEl.innerHTML = `LEVEL ${lvl} <span class="speed-up">+${Math.round((speedMult - 1) * 100)}% speed</span>`; gsap.fromTo(toastEl, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }); gsap.to(toastEl, { opacity: 0, x: -40, duration: 0.3, delay: 2.2 }); } }

let isHeroVisible = true;
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        isHeroVisible = entry.isIntersecting;
    });
}, { threshold: 0 });

const heroSectionToObserve = document.getElementById('hero');
if (heroSectionToObserve) {
    heroObserver.observe(heroSectionToObserve);
}

// ─── MOBILE GAME vs SCROLL LOCKING ───
let isMobileGameMode = true; // By default on mobile, play game at first
let lastTapTime = 0;
let lastTapPos = { x: 0, y: 0 };
let lastToggleTime = 0;

function isMobileMode() {
    return window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024) || (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024);
}

function updateMobileGameBannerUI() {
    const bannerEl = document.getElementById('mobileGameBanner');
    const textEl = document.getElementById('mobileGameBannerText');
    if (!bannerEl || !textEl) return;

    if (isMobileGameMode) {
        bannerEl.classList.remove('scroll-mode');
        textEl.textContent = 'DOUBLE TAP TO EXIT GAME • EXPLORE WEBSITE';
    } else {
        bannerEl.classList.add('scroll-mode');
        textEl.textContent = 'DOUBLE TAP TO ENTER GAME MODE';
    }

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(bannerEl, { opacity: 0.2 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
}

function toggleMobileGameMode() {
    if (!isMobileMode()) return;
    const now = performance.now();
    if (now - lastToggleTime < 400) return;
    lastToggleTime = now;
    isMobileGameMode = !isMobileGameMode;
    snd('collect');
    updateMobileGameBannerUI();
}

if (heroSectionToObserve) {
    // 1. Lock touch scrolling on hero when in Game Mode
    heroSectionToObserve.addEventListener('touchmove', (e) => {
        if (!isMobileMode() || !isMobileGameMode) return;
        const target = e.target;
        if (target && (target.tagName === 'A' || target.closest('a') || target.closest('nav'))) {
            return;
        }
        if (e.cancelable) {
            e.preventDefault();
        }
    }, { passive: false });

    // 2. Double click handler
    heroSectionToObserve.addEventListener('dblclick', (e) => {
        if (!isMobileMode()) return;
        if (e.target && (e.target.tagName === 'A' || e.target.closest('a') || e.target.closest('nav'))) return;
        toggleMobileGameMode();
    });

    // 3. Custom touch double-tap handler for 100% reliability across all touchscreen devices
    heroSectionToObserve.addEventListener('touchend', (e) => {
        if (!isMobileMode()) return;
        if (e.target && (e.target.tagName === 'A' || e.target.closest('a') || e.target.closest('nav'))) return;
        const now = performance.now();
        const touch = e.changedTouches && e.changedTouches[0];
        const pos = touch ? { x: touch.clientX, y: touch.clientY } : { x: 0, y: 0 };
        const dist = Math.hypot(pos.x - lastTapPos.x, pos.y - lastTapPos.y);

        if (now - lastTapTime < 600 && dist < 160) {
            toggleMobileGameMode();
            lastTapTime = 0;
        } else {
            lastTapTime = now;
            lastTapPos = pos;
        }
    }, { passive: true });
}

// Banner direct tap toggle
const mobileBannerEl = document.getElementById('mobileGameBanner');
if (mobileBannerEl) {
    mobileBannerEl.addEventListener('click', (e) => {
        if (!isMobileMode()) return;
        e.stopPropagation();
        toggleMobileGameMode();
    });
}

function tick() {
    requestAnimationFrame(tick);
    if (!isHeroVisible || document.hidden) return;
    const tgt = 1.0 * speedMult; curSpeed += (tgt - curSpeed) * 0.03;
    cam.position.z -= curSpeed;
    cam.position.x += (targetX * 55 - cam.position.x) * 0.025;
    cam.position.y += (targetY * 40 - cam.position.y) * 0.025;
    cam.rotation.y = -cam.position.x * 0.004; cam.rotation.x = cam.position.y * 0.004;
    let velX = targetX - lastTX; cRoll.bank += (velX * 2.5 - cRoll.bank) * 0.05; lastTX = targetX;
    cam.rotation.z = cRoll.bank + cRoll.hurt; pLight.position.copy(cam.position);



    for (let i = 0; i < SN; i++) { const s = sArr[i]; s.z += curSpeed * s.v; if (s.z > cam.position.z + 200) { s.z = cam.position.z - 4500 - Math.random() * 1000; s.x = (Math.random() - 0.5) * 800; s.y = (Math.random() - 0.5) * 800; } dum.position.set(s.x, s.y, s.z); dum.scale.set(1, 1, 1 + curSpeed * s.v * 2.5); dum.updateMatrix(); sIM.setMatrixAt(i, dum.matrix); }
    sIM.instanceMatrix.needsUpdate = true; bp.strength = 0.35 + (speedMult - 1) * 0.3;

    for (let i = 0; i < allObj.length; i++) {
        const o = allObj[i], m = o.mesh;
        if (o.kind === 'bad') {
            m.rotation.x += m.userData.rx || 0; m.rotation.y += m.userData.ry || 0.008; m.rotation.z += m.userData.rz || 0;
            m.position.y = (m.userData.baseY || 0) + Math.sin(performance.now() * (m.userData.bobS || 0.001) + (m.userData.bobO || 0)) * 4;
            if (cam.position.z < m.position.z + 10 && cam.position.z > m.position.z - 30) {
                const dx = cam.position.x - m.position.x, dy = cam.position.y - m.position.y;
                if (Math.sqrt(dx * dx + dy * dy) < 25 && !o.hit) {
                    o.hit = true; snd('damage'); lives = 3; updateLives(); score = 0; lvl = 0; speedMult = 1.0; curSpeed = Math.min(curSpeed, 1.0); scoreEl.textContent = score;
                    gsap.fromTo(scoreBoxEl, { scale: 1.4, color: '#f00' }, { scale: 1, color: 'var(--beige)', duration: 0.4 });
                    const fl = document.getElementById('hurt-flash'); if (fl) gsap.fromTo(fl, { opacity: 0.3 }, { opacity: 0, duration: 0.5 });
                    gsap.fromTo(cRoll, { hurt: Math.random() > 0.5 ? 0.2 : -0.2 }, { hurt: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' });
                }
            } else { o.hit = false; }
            if (m.position.z > cam.position.z + 100) {
                const r = 30 + Math.random() * 70, a = Math.random() * 6.28;
                m.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 80, cam.position.z - TUN - Math.random() * 500);
                m.userData.baseY = m.position.y; m.rotation.y = Math.random() * 6.28; o.hit = false;
            }
        }
        if (o.kind === 'text') {
            if (m.position.z > cam.position.z + 100) {
                let tx = (Math.random() - 0.5) * 160;
                if (Math.abs(tx) < 40) tx = tx > 0 ? tx + 40 : tx - 40; // Avoid dead center
                m.position.set(tx, (Math.random() - 0.5) * 100, cam.position.z - TUN - Math.random() * 500);
            }
        }
        if (o.kind === 'ring') { 
            m.rotation.x += m.userData.rx; m.rotation.y += m.userData.ry; 
            if (!o.got && !o.missed) { 
                if (cam.position.z < m.position.z && cam.position.z > m.position.z - 18) { 
                    const dx = cam.position.x - m.position.x, dy = cam.position.y - m.position.y; 
                    if (Math.sqrt(dx * dx + dy * dy) < 20) { 
                        o.got = true; score++; scoreEl.textContent = score; snd('collect'); checkLevel(); 
                        gsap.fromTo(scoreBoxEl, { scale: 1.2, color: '#fff' }, { scale: 1, color: 'var(--beige)', duration: 0.4 }); 
                        const fm = m.material.clone(); fm.emissiveIntensity = 4; m.material = fm; 
                        gsap.to(m.scale, { x: 0, y: 0, z: 0, duration: 0.4 }); setTimeout(() => { m.visible = false; }, 400); 
                    } 
                } else if (cam.position.z < m.position.z - 25) {
                    o.missed = true;
                    lives--;
                    updateLives();
                    if (lives <= 0) {
                        lives = 3; score = 0; lvl = 0; speedMult = 1.0; curSpeed = Math.min(curSpeed, 1.0); scoreEl.textContent = score; updateLives();
                        snd('damage');
                        gsap.fromTo(scoreBoxEl, { scale: 1.4, color: '#f00' }, { scale: 1, color: 'var(--beige)', duration: 0.4 });
                        const fl = document.getElementById('hurt-flash'); if (fl) gsap.fromTo(fl, { opacity: 0.3 }, { opacity: 0, duration: 0.5 });
                        gsap.fromTo(cRoll, { hurt: Math.random() > 0.5 ? 0.2 : -0.2 }, { hurt: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' });
                    } else {
                        snd('damage');
                        const fl = document.getElementById('hurt-flash'); if (fl) gsap.fromTo(fl, { opacity: 0.15 }, { opacity: 0, duration: 0.3 });
                        gsap.fromTo(cRoll, { hurt: Math.random() > 0.5 ? 0.1 : -0.1 }, { hurt: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' });
                    }
                }
            }
            if (m.position.z > cam.position.z + 100) { 
                o.got = false; o.missed = false; m.visible = true; m.scale.set(1, 1, 1); m.material = ringM; 
                let minZ = cam.position.z; let refX = 0, refY = 0;
                for (let j = 0; j < allObj.length; j++) {
                    if (allObj[j].kind === 'ring' && allObj[j].mesh !== m) {
                        if (allObj[j].mesh.position.z < minZ) {
                            minZ = allObj[j].mesh.position.z;
                            refX = allObj[j].mesh.position.x;
                            refY = allObj[j].mesh.position.y;
                        }
                    }
                }
                let jumpX = Math.random() > 0.85 ? (Math.random() - 0.5) * 100 : (Math.random() - 0.5) * 30;
                let nx = refX + jumpX; 
                nx *= 0.85; // gently pull back to center
                if (nx > 60) nx = 60; if (nx < -60) nx = -60;
                
                let jumpY = (Math.random() - 0.5) * 30;
                let ny = refY + jumpY; 
                ny *= 0.85; // gently pull back to center
                if (ny > 40) ny = 40; if (ny < -40) ny = -40;
                m.position.set(nx, ny, minZ - (100 + Math.random() * 120)); 
            }
        }
    }
    const activeRings = allObj.filter(o => o.kind === 'ring' && !o.got && o.mesh.position.z <= cam.position.z + 40);
    activeRings.sort((a, b) => b.mesh.position.z - a.mesh.position.z);
    for (let i = 0; i < allObj.length; i++) {
        const o = allObj[i];
        if (o.kind === 'ring' && !o.got) {
            const idx = activeRings.indexOf(o);
            o.mesh.visible = (idx === 0 || idx === 1);
        }
    }
    for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.position.x += d.userData.vx; d.position.y += d.userData.vy; d.position.z += d.userData.vz; d.userData.vy -= 0.1; d.userData.ttl--; d.scale.setScalar(Math.max(0, d.userData.ttl / 120)); if (d.userData.ttl <= 0) { scene.remove(d); drops.splice(i, 1); } }
    comp.render();
}
tick();


const resizeObserver = new ResizeObserver(() => {
    const w = container.clientWidth || innerWidth;
    cam.aspect = w / innerHeight;
    cam.updateProjectionMatrix();
    ren.setSize(w, innerHeight);
    if (comp) comp.setSize(w, innerHeight);
});
resizeObserver.observe(container);
addEventListener('resize', () => {
    const w = container.clientWidth || innerWidth;
    cam.aspect = w / innerHeight;
    cam.updateProjectionMatrix();
    ren.setSize(w, innerHeight);
    if (comp) comp.setSize(w, innerHeight);
});
