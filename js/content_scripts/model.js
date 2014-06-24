
/***************Model**********************/

window.model = window.model || {};

window.model.contactList = {
    id: {map: 'uid'},
    title: {map: ['first_name','last_name'], divider: ' '},
    photo: {map: 'photo_50'},
    chat: false
};

window.model.chatList = {
    id: {map:'chatId'},
    title: {map:'title'},
    photo: {map:'photo_50'},
    chat: true
};

window.model.map = function(item,modelId){
    var model = window.model[modelId];
    var resultItem = {};
    for(var name in model){
        if ('object' === typeof(model[name])) {
            if (typeof (model[name].map) !== 'string' && model[name].map.length) {
                var resField = '';
                var mapFields = model[name].map;
                for (var i = 0; i < mapFields.length; i++) {
                    resField += item[mapFields[i]];
                    if (i < mapFields.length - 1) {
                        resField += model[name].divider;
                    }
                }
                resultItem[name] = resField;
            } else {
                resultItem[name] = item[model[name].map];
            }
        } else{
            resultItem[name] = model[name];
        }
    }
    return resultItem;
};
