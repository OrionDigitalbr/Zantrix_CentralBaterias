import { NextRequest, NextResponse } from "next/server"
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, testEmail, fromName, fromEmail } = body;

    if (!apiKey || !testEmail || !fromName || !fromEmail) {
      return NextResponse.json({ success: false, message: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "✅ Teste de API Brevo - Funcionando!";
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>🎉 Parabéns!</h1>
          <p>Seu teste de envio de e-mail através da API da Brevo foi um sucesso.</p>
          <p>Este e-mail foi enviado para ${testEmail}.</p>
        </body>
      </html>
    `;
    sendSmtpEmail.sender = { "name": fromName, "email": fromEmail };
    sendSmtpEmail.to = [
      { "email": testEmail, "name": "Usuário de Teste" }
    ];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('✅ E-mail enviado com sucesso via API Brevo!', JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      message: "E-mail de teste enviado com sucesso via API Brevo!",
      data: data
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail via API Brevo:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Falha ao enviar e-mail via API Brevo: ${error.message || 'Erro desconhecido'}`,
        errorDetails: error.body || error
      },
      { status: 500 }
    );
  }
}