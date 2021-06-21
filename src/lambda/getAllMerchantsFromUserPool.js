const { CognitoIdentityServiceProvider } = require('aws-sdk');

const reduceAttributes = (attributes) => {
  const reducer = (acc, curr) => {
    acc[curr.Name] = curr.Value;
    return acc;
  };
  return attributes.reduce(reducer, {});
}
const parseUsers = (users) => {
  return users
    .filter((user) => {
      return user.Enabled && user.UserStatus === 'CONFIRMED'
    })
    .map((user) => {
      const att = reduceAttributes(user.Attributes);
      return {
        ...att,
        username: user.Username,
        pagination_token: user.PaginationToken
      };
    });
};

const getPaginateToken = (event) => {
  if (event.queryStringParameters && event.queryStringParameters.pagination_token) {
    return event.queryStringParameters.pagination_token;
  }
};

const handler = async (event) => {
  const provider = new CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: process.env.region });
  const paginationToken = getPaginateToken(event);
  const params = {
    UserPoolId: 'us-east-1_6JDtBmeG2',
    Filter: 'preferred_username=\"merchant\"',
    Limit: '60',
    PaginationToken: paginationToken
  };
  const { Users: users } = await provider.listUsers(params).promise();

  const result = Array.isArray(users) ? parseUsers(users) : [];
  return buildResponse(result);
};

const buildResponse = (result) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: `${JSON.stringify(result, undefined, 2)}`
  };
};

module.exports = { handler };
