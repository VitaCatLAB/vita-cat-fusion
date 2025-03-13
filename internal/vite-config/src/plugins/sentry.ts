import { sentryVitePlugin } from '@sentry/vite-plugin';
import type { PluginOption } from 'vite';

export function configSentryVitePlugin({ isBuild }: { isBuild: boolean }) {
  const sentryPlugin: PluginOption[] = sentryVitePlugin({
    org: 'joynop',
    project: 'javascript-vue',
    sourcemaps: {
      filesToDeleteAfterUpload: ['dist/**/*.js.map', 'dist/**/*.css.map'],
    },
  });
  return sentryPlugin;
}
