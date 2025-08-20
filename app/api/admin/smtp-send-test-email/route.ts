import { NextRequest, NextResponse } from "next/server"
import * as nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { host, port, user, pass, encryption, testEmail } = body

    // Validar campos obrigatórios
    if (!host || !port || !user || !pass || !testEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Todos os campos são obrigatórios: host, port, user, pass, testEmail"
        },
        { status: 400 }
      )
    }

    // Validar formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Formato de e-mail inválido"
        },
        { status: 400 }
      )
    }

    // Configurar transporter baseado no tipo de criptografia
    let transporterConfig: any = {
      host: host,
      port: parseInt(port),
      auth: {
        user: user,
        pass: pass,
      },
    }

    // Configurar criptografia
    if (encryption === 'ssl') {
      transporterConfig.secure = true // SSL/TLS
    } else if (encryption === 'tls') {
      transporterConfig.secure = false
      transporterConfig.requireTLS = true
    } else {
      transporterConfig.secure = false
    }

    // Criar transporter com logging detalhado
    const transporter = nodemailer.createTransport({
      ...transporterConfig,
      logger: true, // Habilita logging detalhado
      debug: true, // Habilita debug para Nodemailer
    })

    // O remetente DEVE ser o mesmo e-mail da autenticação para evitar problemas de SPF/DKIM.
    // O nome do remetente pode ser personalizado.
    const fromName = 'Sistema Zantrix';
    const fromEmail = `"${fromName}" <${user}>`; // Use o e-mail de autenticação

    console.log(`[SMTP Test] Remetente configurado: ${fromEmail}`);

    // Configurar e-mail de teste com remetente verificado
    const mailOptions = {
      from: fromEmail,
      to: testEmail,
      subject: "Teste Envio Sucesso", // Título solicitado
      replyTo: user,
      headers: {
        'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@zantrix.system>`,
        'Return-Path': user,
        'X-Mailer': 'Sistema Zantrix v1.0'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f4f8;">
          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #22c55e; margin: 0; font-size: 26px;">
                <span style="font-size: 40px; vertical-align: middle;">✓</span>
                Envio com Sucesso!
              </h1>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Detalhes do Teste</h3>
              <p style="margin: 8px 0; color: #555;"><strong>Servidor SMTP:</strong> ${host}:${port}</p>
              <p style="margin: 8px 0; color: #555;"><strong>Usuário:</strong> ${user}</p>
              <p style="margin: 8px 0; color: #555;"><strong>Destinatário:</strong> ${testEmail}</p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Este é um e-mail de teste gerado pelo Sistema Zantrix.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `Teste Envio Sucesso
      
      Sua configuração SMTP está funcionando corretamente.
      
      Detalhes:
      - Servidor SMTP: ${host}:${port}
      - Usuário: ${user}
      - Destinatário: ${testEmail}
      
      Sistema Zantrix`
    }

    console.log('📧 Enviando e-mail de teste para:', testEmail)
    console.log('📧 Configurações do e-mail:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    })

    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions)

    console.log('✅ E-mail de teste enviado com sucesso!', {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    })

    return NextResponse.json({
      success: true,
      message: "E-mail de teste enviado com sucesso!",
      messageId: info.messageId
    })

  } catch (error: any) {
    console.error('❌ Erro detalhado ao enviar e-mail de teste:', JSON.stringify(error, null, 2))

    let errorMessage = "Erro desconhecido ao enviar e-mail"

    if (error.code === 'EAUTH') {
      errorMessage = "Falha na autenticação. Verifique usuário e senha."
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = "Conexão recusada. Verifique host e porta."
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "Timeout na conexão. Verifique host e porta."
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        message: `Falha ao enviar e-mail: ${errorMessage}`,
        errorDetails: error
      },
      { status: 500 }
    )
  }
}
