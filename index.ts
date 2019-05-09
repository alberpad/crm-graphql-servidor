// Fuente de la configuración TS Express Nodemon ...
// https://medium.com/create-a-server-with-nodemon-express-typescript/create-a-server-with-nodemon-express-typescript-f7c88fb5ee71

import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./data/schema";
import { resolvers } from "./data/resolvers";

// Crear una instancia de express
const app: express.Application = express();
// Crear una instancia de apollo server
const server = new ApolloServer({ typeDefs, resolvers });
// Pasar la aplicación de express a apollo server como middleware
server.applyMiddleware({ app });

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, function() {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}${server.graphqlPath}`
  );
});
