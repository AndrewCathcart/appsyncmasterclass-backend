import Chance from "chance";
import given from "../../steps/given";
import then from "../../steps/then";
import when from "../../steps/when";

const chance = new Chance();

describe("when confirm-user-signup runs", () => {
  it("The user's profile is saved in ddb", async () => {
    const { name, email } = given.a_random_user();
    const username = chance.guid();
    await when.we_invoke_confirmUserSignup(username, name, email);

    const ddbUser = await then.user_exists_in_UsersTable(username);
    expect(ddbUser).toMatchObject({
      id: username,
      name,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCount: 0,
    });

    const [firstName, lastName] = name.split(" ");
    expect(ddbUser.screenName).toContain(firstName);
    expect(ddbUser.screenName).toContain(lastName);
  });
});
