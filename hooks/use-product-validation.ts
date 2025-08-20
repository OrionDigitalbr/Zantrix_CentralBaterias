import { useState } from 'react'

interface ValidationError {
  field: string
  message: string
}

interface ProductData {
  name: string
  slug: string
  category_id: number
  price: number
  selectedUnits: number[]
}

export function useProductValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([])

  const validateProduct = (product: ProductData): boolean => {
    const newErrors: ValidationError[] = []

    // Validação do nome
    if (!product.name?.trim()) {
      newErrors.push({
        field: 'name',
        message: 'Nome do produto é obrigatório'
      })
    } else if (product.name.length < 3) {
      newErrors.push({
        field: 'name',
        message: 'Nome deve ter pelo menos 3 caracteres'
      })
    } else if (product.name.length > 100) {
      newErrors.push({
        field: 'name',
        message: 'Nome deve ter no máximo 100 caracteres'
      })
    }

    // Validação do slug
    if (!product.slug?.trim()) {
      newErrors.push({
        field: 'slug',
        message: 'Slug é obrigatório'
      })
    } else if (!/^[a-z0-9-]+$/.test(product.slug)) {
      newErrors.push({
        field: 'slug',
        message: 'Slug deve conter apenas letras minúsculas, números e hífens'
      })
    }

    // Validação da categoria
    if (!product.category_id || product.category_id === 0) {
      newErrors.push({
        field: 'category_id',
        message: 'Categoria é obrigatória'
      })
    }

    // Validação do preço
    if (!product.price || product.price <= 0) {
      newErrors.push({
        field: 'price',
        message: 'Preço deve ser maior que zero'
      })
    } else if (product.price > 999999.99) {
      newErrors.push({
        field: 'price',
        message: 'Preço deve ser menor que R$ 1.000.000,00'
      })
    }

    // Validação das unidades
    if (product.selectedUnits.length === 0) {
      newErrors.push({
        field: 'units',
        message: 'Selecione pelo menos uma unidade'
      })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const clearErrors = () => {
    setErrors([])
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message
  }

  const hasErrors = (): boolean => {
    return errors.length > 0
  }

  return {
    errors,
    validateProduct,
    clearErrors,
    getFieldError,
    hasErrors
  }
}
