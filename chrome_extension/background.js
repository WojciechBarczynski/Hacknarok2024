function saveTabAction(action, tabId, url) {
    const timestamp = new Date().toISOString();
    const record = { action, tabId, url, timestamp };
    
    chrome.storage.local.get(['tabHistory'], function(result) {
        const tabHistory = result.tabHistory || [];
        tabHistory.push(record);
        chrome.storage.local.set({tabHistory}, function() {
            console.log('Zapisano akcję karty:', record);
        });
    });
}

chrome.tabs.onCreated.addListener((tab) => {
    saveTabAction('opened', tab.id, tab.pendingUrl || tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        saveTabAction('updated', tabId, changeInfo.url);
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    saveTabAction('closed', tabId, 'URL not available');
});

let kok = document.getElementById("test")
kok.addEventListener("click", saveTabAction)
