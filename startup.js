// Modules.server.startup = startup; 

// // let startup = () => {
// //   Modules.server.configureServices(); 
// // }; 

var _setBrowserPolicies = () => {
  
};

if(Meteor.isServer){
    ServiceConfiguration.configurations.remove({
  service: "twitter"
}); 
ServiceConfiguration.configurations.insert({
  service: "twitter",
  clientId: "acrnw2sCwRmDUzhQSq0SLAdQi",
  loginStyle: "popup",
  secret: "GW4QDHjkuMPMPfaLjPyVKtVrHW0Ui2Y514B5PWaChWAwhgwNnJ"
});
    Meteor.startup(function (){
      const services = Meteor.settings.private.oAuth;
      if ( services ) {
        for( let service in services ) {  
          ServiceConfiguration.configurations.upsert( { service: service }, {
            
            $set: services[ service ]
            });
        } 
      }
    });
}