import { useEffect, useRef } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function JadaScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000704");

    const camera = new THREE.PerspectiveCamera(
      30, // field of view
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.4, 3.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0) // where the camera looks
    controls.update()

    const hemiLight = new THREE.HemisphereLight(0xffa366, 0x000704, 15)
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffcc99, 0.2)
    dirLight.position.set(2, 5, 2)
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffe6b3, 0.4)
    scene.add(ambientLight)

    // Load JADA model
    const loader = new GLTFLoader();
    loader.load(
      "/models/jada.glb",
      (gltf) => {
        const existing = scene.getObjectByName("JADA")
        if (existing) scene.remove(existing)

        const model = gltf.scene
        model.name = "JADA"

        // adjust scale and position for centering
        model.scale.set(0.85, 0.85, 0.85)
        model.position.set(0, 0.2, 0)

        model.traverse((child) => {
          if (child.isMesh) child.visible = true
        });

        scene.add(model)

        // show bounding box (debug)
        // const box = new THREE.BoxHelper(model, 0xffff00);
        // scene.add(box);

        console.log("JADA added to scene:", model)
      },
      undefined,
      (error) => {
        console.error("Error loading JADA", error)
      }
    );

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />
}
