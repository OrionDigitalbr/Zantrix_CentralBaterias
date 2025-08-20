import { Truck, DollarSign, Users, Award, Package, MapPin } from "lucide-react"

export function AdvantagesSection() {
  const advantages = [
    {
      id: 1,
      icon: <Truck className="h-8 w-8" />,
      title: "Linha completa",
      subtitle: "PEÇAS CAMINHÃO E CARRETA"
    },
    {
      id: 2,
      icon: <DollarSign className="h-8 w-8" />,
      title: "Preços e condições",
      subtitle: "ESPECIAIS"
    },
    {
      id: 3,
      icon: <Users className="h-8 w-8" />,
      title: "Atendimento",
      subtitle: "PERSONALIZADO"
    },
    {
      id: 4,
      icon: <Award className="h-8 w-8" />,
      title: "Vendedores",
      subtitle: "ESPECIALISTAS"
    },
    {
      id: 5,
      icon: <Package className="h-8 w-8" />,
      title: "Produtos a pronta",
      subtitle: "ENTREGA"
    },
    {
      id: 6,
      icon: <MapPin className="h-8 w-8" />,
      title: "Política de FRETE pago p/",
      subtitle: "DESPACHOS"
    }
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold  mb-4">NOSSAS VANTAGENS</h2>
          <p className="text-lg max-w-1xl mx-auto">
            Descubra por que somos a escolha preferida de nossos clientes em todo o país
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {advantages.map((advantage) => (
            <div
              key={advantage.id}
              className="flex flex-row items-center sm:flex-col sm:items-center sm:text-center p-4 sm:p-6 bg-card rounded-lg hover:bg-muted transition-colors duration-300 gap-4 sm:gap-0"
            >
              <div className="bg-cliente p-3 sm:p-4 rounded-full mb-0 sm:mb-4 text-white flex-shrink-0">
                {advantage.icon}
              </div>
              <div className="flex flex-col">
                <h3 className="font-medium text-sm mb-1">
                  {advantage.title}
                </h3>
                <p className=" font-bold text-sm">
                  {advantage.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
