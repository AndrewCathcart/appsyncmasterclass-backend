import AWS from "aws-sdk";
import { ulid } from "ulid";

const s3 = new AWS.S3({ useAccelerateEndpoint: true });

export const handler = async (event) => {
  const { BUCKET_NAME } = process.env;

  const id = ulid();
  let key = `${event.identity.username}/${id}`;

  const extension = event.arguments.extension;
  if (extension) {
    if (extension.startsWith(".")) {
      key += extension;
    } else {
      key += `.${extension}`;
    }
  }

  const contentType = event.arguments.contentType || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("content type should be an image");
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ACL: "public-read",
    ContentType: contentType,
  };

  const signedUrl = s3.getSignedUrl("putObject", params);

  return signedUrl;
};
