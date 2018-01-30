"use strict";
var MultipleChoiceSimpleCtrl = function (auditionIdArg) {

    this.onInit = this.onInit.bind(this);
    this.onRequestCommand = this.onRequestCommand.bind(this);
    this.onRequestConfiguration = this.onRequestConfiguration.bind(this);
    this.onRequestContent = this.onRequestContent.bind(this);
    this.onRequestResults = this.onRequestResults.bind(this);
    this.onRequestTerminate = this.onRequestTerminate.bind(this);

    this.audition = new Meteor.AuditionItemApi(auditionIdArg);

    this.content = {
        title: 'Multiple Choice (Basic)',
        description: 'This is a Multiple Choice question with 4 fixed answers',
        "free text" : "Free Text (Optional)",
        "Float Right" : false,
        question: 'Which of these are the primary colors?',
        hint: 'Hint text',
        hintTime: 10,
        '1st Answer': {
            answer: 'red, green and black',
            correct: false
        },
        '2nd Answer': {
            answer: 'red, blue and white',
            correct: false
        },
        '3rd Answer': {
            answer: 'red, blue and yellow',
            correct: false
        },
        '4th Answer': {
            answer: ' red, yellow and white',
            correct: false
        }
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
MultipleChoiceSimpleCtrl.prototype = {

    /**
     * Get init event from the audition;
     * @param eventArg
     */
    onInit (eventArg) {
        this.audition.auditionSettings({
            height: '250px',
            width: '100%'
        });
        this.content = eventArg.detail.data.content ? eventArg.detail.data.content : this.content;

        if (!this.content.state) {
            this.content.state = {};
        }
        this.content.state.clicks   = this.content.state.clicks   !== undefined ? this.content.state.clicks   : 0;
        this.content.state.validity = this.content.state.validity !== undefined ? this.content.state.validity : 0;
        this.content.state.answer   = this.content.state.answer   !== undefined ? this.content.state.answer   : "";

        this.content.showHint = false;

        this.question = ReactDOM.render(React.createElement(Meteor.MultipleChoiceSimple, {
            content: this.content }), document.getElementById('multipleChoiceSimple'), () => {
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
    onRequestTerminate (eventArg) {

        this.audition.removeEventListener('content', this.onRequestContent);
        this.audition.removeEventListener('initialize', this.onInit);
        this.audition.removeEventListener('results', this.onRequestResults);
        this.audition.removeEventListener('command', this.onRequestCommand);
        this.audition.removeEventListener('terminate', this.onRequestTerminate);
        this.audition.sendToQualiFit('terminate', null);
        this.audition.terminate();
        this.audition = null;

        ReactDOM.unmountComponentAtNode(document.getElementById('multipleChoiceSimple'));
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
        let score = 0;

        if (questionResult.answer !== '') {
            score = this.content[questionResult.answer].correct ? 100 : 0;
        }

        this.audition.sendToQualiFit('results', score < 0 ? 0 : score);
    },

    onRequestContent (eventArg) {

        if (!this.onInitFlag) return;

        let questionResult = this.question.getAnswer();
        if (questionResult.answer !== '') {
            this.content.state.validity = this.content[questionResult.answer].correct ? 100 : 0;
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

Meteor.MultipleChoiceSimpleCtrl = MultipleChoiceSimpleCtrl;