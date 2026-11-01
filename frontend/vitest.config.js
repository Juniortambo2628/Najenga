import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(viteConfig({ command: 'build' }), defineConfig({
  test: { environment: 'jsdom', include: ['test/**/*.test.{js,jsx}'] },
}));
