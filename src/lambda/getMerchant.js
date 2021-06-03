const { DynamoDB } = require('aws-sdk');

const buildResponse = (result) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: `${JSON.stringify(result, undefined, 2)}`
  };
};

const buildNotFoundResponse = () => {
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: `Not found`
  };
};

const MERCHANT_MAPPING_TABLE = process.env.merchant_mapping_table;
const REGION = process.env.region;

exports.handler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const { merchant_hash } = event.pathParameters;

  if (!merchant_hash) return buildNotFoundResponse();
  
  const docClient = new DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: REGION});
  const result = await docClient.get({
    TableName: MERCHANT_MAPPING_TABLE,
    Key: {'merchant_hash': merchant_hash}
  }).promise();

  console.log(`!!! Merchant retrieved: ${JSON.stringify(result)}`);

  return result ? buildResponse(result) : buildNotFoundResponse();
};