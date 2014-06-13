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
                showNotificationMessage(notifyTitle,notifyMessage);
                window.setTimeout(function () {
                    $('#vkExtNotificationView').fadeOut(1500);
                }, 2000);
            }
        }, function (error) {
            alert(error.error_msg);
        });
    } else {
        var data = window.vkExtselectionData;
        var notifyTitle = 'Message sent';
        var notifyMessage = 'Your message has been sent';
        vkRequest.sendRecord({
            chat_id: data.id,
            recordId: id_record,
            chat_flag: data.chat
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
                    //'<input id="vk_chat_id" type="number" name="chat_id" min="0" value="0"/>' +
                    '<div style="margin-top: 10px">Select "sending option":</div>' +
                    '<div><input value="dialog" type="radio" name="sendFlag"/> <span style="position: relative;top:-3px">Send to dialog</span></div>' +
                    '<div><input value="chat" type="radio" name="sendFlag"/> <span style="position: relative;top:-3px">Send to chat</span></div>' +
                    '<div><input value="wall" type="radio" name="sendFlag"/> <span style="position: relative;top:-3px">Post to wall</span></div>' +
                    '<div style="height: 33px">' +
                        '<div id="vkRecipientBlock" style="display: none">' +
                            '<div class="inl_block">Recipient: </div>' +
                            '<div id="selectedListItem" class="inl_block btn">' +
                                '<div class="text inl_bl"></div><span class="remove"></span>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="inputContainer">' +
                        '<div id="showContactListBtn" class="input_arr"></div>' +
                        '<input class="input_text" id="vk_recipient" type="text" name="recipient" placeholder="Enter user name"/>' +
                        '<div id="contactList" class="popupList" style="display: none">' +
                            '<div class="contactListItem notFound">Not found contact</div>' +
                        '</div>' +
                        '<div id="chatList" class="popupList" style="display: none">' +
                            '<div class="contactListItem notFound">Not found chat</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="btn" id="addNewContactBtn">Add new contact</div>' +
                '</div>' +
            '</div>' +
            '<div class="vkExtIconSettings">' +
            '<image src="' + chrome.extension.getURL("images/share-icon-min.png") +'"/'  +
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

    $('#addNewContactBtn').bind('click',function(){
        showAddContactDialog();
    });

    $('#showContactListBtn').bind('click',function(){
        var list = $('.activeList');
        if(list.is(':visible')){
            list.hide();
        } else{
            list.show();
            filterList($('#vk_recipient').val());
        }
        return false;

    });

    body.bind('mousedown',function(){
        if(!$(event.target).parents('.vkExtSettings')[0]
            && $(event.target).attr("class") !== 'vkExtSettings'){
                iconSetting.show();
                settings.hide();
                $('.activeList').hide();
        }
    });

    $('input:radio[name=sendFlag]').click(function(){
        $('.activeList').hide();
        var chat_flag = $(this).val();
        if(chat_flag === "chat"){
            $('#contactList').removeClass('activeList');
            $('#chatList').addClass('activeList');
            $('.inputContainer').show();
            $('#vk_recipient').attr('placeholder','Enter chat name');
        } else if(chat_flag === 'dialog'){
            $('#chatList').removeClass('activeList');
            $('#contactList').addClass('activeList');
            $('.inputContainer').show();
            $('#vk_recipient').attr('placeholder','Enter user name');
        } else{
            $('.inputContainer').hide();
        }
        chrome.storage.local.set({'vkSendFlag':chat_flag}, function() {
            localStorage.setItem('vk_send_flag',chat_flag);
        });
    });


    $("#contactList").mCustomScrollbar({
        theme:"dark-2",
        scrollInertia:100,
        mouseWheel:{
            preventDefault:true
        }
    });

    $("#chatList").mCustomScrollbar({
        theme:"dark-2",
        scrollInertia:100,
        mouseWheel:{
            preventDefault:true
        }
    });

    $('.mCSB_container').css('margin-right','10px');

    $('#vk_recipient').bind('input',function(){
        $('.activeList > .notFound').hide();
        var chat_id = $(this).val();
        filterList(chat_id);
    });

    $('#vk_recipient').bind('focus',function(){
        $('.activeList').show();
        filterList($('#vk_recipient').val());
        return false;
    });

    $('#vkRecipientBlock').children('#selectedListItem').children('.remove').bind('click',function(){
        localStorage.setItem('vk_chat_id','');
        $('#vkRecipientBlock').hide();
        chrome.storage.local.remove('vkChatData');
    });
}

function addNotificationView(){
    var body = $('body');
    $("<div></div>",{id:'vkExtNotificationView',class:'vkExtNotificationView'})
        .html('<div class="notification_title">Message sent</div>' +
            '<div id="vkExtNotificationBody" class="notification_body">Your message has been sent</div>'
    ).appendTo(body);
}

function addContactDialog(){
    $("<div></div>",{id:'contactDialog'})
        .html('<div class="box_dialog">' +
            '<div class="header">' +
                '<div class="title">Find Contact</div>' +
                '<div class="fl_r box_close">Close</div>' +
            '</div>' +
            '<div class="inner">' +
                '<div>' +
                    '<span><strong>Enter user ID(chat ID):</strong></span>' +
                    '<input id="vk_user_chat_id" type="number" value="1" min="1" />' +
                '</div>' +
                '<div id="searchContact" class="button_blue" style="top:-7px;margin-left: 10px"><button>Find</button></div>' +
            '</div>' +
            '<div id="searchResult"></div>' +
            '<div id="errorSearch"></div>' +
            '<div class="loading_spinner"><img src="' + chrome.extension.getURL("images/loading.gif")+ '" /> </div>' +
            '</div>')
        .appendTo($('#box_layer_wrap'));

    $('#box_layer_wrap').bind('click',function(){
        if(!$(event.target).parents('#contactDialog')[0]
            && $(event.target).attr("id") !== 'contactDialog'){
            if($('#contactDialog').is(':visible')){
                $('#box_layer_wrap').hide();
                $('#contactDialog').hide();
                $('#searchResult').children('.searchResultItem').remove();
            }
        }
    });

    $('#vk_user_chat_id').bind('keyup',function(){
        if(event.keyIdentifier === 'Enter'){
            $('#searchContact').click();
        }
    });

    $('.box_close').bind('click',function(){
        if($('#contactDialog').is(':visible')){
            $('#box_layer_wrap').hide();
            $('#contactDialog').hide();
            $('#searchResult').children('.searchResultItem').remove();
        }
    });

    $('#searchContact').bind('click',function(){
        $('#errorSearch').hide();
        $('.loading_spinner').show();
        $('#searchResult').children('.searchResultItem').remove();
        vkRequest.findUser({
            id:Number($('#vk_user_chat_id').val()),
            fields:'photo_50'
        },function(response){
            $('.loading_spinner').hide();
            if(response.error){
                if(response.error.error_code === 113){
                    $('#errorSearch').show().text('Your query returned no results.');
                } else{
                    alert(response.error.error_msg);
                }
            } else{
                var item = response.response[0];
                if(item && item.deactivated === undefined) {
                    var resultContainer = $('#searchResult');
                    $('<div class="searchResultItem">' +
                        '<div class="inl_block"><img src="' + item.photo_50 + '"/> </div>' +
                        '<div class="text_item inl_block"><strong>' + item.first_name + ' ' + item.last_name + '</strong></div>' +
                        '<div id="addToContact" class="button_blue inl_block" style="top:-30px;margin-left: 10px"><button>Add to contact</button></div>' +
                        '<div class="notify inl_block"></div>' +
                        '</div>')
                        .appendTo(resultContainer);
                    $('#addToContact').bind('click', {ID: item.uid}, function (event) {
                        var res = false;
                        window.contactList.forEach(function (item) {
                            if (item.uid === event.data.ID) {
                                res = true;
                            }
                        });
                        if (res) {
                            $('#searchResult').children().children('.notify')
                                .addClass('notify_error_text')
                                .text('This contact already added');
                        } else {
                            window.contactList.push(item);
                            chrome.storage.local.set({'vkContactList': window.contactList});
                            var contactList = $('#contactList');
                            var contactListItem = $('<div class="contactListItem">' +
                                '<div class="inl_block"><img src="' + item.photo_50 + '"/> </div><div class="text_item">' + item.first_name + ' ' + item.last_name + '</div>'
                                + '</div>');
                            contactListItem.bind('click',{id:item.uid,title:item.first_name + ' ' + item.last_name,chat:false},function(event){
                                selectListItem(event.data);
                            });
                            contactList.append(contactListItem);
                            $('#searchResult').children().children('.notify')
                                .addClass('notify_success_text')
                                .text('Contact added');
                        }
                    })
                } else if(item && item.deactivated){
                    $('#errorSearch').show().text('User was deleted');
                }else{
                    $('#errorSearch').show().text('Your query returned no results.');
                }
            }
        },function(error){

        })
    })
}

function selectListItem(data){
    showRecipientTitle(data.title);
    chrome.storage.local.set({'vkChatData': data}, function() {
        localStorage.setItem('vk_chat_id',data.id);
    });
    window.vkExtselectionData = data;
    $('.activeList').hide();
}

function showRecipientTitle(title){
    $('#vkRecipientBlock').children('#selectedListItem').children('.text').text(title);
    $('#vkRecipientBlock').show();
}

function filterList(val){
    var list = $(".activeList > .mCustomScrollBox > .mCSB_container > .contactListItem");
    if(val === ''){

        list.each(function(){
            if($(this).attr('class').indexOf('notFound') < 0){
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    } else {
        var countHide = 0;
        list.each(function () {
            var item = $(this).children('.text_item');
            if(item[0] != undefined){
                var text = item.text().toLowerCase();
                if (text.indexOf(val) >= 0) {
                    $(this).show()
                } else {
                    $(this).hide();
                    countHide++;
                }
            }
        });
        if (countHide === list.length- 1) {
            $('.activeList > .mCustomScrollBox > .mCSB_container > .notFound').show();
        }
    }
}

function fillContactList(){
    chrome.storage.local.get('vkContactList',function(result){

        function fill(items){
            var contactList = $('#contactList > .mCustomScrollBox > .mCSB_container');
            items.forEach(function(item){
                var contactListItem = $('<div class="contactListItem">' +
                    '<div class="inl_block"><img src="' + item.photo_50 + '"/> </div><div class="text_item">' + item.first_name + ' ' + item.last_name + '</div>'
                    + '</div>');
                contactListItem.bind('click',{id:item.uid,title:item.first_name + ' ' + item.last_name,chat:false},function(event){
                    selectListItem(event.data);
                });
                contactList.append(contactListItem);
            });
        };

        window.contactList = result.vkContactList;
        if(result.vkContactList === undefined){
            vkRequest.getFriends({
                order:'hints',
                fields:'photo_50'
            },function(response){
                if(response.error){
                    alert(response.error.error_msg);
                } else{
                    window.contactList = response.response;
                    chrome.storage.local.set({'vkContactList': response.response});
                    fill(response.response);
                }
            },function(error){

            })
        } else {
            fill(result.vkContactList);
        }

    });
}

function fillChatList(){
    chrome.storage.local.get('vkChatList',function(result){

        function fill(items){
            var chatList = $('#chatList > .mCustomScrollBox > .mCSB_container');
            items.forEach(function(item){
                var chatListItem = $('<div class="contactListItem">' +
                    '<div class="inl_block"><img src="' + item.photo_50 + '"/> </div><div class="text_item">' + item.title + '</div>'
                    + '</div>');
                chatListItem.bind('click',{id:item.chatId,title:item.title,chat:true},function(event){
                    selectListItem(event.data);
                });
                chatList.append(chatListItem);
            });
        };

        window.chatList = result.vkChatList || [];
        if(result.vkChatList === undefined){
            vkRequest.getAllChats({
                count:200
            },function(response){
                if(response.error){
                    alert(response.error.error_msg);
                } else{
                    response.response.forEach(function(item){
                        if(item.chat_id){
                            window.chatList.push({
                                photo_50:item.photo_50 || 'http://vk.com/images/camera_50.gif',
                                title:item.title,
                                chatId:item.chat_id
                            })
                        }
                    });
                    chrome.storage.local.set({'vkChatList': window.chatList});
                    fill(window.chatList);
                }
            },function(error){

            })
        } else {
            fill(window.chatList);
        }

    });
}

function showAddContactDialog(){
    $('#box_layer_wrap').css('background-color','rgba(0,0,0,0.5)').show();
    $('#contactDialog').show();
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
    addContactDialog();
    fillContactList();
    fillChatList();

    chrome.storage.local.get('vkAccessData', function(items) {
        localStorage.setItem('auth_token',items.vkAccessData.token);
    });

    chrome.storage.local.get('vkChatData',function(result){
        if(result.vkChatData) {
            localStorage.setItem('vk_chat_id', result.vkChatData.id);
            showRecipientTitle(result.vkChatData.title);
            window.vkExtselectionData = result.vkChatData;
        }
    });

    chrome.storage.local.get('vkSendFlag',function(result){
        var flag = (result.vkSendFlag !== undefined) ? result.vkSendFlag : 'wall';
        $('input:radio[name=sendFlag][value=' + flag + ']').attr('checked', 'checked');
        switch (flag){
            case 'dialog': $('#contactList').addClass('activeList'); break;
            case 'chat': $('#chatList').addClass('activeList'); break;
        }
        localStorage.setItem('vk_send_flag',flag);
    });


}

$(document).ready(function () {
    var interval = window.setInterval(function(){
        addShareToChatButton();
    },1000);

    start();
});

