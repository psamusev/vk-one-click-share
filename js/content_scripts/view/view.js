
/***************View**********************/

window.view = window.view || {};

window.view.addShareToChatButton = function (){

    function shareRecord(id_record){
        var sendFlag = localStorage.getItem('vk_send_flag')
        var notifyTitle = (sendFlag === 'wall') ? 'Record posted' : 'Message sent';
        var notifyMessage = (sendFlag === 'wall') ? 'Record has posted to your wall' : 'Your message has been sent';
        if(sendFlag === 'wall') {
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
            var data = (sendFlag === 'dialog')? window.vkExtselectionData.contact : window.vkExtselectionData.chat;
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

window.view.addViewExt = function (){
    settingsView.add();
    notificationView.add();
    window.recipientsStorage.chats = undefined;
    window.recipientsStorage.contacts = undefined;
};