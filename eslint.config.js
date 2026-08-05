import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .gitignore'daki "Playwright E2E" bölümüyle aynı liste (bkz. .gitignore) -
  // bunlar Playwright'ın kendi ürettiği, üçüncü taraf/minified rapor ve
  // trace-viewer bundle'ları (playwright-report/trace/*.js gibi). Buraya
  // eklenmemeleri "npx playwright test" bir kez local'de HTML reporter'la
  // çalıştırılınca lint'in yüzlerce sahte hatayla patlamasına yol açtı -
  // bunlar bizim kodumuz değil, lint edilmemeleri gerekiyordu.
  globalIgnores(['dist', 'test-results', 'playwright-report', 'blob-report', 'playwright/.cache']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Playwright config + E2E test dosyaları tarayıcıda değil Node'da
    // çalışıyor (page/browser API'leri Playwright test runner'ından gelir,
    // process.env de config'te ortam değişkeni okumak için kullanılıyor).
    // scripts/** da aynı şekilde build sonrası Node'da çalışan yardımcı
    // script'ler (bkz. scripts/generate-sw-precache.js) - fs/path/process gibi
    // Node global'lerini kullanıyorlar, tarayıcı global'leri değil.
    files: ['playwright.config.js', 'e2e/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
