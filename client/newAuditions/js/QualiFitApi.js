/**
 /* @desc qualiFit Audition API;
 */
var QualiFitApi = function () {
    'use strict';

	this.init();
    this.requestResults = this.requestResults.bind(this);
    this.requestConfiguration = this.requestConfiguration.bind(this);
};

(function () {
    'use strict';

    var _this;

    /**
     * @desc Audition requests sent to QualiFit;
     * @param eventArg
     */
    var getAuditionPostMessage = function (eventArg) {

        var data;

        try {
            data = JSON.parse(eventArg.data);
        }
        catch (e) {
            return;
        }
        if (data.event || data.event !== '') {

            //document.dispatchEvent(createEvent(data.event, data.data));
        }

        if (data.type === 'resource') {
            _this.loadResource(data);
        }
        if (data.type === 'results') {

            for (var index = 0; index < _this._auditions.length; index++) {
                if (_this._auditions[index]._id === data._id) {
                    _this._auditions[index].validity = data.data;
                    alert(data.data);
                    break;
                }
            }
        }
        if (data.type === 'content') {

            for (var index = 0; index < _this._auditions.length; index++) {
                if (_this._auditions[index]._id === data._id) {
                    //_this._auditions[index].countent = data.data;
                    //alert(JSON.stringify(data.data));
                    _this.dispatchEvent(createEvent(data.type, data));
                    break;
                }
            }
        }

        if (data.type === 'settings') {

            // if (data.data.height) {
            //     for (var index = 0; index < _this._auditions.length; index++) {
            //         if (_this._auditions[index]._id === data._id) {
            //             document.getElementById(data._id).style.height = data.data.height;
            //             break;
            //         }
            //     }
            // }
            // if (data.data.width) {
            //     for (var index = 0; index < _this._auditions.length; index++) {
            //         if (_this._auditions[index]._id === data._id) {
            //             document.getElementById(data._id).style.width = data.data.width;
            //             break;
            //         }
            //     }
            // }
        }

        if (data.type === 'declareLoaded') {

            _this.dispatchEvent(createEvent(data.type, data));
        }

        if (data.type === 'configuration') {

            _this.dispatchEvent(createEvent(data.type, data));
        }

        if (data.type === 'terminate') {

            for (var index = 0; index < _this._auditions.length; index++) {
                if (_this._auditions[index]._id === data._id) {
                    _this.dispatchEvent(createEvent(data.type, data));
                    break;
                }
            }
        }
    };

    /**
     * @desc Create a custom event;
     * @param typeArg
     * @param detailArg
     * @returns {CustomEvent}
     */
    function createEvent (typeArg, detailArg) {

        //noinspection JSCheckFunctionSignatures
        return new CustomEvent(typeArg, {detail: detailArg});
    }

    /**
     * @desc return an array of auditions
     * @param auditionIdArg
     * @returns {[*]}
     */
    function getAuditionByIdOrAll (auditionIdArg) {

        var auditionsToReturn = _this._auditions;

        if (auditionIdArg) {
            for (var index = 0; index < _this._auditions.length; index++) {
                if (_this._auditions[index]._id === auditionIdArg) {
                    auditionsToReturn = [_this._auditions[index]];
                }
            }
        }

        return auditionsToReturn;
    }

    QualiFitApi.prototype = {

        /**
         * @desc Initialize class;
         */
        init () {
            _this = this;

            /** @desc Init events; */
            _this._eventListeners = {
                command: [],
                content: [],
                initialize: [],
                results: [],
                declareLoaded: [],
                configuration: []
            };

            _this._auditions = [{
                _id: ''
            }];
            window.addEventListener("message", getAuditionPostMessage);
        },

        /**
         * @desc Send a postMessage event to the Audition;
         * @param eventNameArg
         * @param auditionIdArg
         * @param eventDataArg
         */
        sendEvent (eventNameArg, auditionIdArg, eventDataArg) {

            var eventData = {
                data: eventDataArg,
                event: eventNameArg,
                _id: auditionIdArg
            };

            var allIframes = document.querySelectorAll("iframe");

            for (var index = 0; index < allIframes.length; index++) {
                //noinspection JSCheckFunctionSignatures
                allIframes[index].contentWindow.postMessage(JSON.stringify(eventData), '*');
            }
            window.postMessage(JSON.stringify(eventData), '*');
        },

        /**
         * @desc var QualiFit set the audition settings;
         * @param settingsArg
         */
        auditionSettings (settingsArg) {

        },

        /**
         * @desc Set the active audition
         * @param auditionArg
         */
        setAudition (auditionArg) {
            _this._auditions.push(auditionArg);
        },

        /**
         * @desc send a request for the results of an audition;
         * @param auditionIdArg
         */
        requestResults (auditionIdArg) {

            var auditions = getAuditionByIdOrAll(auditionIdArg);

            for (var index = 0; index < auditions.length; index++) {
                this.sendEvent('results', auditions[index]._id)
            }
        },

        /**
         * @desc send a request for the configuration of an audition;
         * @param auditionIdArg
         */
        requestConfiguration (auditionIdArg) {

            var auditions = getAuditionByIdOrAll(auditionIdArg);

            for (var index = 0; index < auditions.length; index++) {
                this.sendEvent('configuration', auditions[index]._id)
            }
        },

        /**
         * @desc send a request for the content of an audition;
         * @param auditionIdArg
         */
        requestContent (auditionIdArg) {

            var auditions = getAuditionByIdOrAll(auditionIdArg);

            for (var index = 0; index < auditions.length; index++) {
                this.sendEvent('content', auditions[index]._id)
            }
        },

        requestTerminate (auditionIdArg) {

            var auditions = getAuditionByIdOrAll(auditionIdArg);

            for (var index = 0; index < auditions.length; index++) {
                this.sendEvent('terminate', auditions[index]._id);
            }
        },

        requestCommand (commandArg, auditionIdArg) {

            var auditions = getAuditionByIdOrAll(auditionIdArg);

            for (var index = 0; index < auditions.length; index++) {
                this.sendEvent('command', auditions[index]._id, commandArg);
            }
        },

        /**
         * @desc Add event listeners on Audition;
         * @param eventTypeArg
         * @param callbackArg
         */
        addEventListener (eventTypeArg, callbackArg) {

            if (_this._eventListeners[eventTypeArg]) {
                _this._eventListeners[eventTypeArg].push(callbackArg);
            }
        },

        /**
         * @desc dispatch an event came from QualiFit;
         * @param customEventArg
         */
        dispatchEvent (customEventArg) {

            if (_this._eventListeners[customEventArg.type]) {

                _this._eventListeners[customEventArg.type].map(function (eventArg) {
                    eventArg(customEventArg);
                });
            }
        },

        /**
         * -----------------
         * RESOURCES SUPPORT
         * -----------------
         */

        /**
         * @desc load resource request by audition and send it back;
         * @param messageArg
         */
        loadResource (messageArg) {
            $.get(_this._audition._id + '/' + messageArg.data.path, function (responseArg, statusArg) {

                if (statusArg === 'success') {

                    messageArg.data.result = Base64.encode(responseArg);
                    _this.sendEvent(messageArg.type, messageArg.data)
                }
            });

        }
    };
})();
Meteor.qualiFitApi = QualiFitApi;

