const cdk = require('@aws-cdk/core');
const { MainStack } = require('./stacks/main');
const app = new cdk.App();

const getConfig = () => {
  const env = app.node.tryGetContext('config');
    if (!env)
        throw new Error("Context variable missing on CDK command. Pass in as `-c config=XXX`");

    return app.node.tryGetContext(env);
};

const buildConfig = getConfig();
new MainStack(app, `${buildConfig.environment}-merchant-onboarding-main`, {
  env: { region: buildConfig.region }
}, buildConfig);
