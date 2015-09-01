var request = require('request');
var qs = require('querystring');
//Config based information
var ACCESS_URL = sails.config.f1connection.accessUrl;
var REQUEST_URL = sails.config.f1connection.requestUrl;
var CONSUMER_KEY = sails.config.f1connection.consumerKey;
var CONSUMER_SECRET = sails.config.f1connection.consumerSecret;
var USER_ID = sails.config.f1connection.userId;
var USER_PASSWORD = sails.config.f1connection.userPassword;


//rest API endpoints
var FUND_QUERY = 'https://cbcsattx.staging.fellowshiponeapi.com/giving/v1/funds/251856.json';


//Private ish function
// Credential conversion
var buildCreds = function(username,password){
  return new Buffer(username + " " + password).toString('base64');
}


//Exposed functions
var f1Object = {};

//reach out to the service and grab a oauth signing key
f1Object.fetchOAuth = function(callback){
  //Build up the credentials and get the oauth signing key
  request.post({
    body: buildCreds(USER_ID,USER_PASSWORD),
    url:ACCESS_URL,
    oauth: {
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    }}, function (e, r, body) {
      callback(qs.parse(body));
  })
};
//Grab the stored key if we have one, if not store a new value into our model for data store
//send a callback with the data object
f1Object.getKey = function (callback){
  f1Object.fetchOAuth(function(oauth){
    callback(oauth,function(){
      console.log("unrecorverable error");
      callback({},function(){},{error:"unrecorverable"});
    });
  });
};

f1Object.queryUrl = function(url,cb){
  f1Object.getKey(function(oauthInfo,retryCallback,error){
    if(!error){
      //oauth object for header pass
      var oauthHeader = {
        consumer_key: CONSUMER_KEY ,
        consumer_secret: CONSUMER_SECRET ,
        token: oauthInfo.oauth_token ,
        token_secret: oauthInfo.oauth_token_secret
      };
      console.log(oauthHeader);

      request.get({url:url,
        headers: {
          Accept: "application/json",
          "Content-type": "application/json"
        },
        oauth:oauthHeader
      }, function (e, r, body) {
        // ready to make signed requests on behalf of the user
        if(r.statusCode == 401){

          console.log(e);
          console.log(r);
          retryCallback();
        } else {
          console.log("came back");
          console.log(e);
          console.log(r);
          console.log(body);

          cb(JSON.parse(body));
        }
      })
    } else {
      cb(error);
    }

  });
};

f1Object.sayHello = function ( cb ){
  f1Object.queryUrl(FUND_QUERY,cb);
};


module.exports = f1Object;
