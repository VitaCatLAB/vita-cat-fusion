import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const clientDemo: AppRouteModule = {
  path: '/client-demo',
  name: 'client-demo',
  component: LAYOUT,
  redirect: '/client-demo/index',
  meta: {
    icon: 'simple-icons:boxdotme',
    title: 'clientdemo',
    orderNo: 1003,
  },
  children: [
    {
      path: 'user',
      name: 'client-demo-user',
      component: () => import('@/views/client-demo/user/index.vue'),
      meta: {
        title: 'user-demo',
        icon: 'simple-icons:boxdotme',
      },
    },
  ],
};

export default clientDemo;
