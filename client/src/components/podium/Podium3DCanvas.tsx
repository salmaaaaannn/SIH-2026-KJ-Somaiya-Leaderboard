import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Podium3DCanvasProps {
  top5Count: number;
}

export const Podium3DCanvas: React.FC<Podium3DCanvasProps> = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // WebGL not available
    }

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 11);
    camera.lookAt(0, 1.2, 0);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Somaiya Red Accent Directional Spotlight
    const redSpot = new THREE.SpotLight(0xa01c24, 4.5, 25, Math.PI / 4, 0.3);
    redSpot.position.set(0, 9, 3);
    redSpot.castShadow = true;
    scene.add(redSpot);

    // White rim light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfef2f2, 0.8);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    // Ground plane with subtle circular reflection
    const groundGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.1, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.3,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Glowing subtle outer ring
    const ringGeo = new THREE.RingGeometry(7.8, 8.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa01c24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // Pedestals configuration: [rank, x, z, height, radius, color, ringColor]
    const podiumConfigs = [
      { rank: 1, x: 0, z: -0.6, height: 2.2, r: 1.25, color: 0xffffff, rim: 0xd97706 }, // Rank 1 (Tallest, center)
      { rank: 2, x: -3.2, z: 0.4, height: 1.6, r: 1.05, color: 0xffffff, rim: 0xa01c24 }, // Rank 2
      { rank: 3, x: 3.2, z: 0.4, height: 1.2, r: 1.05, color: 0xffffff, rim: 0x991b1b },  // Rank 3
      { rank: 4, x: -5.6, z: 1.4, height: 0.8, r: 0.9, color: 0xffffff, rim: 0xe5e7eb },   // Rank 4
      { rank: 5, x: 5.6, z: 1.4, height: 0.7, r: 0.9, color: 0xffffff, rim: 0xe5e7eb },    // Rank 5
    ];

    const pedestalMeshes: THREE.Group[] = [];

    podiumConfigs.forEach(p => {
      const group = new THREE.Group();
      group.position.set(p.x, 0, p.z);

      // Cylinder base
      const cylGeo = new THREE.CylinderGeometry(p.r, p.r * 1.05, p.height, 36);
      const cylMat = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: 0.2,
        metalness: 0.15,
      });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.position.y = p.height / 2;
      cyl.castShadow = true;
      cyl.receiveShadow = true;
      group.add(cyl);

      // Metallic Top Rim
      const topRimGeo = new THREE.TorusGeometry(p.r, 0.04, 16, 48);
      const topRimMat = new THREE.MeshStandardMaterial({
        color: p.rim,
        roughness: 0.1,
        metalness: 0.8,
      });
      const topRim = new THREE.Mesh(topRimGeo, topRimMat);
      topRim.rotation.x = Math.PI / 2;
      topRim.position.y = p.height;
      group.add(topRim);

      // Subtle base rim
      const baseRimGeo = new THREE.TorusGeometry(p.r * 1.05, 0.03, 16, 48);
      const baseRimMat = new THREE.MeshStandardMaterial({
        color: 0xe5e7eb,
        roughness: 0.3,
        metalness: 0.5,
      });
      const baseRim = new THREE.Mesh(baseRimGeo, baseRimMat);
      baseRim.rotation.x = Math.PI / 2;
      baseRim.position.y = 0.05;
      group.add(baseRim);

      scene.add(group);
      pedestalMeshes.push(group);
    });

    // Subtle floating particles around the stage
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = Math.random() * 4 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xa01c24,
      size: 0.08,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle floating animation on Rank 1 pedestal
      pedestalMeshes[0].position.y = Math.sin(elapsed * 1.2) * 0.06;

      // Subtle rotation of outer ring
      ring.rotation.z = elapsed * 0.05;

      // Slowly rotate particle field
      particles.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 md:opacity-65"
      style={{ overflow: 'hidden' }}
    />
  );
};
