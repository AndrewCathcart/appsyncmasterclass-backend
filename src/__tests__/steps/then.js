import DynamoDB from "aws-sdk/clients/dynamodb";
import { config } from "dotenv";
config();

const user_exists_in_UsersTable = async (id) => {
  const ddb = new DynamoDB.DocumentClient();

  console.log(`looking for user ${id} in table ${process.env.USERS_TABLE}`);

  const res = await ddb
    .get({
      TableName: process.env.USERS_TABLE,
      Key: {
        id,
      },
    })
    .promise();

  expect(res.Item).toBeTruthy();

  return res.Item;
};

export default {
  user_exists_in_UsersTable,
};
