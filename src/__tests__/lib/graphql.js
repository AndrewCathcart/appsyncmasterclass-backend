import http from "axios";
import _ from "lodash";

const throwOnErrors = ({ query, variables, errors }) => {
  if (errors) {
    const errMsg = `query: ${query}
        
variables: ${JSON.stringify(variables, null, 2)}

error: ${JSON.stringify(errors, null, 2)}
        `;
    throw new Error(errMsg);
  }
};

export default async (url, query, variables = {}, auth) => {
  const headers = {};
  if (auth) {
    headers.Authorization = auth;
  }

  try {
    const res = await http({
      method: "post",
      url,
      headers,
      data: {
        query,
        variables: JSON.stringify(variables),
      },
    });

    const { data, errors } = res.data;
    throwOnErrors({ query, variables, errors });
    return data;
  } catch (err) {
    const errors = _.get(err, "response.data.errors");
    throwOnErrors({ query, variables, errors });
    throw err;
  }
};
