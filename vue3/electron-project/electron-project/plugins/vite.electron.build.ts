//开发环境的electron插件
import type { Plugin } from 'vite'
import fs from 'node:fs'
import * as ElectronBuilder from 'electron-builder'
import path from 'path'

const buildBackground = () => {
  require('esbuild').buildSync({
    entryPoints: ['src/background.ts'],
    bundle: true,
    outfile: 'dist/background.js',
    platform: 'node',
    target: 'node12',
    external: ['electron']
  })
}

export const ElectronBuildPlugin = (): Plugin => {
  return {
    name: 'electron-build',
    closeBundle() {
      buildBackground()
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      packageJson.main = 'background.js'
      fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 4))
      //
      fs.mkdirSync('dist/node_modules')
      ElectronBuilder.build({
        config: {
          directories: {
            output: path.resolve(process.cwd(), 'release'),
            app: path.resolve(process.cwd(), 'dist')
          },
          asar: true,
          appId: 'com.example.app',
          productName: 'vite-electron',
          nsis: {
            oneClick: false,
            allowToChangeInstallationDirectory: true
          },
          // electron-build下载依赖超时，换源处理
          electronDownload: {
            mirror: 'https://npm.taobao.org/mirrors/electron/'
          }
        }
      })
    }
  }
}
