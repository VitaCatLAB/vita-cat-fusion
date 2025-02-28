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
      path: 'fabric-fusion-blast',
      name: 'box-fabric-fusion-blast',
      component: () => import('@/views/box/fabric/fabric-fusion-blast.vue'),
      meta: {
        title: 'fabric-fusion-blast',
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
  ],
};

export default box;
