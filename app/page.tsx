'use client'
import React, { useEffect, useRef, useState } from "react";
import Typewriter from 'typewriter-effect';
import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WebGLRenderer } from "three/src/Three.js";
import * as emoji from 'node-emoji'

// Library of shape creation functions
const shapeLibrary = [
  // Cube
  () => {
    const geometry = new THREE.BoxGeometry(7, 7, 7);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  },

  // Removing sphere and adding Triple Torus Knot (complex pretzel)
  () => {
    const geometry = new THREE.TorusKnotGeometry(6, 0.7, 128, 16, 3, 7);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  },

  // Torus (donut)
  () => {
    const geometry = new THREE.TorusGeometry(6, 1.0, 20, 100);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  },

  // Torus Knot (pretzel-like)
  () => {
    const geometry = new THREE.TorusKnotGeometry(6, 0.8, 96, 16, 2, 3);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  },

  // Replacing Icosahedron with Möbius Strip
  () => {
    // Create a Möbius strip using custom geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    const radius = 6;
    const height = 1.5;
    const radialSegments = 128;
    const tubularSegments = 16;

    // Create vertices
    for (let i = 0; i <= radialSegments; i++) {
      const u = i / radialSegments * Math.PI * 2;
      for (let j = 0; j <= tubularSegments; j++) {
        const v = j / tubularSegments * 2 - 1;

        const x = (radius + height * v * Math.cos(u / 2)) * Math.cos(u);
        const y = (radius + height * v * Math.cos(u / 2)) * Math.sin(u);
        const z = height * v * Math.sin(u / 2);

        vertices.push(x, y, z);
      }
    }

    // Create faces
    for (let i = 0; i < radialSegments; i++) {
      for (let j = 0; j < tubularSegments; j++) {
        const a = (tubularSegments + 1) * i + j;
        const b = (tubularSegments + 1) * i + j + 1;
        const c = (tubularSegments + 1) * (i + 1) + j + 1;
        const d = (tubularSegments + 1) * (i + 1) + j;

        // First triangle
        indices.push(a, b, d);
        // Second triangle
        indices.push(b, c, d);
      }
    }

    // Set attributes
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      side: THREE.DoubleSide,
      emissive: 0x111111
    });

    return new THREE.Mesh(geometry, material);
  },

  // Replacing Octahedron with Helicoid Spiral
  () => {
    // Create a helicoid spiral using custom geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    const radius = 6;
    const height = 6;
    const turns = 2.5;
    const radialSegments = 128;
    const heightSegments = 32;

    // Create vertices for a helicoid
    for (let i = 0; i <= heightSegments; i++) {
      const v = i / heightSegments;
      const z = height * (v - 0.5);

      for (let j = 0; j <= radialSegments; j++) {
        const u = j / radialSegments;
        const angle = u * Math.PI * 2 * turns + v * Math.PI * 2 * turns;

        const x = radius * u * Math.cos(angle);
        const y = radius * u * Math.sin(angle);

        vertices.push(x, y, z);
      }
    }

    // Create faces
    for (let i = 0; i < heightSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = (radialSegments + 1) * i + j;
        const b = (radialSegments + 1) * i + j + 1;
        const c = (radialSegments + 1) * (i + 1) + j + 1;
        const d = (radialSegments + 1) * (i + 1) + j;

        // First triangle
        indices.push(a, b, d);
        // Second triangle
        indices.push(b, c, d);
      }
    }

    // Set attributes
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      side: THREE.DoubleSide,
      emissive: 0x111111
    });

    return new THREE.Mesh(geometry, material);
  },

  // Replacing Dodecahedron with a Klein Bottle
  () => {
    // Create a Klein bottle using custom geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    const scale = 0.4; // Reduced from 1.5 to create a smaller Klein bottle
    const uSegments = 64;
    const vSegments = 32;

    // Klein bottle parametric equation
    const kleinBottle = (u: number, v: number): [number, number, number] => {
      u = u * Math.PI * 2;
      v = v * Math.PI * 2;

      // Klein bottle parametric equations - adjusted coefficients for better proportions
      let r = 4 * (1 - Math.cos(u) / 2);

      let x, y, z;

      if (u < Math.PI) {
        x = scale * 6 * Math.cos(u) * (1 + Math.sin(u)) + scale * r * Math.cos(u) * Math.cos(v);
        y = scale * 10 * Math.sin(u) + scale * r * Math.sin(u) * Math.cos(v); // Reduced from 16 to 10
      } else {
        x = scale * 6 * Math.cos(u) * (1 + Math.sin(u)) + scale * r * Math.cos(v + Math.PI);
        y = scale * 10 * Math.sin(u); // Reduced from 16 to 10
      }

      z = scale * r * Math.sin(v);

      return [x, y, z];
    };

    // Create vertices
    for (let i = 0; i <= uSegments; i++) {
      const u = i / uSegments;
      for (let j = 0; j <= vSegments; j++) {
        const v = j / vSegments;
        const [x, y, z] = kleinBottle(u, v);
        vertices.push(x, y, z);
      }
    }

    // Create faces
    for (let i = 0; i < uSegments; i++) {
      for (let j = 0; j < vSegments; j++) {
        const a = (vSegments + 1) * i + j;
        const b = (vSegments + 1) * i + j + 1;
        const c = (vSegments + 1) * (i + 1) + j + 1;
        const d = (vSegments + 1) * (i + 1) + j;

        // First triangle
        indices.push(a, b, d);
        // Second triangle
        indices.push(b, c, d);
      }
    }

    // Set attributes
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      side: THREE.DoubleSide,
      emissive: 0x111111
    });

    return new THREE.Mesh(geometry, material);
  },

  // Replacing Tetrahedron with Cinquefoil Knot (5,2)
  () => {
    const geometry = new THREE.TorusKnotGeometry(6, 0.65, 128, 16, 5, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  },

  // Trefoil Knot (4,3)
  () => {
    const geometry = new THREE.TorusKnotGeometry(6, 0.7, 96, 16, 4, 3);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  },

  // Cone
  () => {
    const geometry = new THREE.ConeGeometry(5, 10, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  },

  // Cylinder
  () => {
    const geometry = new THREE.CylinderGeometry(4, 4, 10, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  },

  // Spiral Torus (special torus knot 5,7)
  () => {
    const geometry = new THREE.TorusKnotGeometry(6, 0.6, 128, 32, 5, 7);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      wireframe: false,
      emissive: 0x111111
    });
    return new THREE.Mesh(geometry, material);
  }
];

