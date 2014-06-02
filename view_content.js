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
                    click:shareRecord.bind(null,id_record)
                }
            }).html("<span class='post_share_link fl_l'>Click to share</span>" +
                "<i class='post_share_icon sp_main fl_l'></i> ")
                .appendTo(wallRecord);
        }
    });
}

function shareRecord(id_record){
    var id = Number(localStorage.getItem('vk_chat_id'));
    var vk_chat_flag = (localStorage.getItem('vk_send_flag') === 'chat');
    var sendToWall = (localStorage.getItem('vk_send_flag') === 'wall');

    if(sendToWall) {
        var notifyTitle = 'Record posted';
        var notifyMessage = 'Record has posted to your wall';
        vkRequest.postRecord({
            recordId: id_record
        }, function (response) {
            if (response.error) {
                if(response.error.error_code === 15){
                    response.error.error_msg = "Record already posted: This record already posted to your wall."
                }
                showErrorMessage(response.error);
            } else {
                showNotificationMessage(notifyTitle,notifyMessage)
                window.setTimeout(function () {
                    $('#vkExtNotificationView').fadeOut(1500);
                }, 2000);
            }
        }, function (error) {
            alert(error.error_msg);
        });
    } else {

        var notifyTitle = 'Message sent';
        var notifyMessage = 'Your message has been sent';
        vkRequest.sendRecord({
            chat_id: id,
            recordId: id_record,
            chat_flag: vk_chat_flag
        }, function (response, one) {
            if (response.error) {
                if(response.error.error_code === 1){
                    response.error.error_msg = "Message didn't send: This record can't be send. Please check 'sending option'"
                }
                showErrorMessage(response.error);
            } else {
                showNotificationMessage(notifyTitle,notifyMessage);
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
                    '<div>Enter user ID(Or chat ID):</div>' +
                    '<input id="vk_chat_id" type="number" name="chat_id" min="0" value="0"/>' +
                    '<div style="margin-top: 10px">Select "sending option":</div>' +
                    '<div><input value="dialog" type="radio" name="sendFlag"/> <span style="position: relative;top:-3px">Send to dialog</span></div>' +
                    '<div><input value="chat" type="radio" name="sendFlag"/> <span style="position: relative;top:-3px">Send to chat</span></div>' +
                    '<div><input value="wall" type="radio" name="sendFlag"/> <span style="position: relative;top:-3px">Post to wall</span></div>' +
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
        if(!$(event.target).parents('.vkExtSettings')[0]
            && $(event.target).attr("class") !== 'vkExtSettings'){
                iconSetting.show();
                settings.hide();
        }
    });

    $('input:radio[name=sendFlag]').click(function(){
        var chat_flag = $(this).val();
        chrome.storage.local.set({'vkSendFlag':chat_flag}, function() {
            localStorage.setItem('vk_send_flag',chat_flag);
        });
    });

    $('input[type=number][id=vk_chat_id]').bind('input',function(){
        var chat_id = $(this).val();

        chrome.storage.local.set({'vkChatId':chat_id}, function() {
            localStorage.setItem('vk_chat_id',chat_id);
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

function showErrorMessage(error){
    var errorTitle = error.error_msg.replace(/:.+/g,'');
    var errorMessage = error.error_msg.replace(/.+:/g,'').trim() + '<br>';
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

function showNotificationMessage(title, message){
    $('#vkExtNotificationView').children('.notification_title').text(title);
    $('#vkExtNotificationView').children('.notification_body').text(message);
    $('#vkExtNotificationView').show();
}

function start(){
    addShareToChatButton();
    addSettingsRegion();
    addNotificationView();

    chrome.storage.local.get('vkAccessData', function(items) {
        localStorage.setItem('auth_token',items.vkAccessData.token);
    });

    chrome.storage.local.get('vkChatId',function(result){
        localStorage.setItem('vk_chat_id',result.vkChatId);
        if(result.vkChatId !== undefined) {
            $('#vk_chat_id').val(result.vkChatId);
        }
    });

    chrome.storage.local.get('vkSendFlag',function(result){
        var flag = (result.vkSendFlag !== undefined) ? result.vkSendFlag : 'wall';
        $('input:radio[name=sendFlag][value=' + flag + ']').attr('checked', 'checked');
        localStorage.setItem('vk_send_flag',flag);
    });


}

var interval = window.setInterval(function(){
    addShareToChatButton();
},1000);

start();