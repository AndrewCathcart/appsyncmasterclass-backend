import Chance from "chance";
import path from "path";
import given from "../../steps/given";
import when from "../../steps/when";

const chance = new Chance();
describe("Mutation.editMyProfile.request template", () => {
  it("should use 'newProfile' fields in expression values", () => {
    const username = chance.guid();
    const templatePath = path.resolve(
      __dirname,
      "../../../../mapping-templates/Mutation.editMyProfile.request.vtl"
    );
    const newProfile = {
      name: "Andy",
      imageUrl: null,
      backgroundImageUrl: null,
      bio: "bio test",
      location: null,
      website: null,
      birthdate: null,
    };
    const context = given.an_appsync_context({ username }, { newProfile });

    const res = when.we_invoke_an_appsync_template(templatePath, context);

    expect(res).toEqual({
      version: "2018-05-29",
      operation: "UpdateItem",
      key: {
        id: {
          S: username,
        },
      },
      update: {
        expression:
          "set #name = :name, imageUrl = :imageUrl, backgroundImageUrl = :backgroundImageUrl, bio = :bio, #location = :location, website = :website, birthdate = :birthdate",
        expressionNames: {
          "#name": "name",
          "#location": "location",
        },
        expressionValues: {
          ":name": {
            S: "Andy",
          },
          ":imageUrl": {
            NULL: true,
          },
          ":backgroundImageUrl": {
            NULL: true,
          },
          ":bio": {
            S: "bio test",
          },
          ":location": {
            NULL: true,
          },
          ":website": {
            NULL: true,
          },
          ":birthdate": {
            NULL: true,
          },
        },
      },
      condition: {
        expression: "attribute_exists(id)",
      },
    });
  });
});
