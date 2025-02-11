# Layers 业务图层

实现业务逻辑相关图层绘制，如网格、坐标轴、炮孔等。

## 示例代码

> `simple-layer.ts`

### **Fabric.js 绘制方法开发指南**

> **适用于 Vue + Fabric.js 项目**  
> 本指南基于 `simple-layer.ts`，适用于开发 **各种 Fabric.js 绘制方法**，如炮孔、轮廓线、其他形状等。

---

## **📌 1. Fabric.js 绘制方法的基本结构**

在 `Fabric.js` 项目中，绘制方法通常包含以下几个部分：

1. **数据获取**：从业务数据中提取待绘制的图形信息。
2. **参数定义**：定义可定制的绘制参数，如颜色、大小、文本等，增强灵活性。
3. **Fabric.js 对象创建**：
   - 使用 `fabric.Circle`、`fabric.Text`、`fabric.Rect`、`fabric.Line` 等对象创建图形。
   - 可以组合多个对象形成 `fabric.Group`，以保持图形的逻辑关系。
4. **事件绑定**：支持 `onClick`、`onHover` 等交互事件，提升用户体验。
5. **返回 `fabric.Object[]` 列表**：
   - **方法不直接操作 `mainRender`，而是返回 `fabric.Object[]`**，让 Vue 组件控制何时、如何添加到画布。

---

## **📌 2. `simple-layer.ts` 示例**

以下是 **Fabric.js 圆形对象绘制方法**，请参考此示例编写其他绘制方法。

```typescript
import { fabric } from '@fabric-fusion/core';

/**
 * @description 生成炮孔 Fabric.js 对象列表，每个元素是独立的 `fabric.Group`
 * @param {object} options - 额外的自定义配置
 * @param {string} [options.fill='#000000'] - 炮孔填充颜色
 * @param {Function} [options.onClick] - 炮孔点击回调函数 (data) => void
 * @param {Function} [options.onHover] - 炮孔悬停回调函数 (data) => void
 * @returns {fabric.Object[]} - 生成的炮孔 Fabric 组对象列表（每个炮孔是 `fabric.Group`）
 */
export const generateObjects = (
  options: {
    fill?: string;
    onClick?: (data: any) => void;
    onHover?: (data: any) => void;
  } = {},
): fabric.Object[] => {
  // 默认参数
  const config = {
    fill: '#000000',
    stroke: '#00e100',
    radius: 10,
    ...options, // 合并用户自定义参数
  };

  // 存储 Fabric.js 对象
  const fabricObjects: fabric.Object[] = [];

  /// 绘制图形 ///
  const count = 2;

  for (let i = 0; i < count; i++) {
    const circle = new fabric.Circle({
      radius: config.radius,
      fill: config.fill,
      stroke: config.stroke,
      left: 100,
      top: 100,
    });

    const data = {
      id: i,
      name: `Circle ${i}`,
      // 其他数据...
    };

    // 绑定点击事件
    if (config.onClick) {
      circle.on('mousedown', () => config.onClick?.(data));
    }

    // 绑定悬停事件
    if (config.onHover) {
      circle.on('mouseover', () => config.onHover?.(data));
    }
    fabricObjects.push(circle);
  }

  return fabricObjects;
};
```

---

## **📌 3. 关键 API 解析**

| API                      | 作用                                  |
| ------------------------ | ------------------------------------- |
| `fabric.Circle({...})`   | 创建圆形（炮孔）                      |
| `fabric.Rect({...})`     | 创建矩形（其他形状）                  |
| `fabric.Line({...})`     | 创建线段（轮廓线）                    |
| `fabric.Text({...})`     | 创建文本（炮孔名称）                  |
| `fabric.Group([...])`    | 组合多个 `fabric.Object` 形成 `Group` |
| `generateHoles({...})`   | 生成炮孔 `fabric.Object[]`            |
| `generateOutline([...])` | 生成轮廓线 `fabric.Object[]`          |
| `generateOther([...])`   | 生成其他形状 `fabric.Object[]`        |

---

## **📌 4. Vue 组件如何使用**

在 Vue 组件中，调用 `generateObjects` 并将返回的 `fabric.Object[]` 添加到 `mainRender`。

```vue
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { generateObjects } from '@/yunbaopo/layers/simple-layer';
  import { FabricRender } from '@fabric-fusion/core';

  const mainRender = ref<FabricRender | null>(null);

  onMounted(() => {
    if (!mainRender.value) return;

    // 生成炮孔对象
    const holeObjects = generateObjects({
      fill: '#ff0000',
      radius: 15,
      selectable: true,
      onClick: (holeData) => console.log('点击了炮孔:', holeData),
    });

    // 将对象添加到 Fabric 画布
    mainRender.value.add(holeObjects);
  });
</script>
```

---

## **📌 5. 如何扩展**

### **✅ 1. 创建 `generateOutline.ts`**

- **使用 `fabric.Line` 生成轮廓线**

```typescript
import { fabric } from '@fabric-fusion/core';

export const generateOutline = (data: any[], options = {}): fabric.Object[] => {
  return data.map((outline) => createOutlineShape(outline, options));
};

const createOutlineShape = (outline: any, options: any): fabric.Line => {
  return new fabric.Line([outline.x1, outline.y1, outline.x2, outline.y2], {
    stroke: options.stroke || '#ff0000',
    strokeWidth: options.strokeWidth || 2,
    selectable: options.selectable || false,
  });
};
```

### **✅ 2. 创建 `generateOther.ts`**

- **使用 `fabric.Rect` 生成矩形**

```typescript
import { fabric } from '@fabric-fusion/core';

export const generateOther = (data: any[], options = {}): fabric.Object[] => {
  return data.map((shapeData) => createOtherShape(shapeData, options));
};

const createOtherShape = (shapeData: any, options: any): fabric.Rect => {
  return new fabric.Rect({
    left: shapeData.x,
    top: shapeData.y,
    width: options.width || 50,
    height: options.height || 50,
    fill: options.fill || '#00ffff',
    stroke: options.stroke || '#0000ff',
    strokeWidth: options.strokeWidth || 2,
    selectable: options.selectable || false,
  });
};
```

---

## **📌 6. 最佳实践**

1. **保持 `generateXXX` 结构统一**，提升代码可维护性。
2. **所有方法返回 `fabric.Object[]`，而不是直接操作 `mainRender`**，以增强灵活性。
3. **支持 `options` 让方法更具可配置性**。

---

## **📌 结论**

✅ **本指南提供 Fabric.js 绘制方法的标准结构** ✅ **开发者可按照 `simple-layer.ts` 模板快速扩展其他形状** ✅ **所有方法返回 `fabric.Object[]`，不直接操作 `mainRender`** 🚀

💡 **最终，团队可按照统一规范开发 Fabric.js 相关功能，提升代码质量与可维护性！** 🎯

🚀 **优化后，README 更清晰、可读性更高，便于开发者快速上手！** 🚀
