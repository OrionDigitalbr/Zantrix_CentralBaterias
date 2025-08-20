"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Script from "next/script"
import { trackPageView } from "@/lib/tracking"

export default function AnalyticsScript() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // ❌ NÃO rastrear páginas do admin
    if (pathname?.startsWith('/admin')) {
      console.log('🚫 [ANALYTICS SCRIPT] Pulando tracking externo para página admin:', pathname)
      return
    }

    if (pathname) {
      // Construir a URL completa com parâmetros de consulta
      let url = pathname
      if (searchParams?.toString()) {
        url += `?${searchParams.toString()}`
      }

      console.log('📊 [ANALYTICS SCRIPT] Tracking externo para página pública:', url)

      // Rastrear visualização de página (apenas páginas públicas)
      trackPageView(url)
    }
  }, [pathname, searchParams])

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `,
        }}
      />

      {/* Facebook Pixel */}
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '000000000000000');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  )
}
