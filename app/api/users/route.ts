// app/api/users/route.ts

import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb"; // MongoDB connection

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const { acc, pass, projectId, url } = await request.json();

    // Validate required fields
    if (!acc || !pass || !projectId || !url) {
      return NextResponse.json(
        { error: "All fields (acc, pass, projectId, url) are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("web_templify"); // Use your database name

    // Insert the new user document with account, password, projectId, and URL
    const result = await db.collection("users").insertOne({
      acc, // The user's account name
      pass, // The user's password
      projectId, // The associated projectId from the deployment
      url, // The deployed URL
      createdAt: new Date(), // Add a timestamp
    });

    // Return success response with the inserted document's ID
    return NextResponse.json({
      message: "User created successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error inserting user into MongoDB:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
