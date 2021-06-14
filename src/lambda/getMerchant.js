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
    body: 'Not found'
  };
};

const buildCannotProcessResponse = () => {
  return {
    statusCode: 422,
    headers: { "Content-Type": "application/json" },
    body: 'name is required'
  };
};

const MERCHANT_MAPPING_TABLE = process.env.merchant_mapping_table;
const REGION = process.env.region;

const getNameFromParam = (event) => {
  if (event.queryStringParameters && event.queryStringParameters.name) {
    return event.queryStringParameters.name;
  }
};

const handler = async (event) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  
  const merchantName = getNameFromParam(event)
  if (!merchantName) return buildCannotProcessResponse();  
  const result = await getMerchantByName(merchantName);
  console.log(`!!! Merchant retrieved: ${JSON.stringify(result)}`);

  return result ? buildResponse(result) : buildNotFoundResponse();
};

const getMerchantByName = async (merchantName) => {
  const docClient = new DynamoDB.DocumentClient({apiVersion: '2012-08-10', region: REGION});
  return await docClient.query({
    TableName: MERCHANT_MAPPING_TABLE,
    IndexName: 'merchantName-index',
    KeyConditionExpression: 'merchantName = :merchantName',
    ExpressionAttributeValues: { ':merchantName': merchantName }
  }).promise(); 
};

module.exports = { handler, getMerchantByName };
