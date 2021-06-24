const { Stack } = require('@aws-cdk/core');
const { Runtime, Code, Function } = require('@aws-cdk/aws-lambda');
const { RestApi, LambdaIntegration, Cors } = require('@aws-cdk/aws-apigateway');
const { Table } = require('@aws-cdk/aws-dynamodb');
const { UserPool } = require('@aws-cdk/aws-cognito');
const { Effect, PolicyStatement } = require('@aws-cdk/aws-iam');

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
    const basicMerchants = v1.addResource('basic_merchants');
    const signup = merchants.addResource('signup');
    const emailMerc = merchants.addResource('email_merchant');

    /*** Lambdas **/
    const sendEmail = new Function(this, getName('send-email', environment), { 
      runtime, 
      code: Code.fromAsset(LAMBDA_DIR), 
      handler: 'sendEmail.handler',
      environment: config
    });
    emailMerc.addMethod('GET', new LambdaIntegration(sendEmail));

    const getMerchant = new Function(this, getName('get-merchant-function', environment), { 
      runtime, 
      code: Code.fromAsset(LAMBDA_DIR), 
      handler: 'getMerchant.handler',
      environment: config
    });
    merchants.addMethod('GET', new LambdaIntegration(getMerchant));
    
    const createMerchant = new Function(this, getName('create-merchant-function', environment), { 
      runtime, 
      code: Code.fromAsset(LAMBDA_DIR), 
      handler: 'createMerchant.handler',
      environment: config
    });
    merchants.addMethod('POST', new LambdaIntegration(createMerchant));

    const getAllMerchantsFromUserPool = new Function(this, getName('get-all-merchants', environment), { 
      runtime, 
      code: Code.fromAsset(LAMBDA_DIR), 
      handler: 'getAllMerchantsFromUserPool.handler',
      environment: config
    });
    basicMerchants.addMethod('GET', new LambdaIntegration(getAllMerchantsFromUserPool));
    
    const signFn = new Function(this, getName('sign-fn', environment), { 
      runtime, 
      code: Code.fromAsset(LAMBDA_DIR), 
      handler: 'autoApproveMerchantUser.handler',
      environment: config
    });
    signup.addMethod('GET', new LambdaIntegration(signFn));
   
    /** Cognito **/
    const userPool = UserPool.fromUserPoolId(this, 'UserPool', 'us-east-1_6JDtBmeG2');
    getAllMerchantsFromUserPool.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:ListUsers'],
        resources: [
          `arn:aws:cognito-idp:${userPool.stack.region}:${userPool.stack.account}:userpool/${userPool.userPoolId}`
        ],
      })
    );
    signFn.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'cognito-idp:*'
        ],
        resources: [
          `arn:aws:cognito-idp:${userPool.stack.region}:${userPool.stack.account}:userpool/${userPool.userPoolId}`
        ],
      })
    );

    /** DynamoDB **/
    const merchantTableArn = `arn:aws:dynamodb:${region}:${aws_account_id}:table/${merchant_mapping_table}`;
    const merchantMappingTable = Table.fromTableArn(this, getName('merchant-mapping-table', environment), merchantTableArn);
    merchantMappingTable.grantReadData(getMerchant);

    const merchantIndex = Table.fromTableAttributes(this, 'dev-merchant-index', { tableArn: merchantTableArn, globalIndexes: ['merchantName-index']});
    merchantIndex.grantReadData(getMerchant);
  }
}

module.exports = { MainStack }