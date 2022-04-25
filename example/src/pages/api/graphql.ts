import { ApolloServer, gql } from 'apollo-server-micro'
import { NextApiRequest, NextApiResponse } from 'next';

const users = [
  {
    id: 1,
    name: 'Frank',
    email: 'fcooke@email.com',
    phoneNumber: '843-303-6284',
    age: 42,
    favoriteColor: 'green'
  },
  {
    id: 2,
    name: 'Jen',
    email: 'jcooke@email.com',
    phoneNumber: '843-303-6284',
    age: 37,
    favoriteColor: 'green',
    favoriteMovie: 'Elf'
  },
  {
    id: 3,
    name: 'Dylan',
    email: 'dcooke@email.com',
    age: 1,
    favoriteColor: 'green',
    favoriteMovie: 'Toy Story'
  },
  {
    id: 4,
    name: 'Dublin',
    email: 'dublin@email.com',
    age: 10,
    favoriteColor: 'grey'
  },
  {
    id: 5,
    name: 'Miles',
    email: 'mcooke@email.com',
    age: 8,
    favoriteColor: 'green'
  },
]

const typeDefs = gql`
  type User {
    id: Int!
    name: String!
    email: String!
    phoneNumber: String
    age: Int!
    favoriteColor: String
    favoriteMovie: String
  }
  
  type Query {
    users: [User!]!
    user(id: Int!): User
  }
`

const resolvers = {
  Query: {
    users: () => users,
    user: (_: any, { id }: any) => users.find((user) => user.id === id),
  },
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
