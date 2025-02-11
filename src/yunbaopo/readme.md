# yunbaopo

```bash
yunbaopo
├── components               # Vue 组件
├── converters               # 单一用途数据转换器
├── gen                      # 计算和生成数据
│   ├── calculate-hole-depth.ts
│   ├── generate-inner-xy.ts
│   └── ...
├── graphics                 # 绘图相关
│   ├── layers
│   ├── primitives
│   ├── utils
│   └── ...
├── processors               # **数据处理模块**
│   ├── hole-group-processor.ts  # 炮孔组数据处理
│   ├── another-processor.ts     # 未来可能增加的类似文件
│   ├── some-other-processor.ts
│   └── ...
├── services                 # API 交互
├── transformers             # 其他数据转换
│   ├── blast-hole-transformer.ts
│   ├── ...
```
