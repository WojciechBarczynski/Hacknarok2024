import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import { Messages, calculatedCurrentTime } from './helpers';

reloadOnUpdate('pages/background');
/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

let LAST_TABS = []

const onActivatedHandler = (activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function (tab) {

        chrome.tabs.query({}, (tabs) => {
            LAST_TABS = tabs.map(tab => tab.url)
        })

        sendInformation(tab.url, OperationType.TabChange)
    });
}

const onUpdatedHandler = (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        chrome.tabs.query({}, (tabs) => {
            LAST_TABS = tabs.map(tab => tab.url)
        })

        sendInformation(changeInfo.url, OperationType.UrlChange)
    }
}

const onRemoveHandler = () => {
    chrome.tabs.query({}, (tabs) => {
        const curTabsUrls = tabs.map(tab => tab.url)

        LAST_TABS.forEach(tab => {
            if (!(curTabsUrls.includes(tab))) {
                sendInformation(tab, OperationType.Remove)
            }
        })

        LAST_TABS = curTabsUrls
    })
}

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {

    if (request.command === Messages.START) {
        chrome.tabs.query({}, (tabs) => {
            LAST_TABS = tabs.map(tab => tab.url)
        })

        chrome.tabs.onUpdated.addListener(onUpdatedHandler);
        chrome.tabs.onActivated.addListener(onActivatedHandler);
        chrome.tabs.onRemoved.addListener(onRemoveHandler);

        setTimeout(() => {
            console.log("TIME TO TURN OFF")
            chrome.tabs.onUpdated.removeListener(onUpdatedHandler);
            chrome.tabs.onActivated.removeListener(onActivatedHandler);
            chrome.tabs.onRemoved.addListener(onRemoveHandler);
        }, 60000)
    }
})

const sendInformation = (url: string, operation: OperationType) => {
    if (url === "chrome://newtab/" || url === "") {
        return
    }

    console.log(`Sending: url = ${url} opeartion = ${operation}`)

    const body = {
        username: "johnny",
        time: calculatedCurrentTime(),
        address: url,
        operation: operation
    }

    fetch("http://54.210.118.222:80/api/communication/create_record", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(response => console.log(response))
}

enum OperationType {
    Remove = "Remove",
    TabChange = "TabChange",
    UrlChange = "UrlChange"
}

console.log('background loaded');
