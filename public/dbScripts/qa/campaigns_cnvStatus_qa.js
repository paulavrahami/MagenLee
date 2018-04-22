db = connect("ds229468.mlab.com:29468/heroku_dwwt61r2");
db.auth( {user: "skillera-qa", pwd: "Mlab0099"});

db.campaigns.find().forEach(function(campaign){
	if (campaign.status === 'Dispatched') {
		db.campaigns.update({_id: campaign._id}, {$set: {status: 'Published'}});
	};
	if (campaign.status === 'Delete') {
		db.campaigns.update({_id: campaign._id}, {$set: {status: 'Deleted'}});
	};
	if (campaign.status === 'In work') {
		db.campaigns.update({_id: campaign._id}, {$set: {status: 'In Work'}});
	};
});