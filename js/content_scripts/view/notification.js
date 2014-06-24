
/***************Notification**********************/

window.notificationView = window.notificationView || {};

window.notificationView.add = function (){
    var body = $('body');
    $("<div></div>",{id:'vkExtNotificationView',class:'vkExtNotificationView'})
        .html('<div class="notification_title">Message sent</div>' +
            '<div id="vkExtNotificationBody" class="notification_body">Your message has been sent</div>'
    ).appendTo(body);
};

window.notificationView.showErrorMessage = function (error){
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

};

window.notificationView.showMessage = function (title, message){
    var view = $('#vkExtNotificationView');
    view.children('.notification_title').text(title);
    view.children('.notification_body').text(message);
    view.show();
};