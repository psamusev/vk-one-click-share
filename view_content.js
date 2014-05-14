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
            }).html("<span class='post_share_link fl_l'>Share to Chat</span>" +
                "<i class='post_share_icon sp_main fl_l'></i> ")
                .appendTo(wallRecord);
        }
    });
}

function sendMessageToGroup(id_record){
    var id = Number(localStorage.getItem('vk_chat_id'));

    vkRequest.sendRecord({
        chat_id:id,
        recordId:id_record,
        chat_flag:$('#vk_chat_flag').prop("checked")
    },function(){
        alert("success");
    },function(error){
        alert(error.error_msg);
    });
}

function addSettingsRegion(){

    var body = $('body');
    $("<div></div>",{id:'outerVkExtSettings'})
        .html('<div class="vkExtSettings">' +
                '<div class="itemSettings">' +
                    '<label for="chat_id">Enter user ID(Or chat ID):</label>' +
                    '<input id="vk_chat_id" type="number" name="chat_id"/>' +
                    '<input id="vk_chat_flag" type="checkbox"/ > Send to chat?' +
                    '<button id="apllyChatID"> Apply </button>' +
                '</div>' +
                '<div class="itemSettings">' +
                    '<button id="reinstallAuthToken">Reinstall token</button>' +
                    '<button id="resetToken">Reset token</button>' +
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
        if(!$(event.target).parent('.vkExtSettings')[0]){
            iconSetting.show();
            settings.hide();
        }
    });
}

function start(){

    chrome.storage.local.get('vkAccessData', function(items) {
        localStorage.setItem('auth_token',items.vkAccessData.token);
    });

    chrome.storage.local.get('vkChatId',function(result){
        localStorage.setItem('vk_chat_id',result.vkChatId);
    });

    addShareToChatButton();
    addSettingsRegion();

    $('#apllyChatID').click(function(){

        var chat_id = $('vk_chat_id').val();

        chrome.storage.local.set({'vkChatId':chat_id}, function() {
            localStorage.setItem('vk_chat_id',chat_id);
        });
    });

    $('#resetToken').click(function(){
        chrome.storage.local.remove('vkAccessData');
    });

    $('#reinstallAuthToken').click(function(){
        chrome.runtime.sendMessage({msg:'reinstallToken'}, function (response) {
            alert(response.msg);
        });
    });
}
/*
var interval = window.setInterval(function(){
    addShareToChatButton();
},1000);*/

start();