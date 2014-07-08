
/***************Share**********************/

window.share = window.share || {};

window.share.add = function(){
    this.addToWall();
    this.addToAudio();
};

window.share.toWall = function(record,title,message){
    var method = (record.type === 'wall') ? 'repostRecord' : 'postRecord';
    vkRequest[method]({record:record},
        function (response) {
            if (response.error) {
                if(response.error.error_code === 15){
                    response.error.error_msg = "Record already posted: This record already posted to your wall."
                }
                notificationView.showErrorMessage(response.error);
            } else {
                notificationView.showMessage(title,message);
                window.setTimeout(function () {
                    $('#vkExtNotificationView').fadeOut(1500);
                }, 2000);
            }
        }, function (error) {
            alert(error.error_msg);
    });
};

window.share.toUsers = function(record,sendFlag,title,message){
    var data = (sendFlag === 'dialog')? window.vkExtselectionData.contact : window.vkExtselectionData.chat;
    vkRequest.sendRecord({
        chat_id: data.id,
        record: record,
        chat_flag: data.chat
    }, function (response) {
        if (response.error) {
            if(response.error.error_code === 1){
                response.error.error_msg = "Message didn't send: This record can't be send. Please check 'sending option'"
            }
            notificationView.showErrorMessage(response.error);
        } else {
            notificationView.showMessage(title,message);
            window.setTimeout(function () {
                $('#vkExtNotificationView').fadeOut(1500);
            }, 2000);
        }

    }, function (error) {
        alert(error.error_msg);
    });
};

window.share.shareRecord = function(id_record,type_record){
    event.stopPropagation();
    var sendFlag = localStorage.getItem('vk_send_flag');
    var notifyTitle = (sendFlag === 'wall') ? 'Record posted' : 'Message sent';
    var notifyMessage = (sendFlag === 'wall') ? 'Record has been posted to your wall' : 'Your message has been sent';
    if(sendFlag === 'wall') {
        share.toWall({id:id_record,type:type_record},notifyTitle,notifyMessage);
    } else {
        share.toUsers({id:id_record,type:type_record},sendFlag,notifyTitle,notifyMessage);
    }
};

window.share.addToWall = function(){
    $('.post_full_like').each(function(i){
        var wallRecord = $(this);
        if(wallRecord.html().indexOf('shareToChat') <= -1) {

            var id_record = wallRecord.children('.post_like').children('.post_like_link')[0].id.replace('like_link', '');
            $("<div></div>",{
                class:'shareToChat post_share fl_r',
                on:{
                    click:share.shareRecord.bind(null,id_record,'wall')
                }
            }).html("<span class='post_share_link fl_l'>Click to share</span>" +
                "<i class='post_share_icon sp_main fl_l'></i> ")
                .appendTo(wallRecord);
        }
    });
};

window.share.addToAudio = function(){
    $('.audio').each(function(i){
        var audio = $(this);
        if(!audio.find('.actions > .shareMusic')[0]) {

            var actionsBlock = audio.find('.actions');
            var id_record = audio.attr('id').replace('audio','');
            $("<div></div>",{
                class:'shareMusic fl_r',
                on:{
                    click:share.shareRecord.bind(null,id_record,'audio')
                }
            }).html("<div class='audio_share'></div> ")
                .appendTo(actionsBlock);

            audio.on('mouseenter',function(){
                if(!$(this).attr('vk-share-change-width')) {
                    var infoBlock = $(this).find('.info');
                    var title = infoBlock.find('.title_wrap');
                    var actions = infoBlock.find('.actions');
                    if (infoBlock.outerWidth() - title.outerWidth() < actions.outerWidth()) {
                        title.width(title.outerWidth() - actions.find('.shareMusic').outerWidth());
                        $(this).attr('vk-share-change-width', true);
                    }
                }
            });
        }
    });
};