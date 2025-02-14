<template>
  <div class="fabric-container">
    <h1>Fabric Canvas Demo</h1>
    <div class="toolbar">
      <button @click="addRectangle">添加矩形1</button>
      <button @click="addTunnel">添加隧道</button>
      <button @click="addCircle">添加圆形</button>
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

  // 定义容器和画布的引用
  const containerRef = ref<HTMLDivElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const mainRender = new FabricRender();

  const uuid = ref('');

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

  const addTunnel = () => {
    const circle = new fabric.Circle({
      radius: 100,
      fill: 'transparent',
      originX: 'center',
      originY: 'center',
    });

    //设为空心圆
    circle.set({
      stroke: 'black',
      strokeWidth: 2,
    });
    //位置至画布中心
    circle.set({
      left: mainRender.canvas.getWidth() / 2,
      top: mainRender.canvas.getHeight() / 2,
    });

    mainRender.add([circle], true);
  };

  // 添加矩形
  const addRectangle = () => {
    mainRender.add(
      [
        new fabric.Rect({
          left: Math.random() * 200,
          top: Math.random() * 200,
          width: 100,
          height: 100,
          fill: 'blue',
        }),
      ],
      false,
    );
  };

  // 添加圆形
  const addCircle = () => {
    mainRender.add(
      [
        new fabric.Circle({
          left: Math.random() * 200,
          top: Math.random() * 200,
          radius: 50,
          fill: 'green',
        }),
      ],
      true,
    );
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
          selectionColor: 'red', //fabric配置项
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
