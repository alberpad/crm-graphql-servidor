import { importSchema } from "graphql-import";
// import { gql } from "apollo-server-express";
import gql from "graphql-tag";

const typeDefs = gql`
  ${importSchema("data/schema.graphql")}
`;

export { typeDefs };
