angular
    .module('skillera')
    .factory ('dbhService',function () {
        Meteor.subscribe('sequences');
        return {

            getNextSequenceValue: (sequenceName) => {

                let sequenceValue = Sequences.findAndModify({
                    query:{_id: sequenceName },
                    update: {$inc:{sequence_value:1}},
                    new:true
                });
                return sequenceValue ? sequenceValue.sequence_value : null;
            },

            insertActivityLog: (type,id,activity,text)=>{
                console.log('in utils activity insert');
                activityLogUpd = {};

                activityLogUpd.collectionType = type;
                activityLogUpd.collectionId = id;
                activityLogUpd.activity = activity;
                activityLogUpd.text = text;
                activityLogUpd.date = new Date();
                activityLogUpd.user = Meteor.user().username;
                activityLogUpd.userid = Meteor.user()._id;

                ActivityLog.insert(activityLogUpd);
            }


//getAudition: (id)=>{
//  console.log('in utils get audition');
//  Meteor.subscribe('auditions');
//  console.log('the id is -' + id);
//  return Auditions.findOne({_id: id});
//},

        }
    })
