import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

// Define the user object type expected by NextAuth
interface User {
  id: string;  // id as a string
  name: string;
  email?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const user: User = { id: "1", name: credentials.username };  // Example static user
        if (user) {
          return user;  // Successful authentication
        }
        return null;  // Authentication failed
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",  // Custom sign-in page
  },
  session: {
    strategy: "jwt",  // Use JWT for session handling
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;  // Add user id to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.id = token.id as string;  // Add user id to session
      }
      return session;
    },
  },
};
