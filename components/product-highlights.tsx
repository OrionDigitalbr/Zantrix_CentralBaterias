import Image from "next/image"
import Link from "next/link"

export function ProductHighlights() {
  const products = [
    {
      id: 1,
      name: "Baterias Automotivas",
      image: "/placeholder.svg?height=200&width=300",
      description: "Linha completa de baterias para automóveis e caminhões",
    },
    {
      id: 2,
      name: "Peças para Caminhões",
      image: "/placeholder.svg?height=200&width=300",
      description: "Peças genuínas e similares para todas as marcas",
    },
    {
      id: 3,
      name: "Lubrificantes",
      image: "/placeholder.svg?height=200&width=300",
      description: "Óleos e lubrificantes de alta qualidade",
    },
    {
      id: 4,
      name: "Acessórios",
      image: "/placeholder.svg?height=200&width=300",
      description: "Acessórios para veículos leves e pesados",
    },
  ]

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Nossos Produtos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            href={`/produto/${product.id}`}
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <Link
          href="/loja"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Ver Todos os Produtos
        </Link>
      </div>
    </section>
  )
}
