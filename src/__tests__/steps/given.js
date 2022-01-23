import { create as createVelocityUtils } from "amplify-appsync-simulator/lib/velocity/util";
import Chance from "chance";

const chance = new Chance();

const a_random_user = () => {
  const firstName = chance.first({ nationality: "en" });
  const lastName = chance.last({ nationality: "en" });
  const suffix = chance.string({
    length: 4,
    pool: "abcdefjhijklmnopqrstuvwxyz",
  });

  const name = `${firstName} ${lastName}${suffix}`;
  const password = chance.string({ length: 8 });
  const email = `${firstName}-${lastName}-${suffix}@appsyncmasterclass.com`;

  return {
    name,
    password,
    email,
  };
};

const an_appsync_context = (identity, args) => {
  const util = createVelocityUtils([], new Date(), Object());
  const context = {
    identity,
    args,
    arguments: args,
  };

  return {
    context,
    ctx: context,
    util,
    utils: util,
  };
};

export default {
  a_random_user,
  an_appsync_context,
};
