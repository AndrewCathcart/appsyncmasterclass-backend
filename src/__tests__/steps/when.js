import { map as velocityMapper } from "amplify-appsync-simulator/lib/velocity/value-mapper/mapper";
import velocityTemplate from "amplify-velocity-template";
import AWS from "aws-sdk";
import { config } from "dotenv";
import fs from "fs";
import { handler as confirmUserSignup } from "../../handlers/confirm-user-signup/handler";

config();

const we_invoke_confirmUserSignup = async (username, name, email) => {
  const event = {
    version: "1",
    region: process.env.REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userName: username,
    triggerSource: "PostConfirmation_ConfirmSignUp",
    request: {
      userAttributes: {
        sub: username,
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
        email_verified: "false",
        name: name,
        email: email,
      },
    },
    response: {},
  };

  const context = {};
  await confirmUserSignup(event, context);
};

const a_user_signs_up = async (name, email, password) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();

  const res = await cognito
    .signUp({
      ClientId: process.env.WEB_COGNITO_USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "name", Value: name }],
    })
    .promise();

  const username = res.UserSub;
  console.log(`${email} has signed up - username: ${username}`);

  await cognito
    .adminConfirmSignUp({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
    })
    .promise();

  console.log(`${email} has confirmed signup`);

  return {
    username,
    name,
    email,
  };
};

const we_invoke_an_appsync_template = (templatePath, context) => {
  const template = fs.readFileSync(templatePath, { encoding: "utf-8" });
  const ast = velocityTemplate.parse(template);
  const compiler = new velocityTemplate.Compile(ast, {
    valueMapper: velocityMapper,
    escape: false,
  });
  return JSON.parse(compiler.render(context));
};

export default {
  we_invoke_confirmUserSignup,
  a_user_signs_up,
  we_invoke_an_appsync_template,
};
