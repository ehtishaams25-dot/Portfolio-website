gsap.registerPlugin(ScrollTrigger);

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isMobileScreen = () => window.innerWidth <= 768;
const isCursorEnabled = () => !isTouchDevice && !isMobileScreen();

function rafThrottle(fn) {
    let ticking = false;
    return (...args) => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                fn(...args);
            });
        }
    };
}

// === 0. LENIS SMOOTH SCROLL ===
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// === PRELOADER & 7-COLUMN STAGGERED BLIND LIFT ===
const preloaderTl = gsap.timeline({ paused: true });

// Disable lenis scrolling during preloader
lenis.stop();

// Set initial logo state for smooth scale-up entrance
gsap.set('#preloaderLogo', { scale: 0.65, opacity: 0 });

let isPageLoaded = false;
window.addEventListener('load', () => {
    isPageLoaded = true;
});

preloaderTl.play();

// 1. Entrance: Logo scales smoothly into place
preloaderTl.to('#preloaderLogo', {
    scale: 1,
    opacity: 1,
    duration: 0.75,
    ease: "power3.out"
});

// 2. Pause if page is not yet loaded
preloaderTl.add(() => {
    if (!isPageLoaded) {
        preloaderTl.pause();
        const checkLoad = setInterval(() => {
            if (isPageLoaded) {
                clearInterval(checkLoad);
                preloaderTl.play();
            }
        }, 80);
    }
}, "+=0.25");

// 3. Staggered slide up of all 7 columns from left to right
// The logo is nested inside the 4th column so it stays stuck to the rectangle and leaves with it without scaling twice.
preloaderTl.to('.preloader-col', {
    yPercent: -100,
    duration: 1.1,
    stagger: 0.07,
    ease: "power3.inOut",
    onComplete: () => {
        const p = document.getElementById('preloader');
        if (p) p.style.display = 'none';
    }
}, "+=0.15");

// 4. Enable scrolling & Hero entrance
preloaderTl.add(() => {
    lenis.start();
    gsap.from('.hero-header', { opacity: 0, y: 10, duration: 1, ease: 'power2.out' });
}, "-=0.75");

// === 1. NAVBAR ===

const glassNavLinks = document.querySelectorAll('.glass-nav a');
glassNavLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    });
});

// === 2. CURSOR ===
const cursorCanvas = document.getElementById('cursor-trail');
const cCtx = cursorCanvas.getContext('2d');
cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight;
let trailParticles = [], ambientParticles = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const ambientParticleCount = isCursorEnabled() ? 40 : 0;
for (let i = 0; i < ambientParticleCount; i++) ambientParticles.push({ x: Math.random() * cursorCanvas.width, y: Math.random() * cursorCanvas.height, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 1.5 + 0.5 });
const isMobileCursorDisabled = () => !isCursorEnabled();
const handleCursorMouseMove = rafThrottle(e => {
    if (isMobileCursorDisabled()) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    trailParticles.push({ x: mouse.x, y: mouse.y, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, life: 1.0, size: Math.random() * 2 + 1 });
});
window.addEventListener('mousemove', handleCursorMouseMove);

let cursorRaf = null;
function animateCursor() {
    if (document.hidden || isMobileCursorDisabled()) {
        if (cursorCanvas) cursorCanvas.style.opacity = '0';
        cursorRaf = requestAnimationFrame(animateCursor);
        return;
    }

    cCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    cCtx.fillStyle = "rgba(220,181,88,0.35)";
    for (let p of ambientParticles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cursorCanvas.width;
        if (p.x > cursorCanvas.width) p.x = 0;
        if (p.y < 0) p.y = cursorCanvas.height;
        if (p.y > cursorCanvas.height) p.y = 0;
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
            const f = (120 - d) / 120;
            p.x -= (dx / d) * f * 2;
            p.y -= (dy / d) * f * 2;
        }
        cCtx.beginPath();
        cCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cCtx.fill();
    }
    cCtx.beginPath();
    cCtx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
    cCtx.fillStyle = "rgba(220,181,88,0.8)";
    cCtx.shadowBlur = 15;
    cCtx.shadowColor = "#dcb558";
    cCtx.fill();
    cCtx.shadowBlur = 0;
    for (let i = 0; i < trailParticles.length; i++) {
        const p = trailParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
            trailParticles.splice(i, 1);
            i--;
            continue;
        }
        cCtx.beginPath();
        cCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        cCtx.fillStyle = `rgba(220,181,88,${p.life})`;
        cCtx.fill();
    }
    cursorRaf = requestAnimationFrame(animateCursor);
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

