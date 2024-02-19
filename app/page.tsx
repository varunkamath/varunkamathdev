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

  return (<div id="canvas" ref={mountRef} className="w-1/2 p-4 border">
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      <Typewriter
        options={{
          cursor: "_",
          delay: 100,
        }}
        onInit={(typewriter) => {
          typewriter.pauseFor(2000).typeString('👋, I\'m <a href="https://varunkamath.dev" class="underline">Varun</a>.<br /><br /><a href="https://github.com/varunkamath" class="underline">github.com/varunkamath</a><br /><br /><a href="https://linkedin.com/in/varun-kamath" class="underline">linkedin.com/in/varun-kamath</a><br /><br />')
            .callFunction(() => {
              console.log('String typed out!');
            })
            .start();
        }}
      />
    </div>
  </div>);
}

export function AsciiBall() {
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

// export function CubeComponent;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 border">
      {/* <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex"> */}
      {/* <CubeComponent /> */}
      {/* <Typewriter
          options={{
            cursor: " ",
            delay: 10,
          }}
          onInit={(typewriter) => {
            typewriter.typeString('&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp___&nbsp&nbsp&nbsp<br />&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp.\'/&nbsp&nbsp&nbsp\\&nbsp&nbsp<br />&nbsp&nbsp&nbsp.&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp.--.&nbsp/&nbsp/&nbsp&nbsp&nbsp&nbsp\\&nbsp<br />&nbsp.\'|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp|__||&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp|&nbsp<br /><&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp.--.|&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp|&nbsp<br />&nbsp|&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp||/&nbsp.&nbsp&nbsp&nbsp.\'&nbsp<br />&nbsp|&nbsp|&nbsp.\'\'\'-.&nbsp|&nbsp&nbsp|&nbsp&nbsp.|&nbsp&nbsp&nbsp|&nbsp&nbsp<br />&nbsp|&nbsp|/.\'\'\'.&nbsp\\|&nbsp&nbsp|&nbsp&nbsp||___|&nbsp&nbsp<br />&nbsp|&nbsp&nbsp/&nbsp&nbsp&nbsp&nbsp|&nbsp||&nbsp&nbsp|&nbsp&nbsp|/___/&nbsp&nbsp<br />&nbsp|&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp|&nbsp||__|&nbsp&nbsp.\'.--.&nbsp&nbsp<br />&nbsp|&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp|&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp|&nbsp|&nbsp&nbsp&nbsp&nbsp|&nbsp<br />&nbsp|&nbsp\'.&nbsp&nbsp&nbsp&nbsp|&nbsp\'\.&nbsp&nbsp&nbsp&nbsp\\_\\&nbsp&nbsp&nbsp&nbsp/&nbsp<br />&nbsp\'---\'&nbsp&nbsp&nbsp\'---\'&nbsp&nbsp&nbsp&nbsp&nbsp\'\'--\'&nbsp&nbsp').callFunction(() => {
              console.log('String typed out!');
            })
              .start();
          }}
        /> */}
      {/* <AsciiBall /> */}
      <CubeComponent />
      {/* </div> */}
      {/* <div className="relative before:absolute max-w-5xl w-full max-h-1xl items-center font-mono text-md md:flex mb-28"> */}
      {/* <div className="z-100 smax-w-5xl w-full max-h-1xl items-center font-mono text-md md:flex mb-28">
        <Head>
          <title>Varun Kamath</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        {/* <Typewriter
          options={{
            cursor: "_",
            delay: 100,
          }}
          onInit={(typewriter) => {
            typewriter.pauseFor(2000).typeString('👋, I\'m <a href="https://varunkamath.dev" class="underline">Varun</a>.<br /><br /><a href="https://github.com/varunkamath" class="underline">github.com/varunkamath</a><br /><br /><a href="https://linkedin.com/in/varun-kamath" class="underline">linkedin.com/in/varun-kamath</a><br /><br />')
              .callFunction(() => {
                console.log('String typed out!');
              })
              .start();
          }}
        /> */}
      {/* </div> */}
      {/* <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div> */}
    </main>
  );
}
