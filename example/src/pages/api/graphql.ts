import { ApolloServer, gql } from 'apollo-server-micro'
import { NextApiRequest, NextApiResponse } from 'next';
import { randAvatar } from '@ngneat/falso';
import { randomUUID } from 'crypto';
import { BookFragment, UserFragment } from '../../types/generated';

const userList: UserFragment[] = [
  {
    id: 'b32fdc53-7ea3-49d9-824d-21aa0fd1b2cb',
    firstName: 'Dan',
    lastName: 'Abramov',
    username: 'dabramov',
    phone: '8438675309',
    email: 'dabramov@email.com',
    img: randAvatar(),
  },
  {
    id: 'b32fdc53-7ea3-49d9-824d-21aa0fd1b2fg',
    firstName: 'TJ',
    lastName: 'Holowaychuk',
    username: 'tj',
    phone: '8438675308',
    email: 'tholowaychuk@email.com',
    img: randAvatar(),
  },
  {
    id: 'b32fdc53-7ea3-49d9-824d-21aa0fd1b2de',
    firstName: 'Kent',
    lastName: 'C Dodds',
    username: 'kd',
    phone: '8438675307',
    email: 'kentcdodds@email.com',
    img: randAvatar(),
  },
  {
    id: 'b32fdc53-7ea3-49d9-824d-21aa0fd1b2ab',
    firstName: 'Guillermo',
    lastName: 'Rauch',
    username: 'rauch',
    phone: '8438675305',
    email: 'grauch@email.com',
    img: randAvatar(),
  }
];

const bookList = [
  {
    id: 'b32fdc53-7ea3-49d9-824d-21aa0fd1b2ab',
    title: 'Clean Code',
    author: 'Robert C Martin',
  },
  {
    id: 'b32fdc53-7ea3-49d9-824d-21aa0fd1b2ac',
    title: 'The Mythical Man-month',
    author: 'Frederick Brooks',
  },
  {
    id: 'b32fdc53-7ea3-49d9-824d-21aa0fd1b2ad',
    title: 'Refactoring: Improving the Design of Existing Code',
    author: 'Martin Fowler',
  },
  {
    id: 'b32fdc53-7ea3-49d9-824d-21aa0fd1b2ae',
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    author: 'Andrew Hunt and David Thomas',
  },
]

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
  }
  
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
    user(id: ID!): User
    books: [Book!]!
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User!
  }
`

const resolvers = {
  Query: {
    users: (_: any, __: any, { users }: Context) => users,
    user: (_: any, { id }: any, { users }: Context) => users.find((user) => user.id === id),
    books: (_: any, __: any, { books }: Context) => books,
  },
  Mutation: {
    createUser: (_: any, { input }: any, { users }: Context) => {
      const newUser = { ...input, id: randomUUID(), img: randAvatar() };
      users.push(newUser);
      return newUser;
    }
  }
}

interface Context {
  users: UserFragment[];
  books: BookFragment[];
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { users: userList, books: bookList };
  }
})

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
