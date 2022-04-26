import { ApolloServer, gql } from 'apollo-server-micro'
import { NextApiRequest, NextApiResponse } from 'next';
import { randAvatar } from '@ngneat/falso';
import { users } from '../../mocks';
import { randomUUID } from 'crypto';

const typeDefs = gql`
  type Address {
    street: String!
    city: String!
    zipCode: String!
  }
  
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    username: String!
    phone: String
    img: String!
    address: Address
  }
  
  input AddressInput {
    street: String!
    city: String!
    zipCode: String!
  }
  
  input CreateUserInput {
    firstName: String!
    lastName: String!
    username: String!
    email: String!
    phone: String
    address: AddressInput
  }
  
  type Query {
    users: [User!]!
    user(id: Int!): User
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User!
  }
`

const resolvers = {
  Query: {
    users: () => users,
    user: (_: any, { id }: any) => users.find((user) => user.id === id),
  },
  Mutation: {
    createUser: (_: any, { input }: any) => {
      const newUser = { ...input, id: randomUUID(), img: randAvatar() };
      users.push(newUser);
      return newUser;
    }
  }
}

const apolloServer = new ApolloServer({ typeDefs, resolvers })

const startServer = apolloServer.start()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  if (req.method === 'OPTIONS') {
    res.end()
    return false
  }

  await startServer
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res)
}

export const config = {
  api: {
    bodyParser: false,
  },
}
