import { defineConfig } from '@playwright/test'
import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,
  grep: /@ci/,
  retries: 1,
  webServer: undefined,
  use: {
    ...baseConfig.use,
    baseURL: 'https://stevennguyen9211.github.io/ShopOnline/',
  },
})
