import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and member profile transactionally
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    image: null,
                    password: hashedPassword,
                    role: 'USER',
                },
            });

            // Simple way to store password since we are using Custom Credentials Provider
            // In a real app with NextAuth + Prisma Adapter, you might store it in an Account or separate table
            // BUT, since we defined 'User' without a password field in standard NextAuth schema, 
            // we need to add a password field to User model OR handle it differently.
            // For this MVP, let's assume we need to update schema to store password for Credentials provider.

            // WAIT: The schema needs a password field for Credential login if we aren't using an external provider.
            // I will update the schema in the next step. For now, let's pretend it exists or add it.

            await tx.memberProfile.create({
                data: {
                    userId: newUser.id,
                    phone: phone || null,
                    currentTier: 'BRONZE',
                    pointsBalance: 0,
                },
            });

            return newUser;
        });

        return NextResponse.json(
            { message: 'User created successfully', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
