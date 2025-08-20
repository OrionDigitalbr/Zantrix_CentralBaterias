import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit } from 'lucide-react';

export interface Specification {
  name: string;
  value: string;
}

interface TechnicalSpecificationsManagerProps {
  initialSpecifications: Specification[];
  onChange: (specifications: Specification[]) => void;
}

export function TechnicalSpecificationsManager({
  initialSpecifications,
  onChange,
}: TechnicalSpecificationsManagerProps) {
  const [specifications, setSpecifications] = useState<Specification[]>(initialSpecifications || []);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setSpecifications(initialSpecifications || []);
  }, [initialSpecifications]);

  const handleAddOrUpdateSpecification = () => {
    if (newSpecName.trim() === '' || newSpecValue.trim() === '') {
      alert('Nome e valor da especificação não podem ser vazios.');
      return;
    }

    if (editingIndex !== null) {
      const updatedSpecs = specifications.map((spec, index) =>
        index === editingIndex ? { name: newSpecName, value: newSpecValue } : spec
      );
      setSpecifications(updatedSpecs);
      onChange(updatedSpecs);
      setEditingIndex(null);
    } else {
      const updatedSpecs = [...specifications, { name: newSpecName, value: newSpecValue }];
      setSpecifications(updatedSpecs);
      onChange(updatedSpecs);
    }
    setNewSpecName('');
    setNewSpecValue('');
  };

  const handleEditSpecification = (index: number) => {
    setNewSpecName(specifications[index].name);
    setNewSpecValue(specifications[index].value);
    setEditingIndex(index);
  };

  const handleDeleteSpecification = (index: number) => {
    const updatedSpecs = specifications.filter((_, i) => i !== index);
    setSpecifications(updatedSpecs);
    onChange(updatedSpecs);
  };

  const handleMoveSpecification = (index: number, direction: 'up' | 'down') => {
    const newSpecs = [...specifications];
    if (direction === 'up' && index > 0) {
      [newSpecs[index - 1], newSpecs[index]] = [newSpecs[index], newSpecs[index - 1]];
    } else if (direction === 'down' && index < newSpecs.length - 1) {
      [newSpecs[index + 1], newSpecs[index]] = [newSpecs[index], newSpecs[index + 1]];
    }
    setSpecifications(newSpecs);
    onChange(newSpecs);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewSpecName('');
    setNewSpecValue('');
  };

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md rounded-lg border bg-card text-card-foreground shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Especificações Técnicas</h3>

      <div className="space-y-4 mb-6 p-4 border rounded-md bg-gray-50">
        <div>
          <Label htmlFor="spec-name">Nome da Especificação</Label>
          <Input
            id="spec-name"
            value={newSpecName}
            onChange={(e) => setNewSpecName(e.target.value)}
            placeholder="Ex: Marca, Modelo, Capacidade"
            className="mt-1 border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none transition-all duration-200"
          />
        </div>
        <div>
          <Label htmlFor="spec-value">Valor da Especificação</Label>
          <Input
            id="spec-value"
            value={newSpecValue}
            onChange={(e) => setNewSpecValue(e.target.value)}
            placeholder="Ex: Jupiter, Premium 60Ah, 60Ah"
            className="mt-1 border border-input rounded-md py-2 px-3 bg-muted/70 focus:outline-none transition-all duration-200"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleAddOrUpdateSpecification}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {editingIndex !== null ? (
              'Atualizar Especificação'
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Especificação
              </>
            )}
          </Button>
          {editingIndex !== null && (
            <Button
              type="button"
              onClick={handleCancelEdit}
              variant="outline"
              className="px-4"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {specifications.length > 0 ? (
        <div className="space-y-3">
          <h4 className="">
            Especificações Adicionadas ({specifications.length})
          </h4>
          {specifications.map((spec, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 mt-1 border border-gray-700 rounded-md py-2 px-3 bg-muted/70 focus:outline-none transition-all duration-200"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide">Nome</span>
                  <span className="font-medium">{spec.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide">Valor</span>
                  <span className="">{spec.value}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleMoveSpecification(index, 'up')}
                  disabled={index === 0}
                  aria-label="Mover para cima"
                  className="h-8 w-8"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleMoveSpecification(index, 'down')}
                  disabled={index === specifications.length - 1}
                  aria-label="Mover para baixo"
                  className="h-8 w-8"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleEditSpecification(index)}
                  aria-label="Editar"
                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteSpecification(index)}
                  aria-label="Excluir"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center">
            <Plus className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm">Nenhuma especificação adicionada ainda.</p>
            <p className="text-xs text-gray-400 mt-1 border border-input rounded-md py-2 px-3 bg-muted/70 rounded-md py-2 px-3 bg-muted/70 focus:outline-none transition-all duration-200">
              Use o formulário acima para adicionar especificações técnicas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
