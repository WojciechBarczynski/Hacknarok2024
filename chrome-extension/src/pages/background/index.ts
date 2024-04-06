import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

reloadOnUpdate('pages/background');
/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

export enum Messages{
    START = "startListener",
    END = "endListener"
}

let SAVED_LINKS = []

const onActivatedHandler = (activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        SAVED_LINKS.push(tab.url);
    });
}

const onUpdatedHandler = (tabId, changeInfo, tab) => {
    if (changeInfo.url){
        SAVED_LINKS.push(changeInfo.url)
    }
}

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {

    
    
    if (request.command === Messages.START) {
        console.log(request.time);

        chrome.tabs.onUpdated.addListener(onUpdatedHandler);
        chrome.tabs.onActivated.addListener(onActivatedHandler);

        setTimeout(() => {
            console.log("TIME TO TURN OFF")
            chrome.tabs.onUpdated.removeListener(onUpdatedHandler);
            chrome.tabs.onActivated.removeListener(onActivatedHandler);
            SAVED_LINKS = []
        }, request.time*1000)
    }

    if (request.command === Messages.END){
        console.log(SAVED_LINKS)
    }
})

console.log('background loaded');
