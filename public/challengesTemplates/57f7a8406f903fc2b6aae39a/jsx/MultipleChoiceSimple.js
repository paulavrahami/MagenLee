"use strict";

Meteor.MultipleChoiceSimple = React.createClass({
    displayName: 'MultipleChoice',
    numberOfClicks: 0,
    currentAnswer: '',
    getInitialState: function getInitialState() {
        return this.props.content;
    },

    /**
     * @desc Handle clicks on answers;
     * @param eventArg
     */
    onClick: function onClick(eventArg) {
        this.numberOfClicks++;
        this.currentAnswer = eventArg.target.value;
        this.state.state.clicks = this.numberOfClicks;
        this.state.state.answer = this.currentAnswer;
        this.setState(this.state);
    },

    /**
     * @desc Return the answer;
     * @returns {{clicks: number, answer: (number|*)}}
     */
    getAnswer: function getAnswer() {
        return {
            clicks: this.numberOfClicks,
            answer: this.currentAnswer
        };
    },
    pause: function pause() {
        this.refs.obscured.classList.add('obscured');
    },
    resume: function resume() {
        this.refs.obscured.classList.remove('obscured');
    },
    hint: function hint() {
        var _this2 = this;

        this.state.showHint = true;

        var hintTime = parseInt(this.state.hintTime + '');

        if (isNaN(hintTime) || hintTime < 0) {
            hintTime = 0;
        }

        if (hintTime > 0) {
            setTimeout(function () {
                _this2.state.showHint = false;
                _this2.setState(_this2.state);
            }, parseInt(this.state.hintTime * 1000));
        }

        this.setState(this.state);
    },

    /**
     * @desc close the hint;
     */
    onCloseHint: function onCloseHint() {
        var _this3 = this;

        return function () {
            _this3.state.showHint = false;
            _this3.setState(_this3.state);
        };
    },


    /**
     * @desc Render the element;
     * @returns {XML}
     */
    render: function render() {
        var _this4 = this;

        var _this = this;

        if (this.state.state) {
            if (this.state.state.clicks !== undefined) {
                this.numberOfClicks = this.state.state.clicks;
            }
            if (this.state.state.answer !== undefined) {
                this.currentAnswer = this.state.state.answer;
            }
        }

        return React.createElement(
            'div',
            { className: 'container-fluid' },
            function (showHint, hint) {
                if (showHint) {
                    return React.createElement(
                        'div',
                        {
                            className: 'hint' },
                        hint,
                        React.createElement('br', null),
                        React.createElement('br', null),
                        React.createElement(
                            'button',
                            { className: 'btn btn-primary', onClick: _this4.onCloseHint() },
                            'Close'
                        )
                    );
                }
            }(this.state.showHint, this.state.hint),
            React.createElement('div', { ref: 'obscured' }),
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'col-md-12' },
                    React.createElement(
                        'div',
                        { className: 'form-group the-question' },
                        function () {
                            if (_this4.state['statement'] && _this4.state['statement'] !== "") {
                                return React.createElement(
                                    'div',
                                    { className: 'md-col-12' },
                                    React.createElement(
                                        'pre',
                                        null,
                                        _this4.state['statement']
                                    )
                                );
                            } else {
                                return React.createElement('span', null);
                            }
                        }(),
                        React.createElement(
                            'div',
                            null,
                            this.state.question
                        ),
                        React.createElement(
                            'div',
                            { className: 'radio' },
                            React.createElement('input', {
                                id: 'radio_1',
                                name: 'multipleChoiceAnswer',
                                type: 'radio',
                                checked: this.state.state.answer == '1st Answer',
                                onChange: this.onClick,
                                value: '1st Answer' }),
                            React.createElement(
                                'label',
                                { 'for': 'radio_1', type: 'radio' },
                                this.state['1st Answer'].answer
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'radio' },
                            React.createElement('input', {
                                id: 'radio_2',
                                name: 'multipleChoiceAnswer',
                                type: 'radio',
                                checked: this.state.state.answer == '2nd Answer',
                                onChange: this.onClick,
                                value: '2nd Answer' }),
                            React.createElement(
                                'label',
                                { 'for': 'radio_2', type: 'radio' },
                                this.state['2nd Answer'].answer
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'radio' },
                            React.createElement('input', {
                                id: 'radio_3',
                                name: 'multipleChoiceAnswer',
                                type: 'radio',
                                checked: this.state.state.answer == '3rd Answer',
                                onChange: this.onClick,
                                value: '3rd Answer' }),
                            React.createElement(
                                'label',
                                { 'for': 'radio_3', type: 'radio' },
                                this.state['3rd Answer'].answer
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'radio' },
                            React.createElement('input', {
                                id: 'radio_4',
                                name: 'multipleChoiceAnswer',
                                type: 'radio',
                                checked: this.state.state.answer == '4th Answer',
                                onChange: this.onClick,
                                value: '4th Answer' }),
                            React.createElement(
                                'label',
                                { 'for': 'radio_4', type: 'radio' },
                                this.state['4th Answer'].answer
                            )
                        )
                    )
                )
            )
        );
    }
});