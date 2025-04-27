<template>
  <div class="fabric-container">
    <h1>Fabric Canvas Demo</h1>
    <div class="toolbar">
      <button @click="addDesign">添加炮孔设计</button>
      <button @click="resetCanvas">重置画布</button>
      <button @click="clearCanvas">清空画布</button>
      <button @click="handleSetText">--/{{ text }}--/</button>
      <button @click="handleGetText">get</button>
      <button @click="exportFile">EXPORT FILE</button>
      {{ graphCanvas.uuid }}
    </div>
    <div class="canvas-wrapper" ref="containerRef">
      <div
        v-if="tooltip.visible"
        :class="['tooltip', `tooltip-${tooltip.position}`, { 'tooltip-visible': tooltip.visible }]"
        :style="tooltipStyle"
      >
        <pre>{{ tooltip.content }}</pre>
      </div>
      <canvas id="fabric-canvas" ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, watch, computed, reactive } from 'vue';
  import { FabricRender, fabric } from '@fabric-fusion/core';
  import { generateHoles } from '@/yunbaopo/graphics/layers/hole-layer';
  import { generatePartition } from '@/yunbaopo/graphics/layers/partition-layer';
  import { message } from 'ant-design-vue';
  import { useGraphStore } from '@/store/modules/graph';
  import { storeToRefs } from 'pinia';

  // region refs and instances
  const containerRef = ref<HTMLDivElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const mainRender = new FabricRender();

  // endregion

  const graphStore = useGraphStore();
  const { canvas: graphCanvas, text } = storeToRefs(graphStore);

  // region tooltip
  const tooltip = reactive({
    visible: false,
    content: '',
    x: 0,
    y: 0,
    position: 'TL' as 'TL' | 'TR' | 'BL' | 'BR', // 默认方向：左上
  });
  const tooltipStyle = computed(() => {
    let offsetX = 0;
    let offsetY = 0;

    switch (tooltip.position) {
      case 'TL':
        offsetX = -10;
        offsetY = -10;
        break;
      case 'TR':
        offsetX = 10;
        offsetY = -10;
        break;
      case 'BL':
        offsetX = -10;
        offsetY = 10;
        break;
      case 'BR':
        offsetX = 10;
        offsetY = 10;
        break;
    }

    return {
      top: `${tooltip.y + offsetY}px`,
      left: `${tooltip.x + offsetX}px`,
    };
  });
  // endregion

  // region canvas management
  const initCanvas = () => {
    if (canvasRef.value && containerRef.value) {
      mainRender.init(
        canvasRef.value,
        {
          selectionColor: 'red',
          backgroundColor: '#f9f9f9',
          enableDefaultListeners: true,
          customListeners: {
            'mouse:down': handleMouseDown,
            'mouse:move': handleMouseMove,
            'mouse:out': handleMouseOut,
          },
        },
        containerRef.value,
      );
    }
  };

  const clearCanvas = () => {
    mainRender.clear();
  };

  const resetCanvas = () => {
    mainRender.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    mainRender.canvas.requestRenderAll();
  };

  const disposeCanvas = () => {
    mainRender.dispose();
  };
  // endregion

  // region layer generators
  const generateHoleObjects = (): fabric.Object[] => {
    return generateHoles({
      fill: '#ff0000',
      stroke: '#ffff00',
      radius: 15,
      selectable: true,
      onClick: (holeData) => console.log('点击了炮孔:', holeData),
      onHover: (holeData) => console.log('鼠标悬停在炮孔上:', holeData),
    });
  };

  const generatePartitionObjects = (): fabric.Object[] => {
    return generatePartition({
      fill: '#00ff00',
      onClick: (data) => console.log('点击了 partition:', data),
      onHover: (data) => console.log('鼠标悬停在 partition 上:', data),
    });
  };

  const layerGenerators: Record<string, () => fabric.Object[]> = {
    hole: generateHoleObjects,
    partition: generatePartitionObjects,
  };

  const drawInit = () => {
    const currentSort = ['partition', 'hole'];
    currentSort.forEach((layer) => {
      const generator = layerGenerators[layer];
      if (generator) {
        mainRender.add(generator());
      } else {
        console.warn(`图层 ${layer} 不存在`);
      }
    });
  };
  // endregion

  // region file export
  const exportFile = () => {
    message.info('导出 SVG');
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
  // endregion

  // region custom events
  const handleMouseDown = (opt: fabric.IEvent) => {
    const pointer = mainRender.canvas.getPointer(opt.e);
    console.log(`鼠标点击位置 x: ${pointer.x}, y: ${pointer.y}`);
  };

  const handleMouseMove = (opt: fabric.IEvent) => {
    const target = opt.target as any;

    if (target && target.tooltip) {
      const pointer = mainRender.canvas.getPointer(opt.e);
      tooltip.visible = true;
      tooltip.content = target.tooltip;

      // 关键改动：正确计算目标在屏幕上的位置
      const viewportTransform = mainRender.canvas.viewportTransform;
      if (viewportTransform) {
        const centerPoint = new fabric.Point(target.left ?? 0, target.top ?? 0);
        const transformedPoint = fabric.util.transformPoint(centerPoint, viewportTransform);
        tooltip.x = transformedPoint.x;
        tooltip.y = transformedPoint.y;
      } else {
        tooltip.x = target.left ?? 0;
        tooltip.y = target.top ?? 0;
      }

      tooltip.position = target.tooltipPosition || 'TL'; // 如果有指定方向，使用
    } else {
      tooltip.visible = false;
    }
  };

  const handleMouseOut = () => {
    tooltip.visible = false;
  };
  // endregion

  // region buttons action
  const addDesign = () => {
    graphStore.setCanvasUUID();
  };

  // endregion

  const handleGetText = () => {
    console.log(text.value);
  };
  const handleSetText = () => {
    graphStore.setText();
  };

  // region watch
  watch(
    () => graphCanvas.value.uuid,
    () => {
      clearCanvas();
      drawInit();
    },
  );
  // endregion

  // region lifecycle
  onMounted(() => {
    initCanvas();
  });

  onUnmounted(() => {
    disposeCanvas();
  });
  // endregion
</script>

<style lang="less" scoped>
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

  .tooltip {
    position: absolute;
    background: rgba(50, 50, 50, 0.85);
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    white-space: pre-wrap;
    opacity: 0;
    z-index: 10;
    transform: translateY(-10px);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .tooltip-TL {
    transform: translate(-10px, -10px);
  }
  .tooltip-TR {
    transform: translate(10px, -10px);
  }
  .tooltip-BL {
    transform: translate(-10px, 10px);
  }
  .tooltip-BR {
    transform: translate(10px, 10px);
  }

  .tooltip-visible {
    opacity: 1;
  }
</style>
