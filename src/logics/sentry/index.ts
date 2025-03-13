import projectSetting from '@/settings/projectSetting';
import { App } from 'vue';
import * as Sentry from '@sentry/vue';
import { useGlobSetting } from '@/hooks/setting';
import { router } from '@/router';
import { isProdMode } from '@/utils/env';

/**
 * Configure global sentry
 * @param app
 */
export function setupSentry(app: App) {
  const { useSentry } = projectSetting;

  const { sentryDsn } = useGlobSetting();

  if (!useSentry || sentryDsn === '' || !isProdMode()) {
    return;
  }
  Sentry.init({
    app,
    dsn: sentryDsn,
    integrations: [
      Sentry.replayIntegration({
        // NOTE: This will disable built-in masking. Only use this if your site has no sensitive data, or if you've already set up other options for masking or blocking relevant data, such as 'ignore', 'block', 'mask' and 'maskFn'.
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.browserTracingIntegration({ router }),
      Sentry.browserProfilingIntegration(),
    ],
    // Tracing
    tracesSampleRate: 0.2, // Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /.*/], // 允许所有 API 请求

    // Profiling
    profilesSampleRate: 0.2, // Profile 100% of the transactions. This value is relative to tracesSampleRate
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}
