import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Comment: a.customType({
    content: a.string().required(),
    username: a.string().required(),
    dp: a.string().required(),
    dn: a.string().required(),
  }),
  Argument: a.customType({
    content: a.string().required(),
    self: a.boolean().required(),
    dp: a.string(),
    dn: a.string(),
    links: a.string().array(),
  }),
  Video: a
    .model({
      partitionKey: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      sortKey: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      type: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      comment: a
        .ref("Comment")
        .array()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      debate: a
        .ref("Argument")
        .array()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.owner(),
        ]),
      category: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.owner(),
        ]),
      description: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.owner(),
        ]),
      url: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.owner(),
        ]),
      thumbnail: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.owner(),
        ]),
      dp: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.owner(),
        ]),
      dn: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.owner(),
        ]),
      username: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.owner(),
        ]),
    })
    .identifier(["partitionKey", "sortKey"])
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
