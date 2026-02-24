import { NextRequest, NextResponse } from "next/server";

// GET - Check Firebase Admin status
export async function GET(request: NextRequest) {
  try {
    // Check if key file exists
    const fs = await import('fs');
    const keyExists = fs.existsSync('./firebase-key.json');

    if (!keyExists) {
      return NextResponse.json({
        success: false,
        adminConfigured: false,
        error: 'Arquivo firebase-key.json não encontrado',
        instructions: 'Gere uma chave no Firebase Console e cole o JSON',
        setupUrl: '/api/admin/setup',
      }, { status: 200 });
    }

    // Try to read and validate the key
    const keyContent = fs.readFileSync('./firebase-key.json', 'utf-8');
    const serviceAccount = JSON.parse(keyContent);

    if (!serviceAccount.private_key || !serviceAccount.client_email) {
      return NextResponse.json({
        success: false,
        adminConfigured: false,
        error: 'Arquivo de chave incompleto',
        instructions: 'O arquivo firebase-key.json deve conter private_key e client_email',
      }, { status: 200 });
    }

    // Key file exists but we couldn't initialize Firebase Admin
    return NextResponse.json({
      success: false,
      adminConfigured: false,
      error: 'Erro ao autenticar com Firebase',
      instructions: 'A chave privada pode estar corrompida. Gere uma nova chave no Firebase Console.',
      setupUrl: '/api/admin/setup',
      projectEmail: serviceAccount.client_email,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in admin users API:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar configuração',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST - Admin actions
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Firebase Admin não configurado',
    instructions: 'Configure a chave do Firebase para gerenciar senhas. Acesse /api/admin/setup para instruções.',
  }, { status: 400 });
}
