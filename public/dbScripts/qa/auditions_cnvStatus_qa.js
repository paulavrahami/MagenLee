db = connect("ds229468.mlab.com:29468/heroku_dwwt61r2");
db.auth( {user: "skillera-qa", pwd: "Mlab0099"});

db.auditions.find().forEach(function(audition){
	if (audition.status === 'Assigned') {
		campaignRec = db.campaigns.findOne({_id: audition.campaignId});
		if (campaignRec.status !== 'Published') {
			db.auditions.update({_id: audition._id}, {$set: {status: 'Verified'}})
		};
		if (campaignRec.status === 'Published') {
			db.auditions.update({_id: audition._id}, {$set: {status: 'Published'}})
		};
		if (campaignRec.status === 'Closed') {
			db.auditions.update({_id: audition._id}, {$set: {status: 'Published'}})
		};
	};
});