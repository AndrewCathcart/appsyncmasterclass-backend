import Chance from "chance";
import path from "path";
import given from "../../steps/given";
import when from "../../steps/when";

const chance = new Chance();
describe("Query.getMyProfile.request template", () => {
  it("should use the username as the id", () => {
    const username = chance.guid();
    const templatePath = path.resolve(
      __dirname,
      "../../../../mapping-templates/Query.getMyProfile.request.vtl"
    );
    const context = given.an_appsync_context({ username }, {});

    const res = when.we_invoke_an_appsync_template(templatePath, context);

    expect(res).toEqual({
      version: "2018-05-29",
      operation: "GetItem",
      key: {
        id: {
          S: username,
        },
      },
    });
  });
});
