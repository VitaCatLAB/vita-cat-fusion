<template>
  <div class="fabric-container">
    <h1>Fabric Canvas Demo</h1>
    <div class="toolbar">
      <button @click="addRectangle">添加矩形</button>
      <button @click="addCircle">添加圆形</button>
      <button @click="resetCanvas">重置画布</button>
      <button @click="clearCanvas">清空画布</button>
    </div>
    <div class="canvas-wrapper" ref="containerRef">
      <canvas id="fabric-canvas" ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { FabricRender, fabric } from '@/orange-cat';

  // 定义容器和画布的引用
  const containerRef = ref<HTMLDivElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const fabricRender = new FabricRender();

  // 添加矩形
  const addRectangle = () => {
    fabricRender.add(
      new fabric.Rect({
        left: Math.random() * 200,
        top: Math.random() * 200,
        width: 50,
        height: 50,
        fill: 'blue',
      }),
    );
  };

  // 添加圆形
  const addCircle = () => {
    fabricRender.add(
      new fabric.Circle({
        left: Math.random() * 200,
        top: Math.random() * 200,
        radius: 25,
        fill: 'green',
      }),
    );
  };

  // 重置画布视口
  const resetCanvas = () => {
    fabricRender.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    fabricRender.canvas.requestRenderAll();
  };

  // 清空画布
  const clearCanvas = () => {
    fabricRender.clear();
  };

  // 自定义监听事件 - 鼠标点击事件
  const customMouseDownHandler = (opt: any) => {
    const pointer = fabricRender.canvas.getPointer(opt.e);
    console.log(`自定义事件：鼠标点击位置 x: ${pointer.x}, y: ${pointer.y}`);
  };

  // Vue 生命周期钩子 - 组件挂载时初始化
  onMounted(() => {
    if (canvasRef.value && containerRef.value) {
      fabricRender.init(
        canvasRef.value,
        {
          backgroundColor: '#f9f9f9', // 设置画布背景颜色
          enableDefaultListeners: true, // 启用默认事件监听器
          customListeners: {
            'mouse:down': customMouseDownHandler, // 添加自定义的鼠标点击事件
          },
        },
        containerRef.value,
      );
    }
  });

  // Vue 生命周期钩子 - 组件卸载时清理资源
  onUnmounted(() => {
    fabricRender.dispose();
  });
</script>

<style scoped>
  .fabric-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .toolbar {
    margin-bottom: 20px;
  }

  .toolbar button {
    margin-right: 10px;
    padding: 10px;
    font-size: 14px;
    cursor: pointer;
  }

  .canvas-wrapper {
    position: relative;
    width: 100%;
    height: 600px;
    border: 1px solid #ccc;
  }
</style>
