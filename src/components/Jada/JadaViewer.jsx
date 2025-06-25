import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function JadaViewer() {
  const mountRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setClearColor(0x0a0a23);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AxesHelper(3));
    scene.add(new THREE.GridHelper(10, 10));

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    loader.load(
      "/models/jada.glb",
      (gltf) => {
        let jada = gltf.scene;

        let meshCount = 0;
        jada.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
              color: "hotpink",
              wireframe: true,
            });
            meshCount++;
          }
        });

        if (meshCount === 0) {
          console.warn("⚠️ JADA loaded but no visible meshes");
        }

        // Center and scale
        const box = new THREE.Box3().setFromObject(jada);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        jada.position.sub(center);

        // Optional: scale to fit in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        jada.scale.setScalar(scale);

        scene.add(jada);
        console.log("✅ JADA added:", jada);
      },
      undefined,
      (err) => {
        console.error("❌ Failed to load JADA:", err);
      }
    );

    // Fallback: add test cube
    const testCube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: "red" })
    );
    testCube.position.set(-2, 0.5, 0);
    scene.add(testCube);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
