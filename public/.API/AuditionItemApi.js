/**
/* @desc Audition Audition API;
*/

let Audition = function (auditionIdArg) {
    'use strict';

    this.init = this.init.bind(this);
    this.getQualiFitPostMessage = this.getQualiFitPostMessage.bind(this);
    this.sendToQualiFit = this.sendToQualiFit.bind(this);
    this.auditionSettings = this.auditionSettings.bind(this);
    this.addEventListener = this.addEventListener.bind(this);
    this.dispatchEvent = this.dispatchEvent.bind(this);
    this.declareLoaded = this.declareLoaded.bind(this);
    this.loadResource = this.loadResource.bind(this);
    this.buildResource = this.buildResource.bind(this);

	this.init(auditionIdArg);
};

(function () {
    'use strict';
    
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

    Audition.prototype = {

        /**
         * @desc Initialize class;
         */
        init (auditionIdArg) {
            /** @desc Get the _id from the URL, this _id will be used
             *  in the communication between the audition and QualiFit;
             */
            this._id = auditionIdArg; //document.querySelector('meta[name="auditionId"]').getAttribute("content");

            /** @desc Init events; */
            this._eventListeners = {
                command: [],
                content: [],
                initialize: [],
                terminate: [],
                results: [],
                configuration: []

            };
            this._callbacks = {};

            window.addEventListener("message", this.getQualiFitPostMessage);
        },
        /**
         * @desc Terminate the class and free resources;
         */
        terminate () {
            window.removeEventListener("message", this.getQualiFitPostMessage);
            this._eventListeners = null;
            this._id = "";
        },
        /**
         * @desc QualiFit events sent to the Audition;
         * @param eventArg
         */
        getQualiFitPostMessage (eventArg) {

            let data;
            try {
                data = JSON.parse(eventArg.data);
            }
            catch (e) {
                return;
            }
            if (data._id === this._id && (data.event || data.event !== '')) {

                switch (data.event) {
                    case 'command' :
                    case 'configuration' :
                    case 'content' :
                    case 'initialize' :
                    case 'results' :
                    case 'terminate' :
                        this.dispatchEvent(createEvent(data.event, data));
                        break;
                    case 'resource' :
                        this.buildResource(data.data);
                        break;
                }
            }
        },
        /**
         * @desc Send post message to QualiFit;
         * @param messageTypeArg
         * @param messageDataArg
         */
        sendToQualiFit (messageTypeArg, messageDataArg) {

            let messageData = {
                data: messageDataArg,
                type: messageTypeArg,
                _id:  this._id
            };

            //if (window.parent) {
                //noinspection JSCheckFunctionSignatures
                window.postMessage(JSON.stringify(messageData), '*');
            //}
            //
            // if (window.parent) {
            //     //noinspection JSCheckFunctionSignatures
            //     window.parent.postMessage(JSON.stringify(messageData), '*');
            // }
        },

        /**
         * @desc Let QualiFit set the audition settings;
         * @param settingsArg
         */
        auditionSettings (settingsArg) {

            this.sendToQualiFit('settings', settingsArg);
        },

        /**
         * @desc Add event listeners on Audition;
         * @param eventTypeArg
         * @param callbackArg
         */
        addEventListener (eventTypeArg, callbackArg) {

            if (this._eventListeners[eventTypeArg]) {
                this._eventListeners[eventTypeArg].push(callbackArg);
            }
        },

        /**
         * @desc Remove event listeners of Audition;
         * @param eventTypeArg
         * @param callbackArg
         */
        removeEventListener (eventTypeArg, callbackArg) {

            let indexOf = this._eventListeners[eventTypeArg].indexOf(callbackArg);

            if (indexOf > -1) {
                this._eventListeners[eventTypeArg].splice(indexOf, 1);
            }
        },

        /**
         * @desc dispatch an event came from QualiFit;
         * @param customEventArg
         */
        dispatchEvent (customEventArg) {

            if (this._eventListeners[customEventArg.type]) {

                this._eventListeners[customEventArg.type].map(function (eventArg) {
                    eventArg(customEventArg);
                });
            }
        },

        /**
         * @desc Let QualiFit know the item is ready for communication;
         */
        declareLoaded () {
            this.sendToQualiFit('declareLoaded')
        },

        /**
         * -----------------
         * RESOURCES SUPPORT
         * -----------------
         */

        /**
         * @desc Loads a resource into the page;
         * @param resourceMimeTypeArg
         * @param resourcePathArg
         * @param callbackArg
         */
        loadResource (resourceMimeTypeArg, resourcePathArg, callbackArg) {

            let request = {
                id : 'request_' + (Math.ceil(Math.random() * 1000000)),
                path: resourcePathArg,
                mime: resourceMimeTypeArg
            };

            if (callbackArg) {
                this._callbacks[request.id] = callbackArg;
            }

            switch (resourceMimeTypeArg) {
                case 'text/javascript' :
                case 'text/babel' :
                case 'text/jsx' :
                    break;
            }

            this.sendToQualiFit('resource', request);
        },

        buildResource (resourceDataArg) {

            let _this = this;
            let element = document.createElement('script'); //document.getElementById(resourceDataArg.id);
            element.type = resourceDataArg.mime;


            if (element) {
                element.src = `data: ${resourceDataArg.mime};base64,${resourceDataArg.result}`;
            }
            document.getElementsByTagName('head')[0].appendChild(element);
            if (this._callbacks[resourceDataArg.id]) {

                setTimeout(function () {
                    _this._callbacks[resourceDataArg.id]();
                    delete _this._callbacks[resourceDataArg.id];
                },100);
            }
        }
    };
})();
Meteor.AuditionItemApi = Audition;