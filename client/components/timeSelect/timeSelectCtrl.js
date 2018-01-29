angular
    .module('brgo')
    .controller('timeSelect', function($state, $scope, $reactive) {

        let timeSelect = this;
        $reactive(timeSelect).attach($scope);
        timeSelect.dependency = new Deps.Dependency();

        if (!timeSelect.ngChange) timeSelect.ngChange = function(){};

        timeSelect.oldHours = 0;
        timeSelect.oldMinutes = 0;
        timeSelect.oldSeconds = 0;
        timeSelect.hours = 0;
        timeSelect.minutes = 0;
        timeSelect.seconds = 0;

        timeSelect.$onChanges = function () {

            timeSelect.valueOf = timeSelect.ngModel[timeSelect.property].valueOf() / 1000;

            if (timeSelect.valueOf > 86400) {
                timeSelect.valueOf = timeSelect.valueOf % 86400;
            }

            //timeSelect.valueOf = timeSelect.ngModel.valueOf() / 1000; //- (new Date()).getTimezoneOffset() * 60;

            timeSelect.hours   = Math.floor(timeSelect.valueOf / 3600);
            timeSelect.minutes = Math.floor(((timeSelect.valueOf % 3600) + 60) / 60 - 1);
            timeSelect.seconds = timeSelect.valueOf % 60;
        };

        //noinspection JSUnusedLocalSymbols
        timeSelect.watchHoursMinutes = function () {

            if (timeSelect.seconds < 0) timeSelect.seconds = 0;
            if (timeSelect.minutes < 0) timeSelect.minutes = 0;
            if (timeSelect.hours   < 0) timeSelect.hours = 0;

            if (timeSelect.seconds > 59) {
                timeSelect.minutes++;
                timeSelect.seconds -= 60;
            }

            if (timeSelect.minutes > 59) {
                timeSelect.hours++;
                timeSelect.minutes -= 60;
            }

            if (timeSelect.hours > 23) {
                //timeSelect.hours = 23;
            }

            if (timeSelect.oldHours !== timeSelect.hours || timeSelect.oldMinutes !== timeSelect.minutes || timeSelect.oldSeconds !== timeSelect.seconds){
                //timeSelect.ngModel.setHours(timeSelect.hours);
                //timeSelect.ngModel.setMinutes(timeSelect.minutes);
                //timeSelect.ngModel.setSeconds(timeSelect.seconds);
                //timeSelect.ngModel = new Date(timeSelect.ngModel);
                timeSelect.ngModel[timeSelect.property] = (timeSelect.hours * 3600 + timeSelect.minutes * 60 + timeSelect.seconds) * 1000;
                timeSelect.oldHours = timeSelect.hours;
                timeSelect.oldMinutes = timeSelect.minutes;
                timeSelect.oldSeconds = timeSelect.seconds;

                //timeSelect.dependency.changed();
                timeSelect.ngChange();
            }
        };
    });
