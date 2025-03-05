<template>
  <div class="fabric-container">
    <h1>Fabric Canvas Demo</h1>
    <div class="toolbar">
      <button @click="startSignature">开始签名</button>
      <button @click="endSignature">结束签名</button>
      <button @click="saveSignature">保存签名</button>
      <button @click="saveTransparentSignature">保存透明签名</button>
      <button @click="clearSignature">清除签名</button>
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
  import { FabricRender, fabric } from '@fabric-fusion/core';

  const containerRef = ref<HTMLDivElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const fabricRender = new FabricRender();

  // 启用签名模式
  const startSignature = () => {
    fabricRender.canvas.isDrawingMode = true;
    fabricRender.canvas.freeDrawingBrush = new fabric.PencilBrush(fabricRender.canvas);
    fabricRender.canvas.freeDrawingBrush.width = 3;
    fabricRender.canvas.freeDrawingBrush.color = '#000';
  };

  // 结束签名模式
  const endSignature = () => {
    fabricRender.canvas.isDrawingMode = false;
  };

  // 保存签名为图片
  const saveSignature = () => {
    const dataURL = fabricRender.canvas.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'signature.png';
    link.click();
  };

  const saveTransparentSignature = () => {
    const originalBg = fabricRender.canvas.backgroundColor || '#f9f9f9'; // 备份原背景色
    fabricRender.canvas.setBackgroundColor('', () => {
      fabricRender.canvas.requestRenderAll();

      // 生成透明背景的图片
      const dataURL = fabricRender.canvas.toDataURL({ format: 'png' });

      // 触发下载
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'signature_transparent.png';
      link.click();

      // 恢复原背景色
      fabricRender.canvas.setBackgroundColor(
        originalBg,
        fabricRender.canvas.requestRenderAll.bind(fabricRender.canvas),
      );
    });
  };

  // 清除签名
  const clearSignature = () => {
    fabricRender.canvas.clear();
    fabricRender.canvas.backgroundColor = '#f9f9f9';
    fabricRender.canvas.requestRenderAll();
  };

  const resetCanvas = () => {
    fabricRender.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    fabricRender.canvas.requestRenderAll();
  };

  const clearCanvas = () => {
    fabricRender.clear();
  };

  onMounted(() => {
    if (canvasRef.value && containerRef.value) {
      fabricRender.init(
        canvasRef.value,
        {
          backgroundColor: '#f9f9f9',
          enableDefaultListeners: true,
        },
        containerRef.value,
      );
    }
  });

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
