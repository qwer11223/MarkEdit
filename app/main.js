const { app, BrowserWindow } = require('electron')

let mainWindow = null

app.on('ready', () => {
    mainWindow = new BrowserWindow({ //创建渲染进程
        webPreferences: {
            show: false,
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    mainWindow.loadFile(__dirname + '/index.html') //加载ui界面

    mainWindow.once('ready-to-show', () => { //解决空白窗口问题
        mainWindow.show()
    })

    mainWindow.on('closed', () => { //窗口关闭后，设置渲染进程对象为null
        mainWindow = null
    })
})