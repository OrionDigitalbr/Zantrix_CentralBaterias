'use client'

import { useSettings } from '@/lib/hooks/use-settings'
import { PriceDisplay } from '@/components/price-display'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function TestPriceDisplay() {
  const { settings, loading, error, getSettingBoolean, updateSetting, refreshSettings } = useSettings()
  const [updating, setUpdating] = useState(false)

  const showPrices = getSettingBoolean('show_prices', true)

  const togglePrices = async () => {
    setUpdating(true)
    try {
      const newValue = !showPrices
      await updateSetting('show_prices', newValue.toString())
      await refreshSettings()
    } catch (err) {
      console.error('Erro ao atualizar configuração:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Exibição de Preços</CardTitle>
        <CardDescription>
          Teste para verificar se a configuração de preços está funcionando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status das configurações */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Status das Configurações:</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
            <p><strong>Error:</strong> {error || 'Nenhum'}</p>
            <p><strong>Show Prices:</strong> {showPrices ? 'Sim' : 'Não'}</p>
            <p><strong>Settings Count:</strong> {Object.keys(settings).length}</p>
            <p><strong>Show Prices Raw:</strong> {settings['show_prices'] || 'undefined'}</p>
          </div>
        </div>

        {/* Controle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">Exibir Preços</p>
            <p className="text-sm text-gray-600">
              {showPrices ? 'Preços estão sendo exibidos' : 'Preços estão ocultos'}
            </p>
          </div>
          <Button 
            onClick={togglePrices} 
            disabled={updating || loading}
            variant={showPrices ? "destructive" : "default"}
          >
            {updating ? 'Atualizando...' : showPrices ? 'Ocultar Preços' : 'Mostrar Preços'}
          </Button>
        </div>

        {/* Teste de exibição */}
        <div className="space-y-4">
          <h3 className="font-medium">Teste de Exibição:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Produto Teste 1</h4>
              <p className="text-sm text-gray-600 mb-2">Bateria Jupiter 60Ah</p>
              <PriceDisplay 
                price={299.90} 
                size="lg"
              />
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Produto Teste 2 (Com Desconto)</h4>
              <p className="text-sm text-gray-600 mb-2">Bateria Moura 45Ah</p>
              <PriceDisplay 
                price={250.00} 
                salePrice={199.90}
                size="lg"
                showInstallments={true}
              />
            </div>
          </div>
        </div>

        {/* Debug info */}
        <details className="p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer font-medium">Debug Info (Clique para expandir)</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify({ settings, loading, error, showPrices }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}
