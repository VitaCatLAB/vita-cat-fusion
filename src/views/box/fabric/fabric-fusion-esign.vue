<template>
  <div class="fabric-container">
    <h1>Fabric Canvas Demo</h1>
    <div class="toolbar">
      <button @click="startSignature">开始签名</button>
      <button @click="endSignature">结束签名</button>
      <button @click="saveSignature">保存签名</button>
      <button @click="getSignData">获取数据</button>
      <button @click="drawData">画图</button>
      <button @click="saveTransparentSignature">保存透明签名</button>
      <button @click="saveSvgWithOffset">保存为SVG</button>
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

  //保存为svg
  const saveSvgWithOffset = () => {
    const offsetX = 0;
    const offsetY = 100;

    // 获取画布 JSON 数据
    let json = fabricRender.canvas.toObject();

    console.log(json);

    json.objects.forEach((obj) => {
      if (obj.type === 'path') {
        // 偏移整体的 left 和 top
        obj.left += offsetX;
        obj.top += offsetY;

        // 偏移 path 内的所有点
        obj.path = obj.path.map((command) => {
          return command.map((val, index) => {
            // 跳过第一个值（M、L、Q等命令），仅对坐标进行偏移
            if (index === 0) return val;
            return index % 2 === 1 ? val + offsetX : val + offsetY;
          });
        });

        // 创建新的路径对象
        const newPath = new fabric.Path(obj.path, {
          left: obj.left,
          top: obj.top,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
          strokeLineCap: obj.strokeLineCap,
          strokeLineJoin: obj.strokeLineJoin,
          strokeMiterLimit: obj.strokeMiterLimit,
          fill: obj.fill,
          opacity: obj.opacity,
          visible: obj.visible,
        });

        // 添加到原画布
        fabricRender.canvas.add(newPath);
      }
    });

    // 渲染更新后的画布
    fabricRender.canvas.renderAll();
  };

  const drawData = () => {
    const svgPath = `
M 247 426.33
C 241.33 425.67, 246.33 426, 229.17 426
M 229.17 426
C 210.67 427.33, 217 426.33, 207.5 429.17
M 207.5 429.17
C 199 437, 204.33 431, 189.33 454.33
M 189.33 454.33
C 176 480.33, 179.67 471.67, 174.83 488.5
M 174.83 488.5
C 175.33 499.33, 173.67 496.67, 182.5 503.67
M 182.5 503.67
C 204 511, 189.67 508, 220.17 511.83
M 220.17 511.83
C 241.33 512.33, 236.33 512.67, 247.5 508.67
M 247.5 508.67
C 259 499, 253.67 505, 263.67 488.67
M 263.67 488.67
C 268.33 473, 268.33 478.33, 266 467.33
M 266 467.33
C 261.33 459.67, 263.67 461.67, 257.67 456.67
M 257.67 456.67
C 252 451.67, 254 453.67, 248.5 449.83
M 248.5 449.83
C 243.33 448, 245 448, 241.33 447.33
M 241.33 447.33
C 239 446.67, 239.33 446.67, 238.83 446.5
`;

    const path = new fabric.Path(svgPath, {
      stroke: 'black',
      fill: '',
      strokeWidth: 1,
    });

    fabricRender.add([path]);
  };
  // 保存签名为图片
  const saveSignature = () => {
    const dataURL = fabricRender.canvas.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'signature.png';
    link.click();
  };

  const getSignData = () => {
    // 获取画布 JSON 数据
    let json = fabricRender.canvas.toObject();
    console.log(json);
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
