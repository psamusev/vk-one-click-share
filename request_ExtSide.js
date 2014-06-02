
vkRequest = window.vkRequest || {};

vkRequest.OAuthURL = vkRequest.OAuthURL || {};

vkRequest.auth = function(callback){
    var client_id = 4354846,
        scope = 'messages wall offline docs',
        redirect_uri = 'http%3A%2F%2Foauth.vk.com%2Fblank.html',
        display = 'page',
        response_type = 'token';
    var vkAuthenticationUrl = 'https://oauth.vk.com/authorize?client_id=' + client_id +
        '&scope=' + scope +
        'redirect_uri=' + redirect_uri +
        '&display=' + display +
        '&response_type=' + response_type;
    chrome.tabs.create({url: vkAuthenticationUrl, selected: true}, function (tab) {
        chrome.tabs.onUpdated.addListener(listenerHandler(tab.id));
    });


    function listenerHandler(authenticationTabId) {
        "use strict";

        return function tabUpdateListener(tabId, changeInfo) {
            var vkAccessToken,
                vkAccessTokenExpiredFlag,
                vkUserID;

            if (tabId === authenticationTabId && changeInfo.url !== undefined && changeInfo.status === "loading") {

                if (changeInfo.url.indexOf('oauth.vk.com/blank.html') > -1) {
                    authenticationTabId = null;
                    chrome.tabs.onUpdated.removeListener(tabUpdateListener);

                    vkAccessToken = getUrlParameterValue(changeInfo.url, 'access_token');

                    if (vkAccessToken === undefined || vkAccessToken.length === undefined) {
                        alert('vk auth response problem access_token length = 0 or vkAccessToken == undefined');
                        return;
                    }

                    vkAccessTokenExpiredFlag = Number(getUrlParameterValue(changeInfo.url, 'expires_in'));

                    vkUserID = Number(getUrlParameterValue(changeInfo.url, 'user_id'));

                    vkRequest.OAuthURL = {
                        token:vkAccessToken,
                        ExpiredTime: vkAccessTokenExpiredFlag,
                        userId:vkUserID
                    };

                    /*if (vkAccessTokenExpiredFlag !== 0) {
                     alert('error');
                     return;
                     }*/

                    chrome.storage.local.set({'vkAccessData': vkRequest.OAuthURL});
                    chrome.storage.local.get('vkChatId',function(result){
                        if(result.vkChatId === undefined){
                            chrome.storage.local.set({'vkChatId': vkUserID});
                        }
                    });
                }
            }
        };
    }
};

function getUrlParameterValue(url, parameterName) {
    "use strict";

    var urlParameters  = url.substr(url.indexOf("#") + 1),
        parameterValue = "",
        index,
        temp;

    urlParameters = urlParameters.split("&");

    for (index = 0; index < urlParameters.length; index += 1) {
        temp = urlParameters[index].split("=");

        if (temp[0] === parameterName) {
            return temp[1];
        }
    }

    return parameterValue;
}