db = connect("ds229458.mlab.com:29458/heroku_h5ztbh0x");
db.auth( {user: "skillera-prd", pwd: "Mlab0099"});

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