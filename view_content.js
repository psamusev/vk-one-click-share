/**
 * Created by Pavel on 10.05.2014.
 */
function addShareToChatButton(){
    $('.post_full_like').each(function(i){
        var wallRecord = $(this);
        if(wallRecord.html().indexOf('shareToChat') <= -1) {

            var id_record = wallRecord.children('.post_like').children('.post_like_link')[0].id.replace('like_link', '');
            $("<div></div>",{
                class:'shareToChat post_share fl_r',
                on:{
                    click:sendMessageToGroup.bind(null,id_record)
                }
            }).html("<span class='post_share_link fl_l'>Click to share</span>" +
                "<i class='post_share_icon sp_main fl_l'></i> ")
                .appendTo(wallRecord);
        }
    });
}

function sendMessageToGroup(id_record){
    var id = Number(localStorage.getItem('vk_chat_id'));
    var vk_chat_flag = (localStorage.getItem('vk_chat_flag_ext') === 'true');
    var sendToWall = (id === Number(localStorage.getItem('user_id')));

    if(sendToWall) {
        vkRequest.postRecord({
            recordId: id_record
        }, function (response) {
            if (response.error) {
                showErrorMessages(response.error);
            } else {
                $('#vkExtNotificationView').show();
                window.setTimeout(function () {
                    $('#vkExtNotificationView').fadeOut(1500);
                }, 2000);
            }
        }, function (error) {
            alert(error.error_msg);
        });
    } else {

        vkRequest.sendRecord({
            chat_id: id,
            recordId: id_record,
            chat_flag: vk_chat_flag
        }, function (response, one) {
            if (response.error) {
                showErrorMessages(response.error);
            } else {
                $('#vkExtNotificationView').show();
                window.setTimeout(function () {
                    $('#vkExtNotificationView').fadeOut(1500);
                }, 2000);
            }

        }, function (error) {
            alert(error.error_msg);
        });
    }
}

function addSettingsRegion(){

    var body = $('body');
    $("<div></div>",{id:'outerVkExtSettings'})
        .html('<div class="vkExtSettings">' +
                '<div class="itemSettings">' +
                    '<label for="chat_id">Enter user ID(Or chat ID):</label>' +
                    '<input id="vk_chat_id" type="number" name="chat_id" min="0" />' +
                    '<input id="vk_chat_flag_ext" type="checkbox" /> <span style="position: relative;top:-3px">Send to chat?</span>' +
                    '<div>' +
                        '<div id="apllyChatID" class="btn"> Apply </div>' +
                        '<div id="reinstallAuthToken" class="btn">Reinstall token</div>' +
                    '</div>' +
                '</div>' +
                '<div class="itemSettings">' +

                    /*'<button id="resetToken">Reset token</button>' +
                    '<button id="resetFlag">Reset chat flag</button>' +
                    '<button id="resetChatId">Reset chat Id</button>' +*/
                '</div>' +
            '</div>' +
            '<div class="vkExtIconSettings">' +
            '<image src="' + chrome.extension.getURL("share-icon-min.png") +'"/'  +
            '</div>'
    ).appendTo(body);

    var settings = $('.vkExtSettings');
    var iconSetting = $('.vkExtIconSettings');

    iconSetting.bind('mouseenter',function(){
        $(this).animate({
            left:0,
            opacity:1
        },"fast");
    });

    iconSetting.bind('mouseleave',function(){
        $(this).animate({
            left:'15px',
            opacity:0.7
        },"fast");
    });

    iconSetting.bind('click',function(){
        $(this).hide();
        settings.show();
        event.stopPropagation();

    });

    body.bind('click',function(){
        if(!$(event.target).parent('.vkExtSettings')[0]
            && !$(event.target).parent('.vkExtSettings > .itemSettings')[0]
            && $(event.target).attr("class") !== 'vkExtSettings'){
                iconSetting.show();
                settings.hide();
        }
    });

    $('#apllyChatID').click(function(){

        var chat_id = $('#vk_chat_id').val();
        var chat_flag = $('#vk_chat_flag_ext').prop("checked");

        chrome.storage.local.set({'vkChatFlag':chat_flag}, function() {
            localStorage.setItem('vk_chat_flag_ext',chat_flag);
        });

        chrome.storage.local.set({'vkChatId':chat_id}, function() {
            localStorage.setItem('vk_chat_id',chat_id);
        });
    });

    $('#resetToken').click(function(){
        chrome.storage.local.remove('vkAccessData');
    });

    $('#resetFlag').click(function(){
        chrome.storage.local.remove('vkChatFlag');
    });

    $('#resetChatId').click(function(){
        chrome.storage.local.remove('vkChatId');
    });

    $('#reinstallAuthToken').click(function(){
        chrome.runtime.sendMessage({msg:'reinstallToken'}, function (response) {
            alert(response.msg);
            chrome.storage.local.get('vkAccessData', function(items) {
                localStorage.setItem('auth_token',items.vkAccessData.token);
            });
        });
    });
}

function addNotificationView(){
    var body = $('body');
    $("<div></div>",{id:'vkExtNotificationView',class:'vkExtNotificationView'})
        .html('<div class="notification_title">Message sent</div>' +
            '<div id="vkExtNotificationBody" class="notification_body">Your message has been sent</div>'
    ).appendTo(body);
}

function showErrorMessages(error){
    var errorTitle = error.error_msg.replace(/:.+/g,'');
    var errorMessage = (error.error_code === 1) ? '' : error.error_msg.replace(/.+:/g,'').trim(); + '<br>';
    var body = $('body');
    var message = $("<div></div>",{class:'vkExtNotificationView errorNotify'})
        .html('<div class="notification_title">' + errorTitle + '</div>' +
            '<div id="vkExtNotificationBody" class="notification_body">' + errorMessage + 'Click any place to close this message(it will be automatically closed after 5 sec.)</div>'
    ).appendTo(body);

    function closeErrorNotification(){
        body.unbind('click',function(){
            closeErrorNotification();
        });
        message.fadeOut(1500,function(){
            message.remove();
        });
    }

    body.bind('click',function(){
       closeErrorNotification();
    });

    window.setTimeout(function(){
        closeErrorNotification();
    },5000);

}

function start(){
    addShareToChatButton();
    addSettingsRegion();
    addNotificationView();

    chrome.storage.local.get('vkAccessData', function(items) {
        localStorage.setItem('user_id',items.vkAccessData.userId);
        localStorage.setItem('auth_token',items.vkAccessData.token);
    });

    chrome.storage.local.get('vkChatId',function(result){
        localStorage.setItem('vk_chat_id',result.vkChatId);
        $('#vk_chat_id').val(result.vkChatId);
    });

    chrome.storage.local.get('vkChatFlag',function(result){
        var flag = (result.vkChatFlag !== undefined) ? result.vkChatFlag : false;
        $('#vk_chat_flag_ext').prop("checked",flag);
        localStorage.setItem('vk_chat_flag_ext',flag);
    });


}

var interval = window.setInterval(function(){
    addShareToChatButton();
},1000);

start();