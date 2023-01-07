import middyValidator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

export default function validator(schema: object) {
  return middyValidator({
    eventSchema: transpileSchema(schema, {
      useDefaults: true,
      strict: false,
    }),
  });
}
