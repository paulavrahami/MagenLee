if (Meteor.isServer) {
    Meteor.startup(function () {
        if (TemplatesCollection.find({_id:'57f7a8406f903fc2b6aae39a'}).count() === 0) {

            TemplatesCollection.insert({
                "_id": "57f7a8406f903fc2b6aae39a",
                "name": "Multiple Choice (Basic)",
                "description": "Check for the right answer",
                "type": "Multiple Choice",
                "templateUrl": "MultipleChoiceSimple.html",
                "dataStructure" : {
                    "interfaces" : {},
                    "structure" : {
                        "statement" : "string",
                        "question" : "string",
                        "hint" : "string",
                        // "hintTime" : "number",
                        "1st Answer" : {
                            "answer" : "string",
                            "correct" : "boolean"
                        },
                        "2nd Answer" : {
                            "answer" : "string",
                            "correct" : "boolean"
                        },
                        "3rd Answer" : {
                            "answer" : "string",
                            "correct" : "boolean"
                        },
                        "4th Answer" : {
                            "answer" : "string",
                            "correct" : "boolean"
                        }
                    }
                }
            });
        }
        if (TemplatesCollection.find({_id:'57f7a8406f903fc2b6aae39a'}).count() === 1) {

            TemplatesCollection.update({_id:'57f7a8406f903fc2b6aae39a'}, {
                "_id": "57f7a8406f903fc2b6aae39a",
                "name": "Multiple Choice (Basic)",
                "description": "Check for the right answer",
                "type": "Multiple Choice",
                "templateUrl": "MultipleChoiceSimple.html",
                "dataStructure" : {
                    "interfaces" : {},
                    "structure" : {
                        "statement" : "string",
                        "question" : "string",
                        "hint" : "string",
                        // "hintTime" : "number",
                        "1st Answer" : {
                            "answer" : "string",
                            "correct" : "boolean"
                        },
                        "2nd Answer" : {
                            "answer" : "string",
                            "correct" : "boolean"
                        },
                        "3rd Answer" : {
                            "answer" : "string",
                            "correct" : "boolean"
                        },
                        "4th Answer" : {
                            "answer" : "string",
                            "correct" : "boolean"
                        }
                    }
                }
            });
        }
        if (TemplatesCollection.find({_id:'57f7a8406f903fc2b6aae49a'}).count() === 0) {

            TemplatesCollection.insert({
                "_id": "57f7a8406f903fc2b6aae49a",
                "name": "Multiple Choice (Reduced)",
                "description": "On each selection the score will be reduced by 5 points",
                "type": "Multiple Choice",
                "templateUrl": "MultipleChoice.html",
                "dataStructure": {
                    "interfaces": {},
                    "structure": {
                        "statement" : "string",
                        "question": "string",
                        "answers": [
                            "string"
                        ],
                        "results": [
                            "number"
                        ]
                    }
                }
            });
        }
        if (TemplatesCollection.find({_id:'57f7a8406f903fc2b6aae49a'}).count() === 1) {

            TemplatesCollection.update({_id:'57f7a8406f903fc2b6aae49a'}, {
                "_id": "57f7a8406f903fc2b6aae49a",
                "name": "Multiple Choice (Reduced)",
                "description": "On each selection the score will be reduced by 5 points",
                "type": "Multiple Choice",
                "templateUrl": "MultipleChoice.html",
                "dataStructure": {
                    "interfaces": {},
                    "structure": {
                        "statement" : "string",
                        "question": "string",
                        "answers": [
                            "string"
                        ],
                        "results": [
                            "number"
                        ]
                    }
                }
            });
        }
        if (TemplatesCollection.find({_id:'5814b536e288e1a685c7a451'}).count() === 0) {
            /* 2 */
            TemplatesCollection.insert({
                "_id" : "5814b536e288e1a685c7a451",
                "name" : "True/False",
                "description" : "Select between two options",
                "type" : "True/False",
                "templateUrl" : "TrueFalse.html",
                "dataStructure" : {
                    "interfaces" : {},
                    "structure" : {
                        "statement" : "string",
                        "question" : "string",
                        "1st Button Text" : "string",
                        "2nd Button Text" : "string",
                        "1st Button Score" : "number",
                        "2nd Button Score" : "number"
                    }
                }
            });
        }
        if (TemplatesCollection.find({_id:'5814b536e288e1a685c7a451'}).count() === 1) {
            /* 2 */
            TemplatesCollection.update({_id:'5814b536e288e1a685c7a451'}, {
                "_id" : "5814b536e288e1a685c7a451",
                "name" : "True/False",
                "description" : "Select between two options",
                "type" : "True/False",
                "templateUrl" : "TrueFalse.html",
                "dataStructure" : {
                    "interfaces" : {},
                    "structure" : {
                        "statement" : "string",
                        "question" : "string",
                        "1st Button Text" : "string",
                        "2nd Button Text" : "string",
                        "1st Button Score" : "number",
                        "2nd Button Score" : "number"
                    }
                }
            });
        }
    });
}
