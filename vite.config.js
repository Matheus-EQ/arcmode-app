import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const enableBase44Plugin = process.env.VITE_ENABLE_BASE44_PLUGIN === 'true';

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [];

  if (enableBase44Plugin) {
    const { default: base44 } = await import('@base44/vite-plugin');
    plugins.push(base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }));
  }

  plugins.push(react());

  return {
    logLevel: 'error', // Suppress warnings, only show errors
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  };
});
