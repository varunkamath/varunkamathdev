'use client'
import React, { useEffect, useRef, useState } from "react";
import Typewriter from 'typewriter-effect';
import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { WebGLRenderer } from "three/src/Three.js";
import * as emoji from 'node-emoji'

function CubeComponent() {
  const mountRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const autoRotationRef = useRef({ x: 0.01, y: 0.01 });
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const previousTouchDistance = useRef<number | null>(null);
  const cameraPositionRef = useRef({ z: 15 });
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    // Hide tooltip after 7 seconds or after user interaction
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 7000);

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = cameraPositionRef.current.z;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);

    // ASCII effect
    const effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.domElement.style.color = 'white';
    effect.domElement.style.backgroundColor = 'black';

    // Create a monochrome cube that will still show rotation clearly
    const geometry = new THREE.BoxGeometry(7, 7, 7);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });

    const cube = new THREE.Mesh(geometry, material);
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

    // Mouse wheel event for zooming
    const onMouseWheel = (event: WheelEvent) => {
      // Hide tooltip when user starts interacting
      setShowTooltip(false);

      // Zoom in or out based on wheel direction
      const zoomSpeed = 0.5;
      const delta = Math.sign(event.deltaY) * zoomSpeed;

      // Update camera position for zoom effect
      // Clamp between 5 (close) and 25 (far away)
      cameraPositionRef.current.z = Math.max(5, Math.min(25, cameraPositionRef.current.z + delta));
      camera.position.z = cameraPositionRef.current.z;
    };

    // Mouse interaction handlers with smoother rotation
    const onMouseDown = (event: MouseEvent) => {
      // Hide tooltip when user starts interacting
      setShowTooltip(false);

      isInteractingRef.current = true;
      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY
      };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isInteractingRef.current) {
        const deltaX = event.clientX - previousMousePosition.current.x;
        const deltaY = event.clientY - previousMousePosition.current.y;

        // Apply rotation directly to the cube based on mouse movement
        // Use smaller multiplier for smoother rotation
        cube.rotation.y += deltaX * 0.005;
        cube.rotation.x += deltaY * 0.005;

        previousMousePosition.current = {
          x: event.clientX,
          y: event.clientY
        };
      }
    };

    const onMouseUp = () => {
      isInteractingRef.current = false;
    };

    // Calculate distance between two touch points
    const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Touch events for mobile
    const onTouchStart = (event: TouchEvent) => {
      // Hide tooltip when user starts interacting
      setShowTooltip(false);

      if (event.touches.length === 1) {
        // Single touch - rotate
        isInteractingRef.current = true;
        previousMousePosition.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      } else if (event.touches.length === 2) {
        // Two touches - pinch to zoom
        previousTouchDistance.current = getTouchDistance(event.touches[0], event.touches[1]);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (isInteractingRef.current && event.touches.length === 1) {
        // Handle rotation
        const deltaX = event.touches[0].clientX - previousMousePosition.current.x;
        const deltaY = event.touches[0].clientY - previousMousePosition.current.y;

        cube.rotation.y += deltaX * 0.005;
        cube.rotation.x += deltaY * 0.005;

        previousMousePosition.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      } else if (event.touches.length === 2 && previousTouchDistance.current !== null) {
        // Handle pinch zoom
        const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);
        const delta = (previousTouchDistance.current - currentDistance) * 0.05;

        // Update camera position for zoom effect
        // Clamp between 5 (close) and 25 (far away)
        cameraPositionRef.current.z = Math.max(5, Math.min(25, cameraPositionRef.current.z + delta));
        camera.position.z = cameraPositionRef.current.z;

        previousTouchDistance.current = currentDistance;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 1) {
        isInteractingRef.current = false;
      }

      if (event.touches.length < 2) {
        previousTouchDistance.current = null;
      }
    };

    // Add event listeners
    effect.domElement.addEventListener('mousedown', onMouseDown as EventListener);
    effect.domElement.addEventListener('mousemove', onMouseMove as EventListener);
    effect.domElement.addEventListener('mouseup', onMouseUp);
    effect.domElement.addEventListener('mouseleave', onMouseUp);
    effect.domElement.addEventListener('wheel', onMouseWheel as EventListener);

    // Add touch event listeners
    effect.domElement.addEventListener('touchstart', onTouchStart as EventListener);
    effect.domElement.addEventListener('touchmove', onTouchMove as EventListener);
    effect.domElement.addEventListener('touchend', onTouchEnd as EventListener);

    // Give the cube an initial tilt for better visual interest
    cube.rotation.x = 0.5;
    cube.rotation.y = 0.5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Auto-rotate cube when not being dragged
      if (!isInteractingRef.current) {
        cube.rotation.x += autoRotationRef.current.x;
        cube.rotation.y += autoRotationRef.current.y;
      }

      effect.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      effect.setSize(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Cleanup
    return () => {
      clearTimeout(tooltipTimer);

      if (mountRef.current && effect.domElement) {
        mountRef.current.removeChild(effect.domElement);
      }

      // Remove event listeners
      effect.domElement.removeEventListener('mousedown', onMouseDown as EventListener);
      effect.domElement.removeEventListener('mousemove', onMouseMove as EventListener);
      effect.domElement.removeEventListener('mouseup', onMouseUp);
      effect.domElement.removeEventListener('mouseleave', onMouseUp);
      effect.domElement.removeEventListener('wheel', onMouseWheel as EventListener);
      effect.domElement.removeEventListener('touchstart', onTouchStart as EventListener);
      effect.domElement.removeEventListener('touchmove', onTouchMove as EventListener);
      effect.domElement.removeEventListener('touchend', onTouchEnd as EventListener);

      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div id="canvas" ref={mountRef} className="flex justify-center h-screen items-center">
      {showTooltip && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 p-3 rounded-md border border-gray-700 font-mono text-white text-sm z-20 transition-opacity duration-300">
          <div className="flex flex-col items-center">
            <p className="mb-1">psst...</p>
            <p className="mb-1">🖱️ Click and drag to rotate</p>
            <p>🔍 Or zoom in/out</p>
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
    let camera: THREE.PerspectiveCamera, controls: TrackballControls, scene: THREE.Scene, renderer: WebGLRenderer, effect: AsciiEffect;
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

    controls = new TrackballControls(camera, effect.domElement);

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
