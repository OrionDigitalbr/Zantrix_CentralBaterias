"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Facebook, Instagram, Linkedin, Youtube, Twitter, Link as LinkIcon } from "lucide-react"

export function SocialLinks() {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLinks = async () => {
      const supabase = createClientSupabaseClient()
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

      setLinks(socialLinks.filter(link => link.enabled && link.href))
      setLoading(false)
    }

    fetchLinks()
  }, [])

  if (loading) {
    return <div className="h-6 w-full animate-pulse bg-muted rounded-md"></div>
  }

  if (links.length === 0) {
    return null
  }

  return (
    <div className="flex justify-center space-x-4 mt-4">
      {links.map(social => (
        <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
          <social.icon />
        </a>
      ))}
    </div>
  )
}