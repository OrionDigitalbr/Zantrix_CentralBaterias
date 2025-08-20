import { useState } from 'react'
import { createClientSupabaseClient } from '../lib/supabase'

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export function useVideoUpload() {
  const [uploading, setUploading] = useState(false)
  const supabase = createClientSupabaseClient()

  const uploadVideo = async (file: File, productName: string): Promise<UploadResult> => {
    try {
      setUploading(true)

      // Validações de segurança
      if (!file) {
        return { success: false, error: 'Nenhum arquivo selecionado' }
      }

      // Verificar tipo de arquivo
      if (!file.type.startsWith('video/')) {
        return { success: false, error: 'Arquivo deve ser um vídeo' }
      }

      // Verificar tamanho (máximo 100MB)
      if (file.size > 100 * 1024 * 1024) {
        return { success: false, error: 'Vídeo deve ter no máximo 100MB' }
      }

      // Verificar extensão
      const allowedExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        return { success: false, error: 'Formato de vídeo não suportado' }
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `product-video-${timestamp}-${randomString}.${fileExtension}`

      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro no upload:', error)
        return { success: false, error: error.message }
      }

      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('product-videos')
        .getPublicUrl(fileName)

      if (!publicUrlData?.publicUrl) {
        return { success: false, error: 'Erro ao gerar URL pública' }
      }

      return { 
        success: true, 
        url: publicUrlData.publicUrl 
      }

    } catch (error) {
      console.error('Erro no upload do vídeo:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    } finally {
      setUploading(false)
    }
  }

  const deleteVideo = async (fileName: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('product-videos')
        .remove([fileName])

      if (error) {
        console.error('Erro ao excluir vídeo:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error)
      return false
    }
  }

  return {
    uploadVideo,
    deleteVideo,
    uploading
  }
}
