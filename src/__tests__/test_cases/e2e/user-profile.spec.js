import Chance from "chance";
import given from "../../steps/given";
import when from "../../steps/when";

const chance = new Chance();

describe("given an authenticated user", () => {
  let user, profile;

  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });

  it("the user can fetch their profile with getMyProfile", async () => {
    profile = await when.a_user_calls_getMyProfile(user);
    expect(profile).toMatchObject({
      id: user.username,
      name: user.name,
      imageUrl: null,
      backgroundImageUrl: null,
      bio: null,
      location: null,
      website: null,
      birthdate: null,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCount: 0,
    });

    const [firstName, lastName] = profile.name.split(" ");
    expect(profile.screenName).toContain(firstName);
    expect(profile.screenName).toContain(lastName);
  });

  it("the user can edit their profile with editMyProfile", async () => {
    const newName = chance.first();
    const input = {
      name: newName,
    };

    const newProfile = await when.a_user_calls_editMyProfile(user, input);
    expect(newProfile).toMatchObject({
      ...profile,
      name: newProfile.name,
    });
  });
});
