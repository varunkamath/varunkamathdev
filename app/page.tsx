'use client'
import React, { useEffect, useRef, useState } from "react";
import Typewriter from 'typewriter-effect';
import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WebGLRenderer } from "three/src/Three.js";
import * as emoji from 'node-emoji'

function CubeComponent() {
  const mountRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);

  // Apply styles to prevent scrolling on body when component mounts
  useEffect(() => {
    // Set overflow hidden on body to prevent scrolling
    document.body.style.overflow = 'hidden';

    // Restore original styles on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Hide tooltip after 7 seconds or after user interaction
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 7000);

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);

    // ASCII effect
    const effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.domElement.style.color = 'white';
    effect.domElement.style.backgroundColor = 'black';

    // Make sure the canvas element gets proper touch handling
    effect.domElement.style.touchAction = 'none';

    // Create a monochrome cube that will still show rotation clearly
    const geometry = new THREE.BoxGeometry(7, 7, 7);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });

    const cube = new THREE.Mesh(geometry, material);
    cubeRef.current = cube;
    scene.add(cube);

    // Add lights with better positioning to show cube edges clearly
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
    pointLight2.position.set(-15, -15, -15);
    scene.add(pointLight2);

    // Mount to DOM
    if (mountRef.current) {
      mountRef.current.appendChild(effect.domElement);
    }

    // Initialize OrbitControls
    const controls = new OrbitControls(camera, effect.domElement);
    controlsRef.current = controls;

    // Configure controls
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.7;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Custom interaction handling to hide tooltip when user interacts
    effect.domElement.addEventListener('pointerdown', () => {
      setShowTooltip(false);
    });

    // Give the cube an initial tilt for better visual interest
    cube.rotation.x = 0.5;
    cube.rotation.y = 0.5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update controls (required for damping)
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      effect.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      effect.setSize(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);

      if (controlsRef.current) {
        controlsRef.current.update();
      }
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      clearTimeout(tooltipTimer);

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (mountRef.current && effect.domElement) {
        mountRef.current.removeChild(effect.domElement);
      }

      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div id="canvas" ref={mountRef} className="flex justify-center h-screen items-center overflow-hidden">
      {showTooltip && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 p-3 rounded-md border border-gray-700 font-mono text-white text-sm z-20 transition-opacity duration-300">
          <div className="flex flex-col items-center">
            <p className="mb-1">psst...</p>
            <p className="mb-1">👆 Touch and drag to rotate</p>
            <p>👌 Pinch to zoom in/out</p>
          </div>
        </div>
      )}
      <div className="p-4 absolute items-center justify-center font-mono text-md backdrop-blur-md md:invert text-white z-10">
        <Typewriter
          options={{
            cursor: "_",
            delay: 75,
          }}
          onInit={(typewriter) => {
            typewriter.pauseFor(500)
              .typeString(emoji.emojify('Hi, I\'m <a href="https://varunkamath.dev" class="underline">Varun</a>.<br /><br />'))
              .pauseFor(2000)
              .typeString('<a href="https://github.com/varunkamath" class="underline">github.com/varunkamath</a><br /><br /><a href="https://linkedin.com/in/varun-kamath" class="underline">linkedin.com/in/varun-kamath</a><br /><br />')
              .pauseFor(1000)
              .typeString('or ')
              .pauseFor(1000)
              .typeString('.')
              .pauseFor(300)
              .typeString('.')
              .pauseFor(300)
              .typeString('. ')
              .pauseFor(300)
              .typeString('<a href="mailto:varun.kamath@gmail.com" class="underline">email me</a>. ')
              .callFunction(() => {
                console.log('String typed out!');
              })
              .start();
          }}
        />
      </div>
    </div>
  );
}

function AsciiBall() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let camera: THREE.PerspectiveCamera, controls: OrbitControls, scene: THREE.Scene, renderer: WebGLRenderer, effect: AsciiEffect;
    let sphere: THREE.Mesh, plane: THREE.Mesh;
    const start = Date.now();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 150;
    camera.position.z = 500;
    camera.rotation.z = 4;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0, 0, 0);

    const pointLight1 = new THREE.PointLight(0xffffff, 3, 0, 0);
    pointLight1.position.set(500, 500, 500);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 0, 0);
    pointLight2.position.set(- 500, - 500, - 500);
    scene.add(pointLight2);

    sphere = new THREE.Mesh(new THREE.SphereGeometry(200, 20, 10), new THREE.MeshPhongMaterial({ flatShading: true }));
    scene.add(sphere);

    plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0xe0e0e0 }));
    plane.position.y = - 200;
    plane.rotation.x = - Math.PI / 2;
    plane.rotation.z = Math.PI / 3;
    scene.add(plane);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.domElement.style.color = 'white';
    effect.domElement.style.backgroundColor = 'black';

    controls = new OrbitControls(camera, effect.domElement);

    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      effect.setSize(window.innerWidth, window.innerHeight);

    }

    function animate() {

      requestAnimationFrame(animate);
      const timer = Date.now() - start;

      sphere.position.y = Math.abs(Math.sin(timer * 0.002)) * 100;
      sphere.rotation.x = timer * 0.0003;
      sphere.rotation.z = timer * 0.0002;

      controls.update();

      effect.render(scene, camera);
    }

    if (mountRef.current) {
      mountRef.current.appendChild(effect.domElement);
    }

    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(effect.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} />;
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <CubeComponent />
    </main>
  );
}
