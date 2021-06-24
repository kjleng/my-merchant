const { CognitoIdentityServiceProvider } = require('aws-sdk');

const handler = async (event) => {
  const username = 'edmund079';
  const provider = new CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: process.env.region });
  const params = {
    UserPoolId: userPoolId,
    Username: username,
    MessageAction: 'SUPPRESS',
    UserAttributes: [
      {
        Name: 'email',
        Value: '......'
      },
      {
        Name: 'name',
        Value: '......'
      },
      {
        Name: 'locale',
        Value: 'EN'
      },
      {
        Name: 'custom:RoleName',
        Value: 'merchant'
      },
      {
        Name: 'email_verified',
        Value: "true"
      }
    ]
  };
  const createResult = await provider.adminCreateUser(params).promise();
  const confirmPasswordParams = {
    Password: password, 
    UserPoolId: userPoolId,
    Username: username,
    Permanent: true
  };
  const confirmPassResult = await provider.adminSetUserPassword(confirmPasswordParams).promise();
  
  // const confirmParams = {
  //   UserPoolId: 'us-east-1_6JDtBmeG2',
  //   Username: username
  // };
  // const confirmResult = await provider.adminConfirmSignUp(confirmParams).promise();
  // console.log('!!!! result = '+JSON.stringify(confirmResult));

  
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: `${JSON.stringify({ foo: 'bar' }, undefined, 2)}`
  };
};

module.exports = { handler };