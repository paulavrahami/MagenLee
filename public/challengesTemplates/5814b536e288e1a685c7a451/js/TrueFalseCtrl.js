"use strict";

let TrueFalseCtrl = function (auditionIdArg) {

    this.onInit = this.onInit.bind(this);
    this.onRequestCommand = this.onRequestCommand.bind(this);
    this.onRequestConfiguration = this.onRequestConfiguration.bind(this);
    this.onRequestContent = this.onRequestContent.bind(this);
    this.onRequestResults = this.onRequestResults.bind(this);
    this.onRequestTerminate = this.onRequestTerminate.bind(this);

    this.audition = new Meteor.AuditionItemApi(auditionIdArg);

    this.content = {
        "free text" : "Free Text (Optional)",
        "question" : "The Sun rises from the west",
        "hint": 'This is the hint for the Multiple Choice',
        "hintTime": 5, //seconds
        "1st Button Text" : "Correct",
        "2nd Button Text" : "Wrong",
        "1st Button Score" : "0",
        "2nd Button Score" : "100"
    };

    this.audition.addEventListener('content', this.onRequestContent);
    this.audition.addEventListener('configuration', this.onRequestConfiguration);
    this.audition.addEventListener('initialize', this.onInit);
    this.audition.addEventListener('results', this.onRequestResults);
    this.audition.addEventListener('command', this.onRequestCommand);
    this.audition.addEventListener('terminate', this.onRequestTerminate);

    this.audition.declareLoaded();

    this.question = {};
};

//noinspection JSUnusedLocalSymbols
TrueFalseCtrl.prototype = {

    /**
     * Get init event from the audition;
     * @param eventArg
     */
    onInit (eventArg) {

        this.audition.auditionSettings({
            width: '100%'
        });
        this.content = eventArg.detail.data.content ? eventArg.detail.data.content : this.content;

        if (!this.content.state) {
            this.content.state = {
                clicks: 0,
                validity: 0
            };
        }

        this.content.showHint = false;

        this.question = ReactDOM.render(React.createElement(Meteor.TrueFalse, {
            content: this.content }), document.getElementById('trueFalse'), () => {
            setTimeout(() => {
                this.audition.auditionSettings({
                    height: document.body.offsetHeight + 'px'
                });
            }, 100);
        });
        this.onInitFlag = true;
    },

    /**
     * @desc Response to the 'terminate' event. Terminate the class;
     * @param eventArg
     */
    onRequestTerminate (eventArg ) {

        this.audition.removeEventListener('content', this.onRequestContent);
        this.audition.addEventListener('configuration', this.onRequestConfiguration);
        this.audition.removeEventListener('initialize', this.onInit);
        this.audition.removeEventListener('results', this.onRequestResults);
        this.audition.removeEventListener('command', this.onRequestCommand);
        this.audition.removeEventListener('terminate', this.onRequestTerminate);
        this.audition.sendToQualiFit('terminate', null);
        this.audition.terminate();
        this.audition = null;

        ReactDOM.unmountComponentAtNode(document.getElementById('trueFalse'));
        this.question = null;
        this.content  = null;
    },

    /**
     * @desc Response to the 'request' event with the result;
     * @param eventArg
     */
    onRequestResults (eventArg ) {
        if (!this.onInitFlag) return;

        let questionResult = this.question.getAnswer();
        let validity = 0;

        if (parseInt(questionResult.validity) > -1) {
            validity = parseInt(questionResult.validity);
            //validity = (validity + 5) - questionResult.clicks * 5;
        }

        this.audition.sendToQualiFit('results', validity < 0 ? 0 : validity);
    },

    onRequestContent (eventArg) {
        if (!this.onInitFlag) return;
        try{let questionResult = this.question.getAnswer();
        let validity = 0;

        if (parseInt(questionResult.validity) > -1) {
            validity = parseInt(questionResult.validity);
            //validity = (validity + 5) - questionResult.clicks * 5;
        }
        this.content.state.validity =  validity;
        this.content.state.clicks = questionResult.clicks;
        }catch(e) {
            debugger;
        }
        this.audition.sendToQualiFit('content', this.content);
    },

    onRequestConfiguration (eventArg) {
        if (!this.onInitFlag) return;

        var configuration = {
            support: {
                hint: true
            },
            enabled: {
                hint: (this.content.hint && this.content.hint !== '')
            }
        };

        this.audition.sendToQualiFit('configuration', configuration);
    },

    onRequestCommand (eventArg) {
        if (!this.onInitFlag) return;
        switch (eventArg.detail.data) {
            case 'pause' :
                this.question.pause();
                break;
            case 'resume' :
                this.question.resume();
                break;
            case 'hint' :
                this.question.hint();
                break;
        }
    }

};

Meteor.TrueFalseCtrl = TrueFalseCtrl;