db = connect("localhost:3001/meteor");

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