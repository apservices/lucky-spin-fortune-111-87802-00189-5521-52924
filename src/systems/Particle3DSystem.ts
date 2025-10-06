/**
 * Premium 3D Particle System with Three.js
 * Instanced meshes for high performance
 */

import * as THREE from 'three';

type ParticleType3D = 'coin' | 'sparkle' | 'star' | 'petal' | 'burst';

interface Particle3D {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
  color: THREE.Color;
  type: ParticleType3D;
  active: boolean;
}

export class Particle3DSystem {
  private scene: THREE.Scene;
  private particles: Particle3D[] = [];
  private particlePool: Particle3D[] = [];
  private instancedMeshes: Map<ParticleType3D, THREE.InstancedMesh> = new Map();
  private dummy = new THREE.Object3D();
  private maxParticles = 500;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeInstancedMeshes();
    this.initializePool();
  }

  private initializeInstancedMeshes() {
    const geometries = {
      coin: new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16),
      sparkle: new THREE.OctahedronGeometry(0.1),
      star: new THREE.BufferGeometry().setFromPoints(this.createStarShape()),
      petal: new THREE.PlaneGeometry(0.2, 0.3),
      burst: new THREE.SphereGeometry(0.15, 8, 8)
    };

    const materials = {
      coin: new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xFFD700,
        emissiveIntensity: 0.5
      }),
      sparkle: new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
      star: new THREE.MeshBasicMaterial({ color: 0xFFD700, side: THREE.DoubleSide }),
      petal: new THREE.MeshBasicMaterial({
        color: 0xFFB6C1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      }),
      burst: new THREE.MeshBasicMaterial({ color: 0xFF6B47, transparent: true })
    };

    Object.entries(geometries).forEach(([type, geometry]) => {
      const material = materials[type as ParticleType3D];
      const mesh = new THREE.InstancedMesh(geometry, material, this.maxParticles);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.count = 0; // Start with 0 visible
      this.scene.add(mesh);
      this.instancedMeshes.set(type as ParticleType3D, mesh);
    });
  }

  private createStarShape(): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const spikes = 5;
    const outerRadius = 0.2;
    const innerRadius = 0.08;

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ));
    }
    points.push(points[0]); // Close the shape
    return points;
  }

  private initializePool() {
    for (let i = 0; i < 100; i++) {
      this.particlePool.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 1,
        maxLife: 60,
        size: 1,
        rotation: new THREE.Euler(),
        rotationSpeed: new THREE.Vector3(),
        color: new THREE.Color(),
        type: 'coin',
        active: false
      });
    }
  }

  private getParticle(): Particle3D | null {
    return this.particlePool.pop() || null;
  }

  private releaseParticle(particle: Particle3D) {
    particle.active = false;
    this.particlePool.push(particle);
  }

  emitCoinExplosion(position: THREE.Vector3, count: number = 20) {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) continue;

      const angle = (Math.PI * 2 * i) / count;
      const speed = 3 + Math.random() * 3;

      particle.active = true;
      particle.position.copy(position);
      particle.velocity.set(
        Math.cos(angle) * speed,
        2 + Math.random() * 3,
        Math.sin(angle) * speed
      );
      particle.life = 1;
      particle.maxLife = 90 + Math.random() * 60;
      particle.size = 0.15 + Math.random() * 0.1;
      particle.rotation.set(0, 0, Math.random() * Math.PI * 2);
      particle.rotationSpeed.set(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.2
      );
      particle.color.setHex(0xFFD700);
      particle.type = 'coin';

      this.particles.push(particle);
    }
  }

  emitWinEffect(position: THREE.Vector3, count: number = 30) {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) continue;

      const spiralAngle = (i / count) * Math.PI * 4;
      const spiralRadius = i * 0.05;

      particle.active = true;
      particle.position.set(
        position.x + Math.cos(spiralAngle) * spiralRadius,
        position.y + Math.sin(spiralAngle) * spiralRadius,
        position.z
      );
      particle.velocity.set(
        Math.cos(spiralAngle + Math.PI / 2) * 0.5,
        -1 - Math.random(),
        (Math.random() - 0.5) * 0.5
      );
      particle.life = 1;
      particle.maxLife = 120 + Math.random() * 60;
      particle.size = 0.1 + Math.random() * 0.15;
      particle.rotation.set(0, 0, 0);
      particle.rotationSpeed.set(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      particle.color.setHex(Math.random() > 0.5 ? 0xFFD700 : 0xFFFFFF);
      particle.type = Math.random() > 0.5 ? 'sparkle' : 'star';

      this.particles.push(particle);
    }
  }

  emitJackpotExplosion(position: THREE.Vector3, count: number = 50) {
    for (let i = 0; i < count; i++) {
      const particle = this.getParticle();
      if (!particle) continue;

      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6;
      const types: ParticleType3D[] = ['coin', 'star', 'sparkle', 'burst', 'petal'];

      particle.active = true;
      particle.position.copy(position);
      particle.velocity.set(
        Math.cos(angle) * speed,
        2 + Math.random() * 4,
        Math.sin(angle) * speed
      );
      particle.life = 1;
      particle.maxLife = 150 + Math.random() * 100;
      particle.size = 0.2 + Math.random() * 0.2;
      particle.rotation.set(0, 0, Math.random() * Math.PI * 2);
      particle.rotationSpeed.set(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      particle.color.setHex(Math.random() > 0.3 ? 0xFFD700 : 0xFF6B47);
      particle.type = types[Math.floor(Math.random() * types.length)];

      this.particles.push(particle);
    }
  }

  update(deltaTime: number) {
    const gravity = new THREE.Vector3(0, -9.8, 0);

    // Update particle physics
    this.particles = this.particles.filter(particle => {
      if (!particle.active) return false;

      // Physics
      particle.velocity.add(gravity.clone().multiplyScalar(deltaTime * 0.1));
      particle.velocity.multiplyScalar(0.98); // Friction
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

      // Rotation
      particle.rotation.x += particle.rotationSpeed.x;
      particle.rotation.y += particle.rotationSpeed.y;
      particle.rotation.z += particle.rotationSpeed.z;

      // Life cycle
      particle.life -= deltaTime / particle.maxLife;

      if (particle.life <= 0) {
        this.releaseParticle(particle);
        return false;
      }

      return true;
    });

    // Update instanced meshes
    this.updateInstancedMeshes();
  }

  private updateInstancedMeshes() {
    // Reset all counts
    this.instancedMeshes.forEach(mesh => {
      mesh.count = 0;
    });

    // Group particles by type
    const particlesByType = new Map<ParticleType3D, Particle3D[]>();
    this.particles.forEach(particle => {
      if (!particlesByType.has(particle.type)) {
        particlesByType.set(particle.type, []);
      }
      particlesByType.get(particle.type)!.push(particle);
    });

    // Update each instanced mesh
    particlesByType.forEach((particles, type) => {
      const mesh = this.instancedMeshes.get(type);
      if (!mesh) return;

      particles.forEach((particle, i) => {
        this.dummy.position.copy(particle.position);
        this.dummy.rotation.copy(particle.rotation);
        this.dummy.scale.setScalar(particle.size * particle.life);
        this.dummy.updateMatrix();

        mesh.setMatrixAt(i, this.dummy.matrix);
        mesh.setColorAt(i, particle.color);
      });

      mesh.count = particles.length;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  }

  dispose() {
    this.particles = [];
    this.particlePool = [];
    this.instancedMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    this.instancedMeshes.clear();
  }
}
