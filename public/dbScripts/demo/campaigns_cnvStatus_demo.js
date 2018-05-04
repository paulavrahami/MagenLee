db = connect("ds153869.mlab.com:53869/heroku_m45dr6l0");
db.auth( {user: "skillera-demo", pwd: "Mlab0099"});

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