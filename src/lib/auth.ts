import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user || !user.password) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          sessionVersion: user.sessionVersion,
        } as any;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sessionVersion = (user as any).sessionVersion || 0;
        console.log("JWT callback initialized for user:", token.id, "version:", token.sessionVersion);
      }

      if (token.id) {
        await connectDB();
        const dbUser = await User.findById(token.id).select('sessionVersion');
        if (!dbUser) {
          console.log("JWT check failed: user not found in DB");
          token.error = "InvalidSession";
          return token;
        }
        if ((dbUser.sessionVersion || 0) !== (token.sessionVersion || 0)) {
          console.log("JWT check failed: session version mismatch. DB:", dbUser.sessionVersion, "Token:", token.sessionVersion);
          token.error = "InvalidSession";
          return token;
        }
      } else if (token.error) {
         console.log("JWT has existing error:", token.error);
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.error === "InvalidSession") {
        session.error = token.error;
      } else if (token && session.user && token.id) {
        session.user.id = token.id as string;
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
