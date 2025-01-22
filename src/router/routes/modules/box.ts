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
  ],
};

export default box;
