//electron主进程文件
import { app, BrowserWindow } from 'electron'
// 准备就绪后创建一个窗口
app.whenReady().then(() => {
  const win = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true, // 可以在渲染进程中使用node.js的api，为了安全不允许
      contextIsolation: false, // 关闭渲染进程的沙箱
      webSecurity: false // 关闭同源策略
    }
  })

  // win.webContents.openDevTools() // 开发环境打开控制台

  if (process.argv[2]) {
    win.loadURL(process.argv[2]) //开发环境
  } else {
    win.loadFile('index.html') //生产环境
  }
})
