import { NextResponse } from "next/server";

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Configuração Firebase Admin - IHS Vistos</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #3C3B6E 0%, #1a1a3e 50%, #B22234 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { color: #3C3B6E; margin-bottom: 10px; }
    h2 { color: #B22234; margin: 30px 0 15px; font-size: 1.2rem; }
    .step {
      background: #f5f5f5;
      border-left: 4px solid #3C3B6E;
      padding: 15px 20px;
      margin: 15px 0;
      border-radius: 0 8px 8px 0;
    }
    .step-number {
      display: inline-block;
      width: 30px;
      height: 30px;
      background: #B22234;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 30px;
      margin-right: 10px;
      font-weight: bold;
    }
    code {
      background: #1a1a3e;
      color: #ffd700;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    pre {
      background: #1a1a3e;
      color: #fff;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 15px 0;
      font-size: 0.85rem;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .warning strong { color: #856404; }
    .success {
      background: #d4edda;
      border: 1px solid #28a745;
      padding: 15px 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .info-box {
      background: #e7f3ff;
      border: 1px solid #0066cc;
      padding: 15px 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    a { color: #B22234; }
    a:hover { text-decoration: underline; }
    ul { margin: 10px 0 10px 20px; }
    li { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧 Configuração do Firebase Admin SDK</h1>
    <p>Para redefinir senhas pela API, você precisa configurar o Firebase Admin SDK.</p>

    <h2>📋 Passo a Passo</h2>

    <div class="step">
      <span class="step-number">1</span>
      <strong>Acesse o Firebase Console</strong>
      <p style="margin-top: 10px;">
        Vá para: <a href="https://console.firebase.google.com/project/vistoamericano-58f87/settings/serviceaccounts/adminsdk" target="_blank">
          https://console.firebase.google.com/project/vistoamericano-58f87/settings/serviceaccounts/adminsdk
        </a>
      </p>
    </div>

    <div class="step">
      <span class="step-number">2</span>
      <strong>Clique em "Gerar nova chave privada"</strong>
      <p style="margin-top: 10px;">Isso vai baixar um arquivo JSON com as credenciais.</p>
    </div>

    <div class="step">
      <span class="step-number">3</span>
      <strong>Adicione as credenciais ao arquivo .env</strong>
      <p style="margin-top: 10px;">Abra o arquivo <code>.env</code> e adicione:</p>
      <pre>FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"vistoamericano-58f87",...}</pre>
      <p style="margin-top: 10px;">Cole todo o conteúdo do JSON em uma única linha.</p>
    </div>

    <div class="step">
      <span class="step-number">4</span>
      <strong>Adicione uma chave API para segurança</strong>
      <pre>ADMIN_API_KEY=sua-chave-secreta-aqui</pre>
    </div>

    <div class="warning">
      <strong>⚠️ Importante:</strong>
      <ul>
        <li>NUNCA compartilhe o arquivo de credenciais ou o envie para o GitHub</li>
        <li>Adicione <code>.env</code> ao seu <code>.gitignore</code></li>
        <li>Essas credenciais têm acesso total ao seu projeto Firebase</li>
      </ul>
    </div>

    <h2>🚀 Exemplo de arquivo .env completo</h2>
    <pre>DATABASE_URL="file:./db/custom.db"

FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"vistoamericano-58f87","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk-xxxxx@vistoamericano-58f87.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40vistoamericano-58f87.iam.gserviceaccount.com"}

ADMIN_API_KEY=ihs-vistos-admin-2024</pre>

    <h2>📡 Usando a API</h2>

    <div class="info-box">
      <strong>Resetar senha do Admin:</strong>
      <pre>curl -X POST https://seu-site.com/api \\
  -H "Authorization: Bearer ihs-vistos-admin-2024" \\
  -H "Content-Type: application/json" \\
  -d '{"action":"create-admin","password":"nova-senha"}'</pre>
    </div>

    <div class="info-box">
      <strong>Resetar senha de um usuário:</strong>
      <pre>curl -X POST https://seu-site.com/api \\
  -H "Authorization: Bearer ihs-vistos-admin-2024" \\
  -H "Content-Type: application/json" \\
  -d '{"action":"reset-password","email":"12345678901@ds160.local","newPassword":"nova-senha"}'</pre>
    </div>

    <div class="info-box">
      <strong>Listar todos os usuários:</strong>
      <pre>curl https://seu-site.com/api \\
  -H "Authorization: Bearer ihs-vistos-admin-2024"</pre>
    </div>

    <div class="success">
      <strong>✅ Após configurar:</strong>
      <p>Reinicie o servidor e acesse o painel admin para gerenciar senhas pela interface.</p>
    </div>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
