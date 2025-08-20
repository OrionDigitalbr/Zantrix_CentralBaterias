import Link from "next/link"
import { MapPin, Phone, Mail, MessageSquare } from "lucide-react"

export function ContactSection() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Nossas Unidades</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Unidade Rondonópolis */}
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 text-cliente" /> Rondonópolis
          </h3>
          <p className="text-gray-700 mb-3">
            <Phone className="inline mr-2 text-gray-500" size={16} />
            (66) 3421-5555
          </p>
          <p className="text-gray-700 mb-3">
            <Mail className="inline mr-2 text-gray-500" size={16} />
            contato@grupocentral.com.br
          </p>
          <a 
            href="https://wa.me/556634215555" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-green-600 font-medium hover:underline"
          >
            <MessageSquare className="mr-1" size={16} />
            Fale pelo WhatsApp
          </a>
        </div>

        {/* Unidade Primavera do Leste */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 text-cliente" /> Primavera do Leste
          </h3>
          <p className="text-gray-700 mb-3">
            <Phone className="inline mr-2 text-gray-500" size={16} />
            (66) 3498-5555
          </p>
          <p className="text-gray-700 mb-3">
            <Mail className="inline mr-2 text-gray-500" size={16} />
            primavera@grupocentral.com.br
          </p>
          <a 
            href="https://wa.me/556634985555" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-green-600 font-medium hover:underline"
          >
            <MessageSquare className="mr-1" size={16} />
            Fale pelo WhatsApp
          </a>
        </div>

        {/* Unidade Barra do Garças */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 text-cliente" /> Barra do Garças
          </h3>
          <p className="text-gray-700 mb-3">
            <Phone className="inline mr-2 text-gray-500" size={16} />
            (66) 3402-5555
          </p>
          <p className="text-gray-700 mb-3">
            <Mail className="inline mr-2 text-gray-500" size={16} />
            barradogarcas@grupocentral.com.br
          </p>
          <a 
            href="https://wa.me/556634025555" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-green-600 font-medium hover:underline"
          >
            <MessageSquare className="mr-1" size={16} />
            Fale pelo WhatsApp
          </a>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Link
          href="/contato"
          className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Entre em Contato
        </Link>
      </div>
    </section>
  )
}
