/**
 * Created by Pavel on 10.05.2014.
 */

vkRequest = window.vkRequest || {};

vkRequest.getChat = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'messages.getChat',
        chat_id = 'chat_id=' + data.id,
        access_token = 'access_token=' + data.token;
    var url = server + method + chat_id + access_token;
    request(url,successCallback,errorCallback);
};

vkRequest.sendRecord = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'messages.send?',
        chat_id = (data.chat_flag)? 'chat_id=' + data.chat_id : 'user_id=' + data.chat_id,
        access_token = '&access_token=' + localStorage.getItem('auth_token'),
        attachment = '&attachment=wall' + data.recordId;
    var url = server + method + chat_id + attachment + access_token;
    console.log(data.recordId);
    request(url,successCallback,errorCallback);
};

function request(url,successCallback,errorCallback){
    $.ajax({
        url:url,
        type:'GET',
        success:successCallback,
        error:errorCallback
    });
}