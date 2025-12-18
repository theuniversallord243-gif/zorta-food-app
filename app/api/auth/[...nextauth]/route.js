import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import fs from 'fs';
import path from 'path';
import { verifyPassword } from '@/lib/crypto';

const dataFilePath = path.join(process.cwd(), 'data', 'users.json');

function getUsers() {
    try {
        const fileData = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
}

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const users = getUsers();
                const user = users.find(u => u.email === credentials.email.toLowerCase());

                if (!user) {
                    throw new Error('User not found');
                }

                const isPasswordValid = await verifyPassword(credentials.password, user.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image || null
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                const users = getUsers();
                const existingUser = users.find(u => u.email === user.email);

                if (!existingUser) {
                    const newUser = {
                        id: 'user_' + Date.now(),
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        authProvider: 'google',
                        password: null,
                        createdAt: new Date().toISOString()
                    };
                    users.push(newUser);
                    saveUsers(users);
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                const users = getUsers();
                const dbUser = users.find(u => u.email === session.user.email);
                if (dbUser) {
                    session.user.id = dbUser.id;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/user/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
