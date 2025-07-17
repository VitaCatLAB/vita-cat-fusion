import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const box: AppRouteModule = {
  path: '/box',
  name: 'box',
  component: LAYOUT,
  redirect: '/box/index',
  meta: {
    icon: 'simple-icons:boxdotme',
    title: '实验盒子',
    orderNo: 1003,
  },
  children: [
    {
      path: 'fabric',
      name: 'box-fabric',
      component: () => import('@/views/box/fabric/index.vue'),
      meta: {
        title: 'FABRIC',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'fabric-fusion',
      name: 'box-fabric-fusion',
      component: () => import('@/views/box/fabric/fabric-fusion.vue'),
      meta: {
        title: 'fabric-fusion',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'fabric-fusion-line',
      name: 'box-fabric-fusion-line',
      component: () => import('@/views/box/fabric/fabric-fusion-line.vue'),
      meta: {
        title: 'fabric-fusion-line',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'fabric-fusion-esign',
      name: 'box-fabric-fusion-esign',
      component: () => import('@/views/box/fabric/fabric-fusion-esign.vue'),
      meta: {
        title: 'fabric-fusion-esgin',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'fabric-fusion-blast',
      name: 'box-fabric-fusion-blast',
      component: () => import('@/views/box/fabric/fabric-fusion-blast.vue'),
      meta: {
        title: 'fabric-fusion-blast',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'fabric-fusion-blast2',
      name: 'box-fabric-fusion-blast2',
      component: () => import('@/views/box/fabric/fabric-fusion-blast2.vue'),
      meta: {
        title: 'fabric-fusion-blast2',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'fabric-fusion-mask',
      name: 'box-fabric-fusion-mask',
      component: () => import('@/views/box/fabric/fabric-fusion-mask.vue'),
      meta: {
        title: 'fabric-fusion-mask',
        icon: 'simple-icons:boxdotme',
      },
    },
    //three-fusion
    {
      path: 'three-fusion',
      name: 'box-three-fusion',
      component: () => import('@/views/box/three/three-fusion.vue'),
      meta: {
        title: 'three-fusion',
        icon: 'simple-icons:boxdotme',
      },
    },
    //three-fusion-blast
    {
      path: 'three-fusion-blast',
      name: 'box-three-fusion-blast',
      component: () => import('@/views/box/three/three-fusion-blast.vue'),
      meta: {
        title: 'three-fusion-blast',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'three-fusion-tunnel',
      name: 'box-three-fusion-tunnel',
      component: () => import('@/views/box/three/three-fusion-tunnel.vue'),
      meta: {
        title: 'three-fusion-tunnel',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'three-fusion-cloud',
      name: 'three-fusion-cloud',
      component: () => import('@/views/box/three/three-fusion-tunnel-cloud.vue'),
      meta: {
        title: 'three-fusion-tunnel-cloud',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'three-fusion-color',
      name: 'box-three-fusion-color',
      component: () => import('@/views/box/three/three-fusion-tunnel-color.vue'),
      meta: {
        title: 'three-fusion-tunnel-color',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'three-fusion-pcd',
      name: 'box-three-fusion-pcd',
      component: () => import('@/views/box/three/three-fusion-pcd.vue'),
      meta: {
        title: 'three-fusion-pcd',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'box-util-localforage',
      name: 'box-util-localforage',
      component: () => import('@/views/box/util/localforage.vue'),
      meta: {
        title: 'box-util-localforage',
        icon: 'simple-icons:boxdotme',
      },
    },
    {
      path: 'box-util-error',
      name: 'box-util-error',
      component: () => import('@/views/box/util/error.vue'),
      meta: {
        title: 'box-util-error',
        icon: 'simple-icons:boxdotme',
      },
    },
  ],
};

export default box;
