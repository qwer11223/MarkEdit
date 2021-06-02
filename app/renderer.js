const marked = require('marked')
const { remote, ipcRenderer } = require('electron')
const mainProcess = remote.require('./main.js')

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

//convert
const renderMarkdownToHtml = markdown => {
    // console.log(marked(markdown, { sanitize: true }))
    htmlView.innerHTML = marked(markdown, { sanitize: true })
}


////// events ////////
markdownView.addEventListener('keyup', e => {
    renderMarkdownToHtml(e.target.value)
})

openFileBtn.addEventListener('click', () => {
    mainProcess.getFileFromUser(remote.getCurrentWindow())   //调用主进程方法
})

ipcRenderer.on('file-opened', (event, file, content) => {
    markdownView.value = content
    renderMarkdownToHtml(content)
})

newFileBtn.addEventListener('click',()=>{
    mainProcess.createWindow()
})