import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function JadaWireframe() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a021e");

    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.4, 2); // x, x, zoom
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    // Lighting (same as original)
    scene.add(new THREE.HemisphereLight(0xffa366, 0x331100, 5));
    const dirLight = new THREE.DirectionalLight(0xffcc99, 0.2);
    dirLight.position.set(2, 5, 2);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffe6b3, 0.4));

    const loader = new GLTFLoader();
    loader.load(
      "/models/jada.glb",
      (gltf) => {
        const model = gltf.scene;
        model.name = "JADA";
        model.scale.set(1, 1, 1);
        model.position.set(0.5, -0.1, 0.5);

        // Clone Jada to create wireframe version
        const wireframeModel = model.clone(true);
        wireframeModel.name = "JADA_WIREFRAME";

        // Convert cloned mesh materials to wireframe
        wireframeModel.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
              color: 0x007777,
              wireframe: true,
              transparent: true,
              opacity: 0.1,
              depthTest: false,
            });
          }
        });

        // Add wireframe model to scene (initially visible)
        scene.add(wireframeModel);
        scene.add(model);

        // ✅ Flicker logic with controlled duration
        let flickerActive = false;

        const triggerGlitch = () => {
          if (flickerActive) return;

          flickerActive = true;
          model.visible = true;
          wireframeModel.visible = false;

          setTimeout(() => {
            model.visible = false;
            wireframeModel.visible = true;
            flickerActive = false;
          }, 40); //solid duration (ms)
        };

        const animate = () => {
          requestAnimationFrame(animate);

          // Randomly trigger glitch effect
          if (!flickerActive && Math.random() < 0.01) {
            triggerGlitch();
          }

          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (error) => {
        console.error("❌ Error loading JADA", error);
      }
    );

    return () => {
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 w-full h-full pointer-events-none"
    />
  );
}
