const SYMBOL_CLASS_PROVIDER_TYPE = Symbol("SYMBOL_CLASS_PROVIDER_TYPE");
const SYMBOL_CLASS_PROVIDER_KEYS = Symbol("SYMBOL_CLASS_PROVIDER_KEYS");
const SYMBOL_CLASS_IDENTIFIER_REF = Symbol("SYMBOL_CLASS_IDENTIFIER_REF");
const SYMBOL_CLASS_IDENTIFIER_SCHEMA = Symbol("SYMBOL_CLASS_IDENTIFIER_SCHEMA");
const SYMBOL_CLASS_IDENTIFIER_MAP = Symbol("SYMBOL_CLASS_IDENTIFIER_MAP");

class SchemaRef<SchemaName> {
  public readonly [SYMBOL_CLASS_IDENTIFIER_REF] = "ref";
  constructor(public readonly ref: SchemaName) {}
}

class SchemaList<Schema> {
  public readonly [SYMBOL_CLASS_IDENTIFIER_SCHEMA] = "list";
  constructor(public readonly schema: Schema) {}
}

class SchemaOptional<Schema> {
  public readonly [SYMBOL_CLASS_IDENTIFIER_SCHEMA] = "optional";
  constructor(public readonly schema: Schema) {}
}

class SchemaMap<Key, Schema> {
  public readonly [SYMBOL_CLASS_IDENTIFIER_MAP] = "map";
  constructor(public readonly key: Key, public readonly schema: Schema) {}
}

class Schema<T extends Record<string, any>, K extends keyof any = string> {
  public readonly [SYMBOL_CLASS_PROVIDER_TYPE] = null as any as T;
  public readonly [SYMBOL_CLASS_PROVIDER_KEYS] = null as any as K;
  constructor(protected readonly schemas: TypesSchemas<K>) {}

  getSchemas<
    With extends "any" | "keys" | "types" = "keys"
  >(): With extends "keys"
    ? { schemas: TypesSchemas<K> }
    : With extends "types"
    ? { schemas: TypesSchemasInferSchemasJsonByDefined<T, false> }
    : { schemas: TypesSchemas<string> } {
    return this.schemas as any;
  }
}

type TypesStrings = "utf8";
type TypesNumbers = "i8" | "u8" | "i16" | "u16" | "i32" | "u32" | "f32" | "f64";
type TypesBools = "bool";
type TypesBinary = "buf4gb";
type TypesAliases = "string" | "integer" | "float" | "buffer";
type TypesSimple = TypesStrings | TypesNumbers | TypesBools | TypesBinary;
type TypesSimpleWithAliases = TypesSimple | TypesAliases;

type TypesList<T> = SchemaList<
  T | TypesList<T> | TypesObject<T> | TypesOptional<T> | TypesMap<T>
>;
type TypesObject<T> = {
  [K: string]:
    | T
    | TypesList<T>
    | TypesObject<T>
    | TypesOptional<T>
    | TypesMap<T>;
};
type TypesOptional<T> = SchemaOptional<
  T | TypesList<T> | TypesObject<T> | TypesOptional<T> | TypesMap<T>
>;
type TypesMapKeys = "i8" | "u8" | "i16" | "u16" | "i32" | "u32" | "utf8";
type TypesMapKeysWithAliases = TypesMapKeys | "string" | "integer";
type TypesMap<T> = SchemaMap<
  TypesMapKeysWithAliases,
  T | TypesList<T> | TypesObject<T> | TypesOptional<T> | TypesMap<T>
>;
type TypesComplex<Based> =
  | Based
  | TypesList<Based>
  | TypesObject<Based>
  | TypesOptional<Based>
  | TypesMap<Based>;

type TypesSchema = {
  kind: "schema";
  name: string;
  fields: {
    [k: string]:
      | {
          kind: "simple";
          type: TypesSimple;
        }
      | {
          kind: "schema";
          ref: string;
          $type?: TypesSchema;
        }
      | {
          kind: "optional";
          value: TypesSchema["fields"][string];
        }
      | {
          kind: "list";
          value: TypesSchema["fields"][string];
        }
      | {
          kind: "map";
          key: TypesMapKeys;
          value: TypesSchema["fields"][string];
        }
      | {
          kind: "object";
          fields: {
            [k: string]: TypesSchema["fields"][string];
          };
        };
  };
};

type TypesSchemas<Keys extends keyof any = string> = {
  [k in Keys]: TypesSchema;
};

//

type TypesResolvingAliases<A> = A extends "string"
  ? "utf8"
  : A extends "integer"
  ? "i32"
  : A extends "float"
  ? "f64"
  : A extends "buffer"
  ? "buf4gb"
  : A;

//#region TypesSchemasInferSchemasJsonByDefined

