/***************View**********************/

window.view = window.view || {};

window.view.addShareToChatButton = function (){

    function shareRecord(id_record){
        var sendToWall = (localStorage.getItem('vk_send_flag') === 'wall');
        var notifyTitle = (sendToWall) ? 'Record posted' : 'Message sent';
        var notifyMessage = (sendToWall) ? 'Record has posted to your wall' : 'Your message has been sent';
        if(sendToWall) {
            vkRequest.postRecord({
                recordId: id_record
            }, function (response) {
                if (response.error) {
                    if(response.error.error_code === 15){
                        response.error.error_msg = "Record already posted: This record already posted to your wall."
                    }
                    notificationView.showErrorMessage(response.error);
                } else {
                    notificationView.showMessage(notifyTitle,notifyMessage);
                    window.setTimeout(function () {
                        $('#vkExtNotificationView').fadeOut(1500);
                    }, 2000);
                }
            }, function (error) {
                alert(error.error_msg);
            });
        } else {
            var data = window.vkExtselectionData;
            vkRequest.sendRecord({
                chat_id: data.id,
                recordId: id_record,
                chat_flag: data.chat
            }, function (response) {
                if (response.error) {
                    if(response.error.error_code === 1){
                        response.error.error_msg = "Message didn't send: This record can't be send. Please check 'sending option'"
                    }
                    notificationView.showErrorMessage(response.error);
                } else {
                    notificationView.showMessage(notifyTitle,notifyMessage);
                    window.setTimeout(function () {
                        $('#vkExtNotificationView').fadeOut(1500);
                    }, 2000);
                }

            }, function (error) {
                alert(error.error_msg);
            });
        }
    }

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
};

window.view.addSettingsRegion = function (){

    var body = $('body');
    $("<div></div>",{id:'outerVkExtSettings'})
        .html('<div id="vkExtSettings" class="vkExtPanel">' +
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
            '<div id="vkExtEnablePanel" class="vkExtPanel" style="float:right">' +
            '<div class="btn" id="enableExtButton">Launch</div>' +
            '</div>'+
            '<div class="vkExtIconSettings">' +
            '<image src="' + chrome.extension.getURL("images/share-icon-min.png") +'"/'  +
            '</div>'
    ).appendTo(body);

    var settings = $('#vkExtSettings');
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
        if(localStorage.getItem('auth_token')){
            settings.show();
        } else{
            $('#vkExtEnablePanel').show();
        }

        event.stopPropagation();

    });

    $('#addNewContactBtn').bind('click',function(){
        view.showAddContactDialog();
    });

    $('#showContactListBtn').bind('click',function(){
        var list = $('.activeList');
        if(list.is(':visible')){
            list.hide();
        } else{
            list.show();
            recipientsStorage.filter($('#vk_recipient').val());
        }
        return false;

    });

    $('#enableExtButton').click(function(){
        var showIconInterval = window.setInterval(function(){
            if(window.recipientsStorage.chats && window.recipientsStorage.contacts){
                clearInterval(showIconInterval);
                iconSetting.show();
            }
        },100);

        $('#vkExtEnablePanel').hide();
        app.authorization();
    });

    body.bind('mousedown',function(){
        if(!$(event.target).parents('.vkExtPanel')[0]
            && $(event.target).attr("class") !== 'vkExtPanel'){
            iconSetting.show();
            $('.vkExtPanel').hide();
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
        recipientsStorage.filter(chat_id);
    });

    $('#vk_recipient').bind('focus',function(){
        $('.activeList').show();
        recipientsStorage.filter($('#vk_recipient').val());
        return false;
    });

    $('#vkRecipientBlock').children('#selectedListItem').children('.remove').bind('click',function(){
        localStorage.setItem('vk_chat_id','');
        $('#vkRecipientBlock').hide();
        chrome.storage.local.remove('vkChatData');
    });
};

window.view.addContactDialog = function (){
    $("<div></div>",{id:'contactDialog'})
        .html('<div class="box_dialog">' +
            '<div class="header">' +
            '<div class="title">Find Contact</div>' +
            '<div class="fl_r box_close">Close</div>' +
            '</div>' +
            '<div class="inner">' +
            '<div>' +
            '<span><strong>Enter user ID:</strong></span>' +
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
                        '<div class="inl_block"><img src="' + app.convertImageToHttpsPath(item.photo_50) + '"/> </div>' +
                        '<div class="text_item inl_block"><strong>' + item.first_name + ' ' + item.last_name + '</strong></div>' +
                        '<div id="addToContact" class="button_blue inl_block" style="top:-30px;margin-left: 10px"><button>Add to contact</button></div>' +
                        '<div class="notify inl_block"></div>' +
                        '</div>')
                        .appendTo(resultContainer);
                    $('#addToContact').bind('click', {ID: item.uid}, function (event) {
                        var res = false;
                        window.recipientsStorage.contacts.forEach(function (item) {
                            if (item.uid === event.data.ID) {
                                res = true;
                            }
                        });
                        if (res) {
                            $('#searchResult').children().children('.notify')
                                .removeClass('notify_success_text')
                                .addClass('notify_error_text')
                                .text('This contact already added');
                        } else {
                            window.recipientsStorage.contacts.push(item);
                            chrome.storage.local.set({'vkContactList': window.recipientsStorage.contacts});
                            var contactList = $('#contactList').find('> .mCustomScrollBox > .mCSB_container');
                            recipientsStorage.addItem(contactList,item,'contactList');
                            $('#searchResult').children().children('.notify')
                                .removeClass('notify_error_text')
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
};

window.view.addViewExt = function (){
    view.addSettingsRegion();
    notificationView.add();
    window.recipientsStorage.chats = undefined;
    window.recipientsStorage.contacts = undefined;
};

window.view.showAddContactDialog = function (){
    $('#box_layer_wrap').css('background-color','rgba(0,0,0,0.5)').show();
    $('#contactDialog').show();
};