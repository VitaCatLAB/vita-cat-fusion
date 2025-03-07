<script setup lang="ts">
  import { onMounted, onUnmounted, ref, nextTick } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { holeGroupProcessor } from '@/yunbaopo/processors/hole-processor';
  import { genHoleDepth } from '@/yunbaopo/gen/calculate-hole-depth';
  import { hole, outline } from '@/yunbaopo/graphics/data';
  import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
  import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
  // 绑定 Vue 组件的 DOM 容器
  const containerRef = ref<HTMLDivElement | null>(null);
  let renderer: THREE.WebGLRenderer | null = null; // 渲染器
  let scene: THREE.Scene; // 场景
  let camera: THREE.PerspectiveCamera | THREE.OrthographicCamera; // 相机（可切换）
  let controls: OrbitControls | null = null; // 轨道控制器
  const isPerspective = ref(false); // 记录当前是否使用透视相机
  const size = ref(3); // 视野范围

  const config: any = {
    closed: false,
    curveType: 'centripetal',
    tension: 0.5,
  };
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
    renderer.setClearColor(0xeef2f9);
    containerRef.value.appendChild(renderer.domElement);

    initHelpers(); // 初始化辅助工具（坐标轴、轨道控制器）
    initGUI();
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
        -1000, // near: 近裁剪面（距离相机）
        1000, // far: 远裁剪面（距离相机）
      );
    }
    camera.position.set(5, 5, 5);
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

    // 增加网格辅助线
    const gridHelper = new THREE.GridHelper(30, 30);

    scene.add(gridHelper);
    // 先移除场景中的旧坐标轴
    scene.children = scene.children.filter((obj) => !(obj instanceof THREE.AxesHelper));
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
  };

  const initGUI = () => {
    console.log('initGUI');
    const gui = new GUI();
    // gui增加交互界面，用来改变obj对应属性
    gui.add(config, 'closed').onChange(updateScene);
    gui.add(config, 'curveType', ['centripetal', 'catmullrom', 'chordal']).onChange(updateScene);
    gui.add(config, 'tension', 0, 1, 0.01).onChange(updateScene);
  };
  // 渲染循环
  const animate = () => {
    requestAnimationFrame(animate);
    controls?.update(); // 更新控制器状态
    renderer?.render(scene, camera); // 渲染场景
  };
  // 更新场景的函数
  const updateScene = () => {
    clearCanvas();
    initHelpers();
    // 重新生成图形
    addTunnel();
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

  const fun1 = () => {
    // 创建梯形形状
    const shape = new THREE.Shape();
    shape.moveTo(-5, 0);
    shape.lineTo(0, -5);
    shape.lineTo(5, 0);

    shape.closePath();

    // 创建路径
    const path = new THREE.CurvePath<THREE.Vector3>();
    const curve1 = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -10));
    const curve2 = new THREE.LineCurve3(
      new THREE.Vector3(0, 0, -10),
      new THREE.Vector3(10, 0, -10),
    );
    path.add(curve1);
    path.add(curve2);

    // 使用 `ExtrudeGeometry` 进行路径扫描
    const extrudeSettings = { steps: 100, bevelEnabled: false, extrudePath: path };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  };
  const addTunnel = () => {
    /**
     * 添加光源，提高物体的可见性
     */
    // 环境光（均匀照亮整个场景）
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);

    // 方向光（模拟太阳光，增加阴影效果）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    /**
     *  定义路径上的关键点（控制隧道的走向）
     */
    const linePoints = [
      { x: 0, y: 0, z: 0 }, // 起点
      { x: 0, y: 0.01, z: -10 }, // 轻微偏移，确保梯形不翻转
      { x: 10, y: 0, z: 0 }, // 拐角点
      { x: 10, y: 0, z: -10 }, // 终点
    ];

    // 转换为 THREE.Vector3 格式
    const linePointsV3 = linePoints.map((point) => new THREE.Vector3(point.x, point.y, point.z));

    /**
     *  在路径控制点上添加小球进行可视化，方便调试
     */
    linePointsV3.forEach((point) => {
      const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
      const randomColor =
        '#' +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, '0'); // 确保颜色格式为 6 位
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: randomColor });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.copy(point);
      scene.add(sphere);
    });

    /**
     *  生成 Catmull-Rom 曲线（平滑路径）
     */

    const crPath = new THREE.CatmullRomCurve3(
      linePointsV3,
      config.closed,
      config.curveType,
      config.tension,
    );

    /**
     *  可视化曲线（红色线条）
     */
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(crPath.getPoints(100));
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    const trapezoidShape = new THREE.Shape();

    const scale = 0.005;

    for (let index = 0; index < outline.length; index++) {
      if (index < 4) {
        const element: any = outline[index];
        if (element.type === 'POINT') {
          trapezoidShape.moveTo(element.x * scale, element.y * scale);
        }
        if (element.type === 'LINE') {
          trapezoidShape.moveTo(element.p1.x * scale, element.p1.y * scale);
          trapezoidShape.lineTo(element.p2.x * scale, element.p2.y * scale);
        }
        if (element.type === 'ARC') {
          trapezoidShape.absarc(
            element.x * scale,
            element.y * scale,
            element.r * scale,
            element.a1,
            element.a2,
            true,
          );
        }
      }
    }

    trapezoidShape.closePath(); // 关闭路径

    /**
     * 进行路径挤出，生成隧道结构
     */
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 200, // 挤出路径上的分段数（控制平滑度）
      bevelEnabled: false, // 关闭倒角
      extrudePath: crPath, // 沿着路径挤出
    };

    const tunnelGeometry = new THREE.ExtrudeGeometry(trapezoidShape, extrudeSettings);

    // 加载 PBR 贴图
    const textureLoader = new THREE.TextureLoader();
    const aoMap = textureLoader.load('/img/Trash/layers/textures/concrete_layers_ao_4k.jpg');
    const baseColorMap = textureLoader.load(
      '/img/Trash/layers/textures/concrete_layers_diff_4k.jpg',
    ); // Diffuse 颜色
    const roughnessMap = textureLoader.load(
      '/img/Trash/layers/textures/concrete_layers_rough_4k.exr',
    ); // 粗糙度
    const displacementMap = textureLoader.load(
      '/img/Trash/layers/textures/concrete_layers_disp_4k.png',
    ); // 置换贴图
    // 加载法线贴图（GLTF 使用 OpenGL 方向的法线贴图）
    const normalMap = new EXRLoader().load(
      '/img/Trash/layers/textures/concrete_layers_nor_gl_4k.exr',
    );
    // 修复贴图间隙问题
    baseColorMap.wrapS = THREE.ClampToEdgeWrapping;
    baseColorMap.wrapT = THREE.ClampToEdgeWrapping;
    baseColorMap.minFilter = THREE.LinearMipMapLinearFilter;
    // **创建 PBR 材质**
    const tunnelMaterial = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide, // 避免背面看不到
      map: baseColorMap, // 颜色贴图
      aoMap: aoMap, // 环境光遮蔽
      roughnessMap: roughnessMap, // 粗糙度贴图
      normalMap: normalMap, // 法线贴图
      displacementMap: displacementMap, // 置换贴图
      displacementScale: 0.1, // 置换高度
      metalness: 0.0, // 水泥不反光
      roughness: 1.0, // 增加粗糙度，减少反光
    });
    // **应用材质到隧道**
    const tunnelMesh = new THREE.Mesh(tunnelGeometry, tunnelMaterial);

    // **修复 AO 贴图的问题**
    tunnelGeometry.setAttribute('uv2', tunnelGeometry.attributes.uv);
    tunnelGeometry.computeVertexNormals();
    scene.add(tunnelMesh);
  };

  const addShape2 = () => {
    const scale = 0.005;
    const trapezoidShape = new THREE.Shape();

    for (let index = 0; index < outline.length; index++) {
      if (index < 4) {
        const element: any = outline[index];
        if (element.type === 'POINT') {
          trapezoidShape.moveTo(element.x * scale, element.y * scale);
        }
        if (element.type === 'LINE') {
          trapezoidShape.moveTo(element.p1.x * scale, element.p1.y * scale);
          trapezoidShape.lineTo(element.p2.x * scale, element.p2.y * scale);
        }
        if (element.type === 'ARC') {
          trapezoidShape.absarc(
            element.x * scale,
            element.y * scale,
            element.r * scale,
            element.a1,
            element.a2,
            true,
          );
        }
      }
    }

    trapezoidShape.closePath();
    const shapeGeometry = new THREE.ShapeGeometry(trapezoidShape);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(shapeGeometry, material);

    scene.add(mesh);
  };
  const addShape = () => {
    const trapezoidShape = new THREE.Shape();
    trapezoidShape.moveTo(2, 0);
    trapezoidShape.lineTo(-2, 0);
    trapezoidShape.lineTo(-1, 2);
    trapezoidShape.lineTo(1, 2);
    trapezoidShape.closePath();
    const shapeGeometry = new THREE.ShapeGeometry(trapezoidShape);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(shapeGeometry, material);

    scene.add(mesh);
  };

  const clearScene = () => {
    while (scene.children.length > 0) {
      const object = scene.children[0];
      scene.remove(object);

      // 释放几何体和材质资源，防止内存泄漏
      if ((object as THREE.Mesh).geometry) {
        (object as THREE.Mesh).geometry.dispose();
      }
      if ((object as THREE.Mesh).material) {
        const material = (object as THREE.Mesh).material;
        if (Array.isArray(material)) {
          material.forEach((mat) => mat.dispose());
        } else {
          material.dispose();
        }
      }
    }
  };

  // 清空画布
  const clearCanvas = () => {
    clearScene();
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

      <button @click="addTunnel">添加隧道1</button>
      <button @click="fun1">添加隧道2</button>
      <button @click="addShape">绘制梯形</button>
      <button @click="addShape2">绘制隧道</button>
      <button @click="addCircle">添加圆</button>

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
