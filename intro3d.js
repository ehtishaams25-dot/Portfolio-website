/* ==========================================================================
   INTRO3D.JS — 3D COMMODORE 64 DESK SCENE & WORMHOLE TRANSITION (VANILLA THREE.JS + GSAP)
   ========================================================================== */

(function () {
    // --- 1. BRAND & COLOR CONFIG ---
    const BRAND = {
        green: '#204937',      // Deep Forest Green
        gold: '#DCB558',       // Warm Gold Ochre
        charcoal: '#1F1F1F',   // Charcoal Black
        cream: '#EFE7D8',      // Warm Cream / Bone
        white: '#FFFFFF',      // Pure White
    };

    // --- 2. TYPING SEQUENCE DEFINITION ---
    const TYPING_SEQUENCE = [
        { action: 'pause', weight: 0.02 },
        { action: 'type', text: 'Hello.' },
        { action: 'pause', weight: 0.035 },
        { action: 'delete', text: 'Hello.' },
        { action: 'type', text: "You're visiting my workspace." },
        { action: 'pause', weight: 0.045 },
        { action: 'delete', text: "You're visiting my workspace." },
        { action: 'type', text: 'Everything here is real.' },
        { action: 'pause', weight: 0.045 },
        { action: 'delete', text: 'Everything here is real.' },
        { action: 'type', text: 'Every file tells part of my story.' },
        { action: 'pause', weight: 0.045 },
        { action: 'delete', text: 'Every file tells part of my story.' },
        { action: 'type', text: 'Feel free to look around.' },
        { action: 'pause', weight: 0.05 },
        { action: 'type', text: '> Enter Workspace', isCommand: true },
        { action: 'pause', weight: 0.08 }
    ];

    const CHAR_WEIGHT_TYPE = 0.0018;
    const CHAR_WEIGHT_DELETE = 0.0012;

    function computeTypingBreakpoints(sequence) {
        let totalWeight = 0;
        const entries = sequence.map((entry) => {
            let weight;
            if (entry.action === 'type' || entry.action === 'delete') {
                const charWeight = entry.action === 'type' ? CHAR_WEIGHT_TYPE : CHAR_WEIGHT_DELETE;
                weight = entry.text.length * charWeight;
            } else {
                weight = entry.weight || 0.01;
            }
            totalWeight += weight;
            return { ...entry, weight };
        });

        let cursor = 0;
        return entries.map((entry) => {
            const start = cursor / totalWeight;
            const end = (cursor + entry.weight) / totalWeight;
            cursor += entry.weight;
            return {
                action: entry.action,
                text: entry.text || '',
                isCommand: entry.isCommand || false,
                start,
                end,
            };
        });
    }

    function getDisplayState(progress, breakpoints) {
        let mainText = '';
        let commandText = '';
        let isCommandComplete = false;
        let cursorOnCommand = false;

        for (const bp of breakpoints) {
            if (progress < bp.start) break;

            const segProgress = Math.min(1, (progress - bp.start) / (bp.end - bp.start));

            if (bp.action === 'type') {
                const charCount = Math.floor(segProgress * bp.text.length);
                const typed = bp.text.slice(0, charCount);

                if (bp.isCommand) {
                    commandText = typed;
                    cursorOnCommand = true;
                    isCommandComplete = charCount >= bp.text.length;
                } else {
                    mainText = typed;
                    commandText = '';
                    cursorOnCommand = false;
                    isCommandComplete = false;
                }
            } else if (bp.action === 'delete') {
                const totalChars = bp.text.length;
                const charsToRemove = Math.floor(segProgress * totalChars);
                mainText = bp.text.slice(0, totalChars - charsToRemove);
                commandText = '';
                cursorOnCommand = false;
                isCommandComplete = false;
            }
        }

        return { mainText, commandText, isCommandComplete, cursorOnCommand };
    }

    const breakpoints = computeTypingBreakpoints(TYPING_SEQUENCE);
    let scrollProgress = 0;
    let displayState = getDisplayState(0, breakpoints);
    let isHovered = false;
    let hoverProgress = 0;
    let isWormholeActive = false;

    // --- 3. INIT WEBGL WHEN DOM READY ---
    window.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('hero-webgl');
        if (!container || !window.THREE) return;

        // Mouse pointer tracking for camera look & torch
        const pointer = { x: 0, y: 0 };
        window.addEventListener('mousemove', (e) => {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // --- RENDERER ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        // --- SCENE & FOG ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#000000');
        scene.fog = new THREE.Fog('#000000', 3.5, 9.5);

        // --- CAMERA ---
        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0.0, 1.15, 3.1);

        // --- CRT SCREEN TEXTURE GENERATOR ---
        const screenCanvas = document.createElement('canvas');
        screenCanvas.width = 1920;
        screenCanvas.height = 1080;
        const screenTexture = new THREE.CanvasTexture(screenCanvas);
        if (THREE.sRGBEncoding) screenTexture.encoding = THREE.sRGBEncoding;
        screenTexture.minFilter = THREE.LinearFilter;
        screenTexture.magFilter = THREE.LinearFilter;

        function updateScreenTexture() {
            const targetH = isHovered && displayState.isCommandComplete ? 1 : 0;
            hoverProgress += (targetH - hoverProgress) * 0.18;
            const h = hoverProgress;

            const ctx = screenCanvas.getContext('2d');

            // 1. Warm screen background
            ctx.fillStyle = '#FFFDF9';
            ctx.fillRect(0, 0, 1920, 1080);

            // Inner bezel frame margin
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 16;
            ctx.strokeRect(8, 8, 1904, 1064);

            // 2. Typography
            ctx.font = '700 86px "Poppins", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const lines = [];
            if (displayState.mainText) lines.push(...displayState.mainText.split('\n').filter(Boolean));
            if (displayState.commandText) lines.push(...displayState.commandText.split('\n').filter(Boolean));

            const lineHeight = 138;
            const totalHeight = lines.length * lineHeight;
            let startY = 540 - (totalHeight / 2) + (lineHeight / 2);

            lines.forEach((line, idx) => {
                const isLastLine = idx === lines.length - 1;
                const yPos = startY + idx * lineHeight;

                if (isLastLine && displayState.isCommandComplete) {
                    ctx.save();
                    const textWidth = ctx.measureText(line).width;
                    const boxWidth = Math.max(textWidth + 160, 780) + h * 44;
                    const boxHeight = 126 + h * 14;
                    const boxX = 960 - boxWidth / 2;
                    const boxY = yPos - boxHeight / 2;

                    ctx.shadowColor = h > 0.05 ? 'rgba(32, 73, 55, 0.75)' : 'rgba(20, 41, 31, 0.38)';
                    ctx.shadowBlur = 18 + h * 26;
                    ctx.shadowOffsetY = 8 + h * 6;

                    const btnGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
                    if (h > 0.4) {
                        btnGrad.addColorStop(0, '#2E674F');
                        btnGrad.addColorStop(1, '#1A3C2D');
                    } else {
                        btnGrad.addColorStop(0, '#265641');
                        btnGrad.addColorStop(1, '#1A382B');
                    }

                    ctx.fillStyle = btnGrad;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 34);
                    } else {
                        ctx.rect(boxX, boxY, boxWidth, boxHeight);
                    }
                    ctx.fill();

                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetY = 0;

                    ctx.lineWidth = 3 + h * 1.5;
                    ctx.strokeStyle = h > 0.2 ? '#DCB558' : 'rgba(239, 231, 216, 0.55)';
                    ctx.stroke();

                    // Upper Gloss Reflection
                    ctx.save();
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(boxX + 6, boxY + 6, boxWidth - 12, boxHeight * 0.42, 28);
                    } else {
                        ctx.rect(boxX + 6, boxY + 6, boxWidth - 12, boxHeight * 0.42);
                    }
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.12 + h * 0.08})`;
                    ctx.fill();
                    ctx.restore();

                    ctx.fillStyle = '#FFFDF9';
                    ctx.shadowColor = h > 0.1 ? 'rgba(255, 253, 249, 0.45)' : 'transparent';
                    ctx.shadowBlur = h * 12;
                    ctx.fillText(line, 960, yPos);
                    ctx.restore();
                } else {
                    ctx.fillStyle = '#204937';
                    ctx.fillText(line, 960, yPos);
                }
            });

            // Blinking cursor
            if (lines.length > 0 && !displayState.isCommandComplete) {
                const lastLine = lines[lines.length - 1];
                const textWidth = ctx.measureText(lastLine).width;
                const lastY = startY + (lines.length - 1) * lineHeight;
                if (Math.floor(Date.now() / 500) % 2 === 0) {
                    ctx.fillStyle = '#204937';
                    ctx.fillRect(960 + (textWidth / 2) + 18, lastY - 42, 8, 84);
                }
            }

            screenTexture.needsUpdate = true;
        }

        // --- STUDIO LIGHTING & DESK ENVIRONMENT ---
        const ambientLight = new THREE.AmbientLight('#FFFFFF', 0.65);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight('#FFF9EA', 2.2);
        keyLight.position.set(4.0, 7.0, 5.0);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight('#E4EDFF', 1.2);
        fillLight.position.set(-4.0, 5.0, 3.5);
        scene.add(fillLight);

        const overheadLight = new THREE.PointLight('#FFF8E7', 12.0, 14, 1.8);
        overheadLight.position.set(0, 4.5, 2.2);
        scene.add(overheadLight);

        // Screen emitted light
        const screenLight = new THREE.PointLight('#FFF3DC', 4.0, 3.2, 2);
        screenLight.position.set(0, 0.727, 0.0);
        scene.add(screenLight);

        // Screen glow spot
        const screenSpotLight = new THREE.SpotLight('#FFDF88', 6.0, 5.0, Math.PI / 1.8, 0.7, 2);
        screenSpotLight.position.set(0, 0.65, 0.35);
        const screenSpotTarget = new THREE.Object3D();
        screenSpotTarget.position.set(0, 0.02, 0.85);
        scene.add(screenSpotTarget);
        screenSpotLight.target = screenSpotTarget;
        scene.add(screenSpotLight);

        // Cursor torch spot light
        const cursorSpotLight = new THREE.SpotLight('#FFFCE8', 9.5, 14, Math.PI / 4.2, 0.65, 2);
        cursorSpotLight.castShadow = true;
        cursorSpotLight.shadow.mapSize.width = 2048;
        cursorSpotLight.shadow.mapSize.height = 2048;
        cursorSpotLight.shadow.bias = -0.0001;
        const cursorSpotTarget = new THREE.Object3D();
        cursorSpotTarget.position.set(0, 0, 0);
        scene.add(cursorSpotTarget);
        cursorSpotLight.target = cursorSpotTarget;
        scene.add(cursorSpotLight);

        // Screen bloom glow plane
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 512;
        glowCanvas.height = 512;
        const glowCtx = glowCanvas.getContext('2d');
        const glowGrad = glowCtx.createRadialGradient(256, 256, 92, 256, 256, 256);
        glowGrad.addColorStop(0.0, 'rgba(255,255,255,0.55)');
        glowGrad.addColorStop(0.45, 'rgba(255,255,255,0.30)');
        glowGrad.addColorStop(0.75, 'rgba(255,255,255,0.10)');
        glowGrad.addColorStop(1.0, 'rgba(255,255,255,0.0)');
        glowCtx.fillStyle = glowGrad;
        glowCtx.fillRect(0, 0, 512, 512);
        const glowTexture = new THREE.CanvasTexture(glowCanvas);
        if (THREE.sRGBEncoding) glowTexture.encoding = THREE.sRGBEncoding;

        const screenGlowMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.25, 0.95),
            new THREE.MeshBasicMaterial({
                map: glowTexture,
                color: '#FFEFD6',
                transparent: true,
                opacity: 0.45,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        screenGlowMesh.position.set(0, 0.727, 0.02);
        scene.add(screenGlowMesh);

        // 1. Solid Wooden Desk Slab
        const deskMesh = new THREE.Mesh(
            new THREE.BoxGeometry(14.0, 0.13, 8.0),
            new THREE.MeshStandardMaterial({ color: '#38302A', roughness: 0.46, metalness: 0.06 })
        );
        deskMesh.position.set(0, -0.065, 0.4);
        deskMesh.receiveShadow = true;
        deskMesh.castShadow = true;
        scene.add(deskMesh);

        // 2. Desk Mat
        const deskMatMesh = new THREE.Mesh(
            new THREE.BoxGeometry(3.9, 0.004, 2.2),
            new THREE.MeshStandardMaterial({ color: '#181A1F', roughness: 0.62, metalness: 0.10 })
        );
        deskMatMesh.position.set(0, 0.001, 0.28);
        deskMatMesh.receiveShadow = true;
        scene.add(deskMatMesh);

        // 3. Studio Room Floor
        const floorMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(120, 120),
            new THREE.MeshStandardMaterial({ color: '#1A1B1E', roughness: 0.75, metalness: 0.08 })
        );
        floorMesh.position.set(0, -2.8, 0);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);

        // --- LOAD COMMODORE 64 MODEL ---
        if (THREE.OBJLoader) {
            const objLoader = new THREE.OBJLoader();
            objLoader.load('models/commodore64.obj', (obj) => {
                const beigePeripheralMat = new THREE.MeshStandardMaterial({ color: '#EFE7D8', roughness: 0.30, metalness: 0.10 });
                const beigeKeysMat = new THREE.MeshStandardMaterial({ color: '#F9F4EB', roughness: 0.22, metalness: 0.05 });
                const monitorGreyMat = new THREE.MeshStandardMaterial({ color: '#585C64', roughness: 0.32, metalness: 0.18 });
                const detailsMat = new THREE.MeshStandardMaterial({ color: '#282B30', roughness: 0.4, metalness: 0.1 });
                const monitorScreenMat = new THREE.MeshBasicMaterial({ map: screenTexture });

                obj.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        const name = node.name.toLowerCase();

                        if (name === 'video_monitor_1702' || (Array.isArray(node.material) && node.material.some(m => m && m.name === 'monitor_screen'))) {
                            const posAttr = node.geometry.attributes.position;
                            let uvAttr = node.geometry.attributes.uv;
                            if (!uvAttr && posAttr) {
                                uvAttr = new THREE.BufferAttribute(new Float32Array(posAttr.count * 2), 2);
                                node.geometry.setAttribute('uv', uvAttr);
                            }

                            const screenGroup = node.geometry.groups.find((g) => g.materialIndex === 2);
                            if (posAttr && uvAttr && screenGroup) {
                                const minX = -0.1292, spanX = 0.2584, minY = 0.0979, spanY = 0.1868;
                                for (let i = screenGroup.start; i < screenGroup.start + screenGroup.count; i++) {
                                    const x = posAttr.getX(i);
                                    const y = posAttr.getY(i);
                                    const u = THREE.MathUtils.clamp((x - minX) / spanX, 0, 1);
                                    const v = THREE.MathUtils.clamp((y - minY) / spanY, 0, 1);
                                    uvAttr.setXY(i, u, v);
                                }
                                uvAttr.needsUpdate = true;
                            }

                            node.material = [monitorGreyMat, monitorGreyMat, monitorScreenMat];
                        } else if (name === 'commodore_64' || (Array.isArray(node.material) && node.material.some(m => m && m.name === 'computer_keyboard'))) {
                            node.material = [detailsMat, beigeKeysMat, beigePeripheralMat];
                        } else {
                            node.material = beigePeripheralMat;
                        }
                    }
                });

                obj.scale.set(3.8, 3.8, 3.8);
                obj.position.set(0, 0, 0);
                scene.add(obj);
            });
        }

        // --- GSAP SCROLL TRIGGER PINNING ---
        if (window.gsap && window.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);

            const heroSection = document.getElementById('hero');
            const heroPinned = document.getElementById('heroPinned');

            if (heroSection && heroPinned) {
                gsap.to({ value: 0 }, {
                    value: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: heroSection,
                        start: 'top top',
                        end: 'bottom bottom',
                        pin: heroPinned,
                        scrub: 0.8,
                        onUpdate: (self) => {
                            scrollProgress = self.progress;
                            displayState = getDisplayState(scrollProgress, breakpoints);
                        }
                    }
                });
            }
        }

        // --- WORMHOLE VIDEO TRANSITION HANDLING ---
        function triggerWormholeTransition() {
            if (isWormholeActive) return;
            isWormholeActive = true;

            const transitionElem = document.getElementById('wormholeTransition');
            const videoElem = document.getElementById('wormholeVideo');
            const endLight = document.getElementById('wormholeEndLight');

            if (!transitionElem || !videoElem) {
                // Fallback: jump to about / light section directly if elements missing
                if (window.lenis) {
                    const target = document.querySelector('.light-section') || document.querySelector('#about');
                    if (target) window.lenis.scrollTo(target, { offset: 0, duration: 1.2 });
                }
                return;
            }

            transitionElem.classList.add('is-active');
            videoElem.currentTime = 0;
            videoElem.play().catch(() => {});

            let isExitingTriggered = false;
            const finishTransition = () => {
                if (isExitingTriggered) return;
                isExitingTriggered = true;

                transitionElem.classList.add('is-exiting');
                if (endLight) endLight.classList.add('is-active');

                setTimeout(() => {
                    const target = document.querySelector('.light-section') || document.querySelector('#about');
                    if (window.lenis && target) {
                        window.lenis.scrollTo(target, { offset: 0, duration: 0 });
                    } else if (target) {
                        target.scrollIntoView({ behavior: 'auto' });
                    }
                }, 440);

                setTimeout(() => {
                    transitionElem.classList.remove('is-active', 'is-exiting');
                    if (endLight) endLight.classList.remove('is-active');
                    videoElem.pause();
                    isWormholeActive = false;
                }, 1350);
            };

            const onTimeUpdate = () => {
                if (videoElem.duration && videoElem.currentTime >= videoElem.duration - 1.45) {
                    videoElem.removeEventListener('timeupdate', onTimeUpdate);
                    finishTransition();
                }
            };

            videoElem.addEventListener('timeupdate', onTimeUpdate);

            // Allow click or tap during wormhole to skip
            const onSkipClick = () => {
                transitionElem.removeEventListener('click', onSkipClick);
                finishTransition();
            };
            transitionElem.addEventListener('click', onSkipClick);
        }

        // --- CLICK & HOVER EVENTS FOR 3D SCREEN BUTTON ---
        const raycaster = new THREE.Raycaster();
        const mouseVector = new THREE.Vector2();

        function checkScreenHover(e) {
            if (!displayState.isCommandComplete || isWormholeActive) {
                if (isHovered) {
                    isHovered = false;
                    document.body.style.cursor = 'default';
                }
                return;
            }

            mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouseVector, camera);

            const intersects = raycaster.intersectObject(screenGlowMesh, true);
            if (intersects.length > 0) {
                if (!isHovered) {
                    isHovered = true;
                    document.body.style.cursor = 'pointer';
                }
            } else {
                if (isHovered) {
                    isHovered = false;
                    document.body.style.cursor = 'default';
                }
            }
        }

        window.addEventListener('mousemove', checkScreenHover);

        window.addEventListener('click', (e) => {
            if (!displayState.isCommandComplete || isWormholeActive) return;

            mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouseVector, camera);

            const intersects = raycaster.intersectObject(screenGlowMesh, true);
            if (intersects.length > 0) {
                triggerWormholeTransition();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (displayState.isCommandComplete && !isWormholeActive && (e.key === 'Enter' || e.key === ' ')) {
                triggerWormholeTransition();
            }
        });

        // Touch support on mobile
        let lastTap = 0;
        window.addEventListener('touchend', (e) => {
            if (!displayState.isCommandComplete || isWormholeActive) return;
            const now = Date.now();
            if (now - lastTap < 400 || scrollProgress >= 0.98) {
                triggerWormholeTransition();
            }
            lastTap = now;
        });

        // --- RESIZE HANDLING (MOBILE RESPONSIVE) ---
        function onResize() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }
        window.addEventListener('resize', onResize);

        // --- ANIMATION LOOP ---
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            const t = clock.getElapsedTime();
            const pulse = Math.sin(t * 1.6) * 0.1 + 1;
            const isComplete = displayState.isCommandComplete;

            // Responsive camera target calculations
            const isMobile = window.innerWidth < 768;
            let targetX, targetY, targetZ, lookX, lookY, lookZ = -0.08;

            if (isMobile) {
                targetX = pointer.x * 0.15;
                targetY = THREE.MathUtils.lerp(1.35, 0.74, Math.pow(scrollProgress, 0.85)) + pointer.y * 0.10;
                targetZ = THREE.MathUtils.lerp(4.4, 2.35, Math.pow(scrollProgress, 0.88));
                lookX = pointer.x * 0.08;
                lookY = THREE.MathUtils.lerp(0.52, 0.727, Math.pow(scrollProgress, 0.85)) + pointer.y * 0.05;
            } else {
                targetX = pointer.x * 0.40;
                targetY = THREE.MathUtils.lerp(1.30, 0.74, Math.pow(scrollProgress, 0.85)) + pointer.y * 0.22;
                targetZ = THREE.MathUtils.lerp(3.88, 1.68, Math.pow(scrollProgress, 0.88));
                lookX = pointer.x * 0.18;
                lookY = THREE.MathUtils.lerp(0.54, 0.727, Math.pow(scrollProgress, 0.85)) + pointer.y * 0.10;
            }

            camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.085);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.085);
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.085);
            camera.lookAt(lookX, lookY, lookZ);

            // Update torch spot light towards cursor
            const torchX = pointer.x * 4.2;
            const torchZ = 0.9 - pointer.y * 2.8;
            const torchY = 3.6;
            cursorSpotLight.position.lerp(new THREE.Vector3(torchX, torchY, torchZ), 0.15);
            cursorSpotTarget.position.lerp(new THREE.Vector3(torchX * 0.9, 0.02, torchZ * 0.9), 0.15);

            // Update screen dynamic lighting
            screenLight.intensity = (isComplete ? 6.0 : 4.0) * pulse;
            screenLight.color.set(isComplete ? BRAND.gold : '#FFF3DC');
            screenGlowMesh.material.opacity = (isComplete ? 0.6 : 0.45) * pulse;
            screenGlowMesh.material.color.set(isComplete ? BRAND.gold : '#FFEFD6');

            screenSpotLight.color.lerp(new THREE.Color(isComplete ? BRAND.gold : '#FFDF88'), 0.1);
            screenSpotLight.intensity = THREE.MathUtils.lerp(screenSpotLight.intensity, isComplete ? 9.0 : 6.0, 0.1);

            // Render dynamic monitor canvas
            updateScreenTexture();

            renderer.render(scene, camera);
        }

        animate();
    });
})();
