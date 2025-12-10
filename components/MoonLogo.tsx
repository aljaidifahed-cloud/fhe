import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MoonLogoProps {
    className?: string;
}

export const MoonLogo: React.FC<MoonLogoProps> = ({ className }) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // --- SCENE SETUP ---
        const scene = new THREE.Scene();

        // Camera setup
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 2.5;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        // Default size to avoid 300x150 squash issue if resize fails initially
        renderer.setSize(200, 200);

        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';

        const updateSize = () => {
            if (mountRef.current) {
                const { clientWidth, clientHeight } = mountRef.current;

                // If container is collapsed, don't update to 0 (would break matrices)
                if (clientWidth === 0 || clientHeight === 0) return;

                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.setSize(clientWidth, clientHeight, false); // false = keep CSS size

                camera.aspect = clientWidth / clientHeight;
                camera.updateProjectionMatrix();
            }
        };

        // CLEAR CONTAINER to prevent duplicate canvases (Hot Reload / Strict Mode)
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
        mountRef.current.appendChild(renderer.domElement);

        // Initial resize
        updateSize();
        // Double check shortly after mount to catch flexbox updates
        setTimeout(updateSize, 100);

        // --- LIGHTS ---
        // Strong ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        // Main Sunlight
        const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
        sunLight.position.set(5, 5, 10);
        scene.add(sunLight);

        // Rim Light
        const rimLight = new THREE.SpotLight(0xaaccff, 4.0);
        rimLight.position.set(-5, 5, -2);
        rimLight.lookAt(0, 0, 0);
        scene.add(rimLight);

        // --- MOON MESH ---
        const textureLoader = new THREE.TextureLoader();
        const moonTexture = textureLoader.load('/moon_texture.png');
        moonTexture.colorSpace = THREE.SRGBColorSpace;

        const geometry = new THREE.SphereGeometry(0.95, 64, 64);

        // Emissive Material for GUARANTEED VISIBILITY
        const material = new THREE.MeshStandardMaterial({
            map: moonTexture,
            bumpMap: moonTexture,
            bumpScale: 0.05,
            color: 0xffffff,
            roughness: 0.6,
            metalness: 0.1,
            emissive: 0xaaaaaa,    // Strong white glow
            emissiveIntensity: 0.5
        });

        const moon = new THREE.Mesh(geometry, material);
        scene.add(moon);

        // --- ANIMATION ---
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (moon) {
                moon.rotation.y += 0.003;
            }
            renderer.render(scene, camera);
        };
        animate();

        // --- RESIZE ---
        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });
        resizeObserver.observe(mountRef.current);

        // --- CLEANUP ---
        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(frameId);

            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }

            geometry.dispose();
            material.dispose();
            moonTexture.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            className={className}
            style={{
                width: '100%',
                height: '100%',
                // Ensure container has aspect ratio 1:1 if unchecked, though className usually handles it
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        />
    );
};
