chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === 'getInnerText') {
        const innerText = document.body.innerText
        sendResponse({ innerText })
    }
    return true
})