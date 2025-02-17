<script setup lang="ts">
  import { onMounted, onUnmounted, ref, nextTick } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  // 绑定 Vue 组件的 DOM 容器
  const containerRef = ref<HTMLDivElement | null>(null);
  let renderer: THREE.WebGLRenderer | null = null; // 渲染器
  let scene: THREE.Scene; // 场景
  let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera; // 相机（可切换）
  let controls: OrbitControls | null = null; // 轨道控制器
  const isPerspective = ref(false); // 记录当前是否使用透视相机

  // 初始化 Three.js 场景
  const initScene = () => {
    if (!containerRef.value) return;

    const { clientWidth, clientHeight } = containerRef.value;

    scene = new THREE.Scene(); // 创建 Three.js 场景
    initCamera(clientWidth, clientHeight); // 初始化相机

    // 创建 WebGL 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.value.appendChild(renderer.domElement);

    initHelpers(); // 初始化辅助工具（坐标轴、轨道控制器）
    animate(); // 启动渲染循环
  };

  // 初始化相机，根据 isPerspective.value 选择透视或正交相机
  const initCamera = (width: number, height: number) => {
    if (isPerspective.value) {
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    } else {
      const aspect = width / height; // 计算宽高比
      const size = 3; // 控制正交相机的视野范围
      camera = new THREE.OrthographicCamera(
        -size * aspect, // left: 视锥左侧边界
        size * aspect, // right: 视锥右侧边界
        size, // top: 视锥上边界
        -size, // bottom: 视锥下边界
        0.1, // near: 近裁剪面（距离相机）
        1000, // far: 远裁剪面（距离相机）
      );
    }
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  };

  // 切换相机模式
  const switchCamera = () => {
    isPerspective.value = !isPerspective.value;
    if (!containerRef.value || !renderer) return;

    initCamera(containerRef.value.clientWidth, containerRef.value.clientHeight); // 重新初始化相机
    initHelpers(); // 重新初始化辅助工具
  };

  // 监听窗口大小变化，调整相机和渲染器尺寸
  const onWindowResize = () => {
    if (!containerRef.value || !renderer || !camera) return;

    const { clientWidth, clientHeight } = containerRef.value;

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = clientWidth / clientHeight; // 更新透视相机的宽高比
    } else {
      const aspect = clientWidth / clientHeight; // 计算当前窗口的宽高比
      const size = 3; // 视野范围
      camera.left = -size * aspect; // 更新正交相机的左侧边界
      camera.right = size * aspect; // 更新正交相机的右侧边界
      camera.top = size; // 更新正交相机的顶部边界
      camera.bottom = -size; // 更新正交相机的底部边界
    }

    camera.updateProjectionMatrix(); // 更新相机投影矩阵
    renderer.setSize(clientWidth, clientHeight); // 更新渲染器尺寸
  };

  // 初始化辅助工具（轨道控制器 + 坐标轴）
  const initHelpers = () => {
    if (!renderer) return;

    controls?.dispose(); // 释放旧的轨道控制器资源
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 先移除场景中的旧坐标轴
    scene.children = scene.children.filter((obj) => !(obj instanceof THREE.AxesHelper));
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
  };

  // 渲染循环
  const animate = () => {
    requestAnimationFrame(animate);
    controls?.update(); // 更新控制器状态
    renderer?.render(scene, camera); // 渲染场景
  };

  // Vue 组件挂载时初始化 Three.js 场景
  onMounted(() => {
    nextTick(() => {
      initScene();
      window.addEventListener('resize', onWindowResize);
    });
  });

  // Vue 组件卸载时清理资源
  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    controls?.dispose();
    renderer?.dispose();
    renderer = null;
  });

  // 添加矩形
  const addRectangle = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const rectangle = new THREE.Mesh(geometry, material);
    scene.add(rectangle);
  };

  // 添加隧道
  const addTunnel = () => {
    const geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const tunnel = new THREE.Mesh(geometry, material);
    scene.add(tunnel);
  };

  // 添加圆形
  const addCircle = () => {
    const geometry = new THREE.CircleGeometry(1, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x0077ff });
    const circle = new THREE.Mesh(geometry, material);
    scene.add(circle);
  };

  // 清空画布
  const clearCanvas = () => {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  };
</script>

<template>
  <div class="threejs-container">
    <h1>Three.js Canvas Demo</h1>
    <h2>
      <span style="color: red">X轴（红色）</span>
      <span style="color: green">Y轴（绿色）</span>
      <span style="color: blue">Z轴（蓝色）</span>
    </h2>
    <div class="toolbar">
      <button @click="switchCamera">
        切换相机（当前：{{ isPerspective ? '透视' : '正交' }}）
      </button>
      <button @click="addRectangle">添加矩形</button>
      <button @click="addTunnel">添加隧道</button>
      <button @click="addCircle">添加圆形</button>
      <button @click="clearCanvas">清空画布</button>
    </div>
    <div class="canvas-wrapper" ref="containerRef"></div>
  </div>
</template>

<style>
  .threejs-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    text-align: center;
  }

  .toolbar {
    margin-bottom: 10px;
  }

  .canvas-wrapper {
    width: 90%;
    height: 80vh;
    border: 1px solid #ccc;
  }
</style>
