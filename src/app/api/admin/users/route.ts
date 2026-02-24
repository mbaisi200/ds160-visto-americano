import { NextRequest, NextResponse } from "next/server";

// GET - Check Firebase Admin status and list users
export async function GET(request: NextRequest) {
  try {
    const { adminAuth, initError } = await import('@/lib/firebase-admin');

    if (initError) {
      return NextResponse.json({
        success: false,
        adminConfigured: false,
        error: 'Erro ao inicializar Firebase Admin',
        details: initError,
      }, { status: 200 });
    }

    if (!adminAuth) {
      return NextResponse.json({
        success: false,
        adminConfigured: false,
        error: 'Firebase Admin não inicializado',
        instructions: 'Verifique o arquivo firebase-key.json',
      }, { status: 200 });
    }

    // List users
    const listUsersResult = await adminAuth.listUsers(1000);
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
    }));

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
    return NextResponse.json({
      success: false,
      error: 'Erro ao acessar Firebase Admin',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST - Admin actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password } = body;
    const { adminAuth, initError } = await import('@/lib/firebase-admin');

    if (initError || !adminAuth) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin não configurado',
        details: initError || 'Auth não inicializado',
      }, { status: 400 });
    }

    switch (action) {
      case 'create-or-reset-admin': {
        const adminEmail = 'admin@vistoamericano.com';
        const adminPassword = password || '123456';

        try {
          const existingAdmin = await adminAuth.getUserByEmail(adminEmail);
          await adminAuth.updateUser(existingAdmin.uid, { password: adminPassword });
          return NextResponse.json({
            success: true,
            action: 'updated',
            message: 'Senha do admin atualizada com sucesso',
            email: adminEmail,
            password: adminPassword,
          });
        } catch {
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
        if (!email) {
          return NextResponse.json({ success: false, error: 'Email é obrigatório' }, { status: 400 });
        }

        const newPassword = password || '123456';

        try {
          const user = await adminAuth.getUserByEmail(email);
          await adminAuth.updateUser(user.uid, { password: newPassword });
          return NextResponse.json({
            success: true,
            message: `Senha atualizada para ${email}`,
            email,
            password: newPassword,
          });
        } catch {
          return NextResponse.json({ success: false, error: `Usuário ${email} não encontrado` }, { status: 404 });
        }
      }

      case 'delete-user': {
        if (!email) {
          return NextResponse.json({ success: false, error: 'Email é obrigatório' }, { status: 400 });
        }

        try {
          const user = await adminAuth.getUserByEmail(email);
          await adminAuth.deleteUser(user.uid);
          return NextResponse.json({ success: true, message: `Usuário ${email} deletado` });
        } catch {
          return NextResponse.json({ success: false, error: `Usuário ${email} não encontrado` }, { status: 404 });
        }
      }

      default:
        return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Error in admin action:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao executar ação',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
