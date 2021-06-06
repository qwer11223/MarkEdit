const { app, BrowserWindow, Menu } = require('electron')
const mainProcess = require('./main')

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
                click(item, focusedWindow) {
                    focusedWindow.webContents.send('save-markdown')
                }
            },
            {
                label: 'Export HTML',
                accelerator: 'Shift+CommandOrControl+N',
                click(item, focusedWindow) {
                    focusedWindow.webContents.send('save-html')
                }
            },
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

//解决macos菜单消失
if (process.platform === 'darwin') {
    const name = 'MarkEdit'
    template.unshift({ label: name })
}

module.exports = Menu.buildFromTemplate(template)