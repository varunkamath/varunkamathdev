'use client'
import React, { useEffect, useRef } from "react";
import Head from 'next/head';
import Typewriter from 'typewriter-effect';
import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { WebGLRenderer } from "three/src/Three.js";

function CubeComponent() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.y = 15;
    camera.position.z = 100;
    camera.rotation.z = 4;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);

    let effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.domElement.style.color = 'white';
    effect.domElement.style.backgroundColor = 'black';

    let controls = new TrackballControls(camera, effect.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const material = new THREE.MeshPhongMaterial({ flatShading: true })
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);
    let cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshPhongMaterial({ flatShading: true }));
    scene.add(cube);

    const pointLight1 = new THREE.PointLight(0xffffff, 3, 0, 0);
    pointLight1.position.set(500, 500, 500);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 0, 0);
    pointLight2.position.set(- 500, - 500, - 500);
    scene.add(pointLight2);

    camera.position.z = 5;

    const animate = function () {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      // renderer.render(scene, camera);
      controls.update();
      effect.render(scene, camera);
    };

    // renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(effect.domElement);
    }

    animate();

    // Clean up on unmount
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(effect.domElement);
      }
    };
  }, []);

  return (<div id="canvas" ref={mountRef} className="flex justify-center h-screen items-center">
    <div className="p-4 absolute items-center justify-center font-mono text-md backdrop-blur-lg text-white">
      <Typewriter
        options={{
          cursor: "_",
          delay: 75,
        }}
        onInit={(typewriter) => {
          typewriter.pauseFor(500).typeString('Hi, I\'m <a href="https://varunkamath.dev" class="underline">Varun</a>.<br /><br />').pauseFor(2000).typeString('<a href="https://github.com/varunkamath" class="underline">github.com/varunkamath</a><br /><br /><a href="https://linkedin.com/in/varun-kamath" class="underline">linkedin.com/in/varun-kamath</a><br /><br /> <a href="mailto:varun.kamath@gmail.com" class="underline">email me</a> if you must... ')
            .callFunction(() => {
              console.log('String typed out!');
            })
            .start();
        }}
      />
    </div>
  </div>);
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

    // Plane

    plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0xe0e0e0 }));
    plane.position.y = - 200;
    plane.rotation.x = - Math.PI / 2;
    plane.rotation.z = Math.PI / 3;
    scene.add(plane);

    renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);

    effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
    effect.setSize(window.innerWidth, window.innerHeight);
    // effect.setSize(400, 400);
    effect.domElement.style.color = 'white';
    effect.domElement.style.backgroundColor = 'black';

    // Special case: append effect.domElement, instead of renderer.domElement.
    // AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.

    // document.body.appendChild(effect.domElement);

    // controls = new TrackballControls(camera, effect.domElement);

    // Add Typewriter with text in the center of the effect.domElement

    //

    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      effect.setSize(window.innerWidth, window.innerHeight);

    }
    //

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
    // Clean up on unmount
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
