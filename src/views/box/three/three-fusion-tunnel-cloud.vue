<template>
  <div class="three-container" ref="containerRef">
    <!-- 分组选中 -->
    <div class="group-selector">
      <RadioGroup v-model:value="selectedGroup" button-style="solid" @change="onGroupChange">
        <RadioButton value="全部">全部</RadioButton>
        <RadioButton value="分组一">分组一</RadioButton>
        <RadioButton value="分组二">分组二</RadioButton>
        <RadioButton value="分组三">分组三</RadioButton>
      </RadioGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { RadioButton, RadioGroup } from 'ant-design-vue';
  // 引用
  const containerRef = ref<HTMLDivElement | null>(null);
  const selectedGroup = ref<string>('全部');

  // 定义Three.js对象
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let mesh: THREE.Mesh;
  let points: THREE.Points;

  // 生成曲面几何体 (新版用 BufferGeometry 替代 ParametricGeometry)
  const createSurfaceGeometry = () => {
    const slices = 100;
    const stacks = 100;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= slices; i++) {
      const u = i / slices;
      for (let j = 0; j <= stacks; j++) {
        const v = j / stacks;

        // 根据u,v计算位置
        const x = Math.sin(u * Math.PI * 2) * 5;
        const y = Math.cos(u * Math.PI * 2) * 5;
        const z = v * 10 - 5;

        positions.push(x, y, z);

        // 生成伪彩色 (z方向归一化)
        const normalized = (z + 5) / 10;
        const color = new THREE.Color();
        color.setHSL((1 - normalized) * 0.7, 1.0, 0.5);
        colors.push(color.r, color.g, color.b);
      }
    }

    // 生成三角面索引
    for (let i = 0; i < slices; i++) {
      for (let j = 0; j < stacks; j++) {
        const a = i * (stacks + 1) + j;
        const b = (i + 1) * (stacks + 1) + j;
        const c = (i + 1) * (stacks + 1) + (j + 1);
        const d = i * (stacks + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals(); // 计算法向量，保证光照效果

    return geometry;
  };

  const createScene = () => {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 20, 20);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.localClippingEnabled = true;
    containerRef.value?.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 坐标轴
    scene.add(new THREE.AxesHelper(10));

    // 曲面 mesh
    const geometry = createSurfaceGeometry();
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 0, -1), 2)],
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 点云
    const pointGeometry = new THREE.BufferGeometry();
    const pointCount = 500;
    const positions = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pointMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x00ffff,
    });
    points = new THREE.Points(pointGeometry, pointMaterial);
    // scene.add(points);
  };

  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  const onGroupChange = () => {
    console.log('当前分组选择：', selectedGroup.value);
    // 后续可以根据分组控制 mesh 和 points 的可见性
  };

  onMounted(() => {
    createScene();
    animate();
    window.addEventListener('resize', onWindowResize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
  });

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
</script>

<style scoped>
  .three-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .group-selector {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 10px;
    border-radius: 8px;
    background: rgb(255 255 255 / 85%);
    box-shadow: 0 0 10px rgb(0 0 0 / 20%);
  }
</style>
