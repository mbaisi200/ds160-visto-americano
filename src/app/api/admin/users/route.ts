import { NextRequest, NextResponse } from "next/server";

// Internal admin API - uses Firebase Admin SDK
// This is called from the admin panel UI

// GET - Check Firebase Admin status and list users
export async function GET(request: NextRequest) {
  try {
    // Dynamic import to avoid build errors
    const { adminAuth } = await import('@/lib/firebase-admin');

    // Try to list users - this will fail if Firebase Admin is not configured
    const listUsersResult = await adminAuth.listUsers(1000);
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
    }));

    // Check if admin exists
    const adminEmail = 'admin@vistoamericano.com';
    const adminUser = users.find(u => u.email === adminEmail);

    return NextResponse.json({
      success: true,
      adminConfigured: true,
      adminExists: !!adminUser,
      adminEmail,
      count: users.length,
      users,
    });
  } catch (error: unknown) {
    console.error('Error in admin users API:', error);

    // Check if it's a Firebase Admin initialization error
    if (error instanceof Error && (error.message.includes('Credential') || error.message.includes('SA_KEY'))) {
      return NextResponse.json({
        success: false,
        adminConfigured: false,
        error: 'Firebase Admin não configurado',
        instructions: 'Configure FIREBASE_SERVICE_ACCOUNT no .env para gerenciar senhas',
        setupUrl: '/api/admin/setup',
      }, { status: 200 }); // Return 200 so UI can show instructions
    }

    return NextResponse.json({
      success: false,
      error: 'Erro ao acessar Firebase Admin',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST - Admin actions (reset password, create admin, etc)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    // Dynamic import
    const { adminAuth } = await import('@/lib/firebase-admin');

    switch (action) {
      case 'create-or-reset-admin': {
        // Create or reset admin user password
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
            action: 'updated',
            message: 'Senha do admin atualizada com sucesso',
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
            action: 'created',
            message: 'Admin criado com sucesso',
            email: adminEmail,
            password: adminPassword,
            uid: newAdmin.uid,
          });
        }
      }

      case 'reset-user-password': {
        // Reset password for a specific user
        if (!email) {
          return NextResponse.json({
            success: false,
            error: 'Email é obrigatório',
          }, { status: 400 });
        }

        const newPassword = password || '123456';

        try {
          const user = await adminAuth.getUserByEmail(email);
          await adminAuth.updateUser(user.uid, {
            password: newPassword,
          });
          return NextResponse.json({
            success: true,
            message: `Senha atualizada para ${email}`,
            email,
            password: newPassword,
          });
        } catch {
          return NextResponse.json({
            success: false,
            error: `Usuário ${email} não encontrado`,
          }, { status: 404 });
        }
      }

      case 'delete-user': {
        if (!email) {
          return NextResponse.json({
            success: false,
            error: 'Email é obrigatório',
          }, { status: 400 });
        }

        try {
          const user = await adminAuth.getUserByEmail(email);
          await adminAuth.deleteUser(user.uid);
          return NextResponse.json({
            success: true,
            message: `Usuário ${email} deletado`,
          });
        } catch {
          return NextResponse.json({
            success: false,
            error: `Usuário ${email} não encontrado`,
          }, { status: 404 });
        }
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação inválida',
        }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Error in admin action:', error);

    if (error instanceof Error && (error.message.includes('Credential') || error.message.includes('SA_KEY'))) {
      return NextResponse.json({
        success: false,
        adminConfigured: false,
        error: 'Firebase Admin não configurado',
        instructions: 'Configure FIREBASE_SERVICE_ACCOUNT no .env',
      }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      error: 'Erro ao executar ação',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
