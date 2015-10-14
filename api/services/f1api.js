var request = require('request');
var qs = require('querystring');
var NodeCache = require( "node-cache" );
var myCache = new NodeCache( { stdTTL: 180, checkperiod: 90 } );


//Regex matching
var paidInFullRegex = /full/i;

//Config based information
var ACCESS_URL = sails.config.f1connection.accessUrl;
var REQUEST_URL = sails.config.f1connection.requestUrl;
var CONSUMER_KEY = sails.config.f1connection.consumerKey;
var CONSUMER_SECRET = sails.config.f1connection.consumerSecret;
var USER_ID = sails.config.f1connection.userId;
var USER_PASSWORD = sails.config.f1connection.userPassword;
var BASE_URL = sails.config.f1connection.baseUrl;

//rest API endpoints
var FUND_QUERY = BASE_URL + 'giving/v1/funds/294115.json';
var ALL_FUNDS_QUERY = BASE_URL + 'giving/v1/funds.json';
var RECEIPTS = BASE_URL + "giving/v1/contributionreceipts/search.json?";
var START_DATE = "2015-08-24";
//var START_DATE = "2015-10-10";
var BATCHES_QUERY = BASE_URL + "giving/v1/batches/search?" + qs.stringify({
  searchFor:"*01-4201-2000*",
  batchTypeID:1,
  recordsPerPage:30
});
var BATCHES_TYPE = BASE_URL + "giving/v1/batches/batchtypes.json";

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
        if(r && r.statusCode){
          console.log(r.statusCode);
          if(r.statusCode == 401){
            console.log(e);
            console.log(r);
            retryCallback();
          } else if (r.statusCode == 500){
              console.log(e);
              cb({error:"500 server error on f1 side."});
          } else if (r.statusCode == 404){
              console.log(e);
              cb({error:"404 server on f1 side."});
          } else if(r.statusCode == 200) {
            console.log("came back");
            try{
                cb(JSON.parse(body));
            } catch (e){
              cb({ error: "Parse error"});
            }
          }
        } else{
          cb({});
        }
      })
    } else {
      cb(error);
    }

  });
};

f1Object.batchesQuery = function ( cb ){
  f1Object.queryUrl(BATCHES_QUERY,cb);
};
f1Object.queryFund = function ( cb ){
  f1Object.queryUrl(FUND_QUERY,cb);
};
f1Object.batchTypes = function(cb){
  f1Object.queryUrl(BATCHES_TYPE,cb);
};
f1Object.receipts = function(cb){
  f1Object.queryUrl(RECEIPTS,cb);
};
f1Object.getReceiptQueryURL = function(fromDate,toDate){
  return BASE_URL + "giving/v1/contributionreceipts/search.json?" + qs.stringify({
    startReceivedDate: fromDate,
    endReceivedDate: toDate,
    recordsPerPage:99999
  });
};

function parseDate(input) {
  var parts = input.split('-');
  return new Date(parts[0], parts[1]-1, parts[2]);
}
function formatDate(input){
  return input.getFullYear() + "-" + (input.getMonth() +1) + "-" + input.getDate();
}
function checkDay(date,foundCB,missingCB){
  Funds.findOne({date:date}).exec(function findOneCB(err, found){
    //console.log("checking for days, err ", err, " found, ", found);
    if(found){
      //console.log("found day already: ", found);
      foundCB(found.amount);
    } else {
      missingCB();
    }
  });
}
function addDay(date,amount){
		Funds.create({date: date, amount: amount}).exec(function createCB(err, created){
		  console.log('Created user with date ', created.date , " and amount of: ", created.amount);
		});
}

f1Object.getDataByDays = function(fromDate, cb){
  var start = parseDate(fromDate);
  var end = new Date();
  var daysBetween = Math.floor((end - start) / (1000*60*60*24));
  console.log("days: ", daysBetween , " start: ", start);
  console.log("end: ", end);
  var dates = [];
  for (var i = 0; i < daysBetween ;i++){
    dates.push({
      startDate: formatDate(new Date(start.getTime() + 24 * 60 * 60 * 1000 * i)),
      endDate: formatDate(new Date(start.getTime() + 24 * 60 * 60 * 1000 * (i + 1)))
    });
  }
  var totalOverall = parseFloat("0.00");

  async.each(dates, function(item, callback) {
    checkDay(item.startDate,function(amount){
      totalOverall = totalOverall + amount;
      callback();
    }, function(){
      f1Object.queryUrl(f1Object.getReceiptQueryURL(item.startDate,item.endDate),function(data){
              if(data.results){
                var total = parseFloat("0.00");
                //console.log(data.results);
                var filteredData = data.results.contributionReceipt.filter(function (el) {
                  return el.fund.name.match(paidInFullRegex);
                });
                filteredData.forEach(function(item){
                  total = total + parseFloat(item.amount);
                });
                //console.log("Day: ", item, " amount: ", total);
                totalOverall = totalOverall + total;
                addDay(item.startDate,total);
              }
              callback();
            });
    });
  }, function(err){
      var today = new Date();
      var tomorrow = formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000 ));
      today = formatDate(today);
      f1Object.queryUrl(f1Object.getReceiptQueryURL(today,tomorrow),function(data){
        if(data.results){
          var total = parseFloat("0.00");
          //console.log(data.results);
          var filteredData = data.results.contributionReceipt.filter(function (el) {
            return el.fund.name.match(paidInFullRegex);
          });
          filteredData.forEach(function(item){
            total = total + parseFloat(item.amount);
          });
          //console.log("Day: ", item, " amount: ", total);
          totalOverall = totalOverall + total;
          addDay(item.startDate,total);
        }
        cb(totalOverall);
      });
  });


};

f1Object.getTotalPaidInFull = function(goalAmount,cb){
    var cacheKey = "paidInFull";
    myCache.get(cacheKey, function (err, result) {

        //Error hitting cache
        if (err) {
          throw new Error(err);
        } else if (result) {
          cb(result);
        } else {
          //Need to process
          f1Object.getDataByDays(START_DATE,function(total){
            myCache.set(cacheKey,{
              totalContributions: parseFloat((total/goalAmount) * 100).toFixed(5)
             } );
            cb( {
              totalContributions: parseFloat((total/goalAmount) * 100).toFixed(5)
             } );
          });
        }

    });

};

module.exports = f1Object;
