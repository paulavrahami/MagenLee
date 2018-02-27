db = connect("ds229468.mlab.com:29468/heroku_dwwt61r2");
db.auth( {user: "skillera-qa", pwd: "Mlab0099"});

db.applications.find().forEach(function(application){
	if (application.states) {
		for (let index in application.states.itemsContent) {
			if (application.states.itemsContent.hasOwnProperty(index)) {
		    	application.states.itemsContent[index].state.maxScore = 5.88235294117647;
		    	application.states.itemsContent[index].state.score = (5.88235294117647 * application.states.itemsContent[index].state.validity)/100;
		    };
		};        
   	};
    db.applications.update({_id: application._id}, {$set: application});
});