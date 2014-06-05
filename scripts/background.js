/**
 * Created by Pavel on 10.05.2014.
 */


chrome.storage.local.get('vkAccessData', function(items) {
    if (items.vkAccessData === undefined) {
        vkRequest.auth();
    }
});

function listenerHandler(vkTabId){
    return function tabUpdateListener(tabId, changeInfo,tab) {

        if (tab.title.indexOf('vk.com/feed') > -1 && changeInfo.status === "loading") {
            chrome.tabs.executeScript(tab.id, { file: 'file.js' });
        }
    };
}

chrome.runtime.onMessage.addListener(
    function (request, recipient, sendResponse) {
        switch (request.msg){
            case 'reinstallToken': vkRequest.auth(); sendResponse({msg:"Ok"});break;
        }

    });



