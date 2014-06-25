/**
 * Created by Pavel on 10.05.2014.
 */


chrome.storage.local.get('vkChatData', function(items) {
    if (items.vkChatData !== undefined && items.vkChatData.chat !== true) {
        chrome.storage.local.remove('vkChatData');
    }
});

chrome.runtime.onConnect.addListener(function(port) {

    port.onMessage.addListener(function(request) {
        if(request.msg === 'getAccess'){
            vkRequest.auth({
                focusedTabId: request.tabId,
                successCallback: function(token){
                    port.postMessage({event:'getAccess',msg:"Ok",token:token});
                },
                errorCallback: function(){
                    port.postMessage({event:'getAccess',msg:"Cancel"});
                }
            });
        } else if(request.msg === 'getActiveTabId'){
            chrome.tabs.query({active:true},function(tabs){
                var actTab = null;
                try {
                    tabs.forEach(function (tab) {
                        if (tab.url.indexOf('vk.com')) {
                            actTab = tab;
                            throw 'done'
                        }
                    });
                } catch (e){
                    if(e === 'done'){
                        port.postMessage({event: 'getActiveTabId', tabId: actTab.id});
                    }
                }
            })

        }
    });
});


