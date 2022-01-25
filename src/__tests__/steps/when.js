import { map as velocityMapper } from "amplify-appsync-simulator/lib/velocity/value-mapper/mapper";
import velocityTemplate from "amplify-velocity-template";
import AWS from "aws-sdk";
import { config } from "dotenv";
import fs from "fs";
import { handler as confirmUserSignup } from "../../handlers/confirm-user-signup/handler";
import { handler as getImageUploadUrl } from "../../handlers/get-image-upload-url/handler";
import GraphQL from "../lib/graphql";

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

const we_invoke_getImageUploadUrl = async (
  username,
  extension,
  contentType
) => {
  const context = {};
  const event = {
    identity: {
      username,
    },
    arguments: {
      extension,
      contentType,
    },
  };

  return await getImageUploadUrl(event, context);
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

const a_user_calls_getMyProfile = async (user) => {
  const getMyProfile = `query getMyProfile {
    getMyProfile {
      createdAt
      backgroundImageUrl
      bio
      birthdate
      followersCount
      followingCount
      id
      imageUrl
      likesCount
      location
      name
      screenName
      website
      tweetsCount
    }
  }`;

  const data = await GraphQL(
    process.env.API_URL,
    getMyProfile,
    {},
    user.accessToken
  );
  const profile = data.getMyProfile;

  console.log(`[${user.username}] - fetched profile`);

  return profile;
};

const a_user_calls_editMyProfile = async (user, input) => {
  const editMyProfile = `mutation editMyProfile($input: ProfileInput!) {
    editMyProfile(newProfile: $input) {
      createdAt
      backgroundImageUrl
      bio
      birthdate
      followersCount
      followingCount
      id
      imageUrl
      likesCount
      location
      name
      screenName
      website
      tweetsCount
    }
  }`;
  const variables = {
    input,
  };

  const data = await GraphQL(
    process.env.API_URL,
    editMyProfile,
    variables,
    user.accessToken
  );
  const profile = data.editMyProfile;

  console.log(`[${user.username}] - edited profile`);

  return profile;
};

const a_user_calls_getImageUploadUrl = async (user, extension, contentType) => {
  const getImageUploadUrl = `query getImageUploadUrl($extension: String, $contentType: String) {
    getImageUploadUrl(extension: $extension, contentType: $contentType)
  }`;
  const variables = {
    extension,
    contentType,
  };

  const data = await GraphQL(
    process.env.API_URL,
    getImageUploadUrl,
    variables,
    user.accessToken
  );
  const url = data.getImageUploadUrl;

  console.log(`[${user.username}] - got image upload url`);

  return url;
};

export default {
  we_invoke_confirmUserSignup,
  a_user_signs_up,
  we_invoke_an_appsync_template,
  a_user_calls_getMyProfile,
  a_user_calls_editMyProfile,
  we_invoke_getImageUploadUrl,
  a_user_calls_getImageUploadUrl,
};
