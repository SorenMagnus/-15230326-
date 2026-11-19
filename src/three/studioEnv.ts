import * as THREE from 'three';

export type AerospaceEnvPreset = 'hangar' | 'golden_hour';

/**
 * Generates a high-contrast procedural aerospace studio or golden-hour aerial HDRI environment map
 * via PMREMGenerator. Unlike generic white-box RoomEnvironment, this paints crisp elongated overhead
 * linear softbox reflection ribbons (for hangar mode) or warm California golden-hour horizon +
 * deep sapphire coastal water bounce (for city flight mode) onto clearcoat composites & canopy glass.
 */
export function createAerospaceStudioEnv(
  renderer: THREE.WebGLRenderer,
  preset: AerospaceEnvPreset
): THREE.Texture {
  const envScene = new THREE.Scene();
  const disposables: { dispose: () => void }[] = [];

  if (preset === 'hangar') {
    envScene.background = new THREE.Color(0x060a12);

    // Architectural dark hangar shell with subtle cool twilight glass-door bounce
    const shellGeo = new THREE.SphereGeometry(24, 24, 16);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x0b1220,
      side: THREE.BackSide,
    });
    envScene.add(new THREE.Mesh(shellGeo, shellMat));
    disposables.push(shellGeo, shellMat);

    // 4 elongated crisp overhead architectural LED light strips (matches cinema_hangar_studio ceiling)
    const stripGeo = new THREE.PlaneGeometry(18, 0.72);
    const stripMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(2.4, 2.35, 2.25),
      side: THREE.DoubleSide,
    });
    disposables.push(stripGeo, stripMat);

    [-6.2, -2.1, 2.1, 6.2].forEach((zOff) => {
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(0, 9.5, zOff);
      strip.rotation.x = Math.PI / 2;
      envScene.add(strip);
    });

    // Cool twilight hangar glass door horizon reflection strip behind aircraft
    const doorGeo = new THREE.PlaneGeometry(24, 5.5);
    const doorMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.32, 0.56, 0.92),
      side: THREE.DoubleSide,
    });
    const doorPanel = new THREE.Mesh(doorGeo, doorMat);
    doorPanel.position.set(0, 2.4, -14);
    envScene.add(doorPanel);
    disposables.push(doorGeo, doorMat);

    // Warm architectural side key softbox card (gives sculpted metallic gradient on composite hull)
    const sideKeyGeo = new THREE.PlaneGeometry(12, 4.5);
    const sideKeyMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(1.45, 1.32, 1.15),
      side: THREE.DoubleSide,
    });
    const sideKey = new THREE.Mesh(sideKeyGeo, sideKeyMat);
    sideKey.position.set(12, 4.5, 6);
    sideKey.lookAt(0, 0, 0);
    envScene.add(sideKey);
    disposables.push(sideKeyGeo, sideKeyMat);

    // Cool rim reflection card on opposite flank
    const rimGeo = new THREE.PlaneGeometry(10, 3.8);
    const rimMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.48, 0.78, 1.18),
      side: THREE.DoubleSide,
    });
    const rimPanel = new THREE.Mesh(rimGeo, rimMat);
    rimPanel.position.set(-12, 3.2, -5);
    rimPanel.lookAt(0, 0, 0);
    envScene.add(rimPanel);
    disposables.push(rimGeo, rimMat);
  } else {
    // Golden-Hour Coastal Aerial HDRI: matches the California coastal aerial plates optically
    const skyGeo = new THREE.SphereGeometry(28, 32, 20);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          // Deep bay ocean reflection below horizon -> warm golden apricot horizon -> coastal blue zenith
          vec3 oceanCol = vec3(0.08, 0.14, 0.22);
          vec3 horizonWarm = vec3(1.28, 0.76, 0.42);
          vec3 midSky = vec3(0.62, 0.54, 0.56);
          vec3 zenithBlue = vec3(0.16, 0.30, 0.52);

          vec3 col = h < 0.0
            ? mix(horizonWarm * 0.65, oceanCol, smoothstep(0.0, -0.35, h))
            : mix(horizonWarm, midSky, smoothstep(0.0, 0.22, h));
          if (h > 0.15) {
            col = mix(col, zenithBlue, smoothstep(0.15, 0.85, h));
          }

          // Bright directional sunset solar specular core (right-rear upper horizon)
          vec3 sunDir = normalize(vec3(0.55, 0.22, -0.80));
          float sunDot = max(0.0, dot(d, sunDir));
          col += vec3(2.8, 1.9, 1.05) * pow(sunDot, 24.0);
          col += vec3(4.5, 3.6, 2.4) * smoothstep(0.985, 0.999, sunDot);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    envScene.add(new THREE.Mesh(skyGeo, skyMat));
    disposables.push(skyGeo, skyMat);
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(envScene, 0.035);
  pmrem.dispose();
  disposables.forEach((d) => d.dispose());

  return envTarget.texture;
}
