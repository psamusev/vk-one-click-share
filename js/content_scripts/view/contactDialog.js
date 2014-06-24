
/***************ContactDialog**********************/

window.contactDialogView = window.contactDialogView || {};

window.contactDialogView.add = function(){
    $("<div></div>",{id:'contactDialog'})
        .load(chrome.extension.getURL('templates/contactDialog.tmpl.html'),function(){
            contactDialogView.bindEvents();
        })
        .appendTo($('#box_layer_wrap'));
};

window.contactDialogView.show = function(){
    $('#box_layer_wrap').css('background-color','rgba(0,0,0,0.5)').show();
    $('#contactDialog').show();
};

window.contactDialogView.bindEvents = function(){
    $('.loading_spinner').find('img').attr('src',chrome.extension.getURL("images/loading.gif"));

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