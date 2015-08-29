var request = require('request');
var ACCESS_URL = sails.config.f1connection.accessUrl;
var REQUEST_URL = sails.config.f1connection.requestUrl;
var CONSUMER_KEY = sails.config.f1connection.consumerKey;
var CONSUMER_SECRET = sails.config.f1connection.consumerSecret;
var USER_ID = sails.config.f1connection.userId;
var USER_PASSWORD = sails.config.f1connection.userPassword;
var qs = require('querystring');
var oauth =
    { consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    }
  , url = ACCESS_URL
  ;


// //Credential conversion
var buildCreds = function(username,password){
  return new Buffer(username + " " + password).toString('base64');
}
// //grab access token
// var getAccessToken = function(credentials){
//
//   var accessToken = {
//     accessToken: "",
//     tokenSecret: ""
//   }
//
//   var nonce = n();
//   var timestamp = getTS();
//   var normalizedUrl = "";
//   var normalizedReqParms = "";
//   var signatureBase = "";
//   var sig = generateSignature(url, getConsumerKey(), getConsumerSecret(), null, null, "POST",
//           timestamp, nonce, normalizedUrl, normalizedReqParms, signatureBase);
//
//   var options = {
//       host: 'my.url',
//       port: 80,
//       path: '/login',
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/xml',
//           'Content-Length': Buffer.byteLength(data)
//       }
//   };
//
//   var req = http.request(options, function(res) {
//       res.setEncoding('utf8');
//       res.on('data', function (chunk) {
//           console.log("body: " + chunk);
//       });
//   });
//
//   req.write(data);
//   req.end();
//
//
//
//   HttpURLConnection request = (HttpURLConnection) url.openConnection();
//   request.setFixedLengthStreamingMode(creds.length);
//   request.setRequestMethod("POST");  // changed to POST to support 2nd party
//   var authHeader = buildOAuthHeader(getConsumerKey(), nonce, sig, HMACSHA1SignatureType, timestamp, null);
//   request.setRequestProperty("Authorization", authHeader);
//   request.setRequestProperty("Content-Type", "application/xml");
//   request.setDoOutput(true);
//   request.setDoInput(true);
//   request.setUseCaches(false);
//   request.setAllowUserInteraction(false);
//
//
//   request.setRequestProperty("Content-Length", creds.length + "");
//   // Get the request stream.
//
//   // Create the form content
//   OutputStream out = request.getOutputStream();
//   out.write(creds);
//   out.close();
//
//   int code = request.getResponseCode();
//   logger.debug("responseCode:" + code);
//
//   if (code != 200) {
//       logger.debug("code is not 200");
//
//       String message = request.getResponseMessage();
//       logger.debug("response message = " + message);
//
//       if (request.getErrorStream() != null) {
//           BufferedReader br = new BufferedReader(new InputStreamReader(request.getErrorStream()));
//           String str;
//           StringBuffer sb = new StringBuffer();
//           while ((str = br.readLine()) != null) {
//               sb.append(str);
//               sb.append("\n");
//           }
//           br.close();
//           String response = sb.toString();
//           logger.error("error response is:" + response);
//       }
//
//       return null;
//
//   }
//
//   BufferedReader br = new BufferedReader(new InputStreamReader(request.getInputStream()));
//   String str;
//   StringBuffer sb = new StringBuffer();
//   while ((str = br.readLine()) != null) {
//       sb.append(str);
//       sb.append("\n");
//   }
//   br.close();
//   String response = sb.toString();
//   logger.debug("response is:" + response);
//
//
//   String[] tokeninfo = response.trim().split("&");
//   accessToken = new AuthenticationToken();
//   accessToken.setAccessToken(tokeninfo[0].replace("oauth_token=", ""));
//   accessToken.setTokenSecret(tokeninfo[1].replace("oauth_token_secret=", ""));
//
//   /*
//       //Could add this if needed
//       if (webResponse.Headers["Content-Location"] != null)
//       {
//           personUrl = webResponse.Headers["Content-Location"].ToString();
//       }
//   */
//   return accessToken;
// }






module.exports = {
    sayHello: function sayHelloService(cb) {
      request.post({
        body: buildCreds(USER_ID,USER_PASSWORD),
        url:url,
        oauth:oauth}, function (e, r, body) {
        // Ideally, you would take the body in the response
        // and construct a URL that a user clicks on (like a sign in button).
        // The verifier is only available in the response after a user has
        // verified with twitter that they are authorizing your app.

        //console.log(e);
        //console.log(r);
        console.log(body);
        // step 2
        var req_data = qs.parse(body);
        console.log (req_data);

        //{ oauth_token: 'ef325a5f-11b3-4dfa-8100-5e67f588ebb4',
        // oauth_token_secret: 'ef3284ad-6edd-4a67-b086-b1bdcd44ecde' }
        var uri = REQUEST_URL + '?' + qs.stringify({oauth_token: req_data.oauth_token})
        // redirect the user to the authorize uri

        // step 3
        // after the user is redirected back to your server
        var auth_data = qs.parse(body)
          , oauth =
            { consumer_key: CONSUMER_KEY
            , consumer_secret: CONSUMER_SECRET
            , token: auth_data.oauth_token
            , token_secret: req_data.oauth_token_secret
            }
          , url = 'https://cbcsattx.staging.fellowshiponeapi.com/giving/v1/funds/251856.json'
          ;
        request.get({url:url,
          headers: {
            Accept: "application/json",
            "Content-type": "application/json"
          },
          oauth:oauth}, function (e, r, body) {
          // ready to make signed requests on behalf of the user
          console.log("came back");
          console.log(body);

          cb(JSON.parse(body));
        })
      })

    }
};
