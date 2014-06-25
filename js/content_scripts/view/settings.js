
/***************SettingView**********************/

window.settingsView = window.settingsView || {};

window.settingsView.add = function(){
    $("<div></div>",{id:'outerVkExtSettings'})
        .load(chrome.extension.getURL('templates/settings.tmpl.html'),function(){
            settingsView.bindEvents();
            if(localStorage.getItem('auth_token')){
                recipientsStorage.loadContacts();
                recipientsStorage.loadChats();
                app.loadStorageData();
            }
        })
        .appendTo($('body'));
};

window.settingsView.bindEvents = function(){
    var settings = $('#vkExtSettings');
    var iconSetting = $('.vkExtIconSettings');

    iconSetting.find('img').attr('src',chrome.extension.getURL('images/share-icon-min.png'));

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
        contactDialogView.show();
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

    $('body').bind('mousedown',function(){
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

            (window.vkExtselectionData.chat) ?
                recipientsStorage.showRecipientTitle(window.vkExtselectionData.chat.title) :
                recipientsStorage.hideRecipientTitle();

            $('#contactList').removeClass('activeList');
            $('#chatList').addClass('activeList');
            $('.inputContainer').show();
            $('#vk_recipient').attr('placeholder','Enter chat name');
        } else if(chat_flag === 'dialog'){

            (window.vkExtselectionData.contact) ?
                recipientsStorage.showRecipientTitle(window.vkExtselectionData.contact.title) :
                recipientsStorage.hideRecipientTitle();

            $('#chatList').removeClass('activeList');
            $('#contactList').addClass('activeList');
            $('.inputContainer').show();
            $('#vk_recipient').attr('placeholder','Enter user name');
        } else{
            recipientsStorage.hideRecipientTitle();
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
        $('#vkRecipientBlock').hide();
        var flag = $('input:radio[name=sendFlag][value=' + localStorage.getItem('vk_send_flag') + ']').val();
        if(flag === 'dialog') {
            chrome.storage.local.remove('vkContactData');
            window.vkExtselectionData.contact = undefined;
        } else {
            chrome.storage.local.remove('vkChatData');
            window.vkExtselectionData.chat = undefined;
        }
    });
};