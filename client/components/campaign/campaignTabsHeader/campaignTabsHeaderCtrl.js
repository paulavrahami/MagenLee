angular
    .module('brgo')
    .controller('campaignTabsHeader', function($state, $scope, $reactive, ENUM, MAP) {

        let tabsHeader = this;
        $reactive(tabsHeader).attach($scope);

        tabsHeader.ENUM = ENUM;
        tabsHeader.MAP = MAP;
        tabsHeader.element = $('.campaignTabsHeader');
        tabsHeader.height = tabsHeader.element.height();

        tabsHeader.$onChanges = function () {
            if (tabsHeader.campaign && tabsHeader.campaign.num) {
                tabsHeader.title = 'Campaign ' + tabsHeader.campaign.num +' - ';
                if (tabsHeader.campaign.status === ENUM.CAMPAIGN_STATUS.DISPATCHED){
                  tabsHeader.status = 'On Air';
                } else {
                  tabsHeader.status = tabsHeader.campaign.status;
              }
            }
            else {
                tabsHeader.title = 'New Campaign - ';
                tabsHeader.status = ENUM.CAMPAIGN_STATUS.IN_WORK;
            }
        };

        // Campaign Tabs navigation
        $(function(){
         $('.btn-circle-tab').on('click',function(){
           $('.btn-circle-tab.btn-info').removeClass('btn-info').addClass('btn-default');
           $(this).addClass('btn-info').removeClass('btn-default').blur();
         });

         $('.next-step, .prev-step').on('click', function (e){
           var $activeTab = $('.tab-pane.active');

           $('.btn-circle-tab.btn-info').removeClass('btn-info').addClass('btn-default');

           if ( $(e.target).hasClass('next-step') )
           {
              var nextTab = $activeTab.next('.tab-pane').attr('id');
              $('[href="#'+ nextTab +'"]').addClass('btn-info').removeClass('btn-default');
              $('[href="#'+ nextTab +'"]').tab('show');
           }
           else
           {
              var prevTab = $activeTab.prev('.tab-pane').attr('id');
              $('[href="#'+ prevTab +'"]').addClass('btn-info').removeClass('btn-default');
              $('[href="#'+ prevTab +'"]').tab('show');
           }
         });
        });    
    });
