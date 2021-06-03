const { Stack } = require('@aws-cdk/core');
const { Runtime, Code, Function } = require('@aws-cdk/aws-lambda');
const { RestApi, LambdaIntegration } = require('@aws-cdk/aws-apigateway');
const { Table, AttributeType } = require('@aws-cdk/aws-dynamodb');

const runtime = Runtime.NODEJS_14_X;
const LAMBDA_DIR = 'src/lambda';

const getName = (resourceName, environment) => {
  const _env = environment || 'qa';
  return `${_env}-${resourceName}`;
}

class MainStack extends Stack {
  constructor(scope, id, props, config) {
    super(scope, id, props);

    const { environment, merchant_mapping_table } = config;
    /** API Gateway **/
    const merchantApi = new RestApi(this, getName('merchant-onboarding-api', environment), { deployOptions: { stageName: environment } });
    const apiRoot = merchantApi.root.addResource('api');
    const v1 = apiRoot.addResource('v1');
    const merchants = v1.addResource('merchants');
    const merchant = merchants.addResource('{merchant_hash}');

    /*** Lambdas **/
    const getMerchant = new Function(this, getName('get-merchant-function', environment), { 
      runtime, 
      code: Code.fromAsset(LAMBDA_DIR), 
      handler: 'getMerchant.handler',
      environment: config
    });
    merchant.addMethod('GET', new LambdaIntegration(getMerchant));
    
   /** DynamoDB **/
    const merchantMappingTable = new Table(this, getName('merchantmapping-table', environment), {
      partitionKey: { name: 'merchant_hash', type: AttributeType.STRING },
      tableName: merchant_mapping_table
    });
    merchantMappingTable.grantReadWriteData(getMerchant);
  }
}

module.exports = { MainStack }