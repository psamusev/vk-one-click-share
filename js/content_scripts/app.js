
/***************App**********************/

window.app = window.app || {};

window.app.isLoginPage = function (){
    return (document.getElementById('logout_link') === null);
};

window.app.convertImageToHttpsPath = function(url){
    var resUrl = url;
    if(url.indexOf('camera_50') > 0){
        resUrl = url.replace(/http/,'https');
    } else if(url.indexOf('https') < 0){
        resUrl = url.replace(/http:\/\/cs/,'https://c').replace(/.vk.me/,'').replace(/https:\/\//,'https://pp.vk.me/');
    }
    return resUrl;
};

window.app.authorization = function (){
/*    var vkObjectScript = document.js[0].textContent;
    var startI = vkObjectScript.indexOf('{');
    var endI = vkObjectScript.indexOf('}');
    var id = Number(vkObjectScript.substring(startI,endI + 1).match(/id: \d+/)[0].replace('id: ',''));*/
    var port = chrome.runtime.connect({name:'accessConnection'});
    port.postMessage({msg:'getActiveTabId'});
    port.onMessage.addListener(function(response) {
        if(response.event === 'getAccess') {
            if (response.msg.toLowerCase() === 'ok') {
                localStorage.setItem('auth_token', response.token);
                window.setInterval(function () {
                    view.addShareToChatButton();
                }, 1000);

                app.start();
            }
            port.disconnect();
        } else if(response.event === 'getActiveTabId'){
            port.postMessage({msg:'getAccess',tabId: response.tabId});
        }
    });

};

window.app.loadStorageData = function(){
    chrome.storage.local.get('vkChatData',function(result){
        if(result.vkChatData) {
            localStorage.setItem('vk_chat_id', result.vkChatData.id);
            recipientsStorage.showRecipientTitle(result.vkChatData.title);
            window.vkExtselectionData = result.vkChatData;
        }
    });

    chrome.storage.local.get('vkSendFlag',function(result){
        var flag = (result.vkSendFlag !== undefined) ? result.vkSendFlag : 'wall';
        $('input:radio[name=sendFlag][value=' + flag + ']').attr('checked', 'checked');
        switch (flag){
            case 'dialog': $('#contactList').addClass('activeList'); break;
            case 'chat': $('#chatList').addClass('activeList'); break;
            case 'wall': $('.inputContainer').hide();
        }
        localStorage.setItem('vk_send_flag',flag);
    });
};

window.app.start = function (){
    view.addShareToChatButton();
    contactDialogView.add();

    $('#logout_link').click(function(){
        chrome.storage.local.remove('vkAccessData');
        chrome.storage.local.remove('vkSendFlag');
        chrome.storage.local.remove('vkChatData');
        chrome.storage.local.remove('vkChatList');
        chrome.storage.local.remove('vkContactList');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('vk_chat_id');
        localStorage.removeItem('vk_send_flag');
    })
};

$(document).ready(function () {

    function run(){
        chrome.storage.local.get('vkAccessData', function (items) {

            if (items.vkAccessData !== undefined) {
                localStorage.setItem('auth_token', items.vkAccessData.token);
                window.setInterval(function () {
                    view.addShareToChatButton();
                }, 1000);
                app.start();
            }
            view.addViewExt();
        })
    }

    if(!app.isLoginPage()){
        run();
    } else {
        var showExtInterval = window.setInterval(function () {
            if (!app.isLoginPage()) {
                clearInterval(showExtInterval);
                run();
            }

        }, 5000);
    }

});

