db = connect("ds119078.mlab.com:19078/heroku_zgtvhxbk");
db.auth( {user: "skillera-dev", pwd: "Mlab0099"});

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