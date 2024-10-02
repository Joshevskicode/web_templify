// lib/mongodb.ts

import { MongoClient } from 'mongodb';

const uri: string = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

console.log('MongoDB URI:', uri);  // Add this line to log the URI for debugging

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
