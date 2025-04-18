<template>
  <div class="fabric-container">
    <h1>Fabric Canvas Demo</h1>
    <div class="toolbar">
      <button @click="startDrawLine">开启画横线</button>
      <button @click="endDrawLine">结束画横线</button
      ><button @click="startDrawPolyline">开启画多段线</button>
      <button @click="endDrawPolyline">结束画多段线</button>

      <button @click="getData">getData</button>

      <button @click="resetCanvas">重置画布</button>
      <button @click="clearCanvas">清空画布</button>
      <button @click="setUUID">SET UUID</button>
      <button @click="exportFile">EXPORT FILE</button>
    </div>
    <div class="canvas-wrapper" ref="containerRef">
      <canvas id="fabric-canvas" ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { FabricRender, fabric } from '@fabric-fusion/core';

  import { generateHoles } from '@/yunbaopo/graphics/layers/hole-layer';
  import { generateObjects } from '@/yunbaopo/graphics/layers/simple-layer';
  import { generatePartition } from '@/yunbaopo/graphics/layers/partition-layer';
  import { message } from 'ant-design-vue';

  let tempPolyline: fabric.Polyline | null = null;
  // 定义容器和画布的引用
  const containerRef = ref<HTMLDivElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const mainRender = new FabricRender();
  // 多段线绘制状态
  let isDrawingPolyline = false;
  let polylinePoints: { x: number; y: number }[] = [];
  let guideLine: fabric.Line | null = null;
  const uuid = ref('');
  let isDrawing = false;
  let currentLine: fabric.Line | null = null;
  const setUUID = () => {
    uuid.value = Math.random().toString();
  };

  const exportFile = () => {
    message.info('导出SVG-generatePartitionObjects');
    const objs = generatePartitionObjects();
    const group = new fabric.Group(objs, {});

    const svg = group.toSVG();
    const png = group.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    console.log('file', {
      svg,
      png,
    });
  };

  const generateHoleObjects = (): fabric.Object[] => {
    return generateHoles({
      fill: '#ff0000', // 红色炮孔
      stroke: '#ffff00', // 黄色边框
      radius: 15,
      selectable: true,
      onClick: (holeData) => console.log('点击了炮孔:', holeData),
      onHover: (holeData) => console.log('鼠标悬停在炮孔上:', holeData),
    });
  };

  const generateTestObjects = (): fabric.Object[] => {
    return generateObjects({
      fill: '#ff0000',
      onClick: (data) => console.log('点击了测试对象:', data),
      onHover: (data) => console.log('鼠标悬停在测试对象上:', data),
    });
  };

  const generatePartitionObjects = (): fabric.Object[] => {
    return generatePartition({
      fill: '#00ff00', // 绿色 partition
      onClick: (data) => console.log('点击了 partition:', data),
      onHover: (data) => console.log('鼠标悬停在 partition 上:', data),
    });
  };
  const drawInit = () => {
    const currentSort = ['hole', 'partition', 'test']; // 控制绘制顺序

    //  将绘制方法拆分，提高可读性

    //  将绘制方法映射到 `layerGenerators`
    const layerGenerators: Record<string, () => fabric.Object[]> = {
      hole: generateHoleObjects,
      test: generateTestObjects,
      partition: generatePartitionObjects,
    };

    //  遍历 `currentSort`，按顺序加载图层
    currentSort.forEach((layer) => {
      if (layerGenerators[layer]) {
        mainRender.add(layerGenerators[layer]()); // 依次添加到 Fabric 画布
      } else {
        console.log(`图层 ${layer} 不存在`);
      }
    });
  };

  watch(
    () => uuid.value,
    () => {
      clearCanvas();
      drawInit();
    },
  );
  const getData = () => {
    console.log(mainRender.canvas.toJSON());
  };

  // 开启多段线绘制
  const startDrawPolyline = () => {
    isDrawingPolyline = true;
    polylinePoints = [];
    guideLine = null;

    mainRender.canvas.on('mouse:down', handlePolylineMouseDown);
    mainRender.canvas.on('mouse:move', handlePolylineMouseMove);
    mainRender.canvas.on('mouse:down', handleRightClickToEnd); // 👈 增加右键监听

    message.success('多段线绘制已开启（右键可结束）');
  };

  // 结束多段线绘制
  const endDrawPolyline = () => {
    isDrawingPolyline = false;
    mainRender.canvas.off('mouse:down', handlePolylineMouseDown);
    mainRender.canvas.off('mouse:move', handlePolylineMouseMove);

    if (polylinePoints.length >= 2) {
      const polyline = new fabric.Polyline(polylinePoints, {
        stroke: 'blue',
        strokeWidth: 2,
        fill: '',
        selectable: true,
      });
      mainRender.canvas.add(polyline);
    }

    // 清除引导线
    if (guideLine) {
      mainRender.canvas.remove(guideLine);
      guideLine = null;
    }
    // ✅ 清除临时 polyline
    if (tempPolyline) {
      mainRender.canvas.remove(tempPolyline);
      tempPolyline = null;
    }

    mainRender.canvas.requestRenderAll();
    polylinePoints = [];
    message.success('多段线绘制已结束');
  };

  // 点击添加点
  const handlePolylineMouseDown = (opt: fabric.IEvent) => {
    if (!isDrawingPolyline) return;

    const pointer = mainRender.canvas.getPointer(opt.e);
    polylinePoints.push({ x: pointer.x, y: pointer.y });

    // 移除旧的临时 polyline
    if (tempPolyline) {
      mainRender.canvas.remove(tempPolyline);
      tempPolyline = null;
    }

    // 重建新的 polyline（已有点）
    if (polylinePoints.length >= 2) {
      tempPolyline = new fabric.Polyline(polylinePoints, {
        stroke: 'blue',
        strokeWidth: 2,
        fill: '',
        selectable: false,
        evented: false,
      });
      mainRender.canvas.add(tempPolyline);
    }

    // 每次添加点后重建 guideLine
    if (guideLine) {
      mainRender.canvas.remove(guideLine);
      guideLine = null;
    }
  };

  // 鼠标移动时更新引导线
  const handlePolylineMouseMove = (opt: fabric.IEvent) => {
    if (!isDrawingPolyline || polylinePoints.length === 0) return;

    const lastPoint = polylinePoints[polylinePoints.length - 1];
    const pointer = mainRender.canvas.getPointer(opt.e);

    if (!guideLine) {
      guideLine = new fabric.Line([lastPoint.x, lastPoint.y, pointer.x, pointer.y], {
        stroke: 'gray',
        strokeWidth: 1,
        selectable: false,
        evented: false,
        strokeDashArray: [5, 5],
      });
      mainRender.canvas.add(guideLine);
    } else {
      guideLine.set({ x1: lastPoint.x, y1: lastPoint.y, x2: pointer.x, y2: pointer.y });
    }

    mainRender.canvas.requestRenderAll();
  };

  const handleRightClickToEnd = (opt: fabric.IEvent) => {
    let opt1: any = opt;
    if (!isDrawingPolyline) return;

    if (opt1.e.button === 2) {
      (opt1.e as MouseEvent).preventDefault();
      endDrawPolyline();
    }
  };
  // 开始绘制直线
  const startDrawLine = () => {
    isDrawing = true;
    mainRender.canvas.on('mouse:down', onMouseDown);
    mainRender.canvas.on('mouse:move', onMouseMove);
    mainRender.canvas.on('mouse:up', onMouseUp);
    message.success('已开启绘制直线');
  };

  // 结束绘制直线
  const endDrawLine = () => {
    isDrawing = false;
    mainRender.canvas.off('mouse:down', onMouseDown);
    mainRender.canvas.off('mouse:move', onMouseMove);
    mainRender.canvas.off('mouse:up', onMouseUp);
    message.success('已结束绘制直线');
  };

  const onMouseDown = (opt: fabric.IEvent) => {
    if (!isDrawing) return;
    const pointer = mainRender.canvas.getPointer(opt.e);
    const points = [pointer.x, pointer.y, pointer.x, pointer.y];
    currentLine = new fabric.Line(points, {
      strokeWidth: 2,
      fill: 'blue',
      stroke: 'blue',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    mainRender.canvas.add(currentLine);
  };

  const onMouseMove = (opt: fabric.IEvent) => {
    if (!isDrawing || !currentLine) return;
    const pointer = mainRender.canvas.getPointer(opt.e);
    currentLine.set({ x2: pointer.x, y2: pointer.y });
    mainRender.canvas.requestRenderAll();
  };

  const onMouseUp = () => {
    if (!isDrawing) return;
    currentLine = null;
  };
  // 重置画布视口
  const resetCanvas = () => {
    mainRender.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    mainRender.canvas.requestRenderAll();
  };

  // 清空画布
  const clearCanvas = () => {
    mainRender.clear();
  };

  // 自定义监听事件 - 鼠标点击事件
  const customMouseDownHandler = (opt: any) => {
    const pointer = mainRender.canvas.getPointer(opt.e);
    console.log(`自定义事件：鼠标点击位置 x: ${pointer.x}, y: ${pointer.y}`);
  };

  // Vue 生命周期钩子 - 组件挂载时初始化
  onMounted(() => {
    if (canvasRef.value && containerRef.value) {
      mainRender.init(
        canvasRef.value,
        {
          // selectionColor: 'red', //fabric配置项
          backgroundColor: '#f9f9f9', // 设置画布背景颜色
          enableDefaultListeners: true, // 启用默认事件监听器
          stopContextMenu: true,
          fireRightClick: true, // 启用右键，button的数字为3,
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
    mainRender.dispose();
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
