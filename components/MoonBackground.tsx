import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// Use public folder path
const moonTextureUrl = '/moon_texture.png';

export const MoonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    // Deep space background color
    scene.background = new THREE.Color('#03030b');
    // Add some fog for depth
    scene.fog = new THREE.FogExp2('#03030b', 0.15);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2.2;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Add a blue rim light for atmosphere effect
    const rimLight = new THREE.SpotLight(0x4455ff, 5);
    rimLight.position.set(-5, 0, -2);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // --- MOON ---
    const textureLoader = new THREE.TextureLoader();
    const moonTexture = textureLoader.load(moonTextureUrl);
    moonTexture.colorSpace = THREE.SRGBColorSpace;

    // Create geometry with more segments for smoothness
    const geometry = new THREE.SphereGeometry(0.8, 128, 128);

    const material = new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.7,
      metalness: 0.1,
      bumpMap: moonTexture,
      bumpScale: 0.02,
    });

    const moon = new THREE.Mesh(geometry, material);
    scene.add(moon);

    // --- STARS BACKGROUND ---
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 50;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- ANIMATION ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Rotate moon
      moon.rotation.y += 0.0015;

      // Slowly rotate stars for parallax
      stars.rotation.y -= 0.0002;
      stars.rotation.x += 0.0001;

      renderer.render(scene, camera);
    };
    animate();

    // --- RESIZE ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- CLEANUP ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // Dispose resources
      geometry.dispose();
      material.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      moonTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
};