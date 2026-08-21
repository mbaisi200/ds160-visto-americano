import { NextRequest, NextResponse } from "next/server";

// Admin master key for API access (set in .env)
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'ihs-vistos-admin-2024';

// Simple auth check
function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  return apiKey === ADMIN_API_KEY;
}

// GET - Check API status and list users
export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Dynamic import to avoid build errors
    const { adminAuth } = await import('@/lib/firebase-admin');

    // List up to 1000 users
    const listUsersResult = await adminAuth.listUsers(1000);
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
    }));

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: unknown) {
    console.error('Error listing users:', error);

    // Check if it's a Firebase Admin initialization error
    if (error instanceof Error && error.message.includes('Credential')) {
      return NextResponse.json({
        error: 'Firebase Admin não configurado. Configure FIREBASE_SERVICE_ACCOUNT no .env',
        instructions: 'Veja /api/admin/setup para instruções.',
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Erro ao listar usuários',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST - Reset password or create admin
export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, email, password, newPassword } = body;

    // Dynamic import to avoid build errors
    const { adminAuth } = await import('@/lib/firebase-admin');

    switch (action) {
      case 'reset-password': {
        // Reset password for a user by email
        if (!email || !newPassword) {
          return NextResponse.json({
            error: 'Email e newPassword são obrigatórios',
          }, { status: 400 });
        }

        const user = await adminAuth.getUserByEmail(email);
        await adminAuth.updateUser(user.uid, {
          password: newPassword,
        });

        return NextResponse.json({
          success: true,
          message: `Senha atualizada para ${email}`,
          newPassword,
        });
      }

      case 'create-admin': {
        // Create or update admin user
        const adminEmail = 'admin@vistoamericano.com';
        const adminPassword = password || '123456';

        try {
          // Check if admin exists
          const existingAdmin = await adminAuth.getUserByEmail(adminEmail);
          // Update password
          await adminAuth.updateUser(existingAdmin.uid, {
            password: adminPassword,
          });
          return NextResponse.json({
            success: true,
            message: 'Admin atualizado com sucesso',
            email: adminEmail,
            password: adminPassword,
          });
        } catch {
          // Admin doesn't exist, create new
          const newAdmin = await adminAuth.createUser({
            email: adminEmail,
            password: adminPassword,
            emailVerified: true,
          });
          return NextResponse.json({
            success: true,
            message: 'Admin criado com sucesso',
            email: adminEmail,
            password: adminPassword,
            uid: newAdmin.uid,
          });
        }
      }

      case 'delete-user': {
        // Delete a user by email
        if (!email) {
          return NextResponse.json({
            error: 'Email é obrigatório',
          }, { status: 400 });
        }

        const user = await adminAuth.getUserByEmail(email);
        await adminAuth.deleteUser(user.uid);

        return NextResponse.json({
          success: true,
          message: `Usuário ${email} deletado`,
        });
      }

      default:
        return NextResponse.json({
          error: 'Ação inválida. Use: reset-password, create-admin, delete-user',
        }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Error in admin action:', error);

    // Check if it's a Firebase Admin initialization error
    if (error instanceof Error && error.message.includes('Credential')) {
      return NextResponse.json({
        error: 'Firebase Admin não configurado. Configure FIREBASE_SERVICE_ACCOUNT no .env',
        instructions: 'Veja /api/admin/setup para instruções.',
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Erro ao executar ação',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
