angular
    .module('skillera')
    .constant('ENUM', {
        AUDITION_COMPLEXITY : {
            BEGINNER:       'Beginner',
            INTERMEDIATE:   'Intermediate',
            ADVANCED:       'Advanced',
            EXPERT:         'Expert'
        },
        AUDITION_TYPE : {
            RECRUITMENT:    'Recruitment',
            CHALLENGES:     'Challenges'
        },
        AUDITION_STATUS : {
            IN_WORK:    'In Work',
            AVAILABLE:  'Assigned',
            DELETED:    'Deleted'
        },
        AUDITION_DURATION : {
            AUDITION:   'Audition',
            ITEM:       'Item'
        },
        AUDITION_ORDER : {
            SEQUEL:     'Sequel',
            RANDOM:     'Random'
        },
        AUDITION_FLOW : {
            MANUAL:     'Manual',
            AUTOMATIC:  'Automatic'
        },
        AUDITION_VIEW_MODE : {
            PREVIEW:     'Preview',
            RESULTS:     'Results'
        },
        ITEM_STATUS : {
            NEW:        'New',
            IN_WORK:    'In Work',
            AVAILABLE:  'Available',
            ASSIGNED:   'Assigned',
            CANCELED: 'Canceled'
        },
        ITEM_AUTHOR_TYPE : {
            RECRUITER:    'Recruiter',
            DOMAIN_EXPERT:'Domain Expert',
            TALENT:       'Talent'
        },
        CHALLENGE_CREATE_MODE : {
            AUDITION: 'Audition',
            POOL: 'Pool'
        },
        ALERT : {
            SUCCESS:    'success',
            INFO:       'info',
            WARNING:    'warning',
            DANGER:     'danger'
        },
        CAMPAIGN_STATUS : {
            DELETE:     'Delete',
            DISPATCHED: 'Dispatched',
            IN_WORK:    'In work',
            CLOSED:     'Closed',
            VERIFIED:   'Verified'
        },
        APPLICATION_FILTER : {
            MIN_SCORE:  'Min Grade',
            MIN_SCORE_10: 'Min Grade - 10',
            MIN_SCORE_20: 'Min Grade - 20'
        },
        CAMPAIGN_TYPE : {
            RECRUITMENT:        'Recruitment',
            HUMAN_RESOURCES:    'HR'
        },
        POSITION_TYPE : {
            PART_TIME: 'Part-Time',
            PERMANENT: 'Permanent',
            CONTRACTOR: 'Contractor/Interim'
        },
        EXPERIENCE : {
            up1:        'Beginner',
            up2:        'Intermediate',
            up3:        'Advanced',
            up4:        'Expert'
        },
        PROFILE_STATES : {
            RECRUITER: 'recruiter.campaigns',
            APPLICANT: 'applicant' ,
            DOMAIN_EXPERT: 'domainExpert.auditions',
            TALENT: 'mainApplications'
        },
        SKILL_IMPORTANCE : {
            NICE:   'Nice to have',
            LOW:    'Low',
            NORMAL: 'Normal',
            HIGH:   'High',
            MUST:   'Must have'
        },
        USER : {
            RECRUITER : 'Recruiter',
            APPLICANT : 'Applicant',
            TALENT    : 'Talent',
            SYSTEM_ADMIN: 'SystemAdmin'
        },
        COMPANY_USER_TYPE : {
            ADMIN : 'Administrator',
            REGULAR : 'Regular'
        },
        APPLICATION_STATUS : {
            SENT_TO_TALENT : 'Sent to Talent',
            IN_WORK : 'In work',
            CANCELED : 'Canceled',
            COMPLETED : 'Completed',
            RETRY: 'Retry'
        },
        APPLICATION_FRUAD_TYPE : {
            NONE    :   'No Fraud',
            REPEAT  :   'Repeat'
        },
        APPLICATION_ORIGIN : {
            PROACTIVE_CAMPAIGN : 'Proactive Campaign',
            TALENT : 'Talent'
        },
        APPLICATION_RESOLUTION : {
            NONE : '',
            REJECT : 'Reject',
            REVIEW : 'Review',
            HIRED : 'Hired'
        },
        TALENT_STATUS : {
            ACTIVE : 'Active',
            SUSPENDED : 'Suspended',
            CANCELED : 'Canceled' 
        },
        ACTIVITY_LOG : {
            DISPATCH_POOL_EMAIL : 'Dispatch Pool/Email',
            DISPATCH_EXTERNAL_FILE : 'Dispatch External',
            DISPATCH_SOCIAL_LINKEDIN : 'Dispatch LinkedIn' 
        },
        MODAL_RESULT : {
            SAVE : 'Save',
            CANCEL : 'Cancel',
            CLOSE : 'Close'
        },
        DROPBOX_API : {
            TOKEN : 'jNRAKI6EZHAAAAAAAAAB_IropCuolUgvwDlmIEBdaddvwmhULqUAdxfuNnU3fwwn'
        }
    });

angular
    .module('skillera')
    .constant('MAP', {
        CAMPAIGN_STATUS : {
            DELETE:     'glyphicon glyphicon-trash',
            DISPATCHED: 'glyphicon glyphicon-send',
            IN_WORK:    'glyphicon glyphicon-cutlery',
            CLOSED:     'glyphicon glyphicon-stop',
            VERIFIED:   'glyphicon glyphicon-thumbs-up'
        },
        ITEM_STATUS : {
            CANCELED: 'glyphicon glyphicon-trash',
            NEW:        'glyphicon glyphicon-ok',
            IN_WORK:    'glyphicon glyphicon-cutlery',
            AVAILABLE:  'glyphicon glyphicon-play',
            ASSIGNED:   'glyphicon glyphicon-ok-circle'
        },
        TALENT_STATUS : {
            CANCELED:  'glyphicon glyphicon-trash',
            SUSPENDED: 'glyphicon glyphicon-stop',
            ACTIVE:    'glyphicon glyphicon-thumbs-up'
        },
        BUTTONS : {
            EDIT:       'glyphicon glyphicon-pencil',
            SAVE:       'glyphicon glyphicon-floppy-disk',
            UNDELETE:   'glyphicon glyphicon-repeat',
            DELETE:     'glyphicon glyphicon-trash',
            APPLICATION:  'glyphicon glyphicon-list-alt'
        }
    });
