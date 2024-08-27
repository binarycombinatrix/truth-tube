import { type ClientSchema, a, defineData } from "@aws-amplify/backend"

const schema = a.schema({
  Comment: a.customType({
    content: a.string(),
    username: a.string().required(),
    dp: a.string(),
    dn: a.string(),
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
          allow.authenticated().to(["read", "create", "update"]),
          allow.owner(),
        ]),
      sortKey: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create", "update"]),
          allow.owner(),
        ]),
      type: a
        .string()
        .required()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create", "update"]),
          allow.owner(),
        ]),
      comment: a
        .ref("Comment")
        .array()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create", "update"]),
          allow.owner(),
        ]),
      debate: a
        .ref("Argument")
        .array()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      category: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      title: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      description: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      url: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      thumbnail: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      dp: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      dn: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      username: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create"]),
          allow.owner(),
        ]),
      subbedto: a
        .ref("Comment")
        .array()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create", "update"]),
          allow.owner(),
        ]),
      subs: a
        .string()
        .array()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create", "update"]),
          allow.owner(),
        ]),
      likedTo: a
        .string()
        .array()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create", "update"]),
          allow.owner(),
        ]),
      likes: a
        .string()
        .authorization((allow) => [
          allow.publicApiKey().to(["read"]),
          allow.authenticated().to(["read", "create", "update"]),
          allow.owner(),
        ]),
    })
    .identifier(["partitionKey", "sortKey"])
    .authorization((allow) => [
      allow.publicApiKey().to(["read"]),
      // allow.authenticated().to(["read", "update", "create"]),
      allow.owner(),
    ]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
})
