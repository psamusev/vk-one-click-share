
/***************App**********************/

window.app = window.app || {};
window.vkExtselectionData = window.vkExtselectionData || {};

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
                    share.add();
                }, 1000);

                app.start();
                recipientsStorage.loadContacts();
                recipientsStorage.loadChats();
                app.loadStorageData();
            }
            port.disconnect();
        } else if(response.event === 'getActiveTabId'){
            port.postMessage({msg:'getAccess',tabId: response.tabId});
        }
    });

};

window.app.loadStorageData = function(){
    chrome.storage.local.get(['vkChatData','vkContactData','vkSendFlag'],function(result){
        if(result.vkChatData) {
            window.vkExtselectionData.chat = result.vkChatData;
        }
        if(result.vkContactData){
            window.vkExtselectionData.contact = result.vkContactData;
        }

        var flag = (result.vkSendFlag !== undefined) ? result.vkSendFlag : 'wall';
        $('input:radio[name=sendFlag][value=' + flag + ']').attr('checked', 'checked');
        switch (flag){
            case 'dialog':
                $('#contactList').addClass('activeList');
                if(window.vkExtselectionData.contact){
                    recipientsStorage.showRecipientTitle(window.vkExtselectionData.contact.title)
                }
                break;
            case 'chat':
                $('#chatList').addClass('activeList');
                if(window.vkExtselectionData.chat){
                    recipientsStorage.showRecipientTitle(window.vkExtselectionData.chat.title)
                }
                break;
            case 'wall': $('.inputContainer').hide();
        }
        localStorage.setItem('vk_send_flag',flag);
    });
};

window.app.start = function (){
    share.add();
    contactDialogView.add();

    $('#logout_link').click(function(){
        chrome.storage.local.clear();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('vk_send_flag');
    })
};

$(document).ready(function () {

    function run(){
        chrome.storage.local.get('vkAccessData', function (items) {

            if (items.vkAccessData !== undefined) {
                localStorage.setItem('auth_token', items.vkAccessData.token);
                window.setInterval(function () {
                    share.add();
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

