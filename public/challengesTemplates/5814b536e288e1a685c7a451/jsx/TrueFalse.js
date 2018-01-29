"use strict";

Meteor.TrueFalse = React.createClass({
    displayName: 'TrueFalse',

    numberOfClicks: 0,
    currentValidity: -1,
    getInitialState: function getInitialState() {
        return this.props.content;
    },

    /**
     * @desc Handle clicks on answers;
     * @param buttonValue
     */
    onClick: function onClick(buttonValue) {
        var _this = this;
        return function (eventArg) {
            _this.numberOfClicks++;
            _this.state.state.clicks = _this.numberOfClicks;
            _this.state.state.validity = parseInt(buttonValue);
            _this.currentValidity = buttonValue;
            _this.setState(_this.state);
        };
    },

    /**
     * @desc Return the answer;
     * @returns {{clicks: number, answer: (number|*)}}
     */
    getAnswer: function getAnswer() {
        return {
            clicks: this.numberOfClicks,
            validity: this.currentValidity
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
            if (this.state.state.validity !== undefined) {
                this.currentValidity = this.state.state.validity;
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
                        { className: 'form-group' },
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
                            { className: 'md-col-12' },
                            this.state.question
                        ),
                        React.createElement(
                            'div',
                            { className: 'md-col-12' },
                            React.createElement(
                                'div',
                                { className: 'col-md-1 col-md-offset-3' },
                                React.createElement(
                                    'button',
                                    { className: 'btn btn-md' + (_this.state && _this.state.state.validity == this.state['1st Button Score'] && this.state.state.clicks > 0 ? ' btn-primary' : ' btn-default'), onClick: this.onClick(this.state['1st Button Score']) },
                                    this.state['1st Button Text']
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-md-1 col-md-offset-3' },
                                React.createElement(
                                    'button',
                                    { className: 'btn btn-md' + (_this.state && _this.state.state.validity == this.state['2nd Button Score'] && this.state.state.clicks > 0 ? ' btn-primary' : ' btn-default'), onClick: this.onClick(this.state['2nd Button Score']) },
                                    this.state['2nd Button Text']
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});