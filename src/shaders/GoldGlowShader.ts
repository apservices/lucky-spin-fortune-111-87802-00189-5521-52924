/**
 * Gold Glow Shader - Custom GLSL for premium golden effects
 * Rim lighting + Fresnel + Animated shimmer
 */

import * as THREE from 'three';

export const GoldGlowShader = {
  uniforms: {
    time: { value: 0 },
    glowColor: { value: new THREE.Color(0xFFD700) },
    rimColor: { value: new THREE.Color(0xFFEB3B) },
    glowIntensity: { value: 1.0 },
    rimPower: { value: 3.0 },
    shimmerSpeed: { value: 2.0 }
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 glowColor;
    uniform vec3 rimColor;
    uniform float glowIntensity;
    uniform float rimPower;
    uniform float shimmerSpeed;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;

    // Noise function for shimmer
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      // Fresnel effect
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), rimPower);

      // Rim lighting
      vec3 rimLight = rimColor * fresnel * glowIntensity;

      // Animated shimmer
      float shimmer = noise(vUv * 10.0 + time * shimmerSpeed);
      shimmer = smoothstep(0.4, 0.6, shimmer);

      // Combine effects
      vec3 finalColor = glowColor + rimLight + (shimmer * 0.3);
      float alpha = glowIntensity * (0.8 + fresnel * 0.2);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export class GoldGlowMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: THREE.UniformsUtils.clone(GoldGlowShader.uniforms),
      vertexShader: GoldGlowShader.vertexShader,
      fragmentShader: GoldGlowShader.fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
  }

  update(time: number) {
    this.uniforms.time.value = time;
  }
}