type __TypesSchemasInferSchemasJsonByDefined_Ref<
  Schemas extends Record<string, Record<string, any>>,
  Schema
> = Schema extends keyof Schemas
  ? __TypesSchemasInferSchemasJsonByDefined<Schemas>[Schema]
  : never;

type __TypesSchemasInferSchemasJsonByDefined_Type<
  Schemas extends Record<string, Record<string, any>>,
  Type
> = __TypesSchemasInferSchemasJsonByDefined<
  Schemas & {
    [SYMBOL_CLASS_IDENTIFIER_REF]: { [SYMBOL_CLASS_IDENTIFIER_REF]: Type };
  }
>[typeof SYMBOL_CLASS_IDENTIFIER_REF]["fields"][typeof SYMBOL_CLASS_IDENTIFIER_REF];

type __TypesSchemasInferSchemasJsonByDefined_FilterRefTypes<T> =
  T extends Record<string | symbol, any>
    ? {
        [K in keyof Omit<
          T,
          "$type"
        >]: __TypesSchemasInferSchemasJsonByDefined_FilterRefTypes<T[K]>;
      }
    : T;

type __TypesSchemasInferSchemasJsonByDefined<
  Schemas extends Record<string | symbol, Record<string, any>>
> = {
  [KS in keyof Schemas]: {
    kind: "schema";
    name: KS;
    fields: {
      [KF in keyof Schemas[KS]]: Schemas[KS][KF] extends infer Value
        ? {
            infering: Value extends TypesAliases
              ? {
                  kind: "simple";
                  type: TypesResolvingAliases<Value>;
                }
              : Value extends TypesSimple
              ? {
                  kind: "simple";
                  type: Value;
                }
              : Value extends SchemaRef<infer K>
              ? {
                  kind: "schema";
                  ref: K;
                  $type: __TypesSchemasInferSchemasJsonByDefined_Ref<
                    Schemas,
                    K
                  >;
                }
              : Value extends SchemaOptional<infer T>
              ? {
                  kind: "optional";
                  value: __TypesSchemasInferSchemasJsonByDefined_Type<
                    Schemas,
                    T
                  >;
                }
              : Value extends SchemaList<infer T>
              ? {
                  kind: "list";
                  value: __TypesSchemasInferSchemasJsonByDefined_Type<
                    Schemas,
                    T
                  >;
                }
              : Value extends SchemaMap<infer K, infer T>
              ? {
                  kind: "map";
                  key: TypesResolvingAliases<K>;
                  value: __TypesSchemasInferSchemasJsonByDefined_Type<
                    Schemas,
                    T
                  >;
                }
              : Value extends Record<string, any>
              ? {
                  kind: "object";
                  fields: {
                    [K in keyof Value]: __TypesSchemasInferSchemasJsonByDefined_Type<
                      Schemas,
                      Value[K]
                    >;
                  };
                }
              : never;
          }["infering"]
        : never;
    };
  };
};

type TypesSchemasInferSchemasJsonByDefined<
  Schemas extends Record<string, Record<string, any>>,
  WithRefTypes extends boolean = true
> = WithRefTypes extends true
  ? __TypesSchemasInferSchemasJsonByDefined<Schemas>
  : __TypesSchemasInferSchemasJsonByDefined_FilterRefTypes<
      __TypesSchemasInferSchemasJsonByDefined<Schemas>
    >;

//#endregion

//#region TypesSchemasInferItemJson

type __TypesSchemasInferItemJsonBySchemaJson_Type<
  T extends TypesSchema["fields"][string]
> = TypesSchemasInferItemJsonBySchemaJson<{
  name: "infering";
  kind: "schema";
  fields: {
    type: T;
  };
}>["type"];

type __TypesSchemasInferItemJsonBySchemaJson_MapKeyToType<K> = K extends "utf8"
  ? string
  : number;

