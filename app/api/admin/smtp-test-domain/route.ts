import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json()

    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: "E-mail de teste é obrigatório" },
        { status: 400 }
      )
    }

    // Configurações SMTP do Brevo
    const host = "smtp-relay.brevo.com"
    const port = 587
    const user = "8cce9e001@smtp-brevo.com"
    const pass = "xsmtpsib-8cce9e001@smtp-brevo.com-VqGJhCzpFnOdWKfA"

    console.log('🔧 Testando SMTP com domínio alternativo...')
    console.log('📧 Configurações SMTP:', { host, port, user: user.substring(0, 10) + '...' })

    // Criar transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // true para 465, false para outras portas
      auth: {
        user,
        pass,
      },
      logger: true,
      debug: true,
    })

    // Testar diferentes remetentes
    const senders = [
      `"Sistema Zantrix" <${user}>` // Sempre usar o usuário SMTP
    ]

    const results = []

    for (const sender of senders) {
      try {
        console.log(`📧 Testando remetente: ${sender}`)
        
        const mailOptions = {
          from: sender,
          to: testEmail,
          subject: `🧪 Teste Domínio - ${sender}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Teste de Domínio SMTP</h2>
              <p><strong>Remetente:</strong> ${sender}</p>
              <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p>Este e-mail testa diferentes configurações de remetente.</p>
              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Sistema Zantrix AI - Grupo Central
              </p>
            </div>
          `,
        }

        const info = await transporter.sendMail(mailOptions)
        
        results.push({
          sender,
          success: true,
          messageId: info.messageId,
          response: info.response
        })

        console.log(`✅ Sucesso com ${sender}:`, info.messageId)
        
      } catch (error: any) {
        results.push({
          sender,
          success: false,
          error: error.message
        })
        
        console.log(`❌ Erro com ${sender}:`, error.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Teste de domínios concluído",
      results
    })

  } catch (error: any) {
    console.error('❌ Erro geral no teste de domínios:', error)

    return NextResponse.json(
      {
        success: false,
        message: `Erro no teste: ${error.message}`,
        errorDetails: error.toString()
      },
      { status: 500 }
    )
  }
}
