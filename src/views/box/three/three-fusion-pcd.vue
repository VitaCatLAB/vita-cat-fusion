<template>
  <div class="threejs-container">
    <h1>Three.js Canvas Demo</h1>
    <h2>
      <span style="color: red">X轴（红色）</span>
      <span style="color: green">Y轴（绿色）</span>
      <span style="color: blue">Z轴（蓝色）</span>
    </h2>
    <div class="toolbar">
      <!-- 相机切换按钮 -->
      <button @click="switchCamera">
        切换相机（当前：{{ config.usePerspective ? '透视' : '正交' }}）
      </button>

      <!-- 添加球体按钮 -->
      <button @click="addSphere">增加球体</button>

      <!-- 清除所有按钮（包括辅助线） -->
      <button @click="clearAll">清空所有</button>

      <!-- 清除用户添加的物体，但保留坐标轴和网格 -->
      <button @click="clearObjectsOnly">清空画布内所有元素</button>
    </div>

    <!-- three.js 渲染容器 -->
    <div class="canvas-wrapper" ref="containerRef"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

  // 容器引用
  const containerRef = ref<HTMLDivElement | null>(null);

  // three.js 核心变量
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let perspectiveCamera: THREE.PerspectiveCamera;
  let orthographicCamera: THREE.OrthographicCamera;
  let currentCamera: THREE.Camera;
  let controls: OrbitControls;
  let gui: GUI;
  let animationId: number;
  let gridHelper: THREE.GridHelper;
  let axesHelper: THREE.AxesHelper;

  // 控制配置
  const config = {
    usePerspective: true, // 当前是否为透视相机
  };

  // 初始化场景
  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 添加辅助坐标轴
    axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // 添加地面网格
    gridHelper = new THREE.GridHelper(200, 20);
    scene.add(gridHelper);
  };

  // 初始化渲染器
  const initRenderer = () => {
    if (!containerRef.value) return;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
    containerRef.value.appendChild(renderer.domElement);
  };

  // 初始化相机（透视 & 正交）
  const initCameras = () => {
    const aspect = containerRef.value!.clientWidth / containerRef.value!.clientHeight;

    // 透视相机
    perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    perspectiveCamera.position.set(100, 100, 100);

    // 正交相机
    const frustumSize = 200;
    orthographicCamera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000,
    );
    orthographicCamera.position.set(100, 100, 100);

    currentCamera = config.usePerspective ? perspectiveCamera : orthographicCamera;
  };

  // 初始化轨道控制器
  const initControls = () => {
    controls = new OrbitControls(currentCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
  };

  // 初始化光源
  const initLights = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(ambientLight, directionalLight);
  };

  // 渲染循环
  const render = () => {
    controls.update();
    renderer.render(scene, currentCamera);
    animationId = requestAnimationFrame(render);
  };

  // 初始化 GUI 控制面板
  const initGUI = () => {
    gui = new GUI({ container: containerRef.value! });
    gui.domElement.classList.add('custom-gui');

    gui
      .add(config, 'usePerspective')
      .name('切换相机')
      .onChange(() => {
        switchCamera();
      });
  };

  // 添加球体到场景
  const addSphere = () => {
    const geometry = new THREE.SphereGeometry(10, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 10, 0);
    scene.add(sphere);
  };

  // 清空所有内容（保留相机）
  const clearAll = () => {
    scene.children.forEach((child) => {
      if (!(child instanceof THREE.Camera)) {
        scene.remove(child);
      }
    });
  };

  // 清空用户添加的对象（保留网格与坐标轴）
  const clearObjectsOnly = () => {
    scene.children.forEach((child) => {
      if (child !== gridHelper && child !== axesHelper && !(child instanceof THREE.Camera)) {
        scene.remove(child);
      }
    });
  };

  // 切换当前使用的相机
  const switchCamera = () => {
    config.usePerspective = !config.usePerspective;
    currentCamera = config.usePerspective ? perspectiveCamera : orthographicCamera;
    initControls(); // 重置控制器以适配新相机
  };

  // 生命周期挂载时初始化
  onMounted(() => {
    initScene();
    initRenderer();
    initCameras();
    initControls();
    initLights();
    initGUI();
    render();

    // 监听键盘快捷键（C 切换相机）
    window.addEventListener('keydown', handleKeydown);
  });

  // 销毁前清理
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    renderer.dispose();
    gui.destroy();
    window.removeEventListener('keydown', handleKeydown);
  });

  // 快捷键事件处理
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'c' || e.key === 'C') {
      switchCamera();
    }
  };
</script>

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
    position: relative;
  }

  .custom-gui {
    position: absolute !important;
    top: 10px;
    right: 10px;
    z-index: 10;
  }
</style>
