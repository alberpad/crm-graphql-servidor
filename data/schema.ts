import { importSchema } from "graphql-import";
import { gql } from "apollo-server-express";

const typeDefs = gql`
  ${importSchema("data/schema.graphql")}
`;

export { typeDefs };
