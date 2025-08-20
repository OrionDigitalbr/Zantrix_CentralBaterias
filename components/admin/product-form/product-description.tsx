"use client"

interface ProductDescriptionProps {
  shortDescription: string
  description: string
  onChange: (field: string, value: string) => void
}

export function ProductDescription({ shortDescription, description, onChange }: ProductDescriptionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição Curta
        </label>
        <textarea
          id="short_description"
          name="short_description"
          value={shortDescription || ""}
          onChange={(e) => onChange("short_description", e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição Completa
        </label>
        <textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
