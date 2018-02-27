db = connect("localhost:3001/meteor");

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