gsap.registerPlugin(ScrollTrigger);

// === 0. LENIS SMOOTH SCROLL ===
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

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
    const MIN_SPEED = 6; // seconds at max scroll velocity
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
    function getScrollAmount() {
        let sliderWidth = rwSlider.scrollWidth;
        return -Math.max(0, sliderWidth - window.innerWidth);
    }

    const tween = gsap.to(rwSlider, {
        x: () => getScrollAmount(),
        ease: "none"
    });

    ScrollTrigger.create({
        trigger: ".recent-works-section",
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
    });

    // Set video hover play/pause and fix initial frame
    const rwVideos = rwSlider.querySelectorAll('video');
    rwVideos.forEach(v => {
        v.pause();
        // Force the first frame to render
        v.addEventListener('loadeddata', () => {
            v.currentTime = 0.01;
        }, { once: true });
        if (v.readyState >= 2) {
            v.currentTime = 0.01;
        }

        const item = v.closest('.carousel-item');
        if (item) {
            item.addEventListener('mouseenter', () => {
                v.play().catch(() => { });
            });
            item.addEventListener('mouseleave', () => {
                v.pause();
            });
        }
    });

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
let cursorMouseX = window.innerWidth / 2;
let cursorMouseY = window.innerHeight / 2;
let cursorLastX = cursorMouseX;
let cursorLastY = cursorMouseY;
let cursorBank = 0;

// === SMART BLEND MODE ===
(function () {
    function getEffectiveBg(el) {
        while (el && el !== document.documentElement) {
            const bg = window.getComputedStyle(el).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                const m = bg.match(/[\d.]+/g);
                if (m) return [+m[0], +m[1], +m[2]];
            }
            el = el.parentElement;
        }
        return [3, 6, 4]; // --dark-void fallback
    }

    document.addEventListener('mousemove', e => {
        // elementFromPoint skips pointer-events:none canvas, hits real element
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || !cursorCanvas) return;

        const [r, g, b] = getEffectiveBg(el);
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum > 100) {
            // Light bg (beige, green sections) → difference pops the gold
            cursorCanvas.style.mixBlendMode = 'difference';
            if (customCursor) customCursor.classList.add('blend-difference');
        } else {
            // Dark bg → screen glows the gold
            cursorCanvas.style.mixBlendMode = 'screen';
            if (customCursor) customCursor.classList.remove('blend-difference');
        }
    });
})();

document.addEventListener('mousemove', (e) => {
    cursorMouseX = e.clientX;
    cursorMouseY = e.clientY;

    if (customCursor) {
        customCursor.style.left = `${cursorMouseX}px`;
        customCursor.style.top = `${cursorMouseY}px`;
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
        if (cursorCanvas) cursorCanvas.style.opacity = '0';
    } else {
        document.body.classList.remove('show-triangle');
        if (cursorCanvas) cursorCanvas.style.opacity = '1';
    }
});

function animateCursorPhysics() {
    requestAnimationFrame(animateCursorPhysics);
    if (!customCursor) return;

    let vx = cursorMouseX - cursorLastX;
    let vy = cursorMouseY - cursorLastY;
    cursorLastX = cursorMouseX;
    cursorLastY = cursorMouseY;

    // Calculate air drag rotation based on movement speed
    // Higher horizontal velocity = more bank rotation
    let targetBank = vx * 1.5;
    targetBank = Math.max(-50, Math.min(50, targetBank));

    // Smoothly apply the bank effect and spring back to 0 when stopped
    cursorBank += (targetBank - cursorBank) * 0.1;

    const cursorSvg = customCursor.querySelector('.cursor-triangle');
    if (cursorSvg) {
        // We add the baseline -135deg if the SVG is pointing top-left by default.
        // Wait, earlier I saw the baseline rotation in script.js was -135. Let me double check index.html to see what the SVG looks like.
        // Actually, if we just set it to rotate(cursorBank deg), let's see if it looks right. I will add the base angle if needed.
        // But let's check index.html first.
        cursorSvg.style.transform = `rotate(${cursorBank}deg)`;
    }
}
animateCursorPhysics();

