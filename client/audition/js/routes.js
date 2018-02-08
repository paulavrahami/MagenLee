function routerConfig($stateProvider) {
    $stateProvider
        .state('auditions.execute', {
            url:'/auditionExecute/:auditionId',
            templateUrl: 'client/audition/view/auditionExecute.html',
            controller: 'AuditionsExecuteCtrl',
            controllerAs: 'vm'
        })
        .state('auditions.edit', {
            url:'/auditionEdit/:auditionId',
            templateUrl: 'client/audition/view/auditionEdit.html',
            controller: 'AuditionEditCtrl',
            controllerAs: 'auditionEdit'
        })
        .state('iframeTemplate', {
            url:'/iframeTemplate/:auditionItemId/:auditionChallengeId',
            templateProvider: function ($stateParams, $promiser, $http) {
                //console.log(((new Date()).valueOf() / 1000).toFixed(3),"start templateProvider");
                return  $promiser.any((resolve, reject) => {
                    Meteor.subscribe('templates' ,() => [], {
                        onReady: function () {
                            //console.log(((new Date()).valueOf() / 1000).toFixed(3),"templates subscribe done");
                            var auditionItemId = $stateParams.auditionItemId;
                            var auditionChallengeId = $stateParams.auditionChallengeId;
                            var challengeTemplate = TemplatesCollection.findOne({_id:auditionChallengeId});
                            //console.log(((new Date()).valueOf() / 1000).toFixed(3),"challengeTemplate returned");
                            $http({
                                method: 'GET',
                                headers: {
                                    "Accept": "text/html;level=1"
                                },
                                url: `challengesTemplates/${auditionChallengeId}/${challengeTemplate.templateUrl}`
                            }).then(function successCallback(response) {
                                var regExpression = new RegExp('{{auditionItemUrl}}','g');
                                var auditionItemUrl = `/challengesTemplates/${auditionChallengeId}`;

                                var html = '';

                                html += `<meta name="auditionId" content="${auditionItemId}">`;
                                html += `<link rel="stylesheet" href=".API/lib/bootstrap/css/bootstrap.min.css">`;
                                html += `<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>`;
                                html += `<script type="text/javascript" src=".API/base64.js"></script>`;
                                html += `<script type="text/javascript" src=".API/AuditionItemApi.js"></script>`;
                                html += `<script src=".API/lib/bootstrap/js/bootstrap.min.js"></script>`;

                                html += `${response.data}`;
                                html = html.replace(regExpression, auditionItemUrl);

                                resolve(html);

                            }, function errorCallback(response) {
                                console.log('error reading file');
                                reject();
                            });

                        }
                    });
                }).then((html)=>{
                    //console.log(((new Date()).valueOf() / 1000).toFixed(3),"html injection to the iframe");
                    return html;
                });
            }
        })
        .state('audition.main', {
            url:'/auditionMain',
            templateUrl: 'client/home/view/comingSoon.html',
            controller: 'AuditionMainCtrl',
            controllerAs: 'vm'
        })
        .state('auditions', {
            url:'/audition',
            templateUrl: 'client/audition/view/audition.html',
            controller: 'AuditionCtrl',
            controllerAs: 'main'
        });
}


angular
    .module('skillera')
    .config(routerConfig);