/***************Request**********************/


window.vkRequest = window.vkRequest || {};

window.vkRequest.getChat = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'messages.getChat?',
        chat_id = 'chat_id=' + data.id,
        access_token = '&access_token=' + data.token;
    var url = server + method + chat_id + access_token;
    request(url,successCallback,errorCallback);
};
window.vkRequest.getAllChats = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'messages.getDialogs?',
        count = 'count=' + data.count,
        access_token = '&access_token=' + localStorage.getItem('auth_token');
    var url = server + method + count +  access_token;
    request(url,successCallback,errorCallback);
};

window.vkRequest.findUser = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'users.get?',
        user_id = 'user_ids=' + data.id,
        fields = '&fields=' + data.fields,
        access_token = '&access_token=' + localStorage.getItem('auth_token');
    var url = server + method + user_id + fields + access_token;
    request(url,successCallback,errorCallback);
};

window.vkRequest.getFriends = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'friends.get?',
        order = 'order=' + data.order,
        fields = '&fields=' + data.fields,
        access_token = '&access_token=' + localStorage.getItem('auth_token');
    var url = server + method + order + fields + access_token;
    request(url,successCallback,errorCallback);
};

window.vkRequest.sendRecord = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'messages.send?',
        chat_id = (data.chat_flag)? 'chat_id=' + data.chat_id : 'user_id=' + data.chat_id,
        access_token = '&access_token=' + localStorage.getItem('auth_token'),
        record = '&attachment=' + data.record.type + data.record.id;
    var url = server + method + chat_id + record + access_token;
    request(url,successCallback,errorCallback);
};

window.vkRequest.postRecord = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'wall.repost?',
        access_token = '&access_token=' + localStorage.getItem('auth_token'),
        record = '&object' + data.record.type + data.record.id;
    var url = server + method + record + access_token;
    request(url,successCallback,errorCallback);
};

window.vkRequest.storageSet = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'storage.set?',
        key = 'key=' + data.key,
        value = '&value=' + data.value,
        user_id = '&user_id=' + data.userId;
    var url = server + method + key + value + user_id;
    request(url,successCallback,errorCallback);
};

window.vkRequest.storageGet = function(data,successCallback,errorCallback){
    var server = 'https://api.vk.com/method/',
        method = 'storage.get?',
        key = 'key=' + data.key,
        user_id = '&user_id=' + data.userId,
        global = '&global=1';
    var url = server + method + key + global;
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