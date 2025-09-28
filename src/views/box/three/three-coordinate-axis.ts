import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export interface BoxGridOptions {
  boxSize: { x: number; y: number; z: number }; // 网格大小
  steps: { x: number; y: number; z: number }; // 每轴间隔
  labels: { x: string; y: string; z: string }; // 每个轴的名称
  fontSize?: number; // 字体大小
  scene: THREE.Scene; // 场景对象
}

/**
 * 初始化 CSS2DRenderer，并挂载至指定 DOM 容器
 */
export const initLabelRenderer = (container: HTMLElement): CSS2DRenderer => {
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(container.clientWidth, container.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  labelRenderer.domElement.style.zIndex = '10';
  container.appendChild(labelRenderer.domElement);
  return labelRenderer;
};

/**
 * 创建一个 3D 立体坐标网格盒子，支持刻度与标签
 */
export const create3DBoxGrid = ({
  boxSize,
  steps,
  labels,
  fontSize = 14,
  scene,
}: BoxGridOptions): void => {
  const { x: sizeX, y: sizeY, z: sizeZ } = boxSize;
  const { x: stepX, y: stepY, z: stepZ } = steps;

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const lineGeometry = new THREE.BufferGeometry();
  const positions: number[] = [];

  // XY 面
  for (let i = 0; i <= sizeX; i += stepX) positions.push(i, 0, 0, i, sizeY, 0);
  for (let j = 0; j <= sizeY; j += stepY) positions.push(0, j, 0, sizeX, j, 0);

  // XZ 面
  for (let i = 0; i <= sizeX; i += stepX) positions.push(i, 0, 0, i, 0, sizeZ);
  for (let k = 0; k <= sizeZ; k += stepZ) positions.push(0, 0, k, sizeX, 0, k);

  // YZ 面
  for (let j = 0; j <= sizeY; j += stepY) positions.push(0, j, 0, 0, j, sizeZ);
  for (let k = 0; k <= sizeZ; k += stepZ) positions.push(0, 0, k, 0, sizeY, k);

  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  /**
   * 创建标签文本 DOM
   */
  const createLabel = (text: string): CSS2DObject => {
    const div = document.createElement('div');
    div.textContent = text;
    div.className = 'axis-label';
    div.style.color = 'white';
    div.style.fontSize = `${fontSize}px`;
    div.style.whiteSpace = 'nowrap';
    div.style.pointerEvents = 'none';
    return new CSS2DObject(div);
  };

  // 主轴标签
  const labelX = createLabel(labels.x);
  labelX.position.set(sizeX + 5, 0, 0);
  scene.add(labelX);

  const labelY = createLabel(labels.y);
  labelY.position.set(0, sizeY + 1, 0);
  scene.add(labelY);

  const labelZ = createLabel(labels.z);
  labelZ.position.set(0, 0, sizeZ + 2);
  scene.add(labelZ);

  // X轴刻度值
  for (let i = stepX; i <= sizeX; i += stepX) {
    const tick = createLabel(`${i}`);
    tick.position.set(i, -1, 0);
    scene.add(tick);
  }

  // Y轴刻度值
  for (let j = stepY; j <= sizeY; j += stepY) {
    const tick = createLabel(`${j}`);
    tick.position.set(-2, j, 0);
    scene.add(tick);
  }

  // Z轴刻度值
  for (let k = stepZ; k <= sizeZ; k += stepZ) {
    const tick = createLabel(`${k}`);
    tick.position.set(-2, 0, k);
    scene.add(tick);
  }
};
