const { app, BrowserWindow, dialog } = require('electron')
const fs = require('fs')

//多窗口集合
const windows = new Set()   //es2015,集合，不允许重复项

app.on('ready', () => {
    createWindow()
})

// app.on('window-all-closed', () => { //关闭窗口不结束整个应用
//     if (process.platform === 'darwin')  //macos
//         return false
// })

// app.on('activate',(event,hasVisibleWindows)=>{  //active事件只会在macos中触发
//     if(!hasVisibleWindows) createWindow()
// })


/////// function ///////

//创建新渲染窗口
const createWindow = () => {

    //新窗口偏移
    let x, y
    const currentWindow = BrowserWindow.getFocusedWindow() //获取当前处于活动状态的浏览器窗口
    if (currentWindow) {
        const [X, Y] = currentWindow.getPosition()
        x = X + 10
        y = Y + 10
    }

    let newWindow = new BrowserWindow({    //创建渲染进程
        x, y,   //窗口位置
        webPreferences: {
            show: false,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    newWindow.loadFile(__dirname + '/index.html') //加载ui界面

    newWindow.once('ready-to-show', () => { //解决空白窗口问题
        newWindow.show()
    })

    newWindow.on('closed', () => { //窗口关闭后，设置渲染进程对象为null
        windows.delete(newWindow)
        newWindow = null
    })

    windows.add(newWindow)
    return newWindow
}

//选择文件
const getFileFromUser = async (targetWindow) => {
    const files = await dialog.showOpenDialog({    //弹出操作系统的文件打开对话框
        properties: ['openFile'],
        filters: [   //限定允许打开的文件类型
            { name: 'Text/Markdown Files', extensions: ['txt', 'md', 'markdown'] }
        ]
    })

    if (files.canceled != true)
        openFile(targetWindow, files.filePaths[0])
}

//打开文件
const openFile = (targetWindow, file) => {
    const content = fs.readFileSync(file, { encoding: 'utf-8' }).toString()
    targetWindow.webContents.send('file-opened', file, content)
}


/////// export modules ///////
module.exports = {
    getFileFromUser, createWindow
}