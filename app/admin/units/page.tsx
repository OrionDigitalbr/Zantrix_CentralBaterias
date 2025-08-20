'use client'

import { useState, useEffect } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Search } from 'lucide-react'
import { useNotify } from '@/contexts/notification-context'

interface Unit {
  id: number
  name: string
  address: string
  city: string
  state: string
  postal_code: string
  phone: string
  email: string
  active: boolean
  created_at: string
  updated_at: string
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    email: '',
    active: true
  })

  const notify = useNotify()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      console.log('🏢 [UNITS PAGE] Buscando unidades...')
      setLoading(true)

      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name')

      if (error) {
        console.error('❌ [UNITS PAGE] Erro ao buscar unidades:', error)
        throw error
      }

      console.log('✅ [UNITS PAGE] Unidades encontradas:', data.length)
      setUnits(data || [])
    } catch (error) {
      console.error('❌ [UNITS PAGE] Erro:', error)
      notify.error('Erro', 'Falha ao carregar unidades')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      console.log('💾 [UNITS PAGE] Salvando unidade...', formData)

      if (editingUnit) {
        // Atualizar
        const { error } = await supabase
          .from('units')
          .update(formData)
          .eq('id', editingUnit.id)

        if (error) throw error
        notify.success('Sucesso', 'Unidade atualizada com sucesso!')
      } else {
        // Criar
        const { error } = await supabase
          .from('units')
          .insert(formData)

        if (error) throw error
        notify.success('Sucesso', 'Unidade criada com sucesso!')
      }

      setShowForm(false)
      setEditingUnit(null)
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        phone: '',
        email: '',
        active: true
      })
      fetchUnits()
    } catch (error) {
      console.error('❌ [UNITS PAGE] Erro ao salvar:', error)
      notify.error('Erro', 'Falha ao salvar unidade')
    }
  }

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      address: unit.address,
      city: unit.city,
      state: unit.state,
      postal_code: unit.postal_code,
      phone: unit.phone,
      email: unit.email,
      active: unit.active
    })
    setShowForm(true)
  }

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Tem certeza que deseja excluir a unidade "${unit.name}"?`)) {
      return
    }

    try {
      console.log('🗑️ [UNITS PAGE] Excluindo unidade:', unit.id)

      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unit.id)

      if (error) throw error

      console.log('✅ [UNITS PAGE] Unidade excluída com sucesso')
      notify.success('Sucesso', 'Unidade excluída com sucesso!')
      fetchUnits()
    } catch (error) {
      console.error('❌ [UNITS PAGE] Erro ao excluir:', error)
      notify.error('Erro', 'Falha ao excluir unidade')
    }
  }

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando unidades...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Unidades</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Unidade
        </Button>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar unidades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CEP</label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm font-medium">Ativo</label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingUnit ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingUnit(null)
                    setFormData({
                      name: '',
                      address: '',
                      city: '',
                      state: '',
                      postal_code: '',
                      phone: '',
                      email: '',
                      active: true
                    })
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Unidades */}
      <div className="grid gap-4">
        {filteredUnits.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhuma unidade encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredUnits.map((unit) => (
            <Card key={unit.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{unit.name}</h3>
                      <Badge variant={unit.active ? "default" : "secondary"}>
                        {unit.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-1">{unit.address}</p>
                    <p className="text-gray-600 mb-1">{unit.city}, {unit.state} - {unit.postal_code}</p>
                    <p className="text-gray-600 mb-1">📞 {unit.phone}</p>
                    <p className="text-gray-600">📧 {unit.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(unit)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(unit)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
