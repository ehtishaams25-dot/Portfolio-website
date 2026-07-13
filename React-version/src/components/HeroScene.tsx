import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { modelPaths } from '../data/portfolio'

type SceneObject = {
  mesh: SceneMesh
  kind: 'ring' | 'bad' | 'text'
  got?: boolean
  missed?: boolean
  hit?: boolean
}

type DisposableMaterial = {
  dispose: () => void
}

type SceneVector = {
  x: number
  y: number
  z: number
  set: (x: number, y: number, z: number) => void
  distanceTo: (vector: SceneVector) => number
}

type SceneScale = SceneVector & {
  setScalar: (value: number) => void
}

type SceneRotation = {
  x: number
  y: number
  z: number
  set: (x: number, y: number, z: number) => void
}

type SceneMesh = {
  position: SceneVector
  rotation: SceneRotation
  scale: SceneScale
  userData: Record<string, number>
  visible: boolean
  frustumCulled?: boolean
  geometry?: { dispose: () => void }
  material?: DisposableMaterial | DisposableMaterial[]
  traverse: (callback: (child: SceneMesh) => void) => void
  clone: (recursive?: boolean) => SceneMesh
}

type GltfResult = {
  scene: SceneMesh
}

type Star = {
  x: number
  y: number
  z: number
  v: number
}

const tunnelLength = 4600

function isSceneMesh(value: unknown): value is SceneMesh {
  return value instanceof THREE.Mesh
}

