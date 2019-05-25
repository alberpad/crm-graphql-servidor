// Fuente de la configuración TS Express Nodemon ...
// https://medium.com/create-a-server-with-nodemon-express-typescript/create-a-server-with-nodemon-express-typescript-f7c88fb5ee71

import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./data/schema";
import { resolvers } from "./data/resolvers";
import { RequestCustom, IUsuarioActual } from "./types";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
dotenv.config({ path: "varialbes.env" });

// Crear una instancia de express
const app: express.Application = express();
// Crear una instancia de apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: ExpressContext) => {
    const token = req.headers["authorization"];
    if (token !== "null" && token !== undefined) {
      try {
        const secreto = process.env.SECRETO;
        if (!secreto) throw new Error("No se puede comprobar el Token");
        // Verificar el token del front end (cliente)
        const usuarioActual = await jwt.verify(token, secreto);
        // Como hacer que req.usuarioActual no de error
        // Opción1: Añadir la propiedad en la Interfaz Request en el index.d.ts (en node_modules -> Express.Request)
        // Opción2: añadir la interfaz Express a un archivo de tipos (types.d.ts) e indicar este archivo en el tsconfig en "files".
        // Agregamos el usuario actual al request
        const reqCustom = req as RequestCustom;
        reqCustom.usuarioActual = usuarioActual as IUsuarioActual;
        return {
          usuarioActual
        };
      } catch (error) {
        console.error(error);
      }
    }
  }
});
// Pasar la aplicación de express a apollo server como middleware
server.applyMiddleware({ app });

const PORT: number = Number(process.env.PORT) || 5000;

app.listen(PORT, function() {
  console.log(
    `Servidor ejecutándose en http://localhost:${PORT}${server.graphqlPath}`
  );
});
