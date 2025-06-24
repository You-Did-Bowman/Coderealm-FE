import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function JadaScene() {
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
    camera.position.set(0, 1.4, 5);
    camera.lookAt(0, 0.5, 0); 

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    const hemiLight = new THREE.HemisphereLight(0xffa366, 0x331100, 15);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffcc99, 0.2);
    dirLight.position.set(2, 5, 2);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffe6b3, 0.4);
    scene.add(ambientLight);

    // const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    // const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    // const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // cube.position.set(0, 1, 0);
    // scene.add(cube);

    const loader = new GLTFLoader();
    loader.load(
      "/models/jada.glb",
      (gltf) => {
        
        const existing = scene.getObjectByName("JADA");
        if (existing) {
          scene.remove(existing);
        }

        const model = gltf.scene;
        model.name = "JADA";
        model.scale.set(1, 1, 1);
        model.position.set(0, 0.5, 0);

        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = true;
          }
        });

        scene.add(model);
        console.log("✅ JADA added to scene:", model);
      },
      undefined,
      (error) => {
        console.error("❌ Error loading JADA", error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
