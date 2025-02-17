<script setup lang="ts">
  import { onMounted, onUnmounted, ref, nextTick } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  // import { hole } from '@/yunbaopo/graphics/data';
  import { hole } from '@/yunbaopo/graphics/data2';
  import { holeGroupProcessor } from '@/yunbaopo/processors/hole-processor';
  import { genHoleDepth } from '@/yunbaopo/gen/calculate-hole-depth';

  // 绑定 Vue 组件的 DOM 容器
  const containerRef = ref<HTMLDivElement | null>(null);
  let renderer: THREE.WebGLRenderer | null = null; // 渲染器
  let scene: THREE.Scene; // 场景
  let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera; // 相机（可切换）
  let controls: OrbitControls | null = null; // 轨道控制器
  const isPerspective = ref(false); // 记录当前是否使用透视相机
  const size = ref(3); // 视野范围
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

      camera = new THREE.OrthographicCamera(
        -size.value * aspect, // left: 视锥左侧边界
        size.value * aspect, // right: 视锥右侧边界
        size.value, // top: 视锥上边界
        -size.value, // bottom: 视锥下边界
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

      camera.left = -size.value * aspect; // 更新正交相机的左侧边界
      camera.right = size.value * aspect; // 更新正交相机的右侧边界
      camera.top = size.value; // 更新正交相机的顶部边界
      camera.bottom = -size.value; // 更新正交相机的底部边界
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
    // 添加环境光与方向光
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // ------------------------
    // 2. 定义三个点，并生成平滑曲线
    // ------------------------
    // 假设三个点都位于 XZ 平面（y = 0）
    const pointA = new THREE.Vector3(0, 0, 10);
    const pointB = new THREE.Vector3(10, 0, -10);
    const pointC = new THREE.Vector3(10, 0, 0);

    const curvePoints = [pointA, pointB, pointC];

    // 使用 CatmullRomCurve3 生成光滑曲线，closed 设置为 false，tension 可调（0.5 为较平滑）
    const smoothCurve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);

    // 为方便观察，也将曲线显示出来
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(smoothCurve.getPoints(100));
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    // ------------------------
    // 3. 定义梯形截面
    // ------------------------
    const trapezoidShape = new THREE.Shape();
    trapezoidShape.moveTo(0, 0); // 底边左侧点
    trapezoidShape.lineTo(1, 2); // 底边右侧点
    trapezoidShape.lineTo(3, 2); // 顶边右侧点
    trapezoidShape.lineTo(4, 0); // 顶边左侧点
    trapezoidShape.closePath();

    // ------------------------
    // 4. 挤出生成曲线管道
    // ------------------------
    // 利用 extrudePath 参数将梯形沿平滑曲线挤出
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 200, // 沿路径采样的点数，越高越平滑
      bevelEnabled: false, // 关闭斜角
      extrudePath: smoothCurve,
    };

    const pipeGeometry = new THREE.ExtrudeGeometry(trapezoidShape, extrudeSettings);
    const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const pipeMesh = new THREE.Mesh(pipeGeometry, pipeMaterial);
    scene.add(pipeMesh);
  };

  // 添加圆形
  const addCircle = () => {
    const _graphHoleList = holeGroupProcessor(hole);

    const scale = 0.005;
    for (const holes of _graphHoleList) {
      for (const hole of holes.holeList) {
        const { x, y, innerX, innerY, d, type, l } = hole.origin;
        const _x = x * scale;
        const _y = y * scale;
        const _innerX = innerX * scale;
        const _innerY = innerY * scale;
        const _d = d * scale;
        const _holeDepth = genHoleDepth(hole) * scale;

        // 转换为三维坐标，固定 Z 轴为 0
        const start = new THREE.Vector3(_x, _y, 0); // 起点的三维坐标
        const end = new THREE.Vector3(_innerX, _innerY, -_holeDepth); // 终点的三维坐标

        const s1 = new THREE.Vector2(start.x, start.y);
        const e1 = new THREE.Vector2(end.x, end.y);

        // 创建一条曲线作为示例
        const curve = new THREE.CatmullRomCurve3([start, end]);
        const lineCurve = new THREE.LineCurve3(start, end);

        // 设置管子的半径和分段数
        const tubeRadius = 0.02;
        const tubeRadialSegments = 32; // 圆周上的分段数
        const tubularSegments = 20; // 沿着路径的分段数

        // 创建管状几何体
        const geometry = new THREE.TubeGeometry(
          lineCurve,
          tubularSegments,
          tubeRadius,
          tubeRadialSegments,
          true,
        );

        // 创建材质
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

        // 创建网格并添加到场景中
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      }
    }
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
      <button @click="addCircle">添加炮孔</button>
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
