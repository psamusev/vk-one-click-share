
/***************Storage**********************/

window.recipientsStorage = window.recipientsStorage || {};


window.recipientsStorage.selectItem = function (data){
    if(data) {
        this.showRecipientTitle(data.title);
        var value = {};
        value['vk' + (data.name.charAt(0).toUpperCase() + data.name.substring(1)) + 'Data'] = data;
        chrome.storage.local.set(value,function(response){
            var s = 5;
        });
        window.vkExtselectionData[data.name] = data;
    }
    $('.activeList').hide();
};

window.recipientsStorage.getEmptyItem = function(){
    return $('.activeList > .mCustomScrollBox > .mCSB_container > .notFound');
};

window.recipientsStorage.showRecipientTitle = function (title){
    var recBlock = $('#vkRecipientBlock');
    recBlock.children('#selectedListItem').children('.text').text(title);
    recBlock.show();
};

window.recipientsStorage.hideRecipientTitle = function (title){
    $('#vkRecipientBlock').hide();
};

window.recipientsStorage.filter = function (val){
    var list = $('.activeList > .mCustomScrollBox > .mCSB_container > .contactListItem');
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
            recipientsStorage.getEmptyItem().show();
        } else{
            recipientsStorage.getEmptyItem().hide();
        }
    }
};

window.recipientsStorage.addItem = function(list,item,modelId){

    if(item.deactivated === undefined){
        item = model.map(item,modelId);
        item.photo = app.convertImageToHttpsPath(item.photo);
        var listItem = $('<div class="contactListItem">' +
            '<div class="inl_block"><img src="' + item.photo + '"/> </div><div class="text_item">' + item.title + '</div>'
            + '</div>');
        listItem.bind('click',item,function(event){
            recipientsStorage.selectItem(event.data);
        });
        list.append(listItem);
    }
};

window.recipientsStorage.fill = function(listId,items,modelId){
    var list = $('#' + listId).find('> .mCustomScrollBox > .mCSB_container');
    items.forEach(function(item){
        recipientsStorage.addItem(list,item,modelId);
    });
};

window.recipientsStorage.loadContacts = function (){
    chrome.storage.local.get('vkContactList',function(result){
        if(result.vkContactList === undefined){
            vkRequest.getFriends({
                order:'hints',
                fields:'photo_50'
            },function(response){
                if(response.error){
                    alert(response.error.error_msg);
                } else{
                    chrome.storage.local.set({'vkContactList': response.response});
                    recipientsStorage.fill('contactList',response.response,'contactList');
                    window.recipientsStorage.contacts = response.response;
                }
            },function(error){

            })
        } else {
            recipientsStorage.fill('contactList',result.vkContactList,'contactList');
            window.recipientsStorage.contacts = result.vkContactList;
        }
    });
};

window.recipientsStorage.loadChats = function (){
    chrome.storage.local.get('vkChatList',function(result){
        if(result.vkChatList === undefined){
            vkRequest.getAllChats({
                count:200
            },function(response){
                if(response.error){
                    alert(response.error.error_msg);
                } else{
                    var arrayChat = [];
                    response.response.forEach(function(item){
                        if(item.chat_id){
                            arrayChat.push({
                                photo_50:item.photo_50 || 'http://vk.com/images/camera_50.gif',
                                title:item.title,
                                chatId:item.chat_id
                            })
                        }
                    });
                    chrome.storage.local.set({'vkChatList': arrayChat});
                    recipientsStorage.fill('chatList',arrayChat,'chatList');
                    window.recipientsStorage.chats = arrayChat;
                }
            },function(error){

            })
        } else {
            recipientsStorage.fill('chatList',result.vkChatList,'chatList');
            window.recipientsStorage.chats = result.vkChatList;
        }

    });
};