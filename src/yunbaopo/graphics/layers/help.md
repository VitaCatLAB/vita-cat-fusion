### **Fabric.js 绘制方法开发指南**

> **适用于 Vue + Fabric.js 项目**  
> 本指南基于 `generateHoles.ts`，适用于开发 **各种 Fabric.js 绘制方法**，如炮孔、轮廓线、其他形状等。

---

## **📌 1. Fabric.js 绘制方法的基本结构**

在 `Fabric.js` 项目中，绘制方法通常包含以下几个部分：

1. **数据获取**：从业务数据中提取待绘制的图形信息。
2. **参数定义**：定义可定制的绘制参数，如颜色、大小、文本等，增强灵活性。
3. **Fabric.js 对象创建**：
   - 使用 `fabric.Circle`、`fabric.Text`、`fabric.Rect` 等对象创建图形。
   - 可以组合多个对象形成 `fabric.Group`，以保持图形的逻辑关系。
4. **事件绑定**：支持 `onClick`、`onHover` 等交互事件，提升用户体验。
5. **返回 `fabric.Object[]` 列表**：
   - **方法不直接操作 `mainRender`，而是返回 `fabric.Object[]`**，让 Vue 组件控制何时、如何添加到画布。

---

## **📌 2. `generateHoles.ts` 示例**

以下是 **Fabric.js 炮孔绘制方法**，请参考此示例编写其他绘制方法。

```typescript
import { holeGroupFactory } from '@/yunbaopo/transformers/blast-hole-transformer';
import { hole } from '../data';
import { fabric } from '@fabric-fusion/core';
import _ from 'lodash';

/**
 * @description 生成炮孔 Fabric.js 对象列表，每个炮孔是独立的 `fabric.Group`
 * @param {object} options - 额外的自定义配置
 * @param {string} [options.fill='#000000'] - 炮孔填充颜色
 * @param {string} [options.stroke='#00e100'] - 炮孔边框颜色
 * @param {number} [options.radius=10] - 炮孔半径（像素）
 * @param {boolean} [options.showText=true] - 是否显示炮孔名称文本
 * @param {string} [options.textColor='#ffffff'] - 文字颜色
 * @param {number} [options.textSize=10] - 文字大小
 * @param {boolean} [options.selectable=false] - 是否允许用户选中
 * @param {Function} [options.onClick] - 炮孔点击回调函数 (holeData) => void
 * @param {Function} [options.onHover] - 炮孔悬停回调函数 (holeData) => void
 * @returns {fabric.Object[]} - 生成的炮孔 Fabric 组对象列表（每个炮孔是 `fabric.Group`）
 */
export const generateHoles = (
  options: {
    fill?: string;
    stroke?: string;
    radius?: number;
    showText?: boolean;
    textColor?: string;
    textSize?: number;
    selectable?: boolean;
    onClick?: (holeData: any) => void;
    onHover?: (holeData: any) => void;
  } = {},
): fabric.Object[] => {
  // 默认参数
  const config = {
    fill: '#000000',
    stroke: '#00e100',
    radius: 10,
    showText: true,
    textColor: '#ffffff',
    textSize: 10,
    selectable: false,
    ...options, // 合并用户自定义参数
  };

  // 生成炮孔组
  const _graphHoleList = holeGroupFactory(hole);

  // 普通数组存储每个 `fabric.Group`，确保它们是独立对象
  const holeObjects: fabric.Object[] = [];

  for (const seqGroupItem of _graphHoleList) {
    const holeGroupList = seqGroupItem.holeList;

    for (const hole of holeGroupList) {
      // 创建炮孔图形
      const circle = new fabric.Circle({
        radius: config.radius,
        fill: config.fill,
        stroke: config.stroke,
        left: hole.x,
        top: hole.y,
        selectable: config.selectable,
        originX: 'center',
        originY: 'center',
      });

      // 创建文本对象（如果需要显示）
      let text: fabric.Text | null = null;
      if (config.showText) {
        text = new fabric.Text(hole.name.toString(), {
          left: hole.x,
          top: hole.y - config.radius - 5, // 文字稍微上移
          fontWeight: 800,
          fontSize: config.textSize,
          originX: 'center',
          originY: 'center',
          selectable: false,
          fill: config.textColor,
        });
      }

      // 组合炮孔与文本
      const mixList: any[] = [circle];
      if (text) mixList.push(text);

      // 创建 Fabric 组（每个炮孔都是独立的 `fabric.Group`）
      const mixedHole = new fabric.Group(mixList, {
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'pointer',
        metaData: { hole },
        selectable: config.selectable,
      } as any);

      // 添加点击事件监听器
      if (config.onClick) {
        mixedHole.on('mousedown', () => config.onClick?.(hole));
      }

      // 添加悬停事件监听器
      if (config.onHover) {
        mixedHole.on('mouseover', () => config.onHover?.(hole));
      }

      // 将炮孔对象存入数组（普通数组，而不是 fabric.Group）
      holeObjects.push(mixedHole);
    }
  }

  return holeObjects;
};
```

