const { app, BrowserWindow, dialog, Menu } = require('electron')
const createApplicationMenu = require('./application-menu')
const fs = require('fs')

//多窗口集合
const windows = new Set()   //es2015,集合，不允许重复项
//打开的文件
const openFiles = new Map() //窗口-文件监控器 键值对

app.on('ready', () => {
    createApplicationMenu()
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

    newWindow.on('focus', createApplicationMenu)

    newWindow.on('close', e => {
        if (newWindow.isDocumentEdited())
            e.preventDefault()

        const result = dialog.showMessageBoxSync(newWindow, {
            type: 'warning',
            title: 'Quit with Unsaved Changes?',
            message: 'Your changes will be lost if you do not save.',
            buttons: [
                'Quit Anyway',
                'Cancel'
            ],
            defaultId: 0,
            cancelId: 1
        })

        if (result === 0) newWindow.destroy()
    })

    newWindow.on('closed', () => { //窗口关闭后，设置渲染进程对象为null
        windows.delete(newWindow)
        createApplicationMenu()
        stopWatchingFile(newWindow) //窗口关闭后同时关闭与窗口关联的文件监控器
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
    app.addRecentDocument(file) //添加文件到系统最近打开列表中
    targetWindow.webContents.send('file-opened', file, content)
    createApplicationMenu()
    startWatchingFile(targetWindow, file)
}

//保存为html
const saveHtml = (targetWindow, content) => {
    const file = dialog.showSaveDialogSync(targetWindow, {
        title: 'Save Html',
        defaultPath: app.getPath('documents'),
        filters: [
            { name: 'HTML Files', extensions: ['html', 'htm'] }
        ]
    })

    if (!file) return

    fs.writeFileSync(file, content)
}

//保存文件
const saveMarkdown = (targetWindow, file, content) => {
    if (!file) {    //新文件，弹出对话框
        file = dialog.showSaveDialog(targetWindow, {
            title: 'Save Markdown',
            defaultPath: app.getPath('documents'),
            filters: [
                { name: 'Markdown File', extensions: ['md', 'markdown'] }
            ]
        })
    }

    if (!file) return   //选中cancle按钮直接返回

    fs.writeFileSync(file, content) //现有文件，直接保存
    openFile(targetWindow, file)
}

//开启文件监控
const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow)  //如果文件监控存在，取消监控

    const watcher = fs.watch(file, e => {
        if (e === 'change') {
            const content = fs.readFileSync(file).toString()
            targetWindow.webContents.send('file-opened', file, content)
        }
    })

    openFiles.set(targetWindow, watcher)
}

//停止文件监控
const stopWatchingFile = targetWindow => {
    if (openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).stop()
        openFiles.delete(targetWindow)
    }
}


/////// export modules ///////
module.exports = {
    getFileFromUser, createWindow, saveHtml, saveMarkdown, openFile
}