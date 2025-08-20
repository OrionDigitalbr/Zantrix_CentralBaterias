// Tipos para o Google Analytics
interface Window {
  gtag?: (command: string, target: string, params?: any) => void
  fbq?: (command: string, event: string, params?: any) => void
  dataLayer?: any[]
}

// Função para rastrear visualização de página
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", "G-XXXXXXXXXX", {
      page_path: url,
    })
  }

  // Facebook Pixel
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView")
  }
}

// Função para rastrear eventos do Google Analytics
export const trackEvent = (action: string, category: string, label: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Função para rastrear eventos do Facebook Pixel
export const trackFbEvent = (event: string, params?: any) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params)
  }
}

// Função para rastrear visualização de produto
export const trackProductView = (product: {
  id: number | string
  name: string
  price: number
  category: string
}) => {
  // Google Analytics
  trackEvent("view_item", "Produtos", product.name, product.price)

  // Facebook Pixel
  trackFbEvent("ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "BRL",
  })
}

// Função para rastrear adição ao carrinho (no caso, clique no botão de compra)
export const trackAddToCart = (product: {
  id: number | string
  name: string
  price: number
  category: string
  quantity: number
}) => {
  // Google Analytics
  trackEvent("add_to_cart", "Produtos", product.name, product.price * product.quantity)

  // Facebook Pixel
  trackFbEvent("AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price * product.quantity,
    currency: "BRL",
  })
}

// Função para rastrear início de checkout (no caso, clique no WhatsApp)
export const trackInitiateCheckout = (product: {
  id: number | string
  name: string
  price: number
  quantity: number
}) => {
  // Google Analytics
  trackEvent("begin_checkout", "Checkout", product.name, product.price * product.quantity)

  // Facebook Pixel
  trackFbEvent("InitiateCheckout", {
    content_ids: [product.id],
    content_name: product.name,
    value: product.price * product.quantity,
    currency: "BRL",
  })
}
