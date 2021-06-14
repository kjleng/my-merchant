const { Stack } = require('@aws-cdk/core');
const { Runtime, Code, Function } = require('@aws-cdk/aws-lambda');
const { RestApi, LambdaIntegration, Cors } = require('@aws-cdk/aws-apigateway');
const { Table } = require('@aws-cdk/aws-dynamodb');

const runtime = Runtime.NODEJS_14_X;
const LAMBDA_DIR = 'src/lambda';

const getName = (resourceName, environment) => {
  const _env = environment || 'qa';
  return `${_env}-${resourceName}`;
}

class MainStack extends Stack {
  constructor(scope, id, props, config) {
    super(scope, id, props);

    const { aws_account_id, region, environment, merchant_mapping_table } = config;
    /** API Gateway **/
    const merchantApi = new RestApi(this, getName('merchant-onboarding-api', environment), { 
      deployOptions: { stageName: environment },
      defaultCorsPreflightOptions: { allowOrigins: Cors.ALL_ORIGINS } 
    });
    const apiRoot = merchantApi.root.addResource('api');
    const v1 = apiRoot.addResource('v1');
    const merchants = v1.addResource('merchants');
    
    /*** Lambdas **/
    const getMerchant = new Function(this, getName('get-merchant-function', environment), { 
      runtime, 
      code: Code.fromAsset(LAMBDA_DIR), 
      handler: 'getMerchant.handler',
      environment: config
    });
    merchants.addMethod('GET', new LambdaIntegration(getMerchant));
    
    /** DynamoDB **/
    const merchantTableArn = `arn:aws:dynamodb:${region}:${aws_account_id}:table/${merchant_mapping_table}`;
    const merchantMappingTable = Table.fromTableArn(this, getName('merchant-mapping-table', environment), merchantTableArn);
    merchantMappingTable.grantReadData(getMerchant);

    const merchantIndex = Table.fromTableAttributes(this, 'dev-merchant-index', { tableArn: merchantTableArn, globalIndexes: ['merchantName-index']});
    merchantIndex.grantReadData(getMerchant);
  }
}

module.exports = { MainStack }