type __TypesSchemasInferItemJsonBySchemaJson<T extends TypesSchema> = {
  [K in keyof T["fields"]]: T["fields"][K] extends infer Value
    ? {
        infering: Value extends {
          kind: "simple";
          type: TypesSimple;
        }
          ? Value["type"] extends TypesStrings
            ? string
            : Value["type"] extends TypesBools
            ? boolean
            : Value["type"] extends TypesNumbers
            ? number
            : Value["type"] extends TypesBinary
            ? Uint8Array
            : never
          : Value extends {
              kind: "schema";
              ref: string;
              $type?: TypesSchema;
            }
          ? Value["$type"] extends TypesSchema
            ? TypesSchemasInferItemJsonBySchemaJson<Value["$type"]>
            : Record<string, any>
          : Value extends {
              kind: "optional";
              value: TypesSchema["fields"][string];
            }
          ?
              | __TypesSchemasInferItemJsonBySchemaJson_Type<Value["value"]>
              | undefined
          : Value extends {
              kind: "list";
              value: TypesSchema["fields"][string];
            }
          ? __TypesSchemasInferItemJsonBySchemaJson_Type<Value["value"]>[]
          : Value extends {
              kind: "map";
              key: TypesMapKeys;
              value: TypesSchema["fields"][string];
            }
          ? {
              infering: __TypesSchemasInferItemJsonBySchemaJson_MapKeyToType<
                Value["key"]
              > extends infer Key
                ? Key extends string | number
                  ? {
                      [key in Key]: __TypesSchemasInferItemJsonBySchemaJson_Type<
                        Value["value"]
                      >;
                    }
                  : never
                : never;
            }["infering"]
          : Value extends {
              kind: "object";
              fields: Record<string, TypesSchema["fields"][string]>;
            }
          ? {
              [key in keyof Value["fields"]]: __TypesSchemasInferItemJsonBySchemaJson_Type<
                Value["fields"][key]
              >;
            }
          : never;
      }["infering"]
    : never;
};

type TypesSchemasInferItemJsonBySchemaJson<T> = T extends TypesSchema
  ? __TypesSchemasInferItemJsonBySchemaJson<T>
  : never;

//#endregion

function define<
  Schemas extends {
    [K in keyof Schemas]: {
      [K: string]: TypesComplex<
        TypesSimpleWithAliases | SchemaRef<keyof Schemas>
      >;
    };
  }
>(props: { schemas: Schemas }) {
  const inputSchemas = props.schemas as Record<
    string,
    Record<
      string,
      TypesComplex<TypesSimpleWithAliases | SchemaRef<keyof Schemas>>
    >
  >;
  const buildedSchemas: TypesSchemas<any> = {};

  const buildSchemaField = (
    field: TypesComplex<TypesSimpleWithAliases | SchemaRef<keyof Schemas>>
  ): TypesSchema["fields"][string] => {
    if (typeof field === "string") {
      if (field === "string") {
        return {
          kind: "simple",
          type: "utf8",
        };
      } else if (field === "integer") {
        return {
          kind: "simple",
          type: "i32",
        };
      } else if (field === "float") {
        return {
          kind: "simple",
          type: "f64",
        };
      } else if (field === "buffer") {
        return {
          kind: "simple",
          type: "buf4gb",
        };
      } else {
        return {
          kind: "simple",
          type: field,
        };
      }
    }
    if (field instanceof SchemaRef) {
      return {
        kind: "schema",
        ref: field.ref as string,
      };
    }
    if (field instanceof SchemaOptional) {
      return {
        kind: "optional",
        value: buildSchemaField(field.schema),
      };
    }
    if (field instanceof SchemaList) {
      return {
        kind: "list",
        value: buildSchemaField(field.schema),
      };
    }
    if (field instanceof SchemaMap) {
      return {
        kind: "map",
        key: field.key as any,
        value: buildSchemaField(field.schema),
      };
    }

    const fields = {} as Record<string, any>;
    for (const [key, value] of Object.entries(field)) {
      fields[key] = buildSchemaField(value);
    }

    return {
      kind: "object",
      fields,
    };
  };

  for (const [schemaName, schema] of Object.entries(inputSchemas)) {
    buildedSchemas[schemaName] = {
      name: schemaName,
      kind: "schema",
      fields: (
        buildSchemaField(schema) as {
          kind: "object";
          fields: Record<string, any>;
        }
      )["fields"],
    };
  }

  return new Schema<Schemas, keyof Schemas>(buildedSchemas);
}

define.schema = <T>(ref: T) => {
  return new SchemaRef(ref);
};

define.array = <T>(schema: T) => {
  return new SchemaList(schema);
};

define.optional = <T>(schema: T) => {
  return new SchemaOptional(schema);
};

define.map = <Key, T>(key: Key, schema: T) => {
  return new SchemaMap(key, schema);
};

///

type InferTypeSchema<
  T extends Schema<any, any>,
  K extends T[typeof SYMBOL_CLASS_PROVIDER_KEYS],
  Recursive extends boolean = false
> = TypesSchemasInferSchemasJsonByDefined<
  T[typeof SYMBOL_CLASS_PROVIDER_TYPE],
  Recursive
>[K];

type InferTypeItem<
  T extends Schema<any, any>,
  K extends T[typeof SYMBOL_CLASS_PROVIDER_KEYS],
  Recursive extends boolean = true
> = TypesSchemasInferItemJsonBySchemaJson<InferTypeSchema<T, K, Recursive>>;

///

export { TypesSimple, TypesAliases, TypesResolvingAliases };
export { TypesSchema, TypesSchemas };
export { InferTypeSchema, InferTypeItem };

export { define };
