//生产环境的electron插件

import type { Plugin } from 'vite'
import type { AddressInfo } from 'node:net'
import { spawn } from 'child_process'
import fs from 'node:fs'

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

export const ElectronDevPlugin = (): Plugin => {
  return {
    name: 'electron-dev',
    // 在configureServer中实现插件的逻辑
    configureServer(server) {
      // 使用esbuild编译TypeScript代码为JavaScript
      buildBackground()
      server?.httpServer?.once('listening', () => {
        // 读取vite服务的信息
        const adressInfo = server?.httpServer?.address() as AddressInfo
        console.log('port', adressInfo.port)
        // 拼接vite服务的ip地址
        const IP = `http://localhost:${adressInfo.port}`

        // 第一个参数是electron的入口文件，第二个参数是vite服务的地址
        // require('electron')返回是一个路径
        // electron 不认识ts文件，所以需要将ts文件编译成js文件
        // 进程传参 0: electron, 1: 入口文件, 2: vite服务的地址
        let ElectronProcess = spawn(require('electron'), ['dist/background.js', IP])
        // 监听background.ts文件的变化，重新编译
        fs.watchFile('src/background.ts', () => {
          ElectronProcess.kill()
          buildBackground()
          ElectronProcess = spawn(require('electron'), ['dist/background.js', IP])
        })
        ElectronProcess.stderr.on('data', (data) => {
          console.log('data', data)
        })
        console.log(IP)
      })
    }
  }
}