function createTextPlane(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'rgba(239, 231, 216, 0.58)'
    ctx.font = '500 62px Poppins, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

  return new THREE.Mesh(new THREE.PlaneGeometry(78, 19.5), material) as SceneMesh
}

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const scoreBoxRef = useRef<HTMLDivElement | null>(null)
  const flashRef = useRef<HTMLDivElement | null>(null)
  const scoreRef = useRef(0)
  const livesRef = useRef(3)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x030604, 0.008)

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / window.innerHeight, 0.1, 6000)
    camera.position.z = 0

    const renderer = new THREE.WebGLRenderer({
      antialias: window.innerWidth > 768,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setSize(container.clientWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, window.innerHeight),
      1,
      0.42,
      0.32,
    )
    composer.addPass(bloom)

    scene.add(new THREE.AmbientLight(0xffffff, 1.5))
    const directionLight = new THREE.DirectionalLight(0xffffff, 2)
    directionLight.position.set(0, 50, 50)
    scene.add(directionLight)
    const pointLight = new THREE.PointLight(0xdcb558, 3, 2000)
    scene.add(pointLight)

    const starCount = window.innerWidth < 768 ? 1300 : 2800
    const starGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1, 6)
    starGeometry.rotateX(Math.PI / 2)
    const starMesh = new THREE.InstancedMesh(
      starGeometry,
      new THREE.MeshBasicMaterial({ color: 0xefe7d8 }),
      starCount,
    )
    const dummy = new THREE.Object3D()
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 800,
      z: -Math.random() * tunnelLength,
      v: 0.35 + Math.random() * 2,
    }))
    scene.add(starMesh)

    const allObjects: SceneObject[] = []
    const ringGeometry = new THREE.TorusGeometry(12, 1.5, 16, 50)
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xdcb558,
      emissive: 0xdcb558,
      emissiveIntensity: 0.8,
      metalness: 0.38,
      roughness: 0.18,
    })

    let lastRingX = 0
    let lastRingY = 0
    let lastRingZ = -280
    for (let i = 0; i < 26; i += 1) {
      lastRingX += (Math.random() - 0.5) * 34
      lastRingY += (Math.random() - 0.5) * 24
      lastRingX = Math.max(-60, Math.min(60, lastRingX))
      lastRingY = Math.max(-44, Math.min(44, lastRingY))
      lastRingZ -= 112 + Math.random() * 80
      const ring = new THREE.Mesh(ringGeometry, ringMaterial) as SceneMesh
      ring.position.set(lastRingX, lastRingY, lastRingZ)
      ring.userData.rx = 0.006
      ring.userData.ry = 0.01
      scene.add(ring)
      allObjects.push({ mesh: ring, kind: 'ring' })
    }

    ;['motion', 'story', 'pace', 'retention', 'design'].forEach((word, index) => {
      const plane = createTextPlane(word)
      const x = index % 2 === 0 ? -105 : 105
      plane.position.set(x, (Math.random() - 0.5) * 90, -700 - index * 620)
      scene.add(plane)
      allObjects.push({ mesh: plane, kind: 'text' })
    })

    const loader = new GLTFLoader()
    modelPaths.forEach((path, modelIndex) => {
      loader.load(
        path,
        (gltf: GltfResult) => {
          gltf.scene.traverse((child) => {
            if (isSceneMesh(child)) {
              child.frustumCulled = true
            }
          })
          for (let i = 0; i < 4; i += 1) {
            const clone = gltf.scene.clone(true)
            const radius = 34 + Math.random() * 70
            const angle = Math.random() * Math.PI * 2
            const scale = [6, 4.5, 0.9, 5.5][modelIndex] * (0.55 + Math.random() * 0.8)
            clone.scale.setScalar(scale)
            clone.position.set(
              Math.cos(angle) * radius,
              (Math.random() - 0.5) * 86,
              -900 - Math.random() * tunnelLength,
            )
            clone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
            clone.userData.baseY = clone.position.y
            clone.userData.bob = 0.001 + Math.random() * 0.002
            scene.add(clone)
            allObjects.push({ mesh: clone, kind: 'bad' })
          }
        },
        undefined,
        () => undefined,
      )
    })

    let frame = 0
    let targetX = 0
    let targetY = 0
    let lastTargetX = 0
    const cameraRoll = { bank: 0, hurt: 0 }
    let speedMultiplier = 1
    let currentSpeed = 0
    let sweepTime = 0

    const updateScore = (nextScore: number) => {
      scoreRef.current = nextScore
      setScore(nextScore)
      const level = Math.floor(nextScore / 10)
      if (level > 0 && nextScore % 10 === 0) {
        speedMultiplier = 1 + nextScore * 0.012
        setToast(`LEVEL ${level}  +${Math.round((speedMultiplier - 1) * 100)}% SPEED`)
        window.setTimeout(() => setToast(''), 1800)
      }
    }

    const resetRun = () => {
      scoreRef.current = 0
      livesRef.current = 3
      speedMultiplier = 1
      currentSpeed = Math.min(currentSpeed, 1)
      setScore(0)
      setLives(3)
      if (scoreBoxRef.current) {
        gsap.fromTo(scoreBoxRef.current, { scale: 1.3, color: '#ff4a4a' }, { scale: 1, color: '#efe7d8', duration: 0.45 })
      }
      if (flashRef.current) {
        gsap.fromTo(flashRef.current, { opacity: 0.3 }, { opacity: 0, duration: 0.55 })
      }
      gsap.fromTo(cameraRoll, { hurt: Math.random() > 0.5 ? 0.18 : -0.18 }, { hurt: 0, duration: 0.6, ease: 'elastic.out(1,0.3)' })
    }

    const pointer = (clientX: number, clientY: number) => {
      targetX = (clientX / window.innerWidth - 0.5) * 2
      targetY = -(clientY / window.innerHeight - 0.5) * 2
      titleRef.current?.style.setProperty('--mx', `${clientX}px`)
      titleRef.current?.style.setProperty('--my', `${clientY}px`)
    }

    const onPointerMove = (event: PointerEvent) => pointer(event.clientX, event.clientY)
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches[0]) pointer(event.touches[0].clientX, event.touches[0].clientY)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    const animate = () => {
      frame = requestAnimationFrame(animate)
      sweepTime += 0.012
      if (Math.abs(targetX) < 0.02 && Math.abs(targetY) < 0.02) {
        targetX = Math.sin(sweepTime) * 0.44
        targetY = Math.cos(sweepTime * 0.8) * 0.24
      }

      currentSpeed += ((1.65 * speedMultiplier) - currentSpeed) * 0.018
      camera.position.z -= currentSpeed
      camera.position.x += (targetX * 55 - camera.position.x) * 0.03
      camera.position.y += (targetY * 40 - camera.position.y) * 0.03
      camera.rotation.y = -camera.position.x * 0.004
      camera.rotation.x = camera.position.y * 0.004
      cameraRoll.bank += ((targetX - lastTargetX) * 2.4 - cameraRoll.bank) * 0.05
      lastTargetX = targetX
      camera.rotation.z = cameraRoll.bank + cameraRoll.hurt
      pointLight.position.copy(camera.position)

      for (let i = 0; i < starCount; i += 1) {
        const star = stars[i]
        star.z += currentSpeed * star.v
        if (star.z > camera.position.z + 200) {
          star.z = camera.position.z - 4400 - Math.random() * 900
          star.x = (Math.random() - 0.5) * 800
          star.y = (Math.random() - 0.5) * 800
        }
        dummy.position.set(star.x, star.y, star.z)
        dummy.scale.set(1, 1, 1 + currentSpeed * star.v * 2.25)
        dummy.updateMatrix()
        starMesh.setMatrixAt(i, dummy.matrix)
      }
      starMesh.instanceMatrix.needsUpdate = true
      bloom.strength = 1 + (speedMultiplier - 1) * 0.8

      for (const object of allObjects) {
        const mesh = object.mesh
        if (object.kind === 'bad') {
          mesh.rotation.y += 0.008
          mesh.position.y = (mesh.userData.baseY || 0) + Math.sin(performance.now() * (mesh.userData.bob || 0.001)) * 4
          if (camera.position.z < mesh.position.z + 10 && camera.position.z > mesh.position.z - 30) {
            const distance = camera.position.distanceTo(mesh.position)
            if (distance < 24 && !object.hit) {
              object.hit = true
              resetRun()
            }
          } else {
            object.hit = false
          }
          if (mesh.position.z > camera.position.z + 120) {
            const radius = 35 + Math.random() * 82
            const angle = Math.random() * Math.PI * 2
            mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 88, camera.position.z - tunnelLength - Math.random() * 500)
            mesh.userData.baseY = mesh.position.y
          }
        }

        if (object.kind === 'text' && mesh.position.z > camera.position.z + 120) {
          const x = Math.random() > 0.5 ? 110 : -110
          mesh.position.set(x, (Math.random() - 0.5) * 96, camera.position.z - tunnelLength - Math.random() * 500)
        }

        if (object.kind === 'ring') {
          mesh.rotation.x += mesh.userData.rx || 0
          mesh.rotation.y += mesh.userData.ry || 0
          if (!object.got && !object.missed) {
            if (camera.position.z < mesh.position.z && camera.position.z > mesh.position.z - 18) {
              const dx = camera.position.x - mesh.position.x
              const dy = camera.position.y - mesh.position.y
              if (Math.hypot(dx, dy) < 20) {
                object.got = true
                updateScore(scoreRef.current + 1)
                if (scoreBoxRef.current) {
                  gsap.fromTo(scoreBoxRef.current, { scale: 1.2, color: '#ffffff' }, { scale: 1, color: '#efe7d8', duration: 0.35 })
                }
                gsap.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 0.35 })
                window.setTimeout(() => {
                  mesh.visible = false
                }, 360)
              }
            } else if (camera.position.z < mesh.position.z - 25) {
              object.missed = true
              livesRef.current -= 1
              setLives(livesRef.current)
              if (livesRef.current <= 0) resetRun()
            }
          }
          if (mesh.position.z > camera.position.z + 120) {
            object.got = false
            object.missed = false
            mesh.visible = true
            mesh.scale.set(1, 1, 1)
            const x = Math.max(-60, Math.min(60, camera.position.x + (Math.random() - 0.5) * 62))
            const y = Math.max(-48, Math.min(48, camera.position.y + (Math.random() - 0.5) * 44))
            mesh.position.set(x, y, camera.position.z - (2100 + Math.random() * 1200))
          }
        }
      }

      composer.render()
    }

    const resize = () => {
      const width = container.clientWidth || window.innerWidth
      camera.aspect = width / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(width, window.innerHeight)
      composer.setSize(width, window.innerHeight)
    }

    window.addEventListener('resize', resize)
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
      composer.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      scene.traverse((object: SceneMesh) => {
        if (isSceneMesh(object)) {
          object.geometry?.dispose()
          const material = object.material
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose())
          } else {
            material?.dispose()
          }
        }
      })
    }
  }, [])

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 z-0" aria-hidden="true" />
      <div ref={flashRef} className="pointer-events-none absolute inset-0 z-[3] bg-red-500 opacity-0" />
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-edge">
        <h1
          ref={titleRef}
          className="hero-title-mask ds-display mx-auto text-center uppercase"
        >
          Mohammed
          <br />
          Ehtishaam
          <br />
          <i className="normal-case">Shaikh</i>
        </h1>
      </div>
      <div className="pointer-events-none absolute left-edge top-28 z-20 flex flex-wrap items-center gap-4 text-beige">
        <div ref={scoreBoxRef} className="font-serif text-2xl">
          Score <span className="text-gold">{score}</span>
        </div>
        <div className="font-serif text-2xl">Lives: {'❤'.repeat(lives)}</div>
      </div>
      <div
        className={`absolute right-edge top-32 z-20 rounded-full border border-gold/60 px-4 py-2 text-sm font-medium tracking-[0.16em] text-gold transition ${
          toast ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
        }`}
      >
        {toast}
      </div>
    </>
  )
}
