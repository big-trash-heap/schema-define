import { InferTypeItem, InferTypeSchema, define } from "./define";

const Schemas = define({
  schemas: {
    User: {
      name: "string",
      age: "f64",
      user: define.optional(define.schema("User")),
      array: define.array("integer"),
      map: define.map("u16", "integer"),
      record: {
        name: "string",
        age: "integer",
      },
    },
  },
});

type sdfsdf = InferTypeSchema<typeof Schemas, "User", true>;
type sd = InferTypeItem<typeof Schemas, "User">;
const sd: sd = {} as any;

const schemas = Schemas.getSchemas<"types">();

const type: typeof schemas = {
  schemas: {
    User: {
      name: "User",
      kind: "schema",
      fields: {
        name: {
          kind: "simple",
          type: "utf8",
        },
        age: {
          kind: "simple",
          type: "f64",
        },
        user: {
          kind: "optional",
          value: {
            kind: "schema",
            ref: "User",
          },
        },
        array: {
          kind: "list",
          value: {
            kind: "simple",
            type: "i32",
          },
        },
        map: {
          kind: "map",
          key: "u16",
          value: {
            kind: "simple",
            type: "i32",
          },
        },
        record: {
          kind: "object",
          fields: {
            name: {
              kind: "simple",
              type: "utf8",
            },
            age: {
              kind: "simple",
              type: "i32",
            },
          },
        },
      },
    },
  },
};

console.log(JSON.stringify(Schemas, null, 2));
