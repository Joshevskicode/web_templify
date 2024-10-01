import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Assume authOptions are in a separate file

// Export the NextAuth handler for both GET and POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
