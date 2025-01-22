#!/bin/bash

# 创建目录结构
mkdir -p orange-cat/canvas/{core,primitives,layers} orange-cat/data/transformers

# 创建主目录的 README.md
echo -e "# Orange Cat Render Canvas\n\n## 项目简介\n\nOrange Cat 是一个基于 Vue + TypeScript 的画布渲染模块，支持复杂的自定义绘图，包括网格、分区、坐标轴、炮孔和爆破结构等功能。\n\n## 目录结构\n\n\`\`\`plaintext\nsrc/\n├── orange-cat/\n│   ├── canvas/\n│   │   ├── core/\n│   │   │   ├── fabric-render.ts\n│   │   │   ├── config.ts\n│   │   │   ├── events.ts\n│   │   │   ├── type.ts\n│   │   │   └── readme.md\n│   │   ├── primitives/\n│   │   │   ├── line.ts\n│   │   │   ├── arc.ts\n│   │   │   ├── circle.ts\n│   │   │   ├── rectangle.ts\n│   │   │   ├── type.ts\n│   │   │   ├── index.ts\n│   │   │   └── readme.md\n│   │   ├── layers/\n│   │   │   ├── grid-layer.ts\n│   │   │   ├── axis-layer.ts\n│   │   │   ├── partition-layer.ts\n│   │   │   ├── hole-layer.ts\n│   │   │   ├── explosive-layer.ts\n│   │   │   ├── type.ts\n│   │   │   ├── index.ts\n│   │   │   └── readme.md\n│   │   ├── utils.ts\n│   │   ├── index.ts\n│   │   └── readme.md\n│   ├── data/\n│   │   ├── transformers/\n│   │   │   ├── transform-data.ts\n│   │   │   ├── index.ts\n│   │   │   └── readme.md\n│   │   ├── type.ts\n│   │   ├── mock-data.ts\n│   │   ├── index.ts\n│   │   └── readme.md\n│   ├── main.ts\n│   └── readme.md\n\`\`\`\n\n## 联系方式\n\n如果有任何问题，请联系开发团队。" > orange-cat/readme.md

# 创建 canvas 子目录的 README.md
echo -e "# Canvas 模块\n\n主要存放画布渲染模块，包括核心模块、基础图形及业务图层。" > orange-cat/canvas/readme.md

# 创建 core 子目录的 README.md
echo -e "# Core 核心模块\n\n核心模块，包括 Fabric 渲染类、事件处理等功能。" > orange-cat/canvas/core/readme.md

# 创建 primitives 子目录的 README.md
echo -e "# Primitives 基础绘图元素\n\n封装基础绘图元素，如直线、弧线、矩形等。" > orange-cat/canvas/primitives/readme.md

# 创建 layers 子目录的 README.md
echo -e "# Layers 业务图层\n\n实现业务逻辑相关图层绘制，如网格、坐标轴、炮孔等。" > orange-cat/canvas/layers/readme.md

# 创建 data 子目录的 README.md
echo -e "# Data 数据模块\n\n存放数据处理逻辑，包括数据转换工具和示例数据。" > orange-cat/data/readme.md

# 创建 transformers 子目录的 README.md
echo -e "# Transformers 数据转换\n\n数据转换模块，用于将原始数据转换为绘图数据。" > orange-cat/data/transformers/readme.md

# 创建必要的代码文件
touch orange-cat/canvas/core/{fabric-render.ts,config.ts,events.ts,type.ts}
touch orange-cat/canvas/primitives/{line.ts,arc.ts,circle.ts,rectangle.ts,type.ts,index.ts}
touch orange-cat/canvas/layers/{grid-layer.ts,axis-layer.ts,partition-layer.ts,hole-layer.ts,explosive-layer.ts,type.ts,index.ts}
touch orange-cat/canvas/{utils.ts,index.ts}
touch orange-cat/data/transformers/{transform-data.ts,index.ts}
touch orange-cat/data/{type.ts,mock-data.ts,index.ts}
touch orange-cat/main.ts

echo "目录结构和文件已生成完成！"
