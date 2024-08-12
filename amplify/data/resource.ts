import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Video: a
    .model({
      partitionKey: a.string().required(),
      sortKey: a.string().required(), ////video title or username   + uuidv1
      type: a.string().required(), ///specify type to avoid confusion
      category: a.string(), /// category which is partition key for video entry
      debate: a.json().array(), ///debate of the video
      description: a.string(), ///channel or video description
      url: a.string(), ///video url
      thumbnail: a.string(), ///video thumbnail
      dp: a.string(), ///user dp can store in both cases,
      comment: a.json().array(), ///only in case of video
      dn: a.string(), //channel name
    })
    .identifier(["partitionKey", "sortKey"])
    .authorization((allow) => [allow.publicApiKey()]),
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

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