// Update cursor state on scroll too
window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight * 0.8) {
        document.body.classList.add('show-triangle');
        if (cursorCanvas) cursorCanvas.style.opacity = '0';
    } else if (!document.body.classList.contains('nav-open')) {
        document.body.classList.remove('show-triangle');
        if (cursorCanvas) cursorCanvas.style.opacity = '1';
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
            if (Math.abs(e.clientX - gPrevMouse.x) > 2 || Math.abs(e.clientY - gPrevMouse.y) > 2) gWasDragged = true;
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
// gsap.fromTo('.footer-content', { y: -150 }, { y: 0, ease: "none", scrollTrigger: { trigger: "footer", start: "top bottom", end: "bottom bottom", scrub: true } });
gsap.to('.footer-large-text', { y: 15, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });

// Footer bottom bar — banana lengths counter & scroll-to-top
const footerScrollMsg = document.getElementById('footerScrollMsg');
const footerTopBtn = document.getElementById('footerTopBtn');
if (footerScrollMsg) {
    const BANANA_PX = 605; // 16cm banana at 96dpi (16 * 37.795)
    function updateBananaCount() {
        const bananas = Math.round(window.scrollY / BANANA_PX);
        footerScrollMsg.textContent = `thanks for scrolling ${bananas} banana length${bananas !== 1 ? 's' : ''}`;
    }
    window.addEventListener('scroll', updateBananaCount);
    updateBananaCount();
}
if (footerTopBtn) {
    footerTopBtn.addEventListener('click', e => {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.5 });
    });
}

// === 9. SCROLL ANIMATIONS ===
gsap.from('.about-text', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.about-section', start: 'top 75%' } });
gsap.from('.about-image-container', { y: 80, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.about-section', start: 'top 70%' } });

// === 9.1 SERVICES SCROLL TRACK ===
// Replaced by services.js

// === ABOUT ME — single-sweep hand-drawn reveal ===
(function initPencilDraw() {
    const clipRect = document.getElementById('underline-clip-rect');
    if (!clipRect) return;

    // Start fully hidden
    clipRect.setAttribute('width', '0');

    gsap.to(clipRect, {
        attr: { width: 1516 },   // sweep across the full 1516-wide viewBox in one motion
        duration: 2.2,
        ease: 'power2.inOut',
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 72%',
            toggleActions: 'play none none none'
        }
    });
})();

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
        name: "~Ayaz Abdul Mutakabur",
        image: "https://scontent.cdninstagram.com/v/t51.82787-19/565308928_18056331812636238_5448057324022458822_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=105&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=MS_qjoBpVEMQ7kNvwEtpUD7&_nc_oc=AdpYvOq8m-UWqUC2ao_Jk8BII94m1CuQCTXmw-fcpL2yIH3OZPv5HBRrbpxqtRanNS8xKGIuXEZFiqSpgMwYqv6c&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=AP1XKxpmC06FDxFnT_L4rg&_nc_ss=7b6a8&oh=00_Af49KL346GJoosMscfRalVdVuVLhY2TazN0jB2uUAAwlrg&oe=6A0E5659",
        text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is.",
        designation: "ayzz.designer"
    },
    {
        name: "~Amar Salvi",
        image: "https://yt3.googleusercontent.com/S_lqN8YGmMw327livmFV1iFGqyzo7ISA5XoqcfPX4gPHU0tJEjXvg5XwpZwcowriyJVVmkFLi4k=s160-c-k-c0x00ffffff-no-rj",
        text: "“Ehtishaam has been a mainstay for my channel, right from inception. He is a fast learner, and even though he did not know about this niche, he learnt fast. He works hard, keeps to the committed timelines, is straightforward about his availability and always delivers. His insights have helped grow the channel much faster than it would have otherwise as a niche channel.",
        designation: "The Weekend Aquarist"
    },
    // {
    //     name: "ayzz.designer",
    //     image: "https://randomuser.me/api/portraits/men/32.jpg",
    //     text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is.",
    // },
    // {
    //     name: "ayzz.designer",
    //     image: "https://randomuser.me/api/portraits/men/32.jpg",
    //     text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is.",
    // },
    // {
    //     name: "ayzz.designer",
    //     image: "https://randomuser.me/api/portraits/men/32.jpg",
    //     text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is."
    // },
    // {
    //     name: "ayzz.designer",
    //     image: "https://randomuser.me/api/portraits/men/32.jpg",
    //     text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is."
    // }
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
                        <h3>${item.designation}</h3>
                    </div>
                </div>
                <div class="testimonial-text">
                    ${item.text}
                </div>
                <div class="testimonial-footer">
                    ${item.name}
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
