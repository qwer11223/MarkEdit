const marked = require('marked')

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

markdownView.addEventListener('keyup', e => {
    renderMarkdownToHtml(e.target.value)
})