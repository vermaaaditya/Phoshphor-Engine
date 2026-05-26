import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function BackgroundScene() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return undefined
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100)
    camera.position.z = 9

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const pointsGeometry = new THREE.BufferGeometry()
    const particles = new Float32Array(700 * 3)
    for (let i = 0; i < particles.length; i += 3) {
      particles[i] = (Math.random() - 0.5) * 12
      particles[i + 1] = (Math.random() - 0.5) * 12
      particles[i + 2] = (Math.random() - 0.5) * 8
    }
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3))

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x7c85ff,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
    })

    const points = new THREE.Points(pointsGeometry, pointsMaterial)
    scene.add(points)

    const resize = () => {
      const { clientWidth, clientHeight } = container
      renderer.setSize(clientWidth, clientHeight)
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
    }

    let animationFrame = 0
    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      points.rotation.y += 0.0008
      points.rotation.x += 0.0004
      renderer.render(scene, camera)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrame)
      pointsGeometry.dispose()
      pointsMaterial.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div className="background-scene" ref={containerRef} aria-hidden="true" />
}

export default BackgroundScene
