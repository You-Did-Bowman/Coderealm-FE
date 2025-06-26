import { useEffect, useRef } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function JadaScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    // initialize scene and camera 
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#000704") // dark background for contrast

    const camera = new THREE.PerspectiveCamera(
      30,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.4, 3.5) // camera slightly above and in front

    // renderer setup 
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    // orbit controls 
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0);
    controls.update();

    // lighting setup 
    const hemiLight = new THREE.HemisphereLight(0xffa366, 0x000704, 15)
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffcc99, 0.2)
    dirLight.position.set(2, 5, 2);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffe6b3, 0.4)
    scene.add(ambientLight)

    // load JADA model 
    const loader = new GLTFLoader();
    loader.load(
      "/models/jada.glb",
      (gltf) => {
        const existing = scene.getObjectByName("JADA")
        if (existing) scene.remove(existing)

        const model = gltf.scene
        model.name = "JADA"
        model.scale.set(0.85, 0.85, 0.85)
        model.position.set(0, 0.2, 0);

        let head = model.getObjectByName("J_Bip_C_Head");
        let upperChest = model.getObjectByName("J_Bip_C_UpperChest")

        // add model to a group and scene
        const jadaGroup = new THREE.Group()
        jadaGroup.name = "JADA_GROUP"
        jadaGroup.add(model)
        scene.add(jadaGroup)

        // animation logic 
        let activeBurst = null;
        let burstStartTime = 0;

        const animate = () => {
          requestAnimationFrame(animate);

          const now = Date.now();

          if (activeBurst) {
            const t = (now - burstStartTime) / 1000 // time since burst started in seconds
            const damping = Math.exp(-4 * t) // exponential decay to simulate slowing
            const bounce = Math.sin(3 * Math.PI * Math.pow(t, 0.85))
            const nod = bounce * damping * 0.105 // final nod value

            if (head) head.rotation.x = nod; // nod head
            if (upperChest) upperChest.rotation.x = nod * 0.3 // slight chest movement

            // stop after 1.2s
            if (t > 1.2) {
              activeBurst = null
              if (head) head.rotation.x = 0
              if (upperChest) upperChest.rotation.x = 0
            }
          }

          renderer.render(scene, camera)
        };
        animate()

        const triggerBurst = () => {
          activeBurst = true;
          burstStartTime = Date.now()
        };

        // === Listen for custom speaking event ===
        window.addEventListener("jada-start-speaking", () => {
          triggerBurst();
          setTimeout(() => triggerBurst(), 640);
          setTimeout(() => triggerBurst(), 1280);

          setTimeout(() => triggerBurst(), 2560);
          setTimeout(() => triggerBurst(), 3200);
          setTimeout(() => triggerBurst(), 3840);
        });

        console.log("JADA added to scene:", model)
      },
      undefined,
      (error) => {
        console.error("Error loading JADA", error)
      }
    );

    return () => {
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    };
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}
