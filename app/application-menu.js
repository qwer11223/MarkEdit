const { app, BrowserWindow, Menu, dialog } = require('electron')
const mainProcess = require('./main.js')

const createApplicationMenu = () => {
    const hasWindows = !!BrowserWindow.getAllWindows().length //是否有打开的窗口
    const focusedWindow = BrowserWindow.getFocusedWindow() //获取焦点窗口（没有返回null）
    const hasFilePath = !!(focusedWindow && focusedWindow.getRepresentedFilename()) //获取文件路径

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CommandOrControl+N',
                    click() {
                        mainProcess.createWindow()
                    }
                },
                {
                    label: 'Open File',
                    accelerator: 'CommandOrControl+O',
                    click(item, focusedWindow) {
                        mainProcess.getFileFromUser(focusedWindow)
                    }
                },
                {
                    label: 'Save File',
                    accelerator: 'CommandOrControl+S',
                    enabled: hasWindows,
                    click(item, focusedWindow) {
                        focusedWindow.webContents.send('save-markdown')
                    }
                },
                {
                    label: 'Export HTML',
                    accelerator: 'Shift+CommandOrControl+N',
                    enabled: hasWindows,
                    click(item, focusedWindow) {
                        focusedWindow.webContents.send('save-html')
                    }
                },
                { type: 'separator' },
                {
                    label: 'Show File',
                    accelerator: 'Shift+CommandOrControl+S',
                    enabled: hasFilePath,
                    click(item, focusedWindow) {
                        if (!focusedWindow) {
                            return dialog.showErrorBox(
                                '无法显示本地文件',
                                '当前没有打开的文档。'
                            )
                        }
                        focusedWindow.webContents.send('show-file')
                    }
                },
                {
                    label: 'Open in Default Editor',
                    accelerator: 'Shift+CommandOrControl+O',
                    enabled: hasFilePath,
                    click(item, focusedWindow) {
                        if (!focusedWindow) {
                            return dialog.showErrorBox(
                                '无法使用默认编辑器打开',
                                '当前没有打开的文档。'
                            )
                        }
                        focusedWindow.webContents.send('open-in-default')
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Copy',
                    accelerator: 'CommandOrControl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CommandOrControl+V',
                    role: 'paste'
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CommandOrControl+M',
                    role: 'minimize'
                },
                {
                    label: 'Close',
                    accelerator: 'CommandOrControl+W',
                    role: 'close'
                }

            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CommandOrControl+Shift+I',
                    click(item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.webContents.toggleDevTools()
                    }
                }
            ]
        }
    ]

    return Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
//解决macos菜单消失
if (process.platform === 'darwin') {
    const name = 'MarkEdit'
    template.unshift({ label: name })
}

module.exports = createApplicationMenu