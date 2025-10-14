<template>
  <div class="threejs-container">
    <h1>Three.js Canvas Demo</h1>
    <h2>
      <span style="color: red">X轴（红色）</span>
      <span style="color: green">Y轴（绿色）</span>
      <span style="color: blue">Z轴（蓝色）</span>
    </h2>
    <!-- 按钮区域 -->
    <div class="toolbar">
      <button @click="switchCamera"
        >切换相机（当前：{{ config.usePerspective ? '透视' : '正交' }}）</button
      >
      <button @click="addSphere">增加球体</button>
      <button @click="clearCanvas">清空画布</button>
      <button @click="clearElements">清空元素</button>

      <!-- 新增 @pnext/three-loader 点云加载 -->
      <button @click="triggerLocalCloudLoad">加载本地点云文件（@pnext/three-loader）</button>
    </div>

    <!-- 隐藏的本地点云文件 input -->
    <input
      type="file"
      ref="cloudFileRef"
      accept="*"
      style="display: none"
      @change="loadLocalCloudFile"
    />

    <!-- three.js 渲染容器 -->
    <div class="canvas-wrapper" ref="containerRef"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, reactive } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
  import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';

  import { Potree, PointCloudOctree } from '@pnext/three-loader';

  const containerRef = ref<HTMLDivElement | null>(null);
  const cloudFileRef = ref<HTMLInputElement | null>(null);

  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let perspectiveCamera: THREE.PerspectiveCamera;
  let orthographicCamera: THREE.OrthographicCamera;
  let currentCamera: THREE.Camera;
  let controls: OrbitControls;
  let arcballControls: ArcballControls;
  let gui: GUI;
  let animationId: number;
  let axesHelper: THREE.AxesHelper;
  let currentBoxHelper: THREE.BoxHelper | null = null;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const config = reactive({
    usePerspective: false,
    pointSize: 0.05,
  });

  const potree = new Potree();
  potree.pointBudget = 2_000_000; // 点预算
  const loadedPointClouds: PointCloudOctree[] = [];

  const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
  };

  const initRenderer = () => {
    if (!containerRef.value) return;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
    containerRef.value.appendChild(renderer.domElement);
  };

  const initCameras = () => {
    const aspect = containerRef.value!.clientWidth / containerRef.value!.clientHeight;

    perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    perspectiveCamera.position.set(100, 100, 100);

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

  const initControls = () => {
    controls = new OrbitControls(currentCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false;

    arcballControls = new ArcballControls(currentCamera, renderer.domElement, scene);
    arcballControls.enableZoom = true;
    arcballControls.enablePan = true;
    arcballControls.enableRotate = true;
    arcballControls.enabled = true;
    arcballControls.enableAnimations = true;
    arcballControls.setGizmosVisible(false);
  };

  const initLights = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(ambientLight, directionalLight);
  };

  const render = () => {
    controls.update();
    potree.updatePointClouds(loadedPointClouds, currentCamera, renderer);
    renderer.render(scene, currentCamera);
    animationId = requestAnimationFrame(render);
  };

  const initGUI = () => {
    gui = new GUI({ container: containerRef.value! });
    gui.domElement.classList.add('custom-gui');
    const pcFolder = gui.addFolder('点云展示设置');
    pcFolder.add({ center: centerPointCloud }, 'center').name('点云居中');
    pcFolder.add({ focus: focusPointCloud }, 'focus').name('点云聚焦');
    pcFolder.add(config, 'pointSize', 0.01, 10.0, 0.01).name('点大小').onChange(updatePointSize);
    gui
      .add(config, 'usePerspective')
      .name('切换相机')
      .onChange(() => {
        switchCamera();
      });
  };

  const updatePointSize = () => {
    loadedPointClouds.forEach((pco) => {
      if (pco.material) {
        pco.material.size = config.pointSize;
        pco.material.needsUpdate = true;
      }
    });
    console.log(`点大小已更新为：${config.pointSize}`);
  };

  const focusPointCloud = () => {
    if (loadedPointClouds.length === 0) {
      console.warn('未加载点云');
      return;
    }
    const target = loadedPointClouds[loadedPointClouds.length - 1];
    const box = new THREE.Box3().setFromObject(target);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    target.position.sub(center);

    controls.target.set(0, 0, 0);
    controls.update();

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5;

    const direction = new THREE.Vector3(1, 1, 1).normalize();
    currentCamera.position.copy(direction.multiplyScalar(distance));

    if ('lookAt' in currentCamera) {
      currentCamera.lookAt(0, 0, 0);
    }
    controls.update();

    console.log('点云已自动聚焦');
  };

  const centerPointCloud = () => {
    if (loadedPointClouds.length === 0) {
      console.warn('未加载点云');
      return;
    }
    const target = loadedPointClouds[loadedPointClouds.length - 1];
    const box = new THREE.Box3().setFromObject(target);
    const center = box.getCenter(new THREE.Vector3());
    target.position.sub(center);

    controls.target.set(0, 0, 0);
    controls.update();

    console.log('点云已居中');
  };

  const addSphere = () => {
    const geometry = new THREE.SphereGeometry(10, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = 'Object-Sphere';
    sphere.position.set(0, 10, 0);
    scene.add(sphere);
  };

  const triggerLocalCloudLoad = () => {
    cloudFileRef.value?.click();
  };

  const loadLocalCloudFile = async (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 使用 URL.createObjectURL 转换文件为可访问的 URL
    const url = URL.createObjectURL(file);

    try {
      const pointCloud = await potree.loadPointCloud(url, (relativeUrl) => relativeUrl);
      loadedPointClouds.push(pointCloud);
      scene.add(pointCloud);
      if (pointCloud.material) {
        pointCloud.material.size = config.pointSize;
        pointCloud.material.needsUpdate = true;
      }
      console.log('本地点云文件加载成功:', file.name);
      focusPointCloud();
    } catch (err) {
      console.error('本地点云文件加载失败', err);
    }
  };

  const clearCanvas = () => {
    loadedPointClouds.forEach((pco: any) => {
      scene.remove(pco);
      pco.geometry.dispose();
      if (pco.material) pco.material.dispose();
    });
    loadedPointClouds.length = 0;

    for (let i = scene.children.length - 1; i >= 0; i--) {
      const child = scene.children[i];
      if (!(child instanceof THREE.Camera) && child !== axesHelper) {
        scene.remove(child);
      }
    }
  };

  const clearElements = () => {
    if (!scene.children.includes(axesHelper)) scene.add(axesHelper);

    scene.children.forEach((child) => {
      const isHelper = child === axesHelper;
      if (!isHelper && !(child instanceof THREE.Camera)) {
        scene.remove(child);
      }
    });

    loadedPointClouds.length = 0;
  };

  const switchCamera = () => {
    config.usePerspective = !config.usePerspective;
    currentCamera = config.usePerspective ? perspectiveCamera : orthographicCamera;
    initControls();
  };

  onMounted(() => {
    initScene();
    initRenderer();
    initCameras();
    initControls();
    initLights();
    initGUI();
    render();

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('pointerdown', handlePointerDown);
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    renderer.dispose();
    gui.destroy();
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('pointerdown', handlePointerDown);
  });

  const handlePointerDown = (event: PointerEvent) => {
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, currentCamera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (currentBoxHelper) {
      scene.remove(currentBoxHelper);
      currentBoxHelper.geometry.dispose();
      (currentBoxHelper.material as THREE.Material).dispose();
      currentBoxHelper = null;
    }

    if (intersects.length > 0) {
      const object = intersects[0].object;
      console.log('选中：', object.name || object);

      if (object.name.startsWith('Object-')) {
        const helper = new THREE.BoxHelper(object, 0xff0000);
        scene.add(helper);
        currentBoxHelper = helper;
      }
    }
  };

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
    position: relative;
    width: 90%;
    height: 80vh;
    border: 1px solid #ccc;
  }

  .custom-gui {
    position: absolute !important;
    z-index: 10;
    top: 10px;
    right: 10px;
  }
</style>
