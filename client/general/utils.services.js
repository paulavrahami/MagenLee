angular.module('brgo').factory ('utilsService',function (){

return {

getRandomNumber: ()=>{
    return (Math.ceil(Math.random() * 900000));
},

getAudition: (id)=>{
  Meteor.subscribe('auditions');
  return Auditions.findOne({_id: id});
},
isLoggedIn: () =>{
  return !!Meteor.userId();
},
currentUser: () =>{
  return Meteor.user();
},

getAuditionName: (id)=>{
  Meteor.subscribe('auditions');
  return Auditions.findOne({_id: id},{name:1});
},

getAuditionById: (nameArg)=>{
  //console.log('in utils get audition');
  Meteor.subscribe('auditions');
  return Auditions.findOne({name: nameArg},{_id:1});
},

getIPAddress: () => {
  $.getJSON('//api.ipify.org?format=jsonp&callback=?', function(data) {
    return data.ip;
  });
}


}
})
