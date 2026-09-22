import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';

const TAU = Math.PI * 2;
const STATE = { idle: 0, listening: 1, thinking: 2, responding: 3 };
const clamp = THREE.MathUtils.clamp;

function randomGenerator(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------------------- */
/* SHADERS                                                                    */
/* -------------------------------------------------------------------------- */

const particleVertex = `
  uniform float uTime, uActivity, uEngage, uAmplitude, uDpr;
  attribute float aSeed, aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float r = length(p);

    float spin = uTime * (0.045 + 0.07 * uActivity) / (0.45 + r);
    spin += sin(uTime * 0.28 + aSeed * 40.0) * 0.05;

    mat2 rotation = mat2(
      cos(spin), -sin(spin),
      sin(spin),  cos(spin)
    );

    p.xz = rotation * p.xz;
    p += normalize(p + vec3(0.001))
      * sin(uTime * 0.65 + aSeed * 60.0) * 0.012;

    p *= 1.0 - uEngage * 0.27;
    p *= 1.0 + uAmplitude * 0.025 * sin(uTime * 3.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    gl_PointSize = clamp(
      aSize * uDpr * 5.0 / -mv.z,
      0.65,
      5.5 * uDpr
    );

    float traveling = pow(
      max(0.0, sin(aSeed * 90.0 - uTime * (0.8 + uActivity))),
      10.0
    );

    vAlpha =
      (0.18 + 0.46 * aSeed + traveling * 0.3)
      * (1.0 + uEngage * 0.7);

    vColor = aColor;
  }
`;

const particleFragment = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;

    float core = exp(-d * d * 7.0);
    gl_FragColor = vec4(vColor, core * vAlpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const filamentVertex = `
  uniform float uEngage, uTime, uAmplitude;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 p = position * (1.0 - uEngage * 0.24);
    p *=
      1.0
      + 0.008 * sin(uTime * 1.1 + position.y * 5.0)
      + uAmplitude * 0.016;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const filamentFragment = `
  uniform float uTime, uActivity, uEngage, uAmplitude;
  varying vec2 vUv;

  void main() {
    float phase = vUv.x * 8.0 - uTime * (0.14 + uActivity * 0.24);

    float stream = pow(
      0.5 + 0.5 * sin(phase * 6.283185),
      16.0
    );

    float secondary = pow(
      0.5 + 0.5 * sin(vUv.x * 37.0 + uTime * 0.31),
      8.0
    );

    vec3 color = mix(
      vec3(0.015, 0.22, 0.38),
      vec3(0.24, 0.85, 1.0),
      stream
    );

    color = mix(
      color,
      vec3(0.31, 0.19, 0.68),
      secondary * 0.12
    );

    color *=
      0.75
      + uEngage * 0.65
      + uAmplitude * 0.4;

    gl_FragColor = vec4(
      color,
      0.29 + 0.6 * stream
    );

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const heartVertex = `
  uniform float uTime, uEngage, uAmplitude;
  varying vec3 vNormal, vWorld;

  void main() {
    float wave =
      sin(position.y * 17.0 + uTime * 0.5)
      * sin(position.x * 19.0 - uTime * 0.4);

    vec3 p =
      position
      * (
        1.0
        + wave * 0.07
        - uEngage * 0.16
        + uAmplitude * 0.04
      );

    vNormal = normalize(mat3(modelMatrix) * normal);

    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;

    gl_Position =
      projectionMatrix
      * viewMatrix
      * world;
  }
`;

const heartFragment = `
  uniform float uTime, uEngage, uAmplitude;
  varying vec3 vNormal, vWorld;

  void main() {
    vec3 view = normalize(cameraPosition - vWorld);

    float fresnel =
      pow(
        1.0 - abs(dot(normalize(vNormal), view)),
        2.4
      );

    float flow =
      sin(
        vWorld.y * 23.0
        + sin(vWorld.x * 19.0 + uTime * 0.5) * 2.0
        - uTime
      );

    float folds = smoothstep(0.6, 1.0, flow);

    vec3 c = mix(
      vec3(0.004, 0.027, 0.045),
      vec3(0.035, 0.45, 0.64),
      folds * 0.45 + fresnel * 0.7
    );

    gl_FragColor = vec4(
      c * (1.0 + uEngage + uAmplitude * 0.4),
      0.88
    );

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const atmosphereFragment = `
  varying vec2 vUv;
  uniform float uStrength;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float d = dot(p, p);

    float field =
      exp(-d * 7.0) * 0.08
      + exp(-d * 28.0) * 0.08;

    float reflection =
      exp(-p.x * p.x * 20.0 - p.y * p.y * 5.0)
      * 0.035;

    gl_FragColor = vec4(
      0.035,
      0.38,
      0.51,
      (field + reflection) * uStrength
    );

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const planeVertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position =
      projectionMatrix
      * modelViewMatrix
      * vec4(position, 1.0);
  }
`;

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function makeUniforms() {
  return {
    uTime: { value: 0 },
    uActivity: { value: 0 },
    uEngage: { value: 0 },
    uAmplitude: { value: 0 },
    uDpr: { value: 1 },
  };
}

function syncUniforms(uniforms, motion, dpr = 1) {
  uniforms.uTime.value = motion.time;
  uniforms.uActivity.value = motion.activity;
  uniforms.uEngage.value = motion.engage;
  uniforms.uAmplitude.value = motion.amplitude;
  uniforms.uDpr.value = dpr;
}

function neuralPoint(t, strand, target = new THREE.Vector3()) {
  const phase = strand * 2.399963;
  const angle =
    t * TAU * (1.3 + (strand % 4) * 0.19) + phase;

  const envelope = Math.sin(Math.PI * t);

  const radius =
    (0.11 + 0.58 * Math.pow(envelope, 0.75))
    * (0.8 + 0.15 * Math.sin(angle * 2.0 + phase));

  target.set(
    Math.cos(angle) * radius,
    (t - 0.5) * 1.43,
    Math.sin(angle) * radius
  );

  target.applyAxisAngle(
    new THREE.Vector3(0, 0, 1),
    Math.sin(phase) * 0.7
  );

  target.applyAxisAngle(
    new THREE.Vector3(1, 0, 0),
    Math.cos(phase) * 0.45
  );

  return target;
}

/* -------------------------------------------------------------------------- */
/* INNER INTELLIGENCE                                                         */
/* -------------------------------------------------------------------------- */

function Intelligence({ motion, quality }) {
  const gl = useThree((s) => s.gl);
  const group = useRef();

  const uniforms = useMemo(makeUniforms, []);

  const geometry = useMemo(() => {
    const rng = randomGenerator(82191);
    const count = quality === 'high' ? 3400 : 1900;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    const p = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      neuralPoint(rng(), i % 28, p);

      p.add(
        new THREE.Vector3(
          rng() - 0.5,
          rng() - 0.5,
          rng() - 0.5
        ).multiplyScalar(0.07)
      );

      positions.set(p.toArray(), i * 3);

      const violet = rng() > 0.96;

      colors.set(
        violet
          ? [0.25, 0.15, 0.57]
          : [
              0.06 + rng() * 0.16,
              0.38 + rng() * 0.28,
              0.65 + rng() * 0.3,
            ],
        i * 3
      );

      seeds[i] = rng();
      sizes[i] = 0.55 + rng() * 1.25;
    }

    const geo = new THREE.BufferGeometry();

    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    geo.setAttribute(
      'aColor',
      new THREE.BufferAttribute(colors, 3)
    );

    geo.setAttribute(
      'aSeed',
      new THREE.BufferAttribute(seeds, 1)
    );

    geo.setAttribute(
      'aSize',
      new THREE.BufferAttribute(sizes, 1)
    );

    return geo;
  }, [quality]);

  const strands = useMemo(
    () =>
      Array.from(
        { length: quality === 'high' ? 28 : 20 },
        (_, i) => {
          const points = Array.from(
            { length: 100 },
            (_, j) => neuralPoint(j / 99, i)
          );

          return new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points),
            160,
            i % 5 === 0 ? 0.005 : 0.0024,
            5,
            false
          );
        }
      ),
    [quality]
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      strands.forEach((g) => g.dispose());
    };
  }, [geometry, strands]);

  useFrame(() => {
    syncUniforms(
      uniforms,
      motion.current,
      gl.getPixelRatio()
    );

    group.current.rotation.y =
      motion.current.time * 0.038;

    group.current.rotation.z =
      Math.sin(motion.current.time * 0.11) * 0.045;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.24, 48, 32]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={heartVertex}
          fragmentShader={heartFragment}
          transparent
          depthWrite={false}
        />
      </mesh>

      {strands.map((g, i) => (
        <mesh key={i} geometry={g} dispose={null}>
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={filamentVertex}
            fragmentShader={filamentFragment}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      <points
        geometry={geometry}
        dispose={null}
        frustumCulled={false}
      >
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={particleVertex}
          fragmentShader={particleFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* PREMIUM METALLIC SHELL                                                    */
/* -------------------------------------------------------------------------- */

function Shell({ motion }) {
  const edge = useRef();
  const sensorLight = useRef();
  const shellGroup = useRef();

  const { roughnessMap, normalMap } = useMemo(() => {
    const size = 256;
    const rng = randomGenerator(3117);

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#777f84';
    ctx.fillRect(0, 0, size, size);

    const image = ctx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
      const base = 105 + Math.sin(y * 0.18) * 10;

      for (let x = 0; x < size; x++) {
        const grain =
          Math.sin(x * 0.95 + y * 0.08) * 7 +
          Math.sin(x * 0.19 - y * 0.47) * 5 +
          (rng() - 0.5) * 12;

        const value = THREE.MathUtils.clamp(
          base + grain,
          42,
          190
        );

        const i = (y * size + x) * 4;

        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);

    // Fine circular machining lines.
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#e1edf1';
    ctx.lineWidth = 0.45;

    for (let r = 12; r < 172; r += 5) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, TAU);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    const roughnessMap = new THREE.CanvasTexture(canvas);
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(2.8, 2.8);
    roughnessMap.colorSpace = THREE.NoColorSpace;
    roughnessMap.needsUpdate = true;

    // Separate subtle normal detail derived from the same machining pattern.
    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = normalCanvas.height = size;

    const nctx = normalCanvas.getContext('2d');
    const normalImage = nctx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const wave =
          Math.sin(x * 0.75 + y * 0.04) * 7 +
          Math.sin(y * 0.17) * 4;

        const nx = THREE.MathUtils.clamp(
          128 + wave,
          90,
          166
        );

        const ny = THREE.MathUtils.clamp(
          128 + Math.sin(y * 0.75) * 5,
          92,
          164
        );

        const i = (y * size + x) * 4;

        normalImage.data[i] = nx;
        normalImage.data[i + 1] = ny;
        normalImage.data[i + 2] = 255;
        normalImage.data[i + 3] = 255;
      }
    }

    nctx.putImageData(normalImage, 0, 0);

    const normalMap = new THREE.CanvasTexture(normalCanvas);
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(2.8, 2.8);
    normalMap.colorSpace = THREE.NoColorSpace;
    normalMap.needsUpdate = true;

    return { roughnessMap, normalMap };
  }, []);

  useEffect(() => {
    return () => {
      roughnessMap.dispose();
      normalMap.dispose();
    };
  }, [roughnessMap, normalMap]);

  useFrame((_, dt) => {
    const m = motion.current;

    if (edge.current) {
      edge.current.emissiveIntensity =
        0.18 +
        m.hover * 0.28 +
        m.engage * 2.5 +
        m.amplitude * 0.32;
    }

    if (sensorLight.current) {
      sensorLight.current.emissiveIntensity =
        0.8 +
        m.activity * 0.8 +
        m.engage * 2.0;
    }

    if (shellGroup.current) {
      shellGroup.current.rotation.y +=
        dt * (0.012 + m.activity * 0.025);

      shellGroup.current.rotation.x =
        THREE.MathUtils.damp(
          shellGroup.current.rotation.x,
          -0.06 + m.hover * 0.025,
          2.2,
          dt
        );
    }
  });

  const aperture = 0.94;

  return (
    <group
      ref={shellGroup}
      rotation={[-0.1, -0.18, 0.16]}
    >
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Segmented aerospace shell */}
        {Array.from({ length: 9 }, (_, i) => (
          <mesh
            key={i}
            rotation={[0, 0, i * 0.008]}
          >
            <sphereGeometry
              args={[
                1,
                112,
                72,
                i * TAU / 9 + 0.008,
                TAU / 9 - 0.016,
                aperture,
                Math.PI - aperture,
              ]}
            />

            <meshPhysicalMaterial
              color={
                i % 4 === 0
                  ? '#263b49'
                  : '#111b24'
              }
              metalness={1}
              roughness={0.19}
              roughnessMap={roughnessMap}
              normalMap={normalMap}
              normalScale={
                new THREE.Vector2(0.22, 0.22)
              }
              clearcoat={1}
              clearcoatRoughness={0.045}
              reflectivity={1}
              envMapIntensity={2.45}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Deep black cavity */}
        <mesh>
          <sphereGeometry
            args={[
              0.972,
              112,
              72,
              0,
              TAU,
              aperture + 0.018,
              Math.PI - aperture - 0.018,
            ]}
          />

          <meshPhysicalMaterial
            color="#01070d"
            metalness={0.92}
            roughness={0.13}
            clearcoat={1}
            clearcoatRoughness={0.055}
            envMapIntensity={0.38}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Smoked glass sealing layer */}
        <mesh renderOrder={3}>
          <sphereGeometry
            args={[
              0.992,
              112,
              72,
              0,
              TAU,
              0,
              aperture - 0.026,
            ]}
          />

          <meshPhysicalMaterial
            color="#356a7e"
            metalness={0.1}
            roughness={0.025}
            transmission={0.08}
            thickness={0.28}
            transparent
            opacity={0.10}
            depthWrite={false}
            clearcoat={1}
            clearcoatRoughness={0.018}
            envMapIntensity={1.85}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>

      {/* Precision-machined aperture */}
      <mesh
        position={[0, 0, Math.cos(aperture)]}
      >
        <torusGeometry
          args={[
            Math.sin(aperture),
            0.027,
            20,
            220,
          ]}
        />

        <meshPhysicalMaterial
          color="#526b77"
          metalness={1}
          roughness={0.11}
          roughnessMap={roughnessMap}
          clearcoat={1}
          clearcoatRoughness={0.028}
          reflectivity={1}
          envMapIntensity={3.0}
        />
      </mesh>

      {/* Recessed black ring */}
      <mesh
        position={[
          0,
          0,
          Math.cos(aperture) + 0.004,
        ]}
      >
        <torusGeometry
          args={[
            Math.sin(aperture) - 0.028,
            0.011,
            12,
            220,
          ]}
        />

        <meshPhysicalMaterial
          color="#02080d"
          metalness={0.98}
          roughness={0.085}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.35}
        />
      </mesh>

      {/* Signature cyan micro-seam */}
      <mesh
        position={[
          0,
          0,
          Math.cos(aperture) + 0.012,
        ]}
      >
        <torusGeometry
          args={[
            Math.sin(aperture) - 0.045,
            0.0032,
            8,
            220,
          ]}
        />

        <meshStandardMaterial
          ref={edge}
          color="#2caed2"
          emissive="#28c8ff"
          emissiveIntensity={0.3}
          metalness={0.7}
          roughness={0.16}
        />
      </mesh>

      {/* Concentric precision grooves */}
      {[1.1, 1.42, 1.78, 2.18, 2.56].map(
        (theta, i) => (
          <mesh
            key={i}
            position={[
              0,
              0,
              Math.cos(theta) * 1.003,
            ]}
          >
            <torusGeometry
              args={[
                Math.sin(theta) * 1.003,
                i === 1 ? 0.006 : 0.0032,
                8,
                180,
              ]}
            />

            <meshPhysicalMaterial
              color={
                i === 1
                  ? '#42616d'
                  : '#0b141b'
              }
              metalness={1}
              roughness={
                i === 1 ? 0.16 : 0.25
              }
              clearcoat={0.8}
              clearcoatRoughness={0.08}
              envMapIntensity={1.8}
            />
          </mesh>
        )
      )}

      {/* Small asymmetrical sensor detail */}
      <group
        position={[0.48, -0.38, 0.75]}
        rotation={[0.45, -0.3, 0.2]}
      >
        <mesh>
          <sphereGeometry
            args={[0.052, 20, 14]}
          />

          <meshPhysicalMaterial
            color="#081018"
            metalness={1}
            roughness={0.10}
            clearcoat={1}
            clearcoatRoughness={0.025}
            envMapIntensity={2.7}
          />
        </mesh>

        <mesh position={[0, 0, 0.045]}>
          <sphereGeometry
            args={[0.018, 16, 12]}
          />

          <meshStandardMaterial
            ref={sensorLight}
            color="#80e8ff"
            emissive="#36c9ff"
            emissiveIntensity={1.2}
            roughness={0.15}
            metalness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* ORBITS                                                                      */
/* -------------------------------------------------------------------------- */

const ORBITS = [
  {
    r: 1.26,
    tilt: [0.95, 0.28, -0.36],
    speed: 0.047,
    color: '#298cba',
  },
  {
    r: 1.40,
    tilt: [-0.63, 0.84, 0.71],
    speed: -0.035,
    color: '#17668f',
  },
  {
    r: 1.54,
    tilt: [0.34, -0.91, -0.4],
    speed: 0.028,
    color: '#344573',
  },
];

function Orbit({ spec, index, motion }) {
  const pivot = useRef();
  const circle = useRef();
  const nodes = useRef([]);
  const material = useRef();
  const phase = useRef(index * 2.1);

  useFrame((_, dt) => {
    const m = motion.current;

    const speed =
      1 +
      m.hover * 0.13 +
      m.activity * 0.55 +
      m.engage * 2.8;

    phase.current +=
      Math.min(dt, 0.04)
      * spec.speed
      * speed
      * m.rate;

    pivot.current.rotation.set(
      spec.tilt[0] +
        Math.sin(m.time * 0.06 + index) * 0.07,

      spec.tilt[1] +
        Math.cos(m.time * 0.04 + index) * 0.08,

      spec.tilt[2] +
        phase.current * 0.24
    );

    const scale =
      1 + m.amplitude * 0.028 - m.engage * 0.023;

    circle.current.scale.setScalar(scale);

    material.current.opacity =
      0.38 +
      m.hover * 0.12 +
      m.amplitude * 0.14 +
      m.engage * 0.18;

    nodes.current.forEach((node, j) => {
      if (!node) return;

      const a =
        phase.current *
          (j % 2 ? 0.8 : 1.2) +
        j * TAU / 4;

      node.position.set(
        Math.cos(a) * spec.r,
        Math.sin(a) * spec.r,
        0
      );

      node.scale.setScalar(
        0.8 +
          0.2 *
            Math.sin(m.time * 0.4 + j)
      );
    });
  });

  return (
    <group ref={pivot}>
      <group ref={circle}>
        <mesh>
          <torusGeometry
            args={[
              spec.r,
              0.0017,
              5,
              220,
            ]}
          />

          <meshBasicMaterial
            ref={material}
            color={spec.color}
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>

        {[0, 1, 2, 3].map((j) => (
          <mesh
            key={j}
            ref={(el) => {
              nodes.current[j] = el;
            }}
          >
            <sphereGeometry
              args={[
                j === 0 ? 0.009 : 0.0055,
                10,
                8,
              ]}
            />

            <meshBasicMaterial
              color={
                index === 2 && j === 0
                  ? '#b78368'
                  : j === 1
                    ? '#5d729e'
                    : '#69c5df'
              }
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* INFORMATION FIELD                                                           */
/* -------------------------------------------------------------------------- */

function InformationField({ motion }) {
  const points = useRef();
  const links = useRef();

  const data = useMemo(() => {
    const rng = randomGenerator(165);
    const count = 110;

    return Array.from(
      { length: count },
      (_, i) => ({
        angle: rng() * TAU,
        radius: 1.14 + rng() * 0.61,
        z: (rng() - 0.5) * 1.8,
        speed: 0.012 + rng() * 0.019,
        size: 0.45 + rng() * 0.75,
        seed: rng(),
        orbit: i % 11 === 0,
      })
    );
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = data.length;

    g.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array(n * 3),
        3
      )
    );

    g.setAttribute(
      'aColor',
      new THREE.BufferAttribute(
        new Float32Array(
          data.flatMap((_, i) =>
            i % 19 === 0
              ? [0.32, 0.25, 0.49]
              : [0.13, 0.38, 0.49]
          )
        ),
        3
      )
    );

    g.setAttribute(
      'aSeed',
      new THREE.BufferAttribute(
        new Float32Array(
          data.map((p) => p.seed)
        ),
        1
      )
    );

    g.setAttribute(
      'aSize',
      new THREE.BufferAttribute(
        new Float32Array(
          data.map((p) => p.size)
        ),
        1
      )
    );

    return g;
  }, [data]);

  const linkGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();

    g.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array(10 * 6),
        3
      )
    );

    return g;
  }, []);

  const uniforms = useMemo(makeUniforms, []);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    return () => {
      geometry.dispose();
      linkGeometry.dispose();
    };
  }, [geometry, linkGeometry]);

  useFrame(() => {
    const m = motion.current;
    const array =
      geometry.attributes.position.array;

    let link = 0;

    data.forEach((p, i) => {
      const a =
        p.angle + m.time * p.speed;

      const attach = Math.pow(
        Math.max(
          0,
          Math.sin(
            m.time * 0.18 +
              p.seed * TAU
          )
        ),
        12
      );

      const radius =
        THREE.MathUtils.lerp(
          p.radius,
          1.4,
          p.orbit ? attach : 0
        ) * (1 - m.engage * 0.18);

      const x = Math.cos(a) * radius;
      const y =
        Math.sin(a) * radius * 0.78;
      const z =
        p.z * (1 - m.engage * 0.2);

      array.set([x, y, z], i * 3);

      if (p.orbit && link < 10) {
        const endAngle =
          a + 0.08 * attach;

        linkGeometry.attributes.position.array.set(
          [
            x,
            y,
            z,
            Math.cos(endAngle) * radius,
            Math.sin(endAngle) *
              radius *
              0.78,
            z,
          ],
          link * 6
        );

        link++;
      }
    });

    geometry.attributes.position.needsUpdate = true;
    linkGeometry.attributes.position.needsUpdate = true;

    syncUniforms(
      uniforms,
      m,
      gl.getPixelRatio()
    );

    links.current.material.opacity =
      0.08 + m.activity * 0.035;
  });

  return (
    <group>
      <points
        ref={points}
        geometry={geometry}
        dispose={null}
        frustumCulled={false}
      >
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={particleVertex}
          fragmentShader={particleFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments
        ref={links}
        geometry={linkGeometry}
        dispose={null}
        frustumCulled={false}
      >
        <lineBasicMaterial
          color="#4085a0"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* TRAVELING NEURAL PARTICLES                                                  */
/* -------------------------------------------------------------------------- */

function Travelers({ motion }) {
  const mesh = useRef();

  const dummy = useMemo(
    () => new THREE.Object3D(),
    []
  );

  const progress = useRef(0);

  useFrame((_, dt) => {
    const m = motion.current;

    progress.current +=
      Math.min(dt, 0.04) *
      (0.022 + m.activity * 0.045) *
      m.rate;

    for (let i = 0; i < 40; i++) {
      neuralPoint(
        (progress.current +
          i * 0.618034) % 1,
        i % 28,
        dummy.position
      );

      dummy.position.multiplyScalar(
        1 - m.engage * 0.24
      );

      dummy.scale.setScalar(
        0.0035 + (i % 4) * 0.0011
      );

      dummy.updateMatrix();

      mesh.current.setMatrixAt(
        i,
        dummy.matrix
      );
    }

    mesh.current.instanceMatrix.needsUpdate = true;

    mesh.current.material.opacity =
      0.3 + m.activity * 0.22;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[null, null, 40]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 6]} />

      <meshBasicMaterial
        color="#95e8f4"
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* -------------------------------------------------------------------------- */
/* REDUCED MOTION                                                             */
/* -------------------------------------------------------------------------- */

function useReducedMotion(override) {
  const [prefers, setPrefers] =
    useState(false);

  useEffect(() => {
    const media =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );

    const update = () =>
      setPrefers(media.matches);

    update();

    media.addEventListener(
      'change',
      update
    );

    return () =>
      media.removeEventListener(
        'change',
        update
      );
  }, []);

  return override === undefined
    ? prefers
    : override;
}

/* -------------------------------------------------------------------------- */
/* CORE SCENE                                                                 */
/* -------------------------------------------------------------------------- */

function CoreScene({
  state,
  amplitude,
  quality,
  reducedMotion,
  input,
  onEngage,
}) {
  const root = useRef();
  const pulse = useRef();
  const floor = useRef();

  const { camera, size } = useThree();

  const motion = useRef({
    time: 0,
    activity: 0,
    engage: 0,
    amplitude: 0,
    hover: 0,
    rate: 1,
  });

  const impulse = useRef(0);
  const lastTrigger = useRef(0);

  const groundUniforms = useMemo(
    () => ({
      uStrength: { value: 0.7 },
    }),
    []
  );

  useEffect(() => {
    const aspect =
      size.width /
      Math.max(size.height, 1);

    const halfFov =
      THREE.MathUtils.degToRad(34 / 2);

    camera.position.set(
      0,
      0.08,
      Math.max(
        7.8,
        1.82 /
          (
            Math.tan(halfFov) *
            aspect *
            0.64
          )
      )
    );

    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [
    camera,
    size.width,
    size.height,
  ]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.04);
    const m = motion.current;
    const mode = STATE[state] ?? 0;

    m.rate = reducedMotion ? 0 : 1;
    m.time += dt * m.rate;

    m.activity =
      THREE.MathUtils.damp(
        m.activity,
        mode === 2
          ? 1
          : mode === 3
            ? 0.55
            : mode === 1
              ? 0.2
              : 0,
        2.1,
        dt
      );

    const audio = clamp(
      Number.isFinite(amplitude)
        ? amplitude
        : 0,
      0,
      1
    );

    const breath =
      mode === 1
        ? 0.065 *
          (
            0.5 +
            0.5 *
              Math.sin(
                m.time * 1.3
              )
          )
        : mode === 3
          ? 0.09 *
            (
              0.5 +
              0.5 *
                Math.sin(
                  m.time * 1.7
                )
            )
          : 0;

    m.amplitude =
      THREE.MathUtils.damp(
        m.amplitude,
        mode === 1 ||
          mode === 3
          ? Math.max(audio, breath)
          : 0,
        7,
        dt
      );

    m.hover =
      THREE.MathUtils.damp(
        m.hover,
        input.current.hover ? 1 : 0,
        5,
        dt
      );

    if (
      input.current.trigger !==
      lastTrigger.current
    ) {
      impulse.current = 1;
      lastTrigger.current =
        input.current.trigger;
    }

    impulse.current = Math.max(
      0,
      impulse.current - dt * 0.85
    );

    const engageTarget =
      input.current.pressed
        ? 0.65
        : impulse.current;

    m.engage =
      THREE.MathUtils.damp(
        m.engage,
        engageTarget,
        9,
        dt
      );

    if (reducedMotion) {
      m.engage =
        Math.min(m.engage, 0.15);

      m.amplitude *= 0.2;
    }

    root.current.position.y =
      reducedMotion
    const inp = input.current;

    // Apply inertia and continuous ambient auto-rotation when not actively dragging
    if (!inp.isDragging) {
      inp.velX = (inp.velX || 0) * 0.94;
      inp.velY = (inp.velY || 0) * 0.94;
      inp.rotY = (inp.rotY || 0) + inp.velY + (reducedMotion ? 0 : 0.003 * m.rate);
      inp.rotX = (inp.rotX || 0) + inp.velX;
      inp.dispX = THREE.MathUtils.damp(inp.dispX || 0, 0, 4.0, dt);
      inp.dispY = THREE.MathUtils.damp(inp.dispY || 0, 0, 4.0, dt);
    }

    // Clamp vertical pitch tilt so Core remains aesthetically oriented
    inp.rotX = clamp(inp.rotX || 0, -1.3, 1.3);

    // Dynamic rotation: accumulated drag rotation + hover parallax tilt
    const targetRotY = inp.rotY + (reducedMotion ? 0 : inp.x * 0.08);
    const targetRotX = inp.rotX + (reducedMotion ? 0 : -inp.y * 0.06);

    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      targetRotY,
      inp.isDragging ? 22 : 6,
      dt
    );

    root.current.rotation.x = THREE.MathUtils.damp(
      root.current.rotation.x,
      targetRotX,
      inp.isDragging ? 22 : 6,
      dt
    );

    // Dynamic position: base floating sine + hover tracking + interactive drag displacement
    const floatY = reducedMotion ? 0 : Math.sin(m.time * 0.55) * 0.035;
    const targetPosX = (inp.dispX || 0) + (reducedMotion ? 0 : inp.x * 0.07);
    const targetPosY = floatY + (inp.dispY || 0) + (reducedMotion ? 0 : inp.y * 0.05);

    root.current.position.x = THREE.MathUtils.damp(
      root.current.position.x,
      targetPosX,
      inp.isDragging ? 16 : 4,
      dt
    );

    root.current.position.y = THREE.MathUtils.damp(
      root.current.position.y,
      targetPosY,
      inp.isDragging ? 16 : 4,
      dt
    );

    const breathe = reducedMotion
      ? 1
      : 1 + m.amplitude * 0.014;

    root.current.scale.setScalar(
      breathe
    );

    pulse.current.material.opacity =
      m.engage * 0.095;

    pulse.current.scale.setScalar(
      1.008 + m.engage * 0.018
    );

    groundUniforms.uStrength.value =
      0.6 +
      m.engage * 0.35 +
      m.amplitude * 0.1;
  });

  const activate = () => {};
  const release = () => {};

  return (
    <>
      <ambientLight
        intensity={0.075}
        color="#557395"
      />

      <directionalLight
        position={[-3, 4, 5]}
        intensity={2.2}
        color="#a4ddf5"
      />

      <directionalLight
        position={[3, -0.5, -2]}
        intensity={1.25}
        color="#b7794e"
      />

      <pointLight
        position={[-2, -1, 2]}
        intensity={1.1}
        color="#205cab"
        decay={2}
      />

      <pointLight
        position={[2, 2, -1]}
        intensity={1.25}
        color="#62518d"
        decay={2}
      />

      {/* Premium studio reflection setup */}
      <Environment
        resolution={256}
        frames={1}
      >
        <Lightformer
          form="rect"
          position={[-4.2, 4.8, 3.4]}
          rotation={[
            0.42,
            -0.56,
            -0.34,
          ]}
          scale={[1.1, 7.5, 1]}
          intensity={5.5}
          color="#d9f5ff"
        />

        <Lightformer
          form="rect"
          position={[4.1, 1.3, 3.8]}
          rotation={[
            0,
            0.78,
            0.18,
          ]}
          scale={[0.42, 6.2, 1]}
          intensity={3.1}
          color="#74b9dc"
        />

        <Lightformer
          form="rect"
          position={[1.9, -0.2, -4]}
          rotation={[
            0,
            Math.PI - 0.45,
            0.25,
          ]}
          scale={[1.2, 4.2, 1]}
          intensity={2.25}
          color="#c98d58"
        />

        <Lightformer
          form="rect"
          position={[-2, -3.8, 1.4]}
          rotation={[
            -0.85,
            0.12,
            0.08,
          ]}
          scale={[4.6, 0.45, 1]}
          intensity={1.15}
          color="#1f6f98"
        />
      </Environment>

      <group ref={root}>
        <Shell motion={motion} />

        <Intelligence
          motion={motion}
          quality={quality}
        />

        <Travelers motion={motion} />

        {ORBITS.map((spec, index) => (
          <Orbit
            key={index}
            spec={spec}
            index={index}
            motion={motion}
          />
        ))}

        <InformationField
          motion={motion}
        />

        {/* Soft engagement pulse */}
        <mesh ref={pulse}>
          <sphereGeometry
            args={[1, 48, 32]}
          />

          <meshBasicMaterial
            color="#47c9ed"
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.BackSide}
            blending={
              THREE.AdditiveBlending
            }
          />
        </mesh>

        {/* Invisible interaction volume */}
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            input.current.hover = true;
          }}
          onPointerOut={() => {
            input.current.hover = false;
            input.current.x = 0;
            input.current.y = 0;
          }}
          onPointerMove={(e) => {
            input.current.x = clamp(
              e.point.x,
              -1,
              1
            );

            input.current.y = clamp(
              e.point.y,
              -1,
              1
            );
          }}
          onPointerDown={activate}
          onPointerUp={release}
          onPointerCancel={release}
        >
          <sphereGeometry
            args={[1.05, 24, 16]}
          />

          <meshBasicMaterial
            transparent
            opacity={0}
            colorWrite={false}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Subtle light pool under the floating object */}
      <mesh
        ref={floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.62, 0]}
      >
        <planeGeometry
          args={[4.5, 3.1]}
        />

        <shaderMaterial
          uniforms={groundUniforms}
          vertexShader={planeVertex}
          fragmentShader={atmosphereFragment}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* PUBLIC COMPONENT                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Standalone NeoBrain AI core.
 *
 * Dependencies:
 *   react
 *   react-dom
 *   three
 *   @react-three/fiber
 *   @react-three/drei
 *
 * Props:
 *   state:
 *     idle | listening | thinking | responding
 *
 *   amplitude:
 *     normalized audio amplitude, 0..1.
 *
 *   quality:
 *     balanced | high
 *
 *   reducedMotion:
 *     optional boolean override.
 *
 *   onEngage:
 *     fires when the user presses/clicks the core.
 *
 *   onCreated:
 *     receives the R3F renderer context.
 */
export default function NeoBrainCore({
  state = 'idle',
  amplitude = 0,
  quality = 'balanced',
  reducedMotion,
  onEngage,
  onCreated,
  className,
  style,
  ariaLabel = 'NeoBrain interactive AI core',
}) {
  const reduce =
    useReducedMotion(
      reducedMotion
    );

  const input = useRef({
    hover: false,
    pressed: false,
    trigger: 0,
    x: 0,
    y: 0,
    isDragging: false,
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
    dispX: 0,
    dispY: 0,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    const release = () => {
      input.current.pressed = false;
      input.current.isDragging = false;
    };

    window.addEventListener(
      'pointerup',
      release
    );

    window.addEventListener(
      'pointercancel',
      release
    );

    window.addEventListener(
      'blur',
      release
    );

    return () => {
      window.removeEventListener(
        'pointerup',
        release
      );

      window.removeEventListener(
        'pointercancel',
        release
      );

      window.removeEventListener(
        'blur',
        release
      );
    };
  }, []);

  return (
    <div
      className={className}
      role="group"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={(e) => {
        input.current.isDragging = true;
        input.current.pressed = true;
        input.current.lastX = e.clientX;
        input.current.lastY = e.clientY;
        input.current.startX = e.clientX;
        input.current.startY = e.clientY;
        input.current.velX = 0;
        input.current.velY = 0;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        input.current.x = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        input.current.y = clamp(-(((e.clientY - rect.top) / rect.height) * 2 - 1), -1, 1);

        if (input.current.isDragging) {
          const dx = e.clientX - input.current.lastX;
          const dy = e.clientY - input.current.lastY;
          input.current.lastX = e.clientX;
          input.current.lastY = e.clientY;

          const sens = 0.0075;
          input.current.rotY += dx * sens;
          input.current.rotX += dy * sens;
          input.current.velY = dx * sens;
          input.current.velX = dy * sens;

          input.current.dispX = clamp((input.current.dispX || 0) + dx * 0.0012, -0.45, 0.45);
          input.current.dispY = clamp((input.current.dispY || 0) - dy * 0.0012, -0.35, 0.35);
        }
      }}
      onPointerUp={(e) => {
        const dist = Math.hypot(e.clientX - input.current.startX, e.clientY - input.current.startY);
        input.current.isDragging = false;
        input.current.pressed = false;
        e.currentTarget.releasePointerCapture?.(e.pointerId);

        if (dist < 8) {
          input.current.trigger++;
          onEngage?.();
        }
      }}
      onPointerCancel={(e) => {
        input.current.isDragging = false;
        input.current.pressed = false;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      }}
      onPointerEnter={() => {
        input.current.hover = true;
      }}
      onPointerLeave={() => {
        input.current.hover = false;
        if (!input.current.isDragging) {
          input.current.x = 0;
          input.current.y = 0;
        }
      }}
      onKeyDown={(e) => {
        if (
          (e.key === 'Enter' ||
            e.key === ' ') &&
          !e.repeat
        ) {
          e.preventDefault();

          input.current.trigger++;
          input.current.pressed = true;

          onEngage?.();
        }
      }}
      onKeyUp={(e) => {
        if (
          e.key === 'Enter' ||
          e.key === ' '
        ) {
          e.preventDefault();
          input.current.pressed = false;
        }
      }}
      onBlur={() => {
        input.current.pressed = false;
        input.current.isDragging = false;
      }}
      style={{
        width: '100%',
        height: 'min(78svh, 540px)',
        minHeight: 280,
        position: 'relative',
        background:
          'radial-gradient(circle at 50% 45%, #0b1b28 0%, #03070b 42%, #000 100%)',
        borderRadius: 28,
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        cursor: 'grab',
        ...style,
      }}
    >
      <Canvas
        camera={{
          fov: 34,
          near: 0.1,
          far: 100,
          position: [0, 0, 9],
        }}
        dpr={[
          1,
          quality === 'high' ? 2 : 1.5,
        ]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference:
            'high-performance',
          preserveDrawingBuffer: false,
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
          pointerEvents: 'none',
        }}
        onCreated={(context) => {
          context.gl.setClearColor(
            0x000000,
            0
          );

          context.gl.toneMapping =
            THREE.ACESFilmicToneMapping;

          context.gl.toneMappingExposure =
            1.05;

          context.gl.outputColorSpace =
            THREE.SRGBColorSpace;

          onCreated?.(context);
        }}
      >
        <CoreScene
          state={state}
          amplitude={amplitude}
          quality={quality}
          reducedMotion={reduce}
          input={input}
          onEngage={onEngage}
        />
      </Canvas>
    </div>
  );
}
