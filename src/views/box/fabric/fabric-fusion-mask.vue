<template>
  <div class="fabric-container">
    <h1>Fabric Canvas Demo</h1>
    <div class="toolbar">
      <button @click="addMaskedImage">添加矩形</button>
      <button @click="addTunnel">添加隧道</button>
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
  import { FabricRender, fabric } from '@fabric-fusion/core';
  // import { FabricRender, fabric } from '@/orange-cat/canvas';
  import DemoImg from '@/assets/images/demo.png';
  import LogoImg from '@/assets/images/logo.png';
  import { message } from 'ant-design-vue';

  // 定义容器和画布的引用
  const containerRef = ref<HTMLDivElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const mainRender = new FabricRender();

  const msgKey = 'msgKey';

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
  const addMaskedImage = async () => {
    const imgurl = `/img/Trash/WechatIMG7093.jpg` + '?v=' + Date.now(); // 图片路径
    const canvasWidth = mainRender.canvas.getWidth();
    const canvasHeight = mainRender.canvas.getHeight();

    console.log(canvasWidth, canvasHeight);

    // 图片加载和设置的通用函数
    const loadImage = (url: string, applyFilters: boolean): Promise<fabric.Image> => {
      return new Promise((resolve) => {
        fabric.Image.fromURL(url, (img) => {
          const imgW = img.width || 0;
          const imgH = img.height || 0;

          // 计算等比缩放比例，确保不会翻转
          // const scale = Math.min(canvasWidth / imgW, canvasHeight / imgH);

          const scaleX = canvasWidth / imgW;
          const scaleY = canvasHeight / imgH;
          // 设置图片适应画布大小
          img.set({
            left: 0,
            top: 0,
            selectable: false, // 禁止选择
            scaleX: scaleX,
            scaleY: scaleY,
          });

          // 如果需要，应用变暗效果
          if (applyFilters) {
            img.filters?.push(new fabric.Image.filters.Brightness({ brightness: -0.15 }));
            img.applyFilters();
          }

          resolve(img); // 图片加载完成后返回 img 对象
        });
      });
    };

    (async () => {
      message.info({ content: '加载图片1...', key: msgKey });

      const img1 = await loadImage(imgurl, true);
      mainRender.add([img1], false); // 添加第一张图片（变暗）
      message.info({ content: '加载图片2...', key: msgKey });
      const img2 = await loadImage(imgurl, false);
      message.info({ content: '处理图片2...', key: msgKey });
      // 创建梯形路径
      const path = `M 0 100
            L 100 0
            L 300 0
            L 400 100
            Z`;

      const shellTop = canvasHeight / 2;
      const shellLeft = canvasWidth / 2;
      // 创建一个路径对象（边框）
      const shell = new fabric.Path(path, {
        top: shellTop,
        left: shellLeft,
        fill: '',
        stroke: 'blue', // 边框颜色
        strokeWidth: 2, // 边框宽度
        scaleX: 2, // 缩放
        scaleY: 2,
        lockScalingFlip: true, // 禁止翻转
        // lockScalingX: true, // 锁定X轴缩放
        // lockScalingY: true, // 锁定Y轴缩放
        lockSkewingX: true, // 锁定X轴倾斜
        lockSkewingY: true, // 锁定Y轴倾斜
        originX: 'center',
        originY: 'center',
        //禁止旋转
        lockRotation: true,
      });

      // 创建剪裁路径
      const clipPath = new fabric.Path(path, {
        top: shellTop,
        left: shellLeft,
        absolutePositioned: true,
        originX: 'center',
        originY: 'center',
        scaleX: 2,
        scaleY: 2,
      });

      // 当路径移动时，更新剪裁路径的位置
      shell.on('moving', ({ e, transform, pointer }) => {
        clipPath.setPositionByOrigin(shell.getCenterPoint(), 'center', 'center');
        img2.set('dirty', true); // 标记图片需要重绘
      });
      //当路径缩放时，更新剪裁路径的位置和尺寸大小
      shell.on('scaling', ({ e, transform, pointer }) => {
        clipPath.setPositionByOrigin(shell.getCenterPoint(), 'center', 'center');

        clipPath.scaleX = shell.scaleX;
        clipPath.scaleY = shell.scaleY;
        img2.set('dirty', true);
      });

      // 将路径作为蒙版应用到图片
      img2.clipPath = clipPath;

      mainRender.add([img2, shell], false); // 添加第二张图片（原色）
      message.success({ content: '处理完成...', key: msgKey });
    })();
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
      fabric.textureSize = 9120;
      mainRender.init(
        canvasRef.value,
        {
          backgroundColor: '#f9f9f9', // 设置画布背景颜色
          enableDefaultListeners: false, // 启用默认事件监听器
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
