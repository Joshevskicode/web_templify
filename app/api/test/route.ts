// app/api/test/route.ts

import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    // Await the connection to ensure it's established
    const client = await clientPromise;

    // Return a success message if the connection is successful
    return NextResponse.json({ message: "Successfully connected to MongoDB!" });
  } catch (e: any) {
    // Log and return the error message
    console.error('MongoDB connection error:', e.message);
    return NextResponse.json(
      { error: "Error connecting to MongoDB", details: e.message },
      { status: 500 }
    );
  }
}
