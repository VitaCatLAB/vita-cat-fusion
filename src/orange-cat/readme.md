# Orange Cat Render Canvas

## 项目简介

Orange Cat 是一个基于 Vue + TypeScript 的画布渲染模块，支持复杂的自定义绘图，包括网格、分区、坐标轴、炮孔和爆破结构等功能。

## 目录结构

```plaintext
src/
├── orange-cat/
│   ├── canvas/
│   │   ├── core/
│   │   │   ├── fabric-render.ts
│   │   │   ├── config.ts
│   │   │   ├── events.ts
│   │   │   ├── type.ts
│   │   │   └── readme.md
│   │   ├── primitives/
│   │   │   ├── line.ts
│   │   │   ├── arc.ts
│   │   │   ├── circle.ts
│   │   │   ├── rectangle.ts
│   │   │   ├── type.ts
│   │   │   ├── index.ts
│   │   │   └── readme.md
│   │   ├── layers/
│   │   │   ├── grid-layer.ts
│   │   │   ├── axis-layer.ts
│   │   │   ├── partition-layer.ts
│   │   │   ├── hole-layer.ts
│   │   │   ├── explosive-layer.ts
│   │   │   ├── type.ts
│   │   │   ├── index.ts
│   │   │   └── readme.md
│   │   ├── utils.ts
│   │   ├── index.ts
│   │   └── readme.md
│   ├── data/
│   │   ├── transformers/
│   │   │   ├── transform-data.ts
│   │   │   ├── index.ts
│   │   │   └── readme.md
│   │   ├── type.ts
│   │   ├── mock-data.ts
│   │   ├── index.ts
│   │   └── readme.md
│   ├── main.ts
│   └── readme.md
```

## 联系方式

如果有任何问题，请联系开发团队。

优化点

1. 防抖机制

防抖原理：事件频繁触发时，仅在最后一次触发后的一段时间内执行目标函数。避免过于频繁调用 adjustCanvasSize。应用场景：拖动浏览器窗口调整大小。容器内部布局变化，导致多次触发 ResizeObserver。2. 统一使用防抖

ResizeObserver 和 window.resize 的回调都使用 debouncedAdjustCanvasSize，确保逻辑一致。3. 延迟时间的选择

防抖延迟时间设置为 100ms，在多数场景下已足够快速响应。如果需要更快速的体验，可以调整到更低值（如 50ms）

对比防抖和节流特性 防抖 节流执行时机 事件停止触发后执行 固定间隔时间内最多执行一次优势 减少无意义的频繁触发 确保事件在一定时间内始终响应场景适配 窗口调整后重新计算布局（准确） 窗口调整过程中动态渲染（流畅）

最终建议一般场景：优先使用 防抖，减少冗余计算，适合窗口调整后重新调整画布。高频动态场景：使用 节流，在调整窗口过程中动态更新，保证画布在过程中流畅渲染。

完整解决方案总结引入防抖或节流优化监听逻辑，减少性能开销。结合 ResizeObserver 和 window.resize，确保兼容性和精确响应。根据具体场景选择防抖或节流策略，实现性能和响应速度的平衡。
