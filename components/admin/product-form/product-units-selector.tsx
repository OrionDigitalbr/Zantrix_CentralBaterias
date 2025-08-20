"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Unit } from "@/lib/database.types"

interface ProductUnitsSelectorProps {
  units: Unit[]
  selectedUnits: number[]
  onUnitsChange: (units: number[]) => void
}

export function ProductUnitsSelector({ units, selectedUnits, onUnitsChange }: ProductUnitsSelectorProps) {
  const handleUnitChange = (unitId: number, checked: boolean) => {
    if (checked) {
      onUnitsChange([...selectedUnits, unitId])
    } else {
      onUnitsChange(selectedUnits.filter((id) => id !== unitId))
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">
        Unidades Disponíveis <span className="text-red-500">*</span>
      </h3>

      {units.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {units.map((unit) => (
            <div key={unit.id} className="flex items-start space-x-2">
              <Checkbox
                id={`unit-${unit.id}`}
                checked={selectedUnits.includes(unit.id)}
                onCheckedChange={(checked) => handleUnitChange(unit.id, checked === true)}
              />
              <Label htmlFor={`unit-${unit.id}`} className="font-normal">
                <div>{unit.name}</div>
                <div className="text-xs text-gray-500">
                  {unit.city} - {unit.state}
                </div>
              </Label>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>Nenhuma unidade cadastrada.</p>
          <p className="text-sm mt-1">Cadastre unidades em Configurações &gt; Unidades</p>
        </div>
      )}
    </div>
  )
}
