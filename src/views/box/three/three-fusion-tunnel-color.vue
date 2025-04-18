<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  const container = ref<HTMLDivElement | null>(null);

  onMounted(() => {
    if (!container.value) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    container.value.appendChild(renderer.domElement);

    // 创建更弯曲的管道路径
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 3, 0), // 入口（左上角）
      new THREE.Vector3(-2, 2, 1), // 拐点1
      new THREE.Vector3(0, 0, -1), // 拐点2（更大的弯曲度）
      new THREE.Vector3(2, -2, 1), // 拐点3
      new THREE.Vector3(4, -3, 0), // 出口（右下角）
    ]);

    // 创建管道几何体
    const tubeGeometry = new THREE.TubeGeometry(path, 100, 0.2, 16, false);

    // 创建渐变颜色
    const colors = [];
    const length = tubeGeometry.parameters.path.getLength();
    for (let i = 0; i <= tubeGeometry.attributes.position.count; i++) {
      const t = i / tubeGeometry.attributes.position.count;
      let color = new THREE.Color();

      if (t <= 0.2) {
        color.lerpColors(new THREE.Color(0xff0000), new THREE.Color(0xffff00), t / 0.2);
      } else if (t <= 0.4) {
        color.lerpColors(new THREE.Color(0xffff00), new THREE.Color(0x0000ff), (t - 0.2) / 0.2);
      } else if (t <= 0.6) {
        color.lerpColors(new THREE.Color(0x0000ff), new THREE.Color(0xffff00), (t - 0.4) / 0.2);
      } else if (t <= 0.8) {
        color.lerpColors(new THREE.Color(0xffff00), new THREE.Color(0xff0000), (t - 0.6) / 0.2);
      } else {
        color.set(0xff0000);
      }
      colors.push(color.r, color.g, color.b);
    }

    tubeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const tubeMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    });
    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tubeMesh);

    // 设置光照
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // 设置摄像机位置
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // 添加 OrbitControls 实现鼠标缩放和旋转
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 20;

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  });
</script>

<template>
  <div ref="container" style="width: 100%; height: 100vh"></div>
</template>
