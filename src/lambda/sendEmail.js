const AWS = require('aws-sdk');

const handler = async (event) => {
const aws_region = "us-east-1"
// Specify the region.
AWS.config.update({region:aws_region});
const senderAddress = "edmund.leng@slalom.com";
const toAddress = "kjleng@gmail.com";
const appId = "1be390da82ac49c5883d68e63070cbb1";

const subject = "fooooooobarrrrrr";
const body_text = `Hellllllllllo`;
const body_html = `<html>
<head></head>
<body>
  <h1>Amazon Pinpoint Test (SDK for JavaScript in Node.js)</h1>
  <p>This email was sent with
    <a href='https://aws.amazon.com/pinpoint/'>the Amazon Pinpoint API</a> using the
    <a href='https://aws.amazon.com/sdk-for-node-js/'>
      AWS SDK for JavaScript in Node.js</a>.</p>
</body>
</html>`;

const charset = "UTF-8";

// Specify that you're using a shared credentials file.
// const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
// AWS.config.credentials = credentials;



//Create a new Pinpoint object.
// const pinpoint = new AWS.Pinpoint();

// // Specify the parameters to pass to the API.
// const params = {
//   ApplicationId: appId,
//   MessageRequest: {
//     Addresses: {
//       [toAddress]:{
//         ChannelType: 'EMAIL'
//       }
//     },
//     MessageConfiguration: {
//       EmailMessage: {
//         FromAddress: senderAddress,
//         SimpleEmail: {
//           Subject: {
//             Charset: charset,
//             Data: subject
//           },
//           HtmlPart: {
//             Charset: charset,
//             Data: body_html
//           },
//           TextPart: {
//             Charset: charset,
//             Data: body_text
//           }
//         }
//       }
//     }
//   }
// };

// //Try to send the email.
// const data = pinpoint.sendMessages(params).promise();
// console.log("Email sent!!!!! Message ID: ", data['MessageResponse']);
// console.log("!!!!! ggggg = "+JSON.stringify(data));




var pinpointemail = new AWS.PinpointEmail({apiVersion: '2018-07-26'});
var params = {
  Content: { /* required */
    Simple: {
      Body: { /* required */
        Html: {
          Data: body_html, /* required */
          Charset: charset
        },
        Text: {
          Data: body_text, /* required */
          Charset: charset
        }
      },
      Subject: { /* required */
        Data: subject, /* required */
        Charset: charset
      }
    }
  },
  Destination: { /* required */
    ToAddresses: [toAddress]
  },
  FromEmailAddress: senderAddress,
  ReplyToAddresses: [senderAddress]
};
pinpointemail.sendEmail(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
return {
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: `${JSON.stringify({ foo: 'bar' }, undefined, 2)}`
};
};

module.exports = { handler };