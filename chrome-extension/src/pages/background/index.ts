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

let sessionStartDate = null;
let sessionEndDate = null;

const onActivatedHandler = (activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function (tab) {

        chrome.tabs.query({}, (tabs) => {
            LAST_TABS = tabs.map(tab => tab.url)
        })

        sendInformation(tab.url, OperationType.TabChange)
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.command === Messages.START) {
        chrome.tabs.query({}, (tabs) => {
            LAST_TABS = tabs.map(tab => tab.url)
        })

        const now = new Date()
        now.setTime(now.getTime() + request.time * 1000)

        sessionStartDate = new Date()
        sessionEndDate = now

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

    if (request.command === Messages.GETPOPUPSTATE) {
        _sendResponse(POPUP_STATE);
    }

    if (request.command === Messages.SETPOPUPSTATE) {
        POPUP_STATE = request.state
    }

    if (request.command === Messages.GETTIME) {
        const interval = sessionEndDate.getTime() - sessionStartDate.getTime()
        const curTime = new Date()
        const remaining = sessionEndDate.getTime() - curTime.getTime()
        const elapsed = curTime.getTime() - sessionStartDate.getTime()

        if (remaining < 0) {
            POPUP_STATE = "form"
            return _sendResponse({ state: "done" })
        }

        const percentage = Math.floor((elapsed / interval) * 100)

        const remainingMinutes = Math.floor(remaining / 60000)
        const remainingSeconds = Math.floor(remaining / 1000)

        const seconds = remainingSeconds % 60
        const minutes = remainingMinutes % 60
        const hours = Math.floor(remainingMinutes / 60)

        console.log({ state: "ongoing", percentage, seconds, minutes, hours });

        return _sendResponse({ state: "ongoing", percentage, seconds, minutes, hours })
    }

    if (request.command === Messages.GETSTARTANDEND) {
        const startHours = sessionStartDate.getHours()
        const startMinutes = sessionStartDate.getMinutes()
        const endHours = sessionEndDate.getHours()
        const endMinutes = sessionEndDate.getMinutes()

        const startDate = `${startHours < 10 ? '0' : ''}${startHours}:${startMinutes < 10 ? '0' : ''}${startMinutes}`
        const endDate = `${endHours < 10 ? '0' : ''}${endHours}:${endMinutes < 10 ? '0' : ''}${endMinutes}`

        return _sendResponse({ start: startDate, end: endDate })
    }
})

const sendInformation = (url: string, operation: OperationType) => {
    if (url === "chrome://newtab/" || url === "") {
        return
    }

    const body = {
        username: "wojtek",
        time: calculatedCurrentTime(),
        address: url,
        operation: operation
    }

    fetch("http://52.87.252.127:80/api/communication/create_record", {
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
