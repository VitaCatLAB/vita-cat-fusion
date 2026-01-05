import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const fabric: AppRouteModule = {
  path: '/fabric',
  name: 'fabric',
  component: LAYOUT,
  redirect: '/fabric/index',
  meta: {
    icon: 'simple-icons:boxdotme',
    title: 'Fabric',
    orderNo: 1005,
  },
  children: [
    {
      path: 'fabric-graph',
      name: 'fabric-graph',
      component: () => import('@/views/box/render/index.vue'),
      meta: {
        title: 'box-fabric-graph',
        icon: 'simple-icons:boxdotme',
      },
    },
  ],
};

export default fabric;
