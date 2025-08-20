"use client"

import { useState } from "react"

interface ProductTabsProps {
  product?: {
    name: string
    description: string
    short_description: string
    technical_specifications?: Array<{ name: string; value: string }>
  } | null
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description")

  // Se não houver produto, não renderiza nada
  if (!product) {
    return null
  }

  // Fallback para especificações se não houver dados do produto
  const fallbackSpecifications = {
    Marca: "Jupiter",
    Modelo: "Premium 60Ah",
    Capacidade: "60Ah",
    Tensão: "12V",
    Dimensões: "242 x 175 x 190 mm",
    Peso: "14,5 kg",
    Garantia: "18 meses",
    "Tipo de Terminal": "Positivo à direita",
    "Corrente de Arranque (CCA)": "450A",
    Tecnologia: "Cálcio/Cálcio",
    Manutenção: "Livre de manutenção",
    Aplicação: "Veículos de passeio e utilitários leves",
  }

  // Usar especificações do produto ou fallback
  const specifications = product?.technical_specifications && product.technical_specifications.length > 0
    ? product.technical_specifications.reduce((acc, spec) => {
        acc[spec.name] = spec.value
        return acc
      }, {} as Record<string, string>)
    : fallbackSpecifications

  return (
    <div className="mb-12">
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("description")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "description" ? "border-orange-500 text-orange-600" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
          >
            Descrição
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "specifications" ? "border-orange-500 text-orange-600" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
          >
            Especificações
          </button>

        </nav>
      </div>

      <div className="py-6">
        {activeTab === "description" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{product?.name || "Descrição do Produto"}</h3>
            <div className="space-y-4 text-muted-foreground">
              {product?.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br>') }} />
              ) : (
                <>
                  <p>
                    A Bateria Jupiter 60Ah é a escolha ideal para veículos de pequeno e médio porte, oferecendo alta
                    performance e durabilidade superior. Fabricada com tecnologia de ponta, esta bateria proporciona
                    arranques consistentes e confiáveis, mesmo em condições climáticas adversas.
                  </p>
                  <p>
                    Desenvolvida com tecnologia de cálcio, a Bateria Jupiter 60Ah é livre de manutenção, eliminando a
                    necessidade de verificações periódicas do nível de eletrólito. Sua construção robusta garante alta
                    resistência a vibrações, aumentando significativamente sua vida útil.
                  </p>
                  <p>Principais características:</p>
                </>
              )}
              <ul className="list-disc pl-5 space-y-1">
                <li>Capacidade de 60Ah para excelente desempenho</li>
                <li>Tecnologia de cálcio para maior durabilidade</li>
                <li>Livre de manutenção</li>
                <li>Alta resistência a vibrações</li>
                <li>Excelente desempenho em baixas temperaturas</li>
                <li>Baixa taxa de autodescarga</li>
                <li>Garantia de 18 meses</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "specifications" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Especificações Técnicas</h3>
            {Object.keys(specifications).length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Característica
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Detalhe
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Object.entries(specifications).map(([key, value]) => (
                      <tr key={key} className="hover:bg-muted">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground bg-muted w-1/3">
                          {key}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg border-2 border-dashed border-border">
                <p className="text-sm">Nenhuma especificação técnica disponível para este produto.</p>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  )
}
