export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryUserArgs = {
  id: Scalars['Int'];
};

export type User = {
  __typename?: 'User';
  age: Scalars['Int'];
  email: Scalars['String'];
  favoriteColor?: Maybe<Scalars['String']>;
  favoriteMovie?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
  phoneNumber?: Maybe<Scalars['String']>;
};

export type UserFragment = { __typename?: 'User', id: number, name: string, email: string, phoneNumber?: string | null, age: number, favoriteColor?: string | null, favoriteMovie?: string | null };

export type UserQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: number, name: string, email: string, phoneNumber?: string | null, age: number, favoriteColor?: string | null, favoriteMovie?: string | null } | null };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: number, name: string, email: string, phoneNumber?: string | null, age: number, favoriteColor?: string | null, favoriteMovie?: string | null }> };
