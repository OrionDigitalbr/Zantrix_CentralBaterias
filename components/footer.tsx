import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Youtube, Twitter, Link as LinkIcon } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function Footer() {
  const supabase = createServerSupabaseClient()
  const { data: settings } = await supabase.from('settings').select('key, value')

  const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || ''

  const socialLinks = [
    { name: 'facebook', href: getSetting('facebook_url'), enabled: getSetting('facebook_enabled') === 'true', icon: Facebook },
    { name: 'instagram', href: getSetting('instagram_url'), enabled: getSetting('instagram_enabled') === 'true', icon: Instagram },
    { name: 'linkedin', href: getSetting('linkedin_url'), enabled: getSetting('linkedin_enabled') === 'true', icon: Linkedin },
    { name: 'twitter', href: getSetting('twitter_url'), enabled: getSetting('twitter_enabled') === 'true', icon: Twitter },
    { name: 'youtube', href: getSetting('youtube_url'), enabled: getSetting('youtube_enabled') === 'true', icon: Youtube },
    { name: 'otherSocial', href: getSetting('other_social_url'), enabled: getSetting('other_social_enabled') === 'true', icon: LinkIcon },
  ]

  const enabledSocialLinks = socialLinks.filter(link => link.enabled && link.href)

  return (
    <footer className="bg-cliente text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <div className="flex items-center mb-4">
                <Image
                  src={getSetting('logo') || "/placeholder.svg?height=50&width=150"}
                  alt="Grupo Central Logo"
                  width={150}
                  height={50}
                  className="h-10"
                />
              </div>
            </Link>
            <p className=" text-sm text-black">
              {getSetting('site_description') || 'Inaugurada em março de 2005, a Central Distribuidora Autopeças e Baterias traz o que há de mais moderno em peças para seu veículo.'}
            </p>
          </div>

          <div>
            <h3 className="text-lg text-black font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/" className=" text-black hover:text-foreground transition-colors">Início</Link></li>
              <li><Link href="/sobre" className=" text-black hover:text-foreground transition-colors">Sobre Nós</Link></li>
              <li><Link href="/unidades" className=" text-black hover:text-foreground transition-colors">Nossas Unidades</Link></li>
              <li><Link href="/baterias" className=" text-black hover:text-foreground transition-colors">Baterias</Link></li>
              <li><Link href="/loja" className=" text-black hover:text-foreground transition-colors">Loja Virtual</Link></li>
              <li><Link href="/contato" className=" text-black hover:text-foreground transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg text-black font-semibold mb-4">Contato</h3>
            <p className=" text-black mb-2">{getSetting('contact_phone') || 'Rondonópolis: (66) 3421-5555'}</p>
            <p className="text-black">{getSetting('contact_email') || 'contato@grupocentral.com.br'}</p>
          </div>

          {enabledSocialLinks.length > 0 && (
            <div>
              <h3 className="text-lg text-black font-semibold mb-4">Redes Sociais</h3>
              <div className="flex space-x-4">
                {enabledSocialLinks.map(social => (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="text-black">
                    <social.icon />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <hr className="border-border my-6" />

        <div className="text-center text-black text-sm">
          &copy; {new Date().getFullYear()} {getSetting('site_name') || 'Grupo Central'}. Todos os direitos reservados. Bina Santos • Rafael Rosa
        </div>
      </div>
    </footer>
  )
}
