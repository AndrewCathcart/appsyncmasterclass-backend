import DynamoDB from "aws-sdk/clients/dynamodb";
import http from "axios";
import { config } from "dotenv";
import fs from "fs";
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

const user_can_upload_image_to_url = async (url, filepath, contentType) => {
  const data = fs.readFileSync(filepath);
  await http({
    method: "put",
    url,
    headers: {
      "Content-Type": contentType,
    },
    data,
  });

  console.log("uploaded image to", url);
};

const user_can_download_image_from = async (url) => {
  const res = await http(url);
  console.log("downloaded image from", url);
  return res.data;
};

export default {
  user_exists_in_UsersTable,
  user_can_upload_image_to_url,
  user_can_download_image_from,
};
