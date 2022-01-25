import Chance from "chance";
import { config } from "dotenv";
import when from "../../steps/when";

config();

describe("when getImageUploadUrl runs", () => {
  it.each([
    [".png", "image/png"],
    [".jpeg", "image/jpeg"],
    [".png", null],
    [null, "image/png"],
    [null, null],
  ])(
    "returns a signed S3 url for extension %s and content type %s",
    async (extension, contentType) => {
      const username = new Chance().guid();

      const signedUrl = await when.we_invoke_getImageUploadUrl(
        username,
        extension,
        contentType
      );

      const { BUCKET_NAME } = process.env;
      const regex = new RegExp(
        `https://${BUCKET_NAME}.s3-accelerate.amazonaws.com/${username}/.*${
          extension || ""
        }\?.*Content-Type=${
          contentType ? contentType.replace("/", "%2F") : "image%2F"
        }.*`
      );
      expect(signedUrl).toMatch(regex);
    }
  );
});
