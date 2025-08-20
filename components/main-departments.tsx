import Link from "next/link"
import Image from "next/image"

export function MainDepartments() {
  const departments = [
    {
      id: 1,
      name: "Freios",
      image: "/images/home/Departamentos/Zantrix-Sistema-Central-Pecas_Departamento--Freio.jpg",
      url: "/loja?categoria=freios",
    },
    {
      id: 2,
      name: "Baterias",
      image: "/images/home/Departamentos/departamentos - BATERIA.jpg",
      url: "/loja?categoria=baterias",
    },
    {
      id: 3,
      name: "Suspensão",
      image: "/images/home/Departamentos/departamentos - SUSPENSÃO.jpg",
      url: "/loja?categoria=suspensao",
    },
    {
      id: 4,
      name: "Elétrica",
      image: "/images/home/Departamentos/departamentos - ELÉTRICA.jpg",
      url: "/loja?categoria=eletrica",
    },
    {
      id: 5,
      name: "Acessórios",
      image: "/images/home/Departamentos/departamentos - ACESSÓRIOS.jpg",
      url: "/loja?categoria=acessorios",
    },
    {
      id: 6,
      name: "Carrocerias",
      image: "/images/home/Departamentos/departamentos - CARROCERIA.jpg",
      url: "/loja?categoria=carrocerias",
    },
  ]

  return (
    <section className="py-12 bg-cliente">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-black">Principais Departamentos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href={dept.url}
              className="group flex flex-col items-center rounded-xl transition-all duration-300 hover:scale-105 "
            >
              <div className="w-28 h-28 mb-4 relative overflow-hidden rounded-full transition-all duration-300">
                <Image
                  src={dept.image || "/placeholder.svg"}
                  alt={dept.name}
                  fill
                  className="object-cover rounded-full p-1"
                  sizes="(max-width: 768px) 96px, 96px"
                />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-black text-center transition-colors duration-300">
                {dept.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
