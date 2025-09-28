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

      <!-- 新增 PCD 功能按钮 -->
      <button @click="loadRemotePCD">加载远程 PCD 文件</button>
      <button @click="triggerLocalPCDLoad">加载本地 PCD 文件</button>
      <!-- 新增 PLY 功能按钮 -->
      <button @click="loadRemotePLY">加载远程 PLY 文件</button>
      <button @click="triggerLocalPLYLoad">加载本地 PLY 文件</button>
      <!-- BVH 构建按钮 -->
      <button @click="buildBVHForMeshes">构建 BVH 加速结构</button>
    </div>
    <!-- 隐藏的本地文件 input -->
    <input
      type="file"
      ref="pcdFileRef"
      accept=".pcd"
      style="display: none"
      @change="loadLocalPCDFile"
    />

    <input
      type="file"
      ref="plyFileRef"
      accept=".ply"
      style="display: none"
      @change="loadLocalPLYFile"
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
  import Stats from 'three/examples/jsm/libs/stats.module.js';
  import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

  // 新增导入 PCDLoader
  import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js';
  import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

  THREE.Mesh.prototype.raycast = acceleratedRaycast;
  const pcdFileRef = ref<HTMLInputElement | null>(null);
  const plyFileRef = ref<HTMLInputElement | null>(null);
  // 容器引用
  const containerRef = ref<HTMLDivElement | null>(null);

  // three.js 核心变量
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let perspectiveCamera: THREE.PerspectiveCamera;
  let orthographicCamera: THREE.OrthographicCamera;
  let currentCamera: THREE.Camera;
  let controls: OrbitControls;
  let arcballControls: ArcballControls;
  let gui: GUI;
  let stats: Stats; // 性能监测工具
  let animationId: number;
  let gridHelper: THREE.GridHelper;
  let axesHelper: THREE.AxesHelper;
  let currentBoxHelper: THREE.BoxHelper | null = null;
  const raycaster = new THREE.Raycaster();

  const mouse = new THREE.Vector2();
  // 控制配置
  const config = reactive({
    usePerspective: false, // 当前是否为透视相机
    pointSize: 0.05,
  });

  // 初始化场景
  const initScene = () => {
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xf0f0f0);
    scene.background = new THREE.Color(0x000000);

    // 添加辅助坐标轴
    axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // 添加地面网格
    // gridHelper = new THREE.GridHelper(200, 20);
    // scene.add(gridHelper);
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
    controls.enabled = false;
    arcballControls = new ArcballControls(currentCamera, renderer.domElement, scene);
    // 设置是否启用缩放和平移
    arcballControls.enableZoom = true;
    arcballControls.enablePan = true;
    arcballControls.enableRotate = true;
    arcballControls.enabled = true;
    arcballControls.enableAnimations = true;
    arcballControls.setGizmosVisible(false);
  };

  // 初始化光源
  const initLights = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    scene.add(ambientLight, directionalLight);
  };

  // 渲染循环
  const render = () => {
    controls.update();
    stats.update();
    renderer.render(scene, currentCamera);
    animationId = requestAnimationFrame(render);
  };

  const initStats = () => {
    if (containerRef.value) {
      //stats
      console.log('stats');
      stats = new Stats();
      stats.dom.classList.add('custom-stats');
      containerRef.value.appendChild(stats.dom); // 直接插入 Three.js 画布容器内部
    }
  };
  // 初始化 GUI 控制面板
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
    const target =
      scene.getObjectByName('Object-RemotePCD') ||
      scene.getObjectByName('Object-LocalPCD') ||
      scene.getObjectByName('Object-RemotePLY') ||
      scene.getObjectByName('Object-LocalPLY');
    if (!target) {
      console.warn('未找到 PCD 点云对象');
      return;
    }

    // 调整材质的 size
    if (target instanceof THREE.Points && target.material instanceof THREE.PointsMaterial) {
      target.material.size = config.pointSize;
      target.material.needsUpdate = true;
    } else if (target instanceof THREE.Points && Array.isArray(target.material)) {
      // 多材质处理
      target.material.forEach((mat: any) => {
        if (mat instanceof THREE.PointsMaterial) {
          mat.size = config.pointSize;
          mat.needsUpdate = true;
        }
      });
    }

    console.log(`点大小已更新为：${config.pointSize}`);
  };

  const focusPointCloud = () => {
    const target =
      scene.getObjectByName('Object-RemotePCD') ||
      scene.getObjectByName('Object-LocalPCD') ||
      scene.getObjectByName('Object-RemotePLY') ||
      scene.getObjectByName('Object-LocalPLY');
    if (!target) {
      console.warn('未找到 点云对象');
      return;
    }

    const box = new THREE.Box3().setFromObject(target);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // 居中点云
    target.position.sub(center);

    // 设置控制器焦点为 (0,0,0)
    controls.target.set(0, 0, 0);
    controls.update();

    // 自动调整相机位置：计算最大尺寸作为距离参考
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 1.5; // 缩放比例可调

    const direction = new THREE.Vector3(1, 1, 1).normalize(); // 默认朝向
    currentCamera.position.copy(direction.multiplyScalar(distance));

    if ('lookAt' in currentCamera) {
      currentCamera.lookAt(0, 0, 0);
    }

    controls.update();

    console.log('点云已自动聚焦');
  };

  const centerPointCloud = () => {
    const target =
      scene.getObjectByName('Object-RemotePCD') ||
      scene.getObjectByName('Object-LocalPCD') ||
      scene.getObjectByName('Object-RemotePLY') ||
      scene.getObjectByName('Object-LocalPLY');
    if (!target) {
      console.warn('未找到 PCD 点云对象');
      return;
    }

    const box = new THREE.Box3().setFromObject(target);
    const center = box.getCenter(new THREE.Vector3());

    // 平移点云居中
    target.position.sub(center);

    // 设置控制器焦点
    controls.target.set(0, 0, 0);
    controls.update();

    console.log('点云已居中');
  };
  // 添加球体到场景
  const addSphere = () => {
    const geometry = new THREE.SphereGeometry(10, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = 'Object-Sphere';
    sphere.position.set(0, 10, 0);
    scene.add(sphere);
    // const helper = new THREE.BoxHelper(sphere, 0x0077ff);
    // scene.add(helper);
  };
  const loadRemotePCD = () => {
    const loader = new PCDLoader();
    const url = 'https://threejs.org/examples/models/pcd/binary/Zaghetto.pcd'; // 可换成你的 URL

    loader.load(
      url,
      (points) => {
        points.name = 'Object-RemotePCD';
        scene.add(points);
        console.log('远程 PCD 加载成功');
      },
      (xhr) => {
        console.log(`远程加载进度: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (err) => {
        console.error('远程 PCD 加载失败', err);
      },
    );
  };
  const triggerLocalPCDLoad = () => {
    pcdFileRef.value?.click();
  };
  const loadLocalPCDFile = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) return;

      const loader = new PCDLoader();
      try {
        const points = loader.parse(arrayBuffer as ArrayBuffer);
        points.name = 'Object-LocalPCD';
        //  设置点大小
        if (points.material instanceof THREE.PointsMaterial) {
          points.material.size = config.pointSize;
          points.material.sizeAttenuation = true; // 可选：是否随距离缩放
          points.rotation.x = -Math.PI / 2; // 将Z轴（CloudCompare的Up）转为Y轴（Three.js的Up）
        }

        //  根据 Y 值设置点颜色
        const geometry = points.geometry;
        const position = geometry.attributes.position;
        const count = position.count;

        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const y = position.getY(i);
          const color = new THREE.Color(y >= 0 ? 0xff0000 : 0xffff00);
          colors[i * 3 + 0] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        points.material.vertexColors = true;
        console.log('本地 PCD 加载成功', points);
        console.log('几何体属性列表：', points.geometry.attributes);
        console.log('点数量：', points.geometry.attributes.position.count);
        // 自动聚焦
        scene.add(points);
        focusPointCloud();
      } catch (err) {
        console.error('本地 PCD 加载失败', err);
      }
    };

    reader.readAsArrayBuffer(file);
  };
  const loadRemotePLY = () => {
    const loader = new PLYLoader();
    const url = 'https://threejs.org/examples/models/ply/binary/Lucy100k.ply';
    loader.load(
      url,
      (geometry) => {
        geometry.computeVertexNormals();
        const material = new THREE.PointsMaterial({ size: config.pointSize, vertexColors: true });
        const points = new THREE.Points(geometry, material);
        points.name = 'Object-RemotePLY';
        scene.add(points);
        console.log('Remote PLY loaded');
      },
      (xhr) => {
        console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (err) => {
        console.error('Failed to load remote PLY', err);
      },
    );
  };

  const triggerLocalPLYLoad = () => {
    plyFileRef.value?.click();
  };

  const loadLocalPLYFile = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const text = event.target?.result;
      if (!text) return;

      try {
        const loader = new PLYLoader();
        const geometry = loader.parse(text as string); // ASCII 格式必须是字符串
        geometry.computeVertexNormals();

        const material = new THREE.PointsMaterial({
          size: config.pointSize,
          vertexColors: true,
          // color: 0x00ff00, // 固定颜色
        });

        const points = new THREE.Points(geometry, material);
        points.name = 'Object-LocalPLY';
        scene.add(points);

        console.log('本地 PLY 加载成功');
        console.log('几何体属性列表：', geometry.attributes);
        console.log('点数量：', geometry.attributes.position.count);
        // 自动聚焦
        focusPointCloud();
      } catch (err) {
        console.error('本地 PLY 加载失败', err);
      }
    };

    reader.readAsText(file); // ✅ ASCII 格式读取方式
  };
  const buildBVHForMeshes = () => {
    let count = 0;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        if (!('boundsTree' in child.geometry)) {
          child.geometry.computeBoundsTree = computeBoundsTree;
          child.geometry.disposeBoundsTree = disposeBoundsTree;
        }

        try {
          (child.geometry as any).computeBoundsTree(); // 为几何体构建 BVH
          count++;
        } catch (e) {
          console.warn('构建 BVH 失败：', child.name, e);
        }
      }
    });

    console.log(`成功为 ${count} 个 Mesh 构建 BVH`);
  };

  // 清空整个画布，包括坐标轴、网格等
  const clearCanvas = () => {
    for (let i = scene.children.length - 1; i >= 0; i--) {
      const child = scene.children[i];
      if (!(child instanceof THREE.Camera)) {
        scene.remove(child);
      }
    }
  };

  // 清空用户添加的物体，仅保留辅助线和网格（还原为初始状态）
  const clearElements = () => {
    // 如果已经被移除，需要重新添加辅助线和网格
    if (!scene.children.includes(axesHelper)) scene.add(axesHelper);
    // if (!scene.children.includes(gridHelper)) scene.add(gridHelper);

    scene.children.forEach((child) => {
      const isHelper = child === axesHelper;
      // || child === gridHelper;
      if (!isHelper && !(child instanceof THREE.Camera)) {
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
    initStats();
    render();

    // 监听键盘快捷键（C 切换相机）
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('pointerdown', handlePointerDown);
  });

  // 销毁前清理
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    renderer.dispose();
    gui.destroy();
    stats.dom.remove();
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

    // 先移除之前的 Helper（若有）
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
        // 创建新的 Helper 并保存
        const helper = new THREE.BoxHelper(object, 0xff0000);
        scene.add(helper);
        currentBoxHelper = helper;
      }
    }
  };

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

  .custom-stats {
    position: absolute !important;
    z-index: 10;
    top: 10px;
    right: 10px;
  }
</style>
