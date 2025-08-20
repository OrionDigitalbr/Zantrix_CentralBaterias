"use client"

import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProductFormActionsProps {
  saving: boolean
  onSave: () => void
}

export function ProductFormActions({ saving, onSave }: ProductFormActionsProps) {
  const router = useRouter()

  return (
    <div className="flex justify-between pt-4">
      <button
        type="button"
        onClick={() => router.push("/admin/products")}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
      >
        <ArrowLeft className="inline-block mr-2 h-4 w-4" />
        Voltar
      </button>
      <button
        type="submit"
        disabled={saving}
        onClick={onSave}
        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all duration-200 hover:scale-105 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="inline-block mr-2 h-4 w-4" />
            Salvar Produto
          </>
        )}
      </button>
    </div>
  )
}
