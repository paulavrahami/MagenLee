db = connect("localhost:3001/meteor");

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