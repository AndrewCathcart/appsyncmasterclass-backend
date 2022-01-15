import DynamoDB from "aws-sdk/clients/dynamodb";
import Chance from "chance";

const chance = new Chance();
const DocumentClient = new DynamoDB.DocumentClient();

export const handler = async (event) => {
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    const name = event.request.userAttributes["name"];
    const suffix = chance.string({
      length: 8,
      casing: "upper",
      alpha: true,
      numeric: true,
    });
    const user = {
      id: event.userName,
      name,
      screenName: `${name.replace(/[^a-zA-Z0-9]/g, "")}${suffix})`,
      createdAt: new Date().toJSON(),
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCount: 0,
    };

    await DocumentClient.put({
      TableName: process.env.USERS_TABLE,
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    }).promise();

    return event;
  } else {
    return event;
  }
};