// === 5.1. LOGO MARQUEE — smooth infinite scroll with scroll speed boost ===
(function initMarquee() {
    const wrapper = document.getElementById('logo-marquee');
    if (!wrapper) return;

    // Turn off CSS animation so JS has full control over transform position
    wrapper.style.animation = 'none';

    let xPos = 0;
    const BASE_SPEED = 0.8; // px per frame at rest
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let halfWidth = wrapper.scrollWidth / 2;
    let raf;

    const updateWidth = () => {
        halfWidth = wrapper.scrollWidth / 2;
    };
    window.addEventListener('load', updateWidth);
    window.addEventListener('resize', updateWidth);
    if (window.ResizeObserver) {
        new ResizeObserver(updateWidth).observe(wrapper);
    }

    function tick() {
        const scrollY = window.scrollY;
        const deltaScroll = Math.abs(scrollY - lastScrollY);
        lastScrollY = scrollY;

        // Smoothly blend scroll velocity bonus so it gently speeds up on scroll without reversing
        const targetBonus = Math.min(deltaScroll * 0.25, 3.5);
        scrollVelocity += (targetBonus - scrollVelocity) * 0.1;

        // Total movement per frame (ALWAYS positive to move left smoothly, never backwards!)
        const moveSpeed = BASE_SPEED + scrollVelocity;
        xPos -= moveSpeed;

        // Seamless loop wrap-around
        if (halfWidth > 0 && Math.abs(xPos) >= halfWidth) {
            xPos += halfWidth;
        }

        wrapper.style.transform = `translate3d(${xPos}px, 0, 0)`;
        raf = requestAnimationFrame(tick);
    }

    // Only run the loop when the marquee is visible
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            lastScrollY = window.scrollY;
            raf = requestAnimationFrame(tick);
        } else {
            cancelAnimationFrame(raf);
        }
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

            const mobileVideoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
                        if (entry.isIntersecting) {
                            v.play().catch(() => { });
                        } else {
                            v.pause();
                        }
                    }
                });
            }, { threshold: 0.5 });
            mobileVideoObserver.observe(item);
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
    if (isMobileCursorDisabled()) return;
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
        if (target && target.closest && target.closest('.hero-logo')) {
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
    if (isMobileCursorDisabled()) return;
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
const videoSection = document.getElementById('video-scroll') || viewport;
let videoCarouselInitialized = false;

function initVideoCarousel() {
    if (videoCarouselInitialized || !track || !viewport || !videoSection) return;
    videoCarouselInitialized = true;

    function getShortFormConfig() {
        const w = window.innerWidth;
        if (w <= 480) {
            return { w: 275, g: 22 };
        } else if (w <= 768) {
            return { w: 300, g: 26 };
        } else {
            return { w: 280, g: 28 };
        }
    }
    const initCfg = getShortFormConfig();
    let cardW = initCfg.w, gap = initCfg.g, step = cardW + gap, totalOrig = videoFiles.length, setW = totalOrig * step, copies = 3, totalCards = totalOrig * copies, cardsData = [];
    function loopSeg(v, s, e) {
        v.addEventListener('timeupdate', () => { if (v.currentTime >= e) v.currentTime = s; });
        v.addEventListener('loadedmetadata', () => { if (v.currentTime < s) v.currentTime = s; }, { once: true });
    }
    for (let i = 0; i < totalCards; i++) {
        const oi = i % totalOrig, card = document.createElement('div'); card.className = 'video-card';
        const v = document.createElement('video'); v.src = videoFiles[oi]; v.preload = 'none'; v.loop = true; v.controls = true; v.playsInline = true; v.muted = true;
        if (oi === 0) loopSeg(v, 12, 18);
        card.appendChild(v); track.appendChild(card);
        const ox = i - Math.floor(totalCards / 2); cardsData.push({ element: card, video: v, initialX: ox * step, isHovered: false, currentVolume: 0 });
        card.addEventListener('mouseenter', () => {
            cardsData[i].isHovered = true;
            cardsData[i].video.muted = false;
        });
        card.addEventListener('mouseleave', () => {
            cardsData[i].isHovered = false;
        });
    }
    window.addEventListener('resize', () => {
        const cfg = getShortFormConfig();
        cardW = cfg.w;
        gap = cfg.g;
        step = cardW + gap;
        setW = totalOrig * step;
        cardsData.forEach((item, idx) => {
            const ox = idx - Math.floor(totalCards / 2);
            item.initialX = ox * step;
        });
    });
    let vSX = 0, vTX = 0, vV = 0, vD = false, vLM = 0;
    viewport.addEventListener('mousedown', e => { vD = true; vLM = e.clientX; });
    window.addEventListener('mousemove', e => { if (!vD) return; const dx = e.clientX - vLM; vTX += dx; vV = dx; vLM = e.clientX; });
    window.addEventListener('mouseup', () => { vD = false; });
    viewport.addEventListener('touchstart', e => { vD = true; vLM = e.touches[0].clientX; }, { passive: true });
    window.addEventListener('touchmove', e => { if (!vD) return; const dx = e.touches[0].clientX - vLM; vTX += dx; vV = dx; vLM = e.touches[0].clientX; }, { passive: true });
    window.addEventListener('touchend', () => { vD = false; });
    function updateCarousel() {
        if (document.hidden) {
            requestAnimationFrame(updateCarousel);
            return;
        }
        requestAnimationFrame(updateCarousel);
        if (!vD) { vV *= 0.95; vTX += vV; } vSX += (vTX - vSX) * 0.15;
        if (vSX > setW) { vSX -= setW; vTX -= setW; } else if (vSX < -setW) { vSX += setW; vTX += setW; }

        const rect = videoSection.getBoundingClientRect();
        const vHeight = window.innerHeight;
        const bottomFade = Math.max(0, Math.min(1, (rect.bottom - vHeight * 0.35) / (vHeight * 0.5)));
        const topFade = Math.max(0, Math.min(1, (vHeight * 0.65 - rect.top) / (vHeight * 0.5)));
        const verticalFade = Math.min(bottomFade, topFade);
        const isSectionVisible = verticalFade > 0.01;

        cardsData.forEach(item => {
            let xP = item.initialX + vSX; const mD = setW * 1.5;
            if (xP > mD) xP -= totalCards * step; if (xP < -mD) xP += totalCards * step;
            const dist = Math.abs(xP), tZ = Math.pow(dist * 0.018, 2), rY = xP * -0.025;
            const sat = Math.max(0.1, 1 - (dist * 0.0008)), br = Math.max(0.4, 1 - (dist * 0.0006));
            item.element.style.transform = `translateX(-50%) translateX(${xP}px) translateZ(${tZ}px) rotateY(${rY}deg)`;
            item.element.style.filter = `saturate(${sat}) brightness(${br})`;

            if (!isSectionVisible || dist > window.innerWidth) {
                if (!item.video.paused) item.video.pause();
                if (!isSectionVisible) item.isHovered = false;
                item.currentVolume = 0;
                item.video.volume = 0;
                item.video.muted = true;
            } else {
                const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
                const isCenter = dist < 180;
                const shouldPlay = item.isHovered || (isMobile && isCenter);

                if (shouldPlay) {
                    if (item.video.paused) item.video.play().catch(() => { });
                } else {
                    if (!item.video.paused) item.video.pause();
                }

                const dV = Math.max(0, 1 - (dist / 800)); const tV = (shouldPlay ? dV : 0) * 0.3 * verticalFade;
                item.currentVolume += (tV - item.currentVolume) * (shouldPlay ? 0.3 : 0.05);
                item.video.volume = Math.max(0, Math.min(1, item.currentVolume));
                if (shouldPlay || item.currentVolume > 0.01) {
                    item.video.muted = false;
                } else {
                    item.video.muted = true;
                }
            }
        });
    }
    updateCarousel();
}

if (videoSection) {
    const videoCarouselObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            initVideoCarousel();
            videoCarouselObserver.disconnect();
        }
    }, { rootMargin: '400px' });
    videoCarouselObserver.observe(videoSection);
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
    const globeElements = [];
    function getGRadius() { return Math.min(gContainer.offsetWidth, gContainer.offsetHeight) * 0.38; }
    let gRadius = getGRadius();
    window.addEventListener('resize', () => { gRadius = getGRadius(); });
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
    gContainer.addEventListener('touchstart', e => {
        gDragging = true;
        gWasDragged = false;
        gPrevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    window.addEventListener('touchend', () => {
        setTimeout(() => gDragging = false, 0);
    });
    window.addEventListener('touchmove', e => {
        if (gDragging && e.touches[0]) {
            const tx = e.touches[0].clientX;
            const ty = e.touches[0].clientY;
            if (Math.abs(tx - gPrevMouse.x) > 2 || Math.abs(ty - gPrevMouse.y) > 2) gWasDragged = true;
            gTargetRotY += (tx - gPrevMouse.x) * 0.01;
            gTargetRotX += (ty - gPrevMouse.y) * 0.01;
            gPrevMouse = { x: tx, y: ty };
        }
    }, { passive: true });

    let isGlobeVisible = true;
    const globeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => isGlobeVisible = entry.isIntersecting);
    }, { threshold: 0 });
    globeObserver.observe(gContainer);

    function animateGlobe() {
        requestAnimationFrame(animateGlobe);
        // On mobile, CSS flattens the globe into a horizontal list — skip 3D animation
        if (window.innerWidth <= 768) {
            // Clear inline styles so CSS can control layout
            globeElements.forEach(layer => layer.forEach(item => {
                item.el.style.transform = '';
                item.el.style.opacity = '';
                item.el.style.fontSize = '';
                item.el.style.color = '';
                item.el.style.filter = '';
                item.el.style.zIndex = '';
            }));
            gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
            return;
        }
        if (!isGlobeVisible || document.hidden) return;
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

                // Keep sizes proportional to original classes, scale with container
                let baseSize = 1.0;
                if (item.el.classList.contains('large')) baseSize = 1.5;
                if (item.el.classList.contains('small')) baseSize = 0.65;
                const containerScale = Math.min(gContainer.offsetWidth, gContainer.offsetHeight) / 500;
                const scaledSize = (scale * baseSize + (baseSize / 2)) * containerScale;
                item.el.style.fontSize = `${Math.max(scaledSize, 0.4)}rem`;

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

// === 9.1 SERVICES SECTION BENTO CARDS ===
const cardsContainer = document.getElementById("cards-container");
if (cardsContainer) {
    cardsContainer.addEventListener("mousemove", e => {
        for (const card of document.getElementsByClassName("service-card")) {
            const rect = card.getBoundingClientRect(),
                x = e.clientX - rect.left,
                y = e.clientY - rect.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        }
    });
}
gsap.from('.services-title', { y: 50, opacity: 0, duration: 1.2, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.services-section', start: 'top 80%' } });
gsap.from('.service-card', { y: 60, opacity: 0, duration: 1.0, stagger: 0.1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.services-grid', start: 'top 85%' } });

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
        image: "ayzz_profile.jpg",
        text: "Worked with a lot of editors before, Ehtisham is the best of all of them. Most editors just make it look good and send it. He actually cares video perform well, thinks about how the video will go viral, suggests ideas. His editing skills? 🔥. Honestly, I'm a little scared writing this cuz with this review that he'll get some better job & won't work with me, haha. That tells you how good he is.",
        designation: "ayzz.designer"
    },
    {
        name: "~Amar Salvi",
        image: "https://yt3.googleusercontent.com/S_lqN8YGmMw327livmFV1iFGqyzo7ISA5XoqcfPX4gPHU0tJEjXvg5XwpZwcowriyJVVmkFLi4k=s160-c-k-c0x00ffffff-no-rj",
        text: "“Ehtishaam has been a mainstay for my channel, right from inception. He is a fast learner, and even though he did not know about this niche, he learnt fast. He works hard, keeps to the committed timelines, is straightforward about his availability and always delivers. His insights have helped grow the channel much faster than it would have otherwise as a niche channel.",
        designation: "The Weekend Aquarist"
    },
    {
        name: "~Nikita Jeswani",
        image: "biege logos/it_square_icon.png",
        text: "“Oh i love Ehtishaam's work, he's so creative, his designs are unique, he puts good thought & effort in this work.<br><br>Can totally rely on him for such stuff”",
        designation: "IT Square",
        link: "https://theitsquare.com/?srsltid=AfmBOooX_tzqTmfhCH2p4VAwy1RYlLv5zO0xMDchFkGc33swSqFVHbd2"
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
                        <h3>${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;" onclick="event.stopPropagation()">${item.designation}</a>` : item.designation}</h3>
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

    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToTSlide(tCurrentIndex - 1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToTSlide(tCurrentIndex + 1);
        });
    }
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


