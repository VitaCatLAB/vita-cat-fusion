<template>
  <div class="fabric-container">
    <h1>Fabric Canvas Demo</h1>
    <div class="toolbar">
      <button @click="addDesign">添加炮孔设计</button>
      <button @click="randomHoleColor">修改炮孔颜色</button>
      <button @click="resetCanvas">重置画布</button>
      <button @click="clearCanvas">清空画布</button>
      <button @click="handleSetText">设置文本</button>
      <button @click="handleGetText">获取文本</button>
      <button @click="exportFile">导出文件</button>
    </div>

    <div class="canvas-wrapper" ref="containerRef">
      <!-- <div
        v-if="tooltip.visible"
        :class="['tooltip', `tooltip-${tooltip.position}`, { 'tooltip-visible': tooltip.visible }]"
        :style="tooltipStyle"
      >
        <pre>{{ tooltip.content }}</pre>
      </div> -->
      <!-- Tooltip 组件 -->
      <Tooltip
        :visible="tooltip.visible"
        :content="tooltip.content"
        :position="tooltip.position"
        :x="tooltip.x"
        :y="tooltip.y"
      />
      <canvas id="fabric-canvas" ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // region 模块导入
  import { ref, onMounted, onUnmounted, watch, computed, reactive } from 'vue';
  import {
    FabricRender,
    fabric,
    FabricLayerManager,
    FabricObjectWithLayer,
  } from '@fabric-fusion/core';
  import { generateHoles } from '@/yunbaopo/graphics/layers/hole-layer';
  import { generatePartition } from '@/yunbaopo/graphics/layers/partition-layer';
  import { message } from 'ant-design-vue';
  import { useGraphStore } from '@/store/modules/graph';
  import { storeToRefs } from 'pinia';
  import { useTooltip } from '@/yunbaopo/composables/useTooltip';
  import Tooltip from '@/yunbaopo/graphics/components/Tooltip.vue';
  // endregion
  const { tooltip, tooltipMouseMove, tooltipMouseOut } = useTooltip();
  // region refs与实例
  const containerRef = ref<HTMLDivElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const mainRender = new FabricRender();
  const layerManager = ref<FabricLayerManager | null>(null);
  // 用于存储原始颜色
  let originalHoleColors: Map<string, string> = new Map();
  // endregion

  // region store绑定
  const graphStore = useGraphStore();
  const { canvas: graphCanvas, text } = storeToRefs(graphStore);
  // endregion

  // region 提示框管理
  // const tooltip = reactive({
  //   visible: false,
  //   content: '',
  //   x: 0,
  //   y: 0,
  //   position: 'TL' as 'TL' | 'TR' | 'BL' | 'BR', // 默认位置：左上
  // });

  // const tooltipStyle = computed(() => {
  //   let offsetX = 0;
  //   let offsetY = 0;

  //   switch (tooltip.position) {
  //     case 'TL':
  //     case 'BL':
  //       offsetX = -10;
  //       break;
  //     case 'TR':
  //     case 'BR':
  //       offsetX = 10;
  //       break;
  //   }
  //   switch (tooltip.position) {
  //     case 'TL':
  //     case 'TR':
  //       offsetY = -10;
  //       break;
  //     case 'BL':
  //     case 'BR':
  //       offsetY = 10;
  //       break;
  //   }

  //   return {
  //     top: `${tooltip.y + offsetY}px`,
  //     left: `${tooltip.x + offsetX}px`,
  //   };
  // });
  // endregion

  // region 画布管理
  const initCanvas = () => {
    if (canvasRef.value && containerRef.value) {
      mainRender.init(
        canvasRef.value,
        {
          selectionColor: 'red',
          backgroundColor: '#f9f9f9',
          enableDefaultListeners: true,
          preserveObjectStacking: true,
          customListeners: {
            'mouse:down': handleMouseDown,
            'mouse:move': handleMouseMove,
            'mouse:out': handleMouseOut,
          },
        },
        containerRef.value,
      );
      layerManager.value = new FabricLayerManager(mainRender.canvas);
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
    mainRender.canvas.off();
    mainRender.dispose();
  };
  // endregion

  // 新增随机颜色函数
  const randomHoleColor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

    // 获取 hole 图层中的所有 Group 对象
    const holeObjects = layerManager.value?.getObjectsByLayer('hole') || [];

    holeObjects.forEach((group) => {
      // 确保是 Group 对象
      if (group instanceof fabric.Group) {
        // 遍历 Group 中的所有对象
        group.forEachObject((obj) => {
          if (obj instanceof fabric.Circle) {
            // 找到 Circle 对象，改变其填充颜色
            obj.set({ fill: randomColor });
          }
        });
      }
    });

    // 重新渲染画布
    mainRender.canvas.requestRenderAll();
  };
  // 新增函数：选中炮孔并变为黑色
  const selectHole = (hole: any) => {
    let holeId = hole.metaData.hole.id;
    // 遍历 Group 内的所有对象，找到 Circle 对象并改变颜色
    hole.forEachObject((obj: any) => {
      if (obj) {
        // 如果之前没有记录原始颜色，则记录
        if (!originalHoleColors.has(holeId)) {
          originalHoleColors.set(holeId, obj.fill);
        }
        // 设置选中的颜色为黑色
        obj.set({ fill: '#000000' });
      }
    });

    // 重新渲染画布
    mainRender.canvas.requestRenderAll();
  };

  // 新增函数：取消选中并恢复原来的颜色
  const deselectHole = (hole: any) => {
    let holeId = hole.metaData.hole.id;
    hole.forEachObject((obj) => {
      if (obj instanceof fabric.Circle) {
        // 恢复原来的颜色
        const originalColor = originalHoleColors.get(holeId);
        if (originalColor) {
          obj.set({ fill: originalColor });
        }
      }
    });

    // 清除该炮孔的记录
    originalHoleColors.delete(holeId);

    // 重新渲染画布
    mainRender.canvas.requestRenderAll();
  };

  // region 图层生成
  const generateHoleObjects = (): fabric.Object[] => {
    return generateHoles({
      fill: '#ff0000',
      stroke: '#ffff00',
      radius: 15,
      selectable: true,
      onClick: (holeData) => console.log('点击了炮孔:', holeData),
      onHover: (holeData) => console.log('悬停在炮孔上:', holeData),
    });
  };

  const generatePartitionObjects = (): fabric.Object[] => {
    return generatePartition({
      fill: '#00ff00',
      onClick: (data) => console.log('点击了分区:', data),
      onHover: (data) => console.log('悬停在分区上:', data),
    });
  };

  const layerGenerators: Record<string, () => fabric.Object[]> = {
    hole: generateHoleObjects,
    partition: generatePartitionObjects,
  };

  /**
   * 初始化绘制图层
   */
  const drawInit = (layersToReset: string[] = ['partition', 'hole']) => {
    layersToReset.forEach((layer) => {
      const generator = layerGenerators[layer];
      if (generator && layerManager.value) {
        // 先移除旧的
        layerManager.value.removeLayer(layer);
        // 再重新生成新的
        const objects = generator() as FabricObjectWithLayer[];
        layerManager.value.addToLayer(objects, layer);
      } else {
        console.warn(`图层 ${layer} 未定义`);
      }
    });
  };
  // endregion

  // region 文件导出
  const exportFile = () => {
    message.info('导出 SVG 文件');
    const objs = generatePartitionObjects();
    const group = new fabric.Group(objs, {});

    const svg = group.toSVG();
    const png = group.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    console.log('导出内容:', { svg, png });
  };
  // endregion

  // region 自定义事件
  /**
   * 处理鼠标点击事件
   * @param opt Fabric 事件对象
   */
  const handleMouseDown = (opt: fabric.IEvent) => {
    const pointer = mainRender.canvas.getPointer(opt.e);
    console.log(`鼠标点击坐标 x: ${pointer.x}, y: ${pointer.y}`);
    const target: any = opt.target;
    console.log(target);

    if (target && target.layer === 'hole') {
      // 判断目标是否是炮孔（Group），然后执行选中或取消选中的操作
      if (originalHoleColors.has(target.metaData.hole)) {
        // 如果该炮孔已经被选中，取消选中
        deselectHole(target);
      } else {
        // 如果该炮孔没有被选中，选中该炮孔
        selectHole(target);
      }
    } else {
      drawInit(['hole']);
    }
  };

  /**
   * 处理鼠标移动事件，控制提示框
   * @param opt Fabric 事件对象
   */
  const handleMouseMove = (opt: fabric.IEvent) => {
    tooltipMouseMove(opt, mainRender.canvas);
    // const target = opt.target as any;
    // if (target && target.tooltip) {
    //   const pointer = mainRender.canvas.getPointer(opt.e);
    //   tooltip.visible = true;
    //   tooltip.content = target.tooltip;
    //   const viewportTransform = mainRender.canvas.viewportTransform;
    //   if (viewportTransform) {
    //     const centerPoint = new fabric.Point(target.left ?? 0, target.top ?? 0);
    //     const transformedPoint = fabric.util.transformPoint(centerPoint, viewportTransform);
    //     tooltip.x = transformedPoint.x;
    //     tooltip.y = transformedPoint.y;
    //   } else {
    //     tooltip.x = target.left ?? 0;
    //     tooltip.y = target.top ?? 0;
    //   }
    //   tooltip.position = target.tooltipPosition || 'TL';
    // } else {
    //   tooltip.visible = false;
    // }
  };

  /**
   * 处理鼠标移出事件，隐藏提示框
   */
  const handleMouseOut = () => {
    tooltipMouseOut();
    // tooltip.visible = false;
  };
  // endregion

  // region 按钮动作
  /**
   * 添加炮孔设计
   */
  const addDesign = () => {
    graphStore.setCanvasUUID();
  };

  /**
   * 获取文本内容
   */
  const handleGetText = () => {
    console.log('当前文本:', text.value);
  };

  /**
   * 设置新的文本
   */
  const handleSetText = () => {
    graphStore.setText();
  };
  // endregion

  // region 监听器
  watch(
    () => graphCanvas.value.uuid,
    () => {
      clearCanvas();
      drawInit();
    },
  );
  // endregion

  // region 生命周期钩子
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
    z-index: 10;
    padding: 8px 12px;
    transform: translateY(-10px);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
    border-radius: 4px;
    opacity: 0;
    background: rgb(50 50 50 / 85%);
    color: #fff;
    font-size: 12px;
    white-space: pre-wrap;
    pointer-events: none;
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
