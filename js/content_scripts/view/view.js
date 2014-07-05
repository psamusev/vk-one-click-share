
/***************View**********************/

window.view = window.view || {};

window.view.addViewExt = function (){
    settingsView.add();
    notificationView.add();
    window.recipientsStorage.chats = undefined;
    window.recipientsStorage.contacts = undefined;
};