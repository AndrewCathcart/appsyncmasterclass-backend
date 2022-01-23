import { create as createVelocityUtils } from "amplify-appsync-simulator/lib/velocity/util";
import AWS from "aws-sdk";
import Chance from "chance";
import { config } from "dotenv";

config();

const chance = new Chance();

const a_random_user = () => {
  const firstName = chance.first({ nationality: "en" });
  const lastName = chance.last({ nationality: "en" });
  const suffix = chance.string({
    length: 4,
    pool: "abcdefjhijklmnopqrstuvwxyz",
  });

  const name = `${firstName} ${lastName}${suffix}`;
  const password = chance.string({ length: 8 });
  const email = `${firstName}-${lastName}-${suffix}@appsyncmasterclass.com`;

  return {
    name,
    password,
    email,
  };
};

const an_appsync_context = (identity, args) => {
  const util = createVelocityUtils([], new Date(), Object());
  const context = {
    identity,
    args,
    arguments: args,
  };

  return {
    context,
    ctx: context,
    util,
    utils: util,
  };
};

const an_authenticated_user = async () => {
  const { name, email, password } = a_random_user();

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

  const auth = await cognito
    .initiateAuth({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.WEB_COGNITO_USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    })
    .promise();

  console.log(`[${email}] - signed in`);

  return {
    username,
    name,
    email,
    idToken: auth.AuthenticationResult.IdToken,
    accessToken: auth.AuthenticationResult.AccessToken,
  };
};

export default {
  a_random_user,
  an_appsync_context,
  an_authenticated_user,
};
