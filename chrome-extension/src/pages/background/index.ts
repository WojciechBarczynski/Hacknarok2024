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
let POPUP_STATE: "form" | "work" = "form"

const onActivatedHandler = (activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function(tab) {

        chrome.tabs.query({}, (tabs) => {
            LAST_TABS = tabs.map(tab => tab.url)
        })

        sendInformation(tab.url, OperationType.TabChange)
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onUpdatedHandler = (tabId, changeInfo, tab) => {
    if (changeInfo.url){
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
            if (!(curTabsUrls.includes(tab))){
                sendInformation(tab, OperationType.Remove)
            }
        })

        LAST_TABS = curTabsUrls
    })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    if (request.command === Messages.GETPOPUPSTATE){
        _sendResponse(POPUP_STATE);
    }

    if (request.command === Messages.SETPOPUPSTATE){
        POPUP_STATE = request.state
    }
})

const sendInformation =  (url: string, operation: OperationType) => {
    if (url === "chrome://newtab/" || url === ""){
        return
    }

    const body = {
        username: "johnny",
        time: calculatedCurrentTime(),
        addres: url,
        operation: operation
    }
    //"http://127.0.0.1:5000/db/add_record"
    
    console.log(`Sending: url = ${url} opeartion = ${operation}`)

    fetch("https://01htspnak6ny62hs5gpyv2ka8300-0fd1b06d962b4163c9eb.requestinspector.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(console.log)

    console.log("dupa")
}

enum OperationType{
    Remove = "Remove",
    TabChange = "TabChange",
    UrlChange = "UrlChange"
}

console.log('background loaded');
