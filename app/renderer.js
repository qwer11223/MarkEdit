const marked = require('marked')
const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')
const path = require('path')

const currentWindow = remote.getCurrentWindow() //当前窗口
let filePath = null //文件路径
let originalContent = ''    //文件原内容

//view
const markdownView = document.querySelector('#markdown')
const htmlView = document.querySelector('#html')

//button
const newFileBtn = document.querySelector('#new-file')
const openFileBtn = document.querySelector('#open-file')
const saveMarkdownBtn = document.querySelector('#save-markdown')
const revertBtn = document.querySelector('#revert')
const saveHtmlBtn = document.querySelector('#save-html')
const showFileBtn = document.querySelector('#show-file')
const openInDefaultBtn = document.querySelector('#open-in-default')


//drag event
document.addEventListener('dragstart', e => e.preventDefault())
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('dragleave', e => e.preventDefault())
document.addEventListener('drop', e => e.preventDefault())

///// function //////
const renderMarkdownToHtml = markdown => {
    // console.log(marked(markdown, { sanitize: true }))
    htmlView.innerHTML = marked(markdown, { sanitize: true })
}

const updateUserInterface = (isEdit) => {     //修改标题
    let title = 'MarkEdit'

    if (filePath)
        title = `${path.basename(filePath)} - ${title}`
    if (isEdit)
        title = `${title} (Edited)`

    currentWindow.setTitle(title)
    currentWindow.setDocumentEdited(isEdit) //macos有效，影响窗口样式

    //启用按钮
    saveMarkdownBtn.disabled = !isEdit
    revertBtn.disabled = !isEdit
}

//  get drag/drop file
const getDraggedFile = e => e.dataTransfer.items[0]
const getDroppedFile = e => e.dataTransfer.files[0]

const fileTypeIsSupported = file => {
    return ['text/plain', 'text/markdown'].includes(file.type)
}


////// events ////////
markdownView.addEventListener('keyup', e => {
    const currentContent = e.target.value

    renderMarkdownToHtml(e.target.value)
    updateUserInterface(currentContent != originalContent)

})

openFileBtn.addEventListener('click', () => {
    mainProcess.getFileFromUser(currentWindow)   //调用主进程方法
})

ipcRenderer.on('file-opened', (event, file, content) => {
    filePath = file //将当前所打开的文件路径保存到全局变量
    originalContent = content   //将原始内容保存到全局变量，检测文件是否修改

    markdownView.value = content    //覆盖textarea区域内容
    renderMarkdownToHtml(content)   //渲染到markdown区域

    updateUserInterface()
})

newFileBtn.addEventListener('click', () => {
    mainProcess.createWindow()
})

saveHtmlBtn.addEventListener('click', () => {
    mainProcess.saveHtml(currentWindow, htmlView.innerHTML)
})

saveMarkdownBtn.addEventListener('click', () => {
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value)
})

revertBtn.addEventListener('click', () => {
    markdownView.value = originalContent
    renderMarkdownToHtml(originalContent)
})

markdownView.addEventListener('dragover', e => {
    const file = getDraggedFile(e)

    if (fileTypeIsSupported(file))
        markdownView.classList.add('drag-over')
    else
        markdownView.classList.add('drag-error')
})

markdownView.addEventListener('dragleave', e => {
    markdownView.classList.remove('drag-over')
    markdownView.classList.remove('drag-error')
})

markdownView.addEventListener('drop', e => {
    const file = getDroppedFile(e)

    if (fileTypeIsSupported(file))
        mainProcess.openFile(currentWindow, file.path)
    else
        alert('That file type is not supported')

    markdownView.classList.remove('drag-over')
    markdownView.classList.remove('drag-error')
})