function ShapeComponent() {
  const mountRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [currentShapeName, setCurrentShapeName] = useState<string>("shape");
  const [isPersonalInfoMinimized, setIsPersonalInfoMinimized] = useState(false);

  // Apply styles to prevent scrolling on body when component mounts
  useEffect(() => {
    // Set overflow hidden on body to prevent scrolling
    document.body.style.overflow = 'hidden';

    // Restore original styles on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Function to change the current shape
  const changeShape = () => {
    if (!sceneRef.current || !shapeRef.current) return;

    // Remove the current shape from the scene
    sceneRef.current.remove(shapeRef.current);

    // Names of all shapes in our library
    const shapeNames = [
      "cube", "triple torus knot", "torus", "torus knot", "möbius strip",
      "helicoid spiral", "klein bottle", "cinquefoil knot", "trefoil knot", "cone", "cylinder", "spiral torus"
    ];

    // Get a random shape index that's different from the current one
    let currentIndex = shapeNames.indexOf(currentShapeName);
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * shapeLibrary.length);
    } while (newIndex === currentIndex && shapeLibrary.length > 1);

    // Create the new shape
    const newShape = shapeLibrary[newIndex]();

    // Apply initial rotation for visual interest
    newShape.rotation.x = 0.5;
    newShape.rotation.y = 0.5;

    // Add the new shape to the scene
    sceneRef.current.add(newShape);

    // Update the shape reference
    shapeRef.current = newShape;

    // Update the shape name
    setCurrentShapeName(shapeNames[newIndex]);
  };

  useEffect(() => {
    // Hide tooltip after 7 seconds or after user interaction
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 7000);

    // Get a random shape from our library
    const randomShapeIndex = Math.floor(Math.random() * shapeLibrary.length);
    const shapeNames = [
      "cube", "triple torus knot", "torus", "torus knot", "möbius strip",
      "helicoid spiral", "klein bottle", "cinquefoil knot", "trefoil knot", "cone", "cylinder", "spiral torus"
    ];
    setCurrentShapeName(shapeNames[randomShapeIndex]);

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
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

    // Create a random shape from our library
    const shape = shapeLibrary[randomShapeIndex]();
    shapeRef.current = shape;
    scene.add(shape);

    // Add lights with better positioning to show shape edges clearly
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
    controls.maxDistance = 40; // Increased max zoom distance from 25 to 40
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Custom interaction handling to hide tooltip when user interacts
    effect.domElement.addEventListener('pointerdown', () => {
      setShowTooltip(false);
    });

    // Give the shape an initial tilt for better visual interest
    shape.rotation.x = 0.5;
    shape.rotation.y = 0.5;

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
            <p className="mb-1">👆 Touch and drag to rotate the {currentShapeName}</p>
            <p>👌 Pinch to zoom in/out</p>
          </div>
        </div>
      )}

      {/* Permanent shape indicator in bottom right - now clickable */}
      <div
        className="absolute bottom-4 right-4 bg-black bg-opacity-80 p-2 rounded-md border border-gray-700 font-mono text-white text-sm z-20 cursor-pointer hover:bg-opacity-100 hover:border-white transition-all duration-300"
        onClick={changeShape}
        title="Click to change shape"
      >
        <div className="flex items-center">
          <span className="mr-2">✧</span>
          <span className="capitalize">{currentShapeName}</span>
          <span className="ml-2">✧</span>
        </div>
      </div>

      {/* Personal info section with minimize/expand functionality */}
      <div className={`absolute transition-all duration-300 ${isPersonalInfoMinimized
        ? 'hidden md:block md:left-4 md:bottom-4 md:transform md:scale-90 md:opacity-80 md:hover:opacity-100'
        : 'left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'
        }`}>

        {/* Terminal wrapper - contains both the terminal box and the label */}
        <div className="relative">
          {/* The terminal box */}
          <div className="p-4 pt-5 font-mono text-xs md:text-sm backdrop-blur-md md:invert text-white z-10 relative border border-gray-700 rounded-md bg-black bg-opacity-80 w-[350px] md:w-[420px] h-[280px] md:h-[320px] overflow-y-auto">
            {/* Minimize/expand button */}
            <button
              className="absolute top-2 right-2 bg-black bg-opacity-70 hover:bg-opacity-100 rounded-full w-6 h-6 flex items-center justify-center text-white transition-colors duration-200 z-20"
              onClick={() => setIsPersonalInfoMinimized(!isPersonalInfoMinimized)}
              title={isPersonalInfoMinimized ? "Expand info" : "Minimize info"}
            >
              {isPersonalInfoMinimized ? "+" : "–"}
            </button>

            <div className="mt-0">
              <Typewriter
                options={{
                  cursor: "_",
                  delay: 50,
                  deleteSpeed: 1,
                }}
                onInit={(typewriter) => {
                  typewriter.pauseFor(500)
                    // First command - whoami
                    .pasteString('<span class="text-green-400">varun@home:~$</span> ', null)
                    .typeString('whoami')
                    .pauseFor(600)
                    .typeString('<br/>')
                    .pasteString('<a href="https://varunkamath.dev" class="underline text-cyan-400">varun</a><br/>', null)
                    .pasteString('<span class="text-green-400">varun@home:~$</span> ', null)
                    .pauseFor(800)

                    // Second command - GitHub
                    .typeString('ls -l projects')
                    .pauseFor(600)
                    .typeString('<br/>')
                    .pasteString('<a href="https://github.com/varunkamath" class="underline text-cyan-400">github.com/varunkamath</a><br/>', null)
                    .pasteString('<span class="text-green-400">varun@home:~$</span> ', null)
                    .pauseFor(800)

                    // Third command - LinkedIn
                    .typeString('cat contact.txt')
                    .pauseFor(600)
                    .typeString('<br/>')
                    .pasteString('<a href="https://linkedin.com/in/varun-kamath" class="underline text-cyan-400">linkedin.com/in/varun-kamath</a><br/>', null)
                    .pasteString('<span class="text-green-400">varun@home:~$</span> ', null)
                    .pauseFor(800)

                    // Fourth command - Need to get in touch
                    .typeString('echo "Need to get in touch?"')
                    .pauseFor(600)
                    .typeString('<br/>')
                    .pasteString('Need to get in touch?<br/>', null)
                    .pasteString('<span class="text-green-400">varun@home:~$</span> ', null)
                    .pauseFor(800)

                    // Fifth command - Email
                    .typeString('mail -s "Hello" varun.kamath@gmail.com')
                    .pauseFor(600)
                    .typeString('<br/>')
                    .pasteString('<a href="mailto:varun.kamath@gmail.com" class="underline text-cyan-400">Message sent!</a><br/>', null)
                    .pasteString('<span class="text-green-400">varun@home:~$</span> ', null)
                    .callFunction(() => {
                      console.log('Shell typing completed!');
                    })
                    .start();
                }}
              />
            </div>
          </div>

          {/* Show minimized state indicator - now positioned in the wrapper */}
          {isPersonalInfoMinimized && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 px-3 py-1 text-xs text-white rounded-md border border-gray-700 z-50 shadow-md md:block hidden">
              Terminal
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only floating button to restore terminal when minimized */}
      {isPersonalInfoMinimized && (
        <button
          onClick={() => setIsPersonalInfoMinimized(false)}
          className="md:hidden fixed bottom-4 left-4 bg-black bg-opacity-80 p-2 rounded-md border border-gray-700 font-mono text-white text-sm z-50 cursor-pointer hover:bg-opacity-100 hover:border-white transition-all duration-300 flex items-center justify-center"
          aria-label="Open Terminal"
        >
          <span className="mr-2">✧</span>
          <span>Terminal</span>
          <span className="ml-2">✧</span>
        </button>
      )}
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
      <ShapeComponent />
    </main>
  );
}