---

## **📌 3. 关键 API 解析**

| API                      | 作用                                  |
| ------------------------ | ------------------------------------- |
| `fabric.Circle({...})`   | 创建圆形（炮孔）                      |
| `fabric.Text({...})`     | 创建文本（炮孔名称）                  |
| `fabric.Group([...])`    | 将 `Circle` 和 `Text` 组合成 `Group`  |
| `holeGroupFactory(hole)` | 业务数据转换为炮孔数据                |
| `flatMap(...)`           | 遍历 `holeList` 并生成 `fabric.Group` |

---

## **📌 4. Vue 组件如何使用**

在 Vue 组件中，调用 `generateHoles` 并将返回的 `fabric.Object[]` 添加到 `mainRender`。

```vue
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { generateHoles } from '@/yunbaopo/transformers/generateHoles';
  import { FabricRender } from '@fabric-fusion/core';

  const mainRender = ref<FabricRender | null>(null);

  onMounted(() => {
    if (!mainRender.value) return;

    // 生成炮孔对象
    const holeObjects = generateHoles({
      fill: '#ff0000', // 炮孔填充颜色
      stroke: '#ffff00', // 炮孔边框颜色
      radius: 15, // 炮孔半径
      selectable: true, // 允许选中
      onClick: (holeData) => console.log('点击了炮孔:', holeData),
      onHover: (holeData) => console.log('鼠标悬停在炮孔上:', holeData),
    });

    // 将所有炮孔对象单独添加到 Fabric 画布
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

/**
 * @description 生成轮廓线 Fabric.js 对象
 * @returns {fabric.Object[]} - 轮廓线对象列表
 */
export const generateOutline = (data: any[], options = {}): fabric.Object[] => {
  return data.map((outline) => createOutlineShape(outline, options));
};

/**
 * @description 创建单个轮廓线 Fabric.js 对象
 */
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

/**
 * @description 生成矩形 Fabric.js 对象
 * @returns {fabric.Object[]} - 矩形对象列表
 */
export const generateOther = (data: any[], options = {}): fabric.Object[] => {
  return data.map((shapeData) => createOtherShape(shapeData, options));
};

/**
 * @description 创建单个矩形 Fabric.js 对象
 */
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

1. **保持 `generateXXX.ts` 结构统一**，提升代码可维护性。
2. **所有方法返回 `fabric.Object[]`，而不是直接操作 `mainRender`**，以增强灵活性。
3. **支持 `options` 让方法更具可配置性**。

---

## **📌 结论**

✅ **本指南提供 Fabric.js 绘制方法的标准结构**  
✅ **开发者可按照 `generateHoles.ts` 模板快速扩展其他形状**  
✅ **所有方法返回 `fabric.Object[]`，不直接操作 `mainRender`** 🚀

💡 **最终，团队可按照统一规范开发 Fabric.js 相关功能，提升代码质量与可维护性！** 🎯
