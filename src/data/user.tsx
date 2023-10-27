// export const userData = {
//   description: "Get All Registered User",
//   method: "get",
//   path: "/api/v1/user",
//   usecase: "userGetAll",
//   tag: "user",
//   query: {
//     page: { type: "number", default: 1, description: "Page number for pagination" },
//     size: { type: "number", default: 20, description: "Number of items per page" },
//   },
//   response: {
//     200: {
//       items: {
//         type: "array_of_object",
//         properties: {
//           id: { type: "string", description: "" },
//           name: { type: "string", description: "" },
//           createdDate: { type: "string", description: "" },
//           totalPoints: { type: "string", description: "" },
//           status: { type: "string", description: "" },
//         },
//       },
//       count: { type: "number", default: 0 },
//     },
//   },
// };
