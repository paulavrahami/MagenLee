function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
if (!inIframe()) {
    //let script;
    //Meteor.skillera;
    var timerHandler;
    //script = document.createElement('script');
    //script.src = '.API/base64.js';
    //document.head.appendChild(script);
    //script = document.createElement('script');
    //script.src = '.API/skilleraApi.js';

    //script.addEventListener('load', function () {

        function checkForAudition() {

            if (!window._audition) {
                timerHandler = setTimeout(checkForAudition, 100);
            }
            else {
                window.loadAudition();
            }
        }

        checkForAudition();

    //});
    //document.head.appendChild(script);
    //console.log(((new Date()).valueOf() / 1000).toFixed(3), "skilleraApi script in header");

    window.loadAudition = function () {
        //console.log(((new Date()).valueOf() / 1000).toFixed(3), "start loadAudition");
        clearTimeout(timerHandler);

        Meteor.skillera = new Meteor.skilleraApi();

        Meteor.skillera.addEventListener('declareLoaded', function (eventArg) {
            //console.log(((new Date()).valueOf() / 1000).toFixed(3), "declareLoaded event");
            for (var index = 0; index < window._audition.items.length; index++) {
                if (window._audition.items[index].itemId === eventArg.detail._id) {

                    Meteor.skillera.sendEvent('initialize', window._audition.items[index].itemId , {
                        content: window.auditionExecuteCtrl.getContent(window._audition.items[index].itemId )
                    });
                    Meteor.skillera.requestConfiguration('configuration', window._audition.items[index].itemId );

                    window.auditionExecuteCtrl.states.isShowControls = true;
                    break;
                }
            }
        });

        Meteor.skillera.addEventListener('content', function (eventArg) {
            //console.log(((new Date()).valueOf() / 1000).toFixed(3), "content event");
            window.auditionExecuteCtrl.setContent(eventArg.detail._id, eventArg.detail.data);
        });

        Meteor.skillera.addEventListener('configuration', function (eventArg) {
            //console.log(((new Date()).valueOf() / 1000).toFixed(3), "content event");
            window.auditionExecuteCtrl.setConfiguration(eventArg.detail._id, eventArg.detail.data);
        });

        if (window._audition) {
            //console.log(((new Date()).valueOf() / 1000).toFixed(3), "set audition");
            for (var index = 0; index < window._audition.items.length; index++) {
                Meteor.skillera.setAudition({
                    _id: window._audition.items[index].itemId
                });
            }
        }
    };
}