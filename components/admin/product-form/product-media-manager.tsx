"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Check, X, Plus, Video, Loader2 } from "lucide-react"
import { useImageUpload } from "../../../hooks/use-image-upload"
import { useVideoUpload } from "../../../hooks/use-video-upload"
import type { ProductImage } from "../../../lib/database.types"

interface ProductMediaManagerProps {
  images: ProductImage[]
  videoUrl: string | null
  onImagesChange: (images: ProductImage[]) => void
  onVideoChange: (videoUrl: string | null) => void
  productName: string
}

export function ProductMediaManager({ 
  images, 
  videoUrl, 
  onImagesChange, 
  onVideoChange, 
  productName 
}: ProductMediaManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  
  const { uploadImage, uploading: uploadingImage } = useImageUpload()
  const { uploadVideo, uploading: uploadingVideo } = useVideoUpload()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Verificar se não excede o limite de 10 imagens
    if (images.length + files.length > 10) {
      alert("Você pode adicionar no máximo 10 imagens por produto.")
      return
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Verificar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`A imagem ${file.name} deve ter no máximo 5MB.`)
          continue
        }

        // Verificar tipo do arquivo
        if (!file.type.startsWith('image/')) {
          alert(`O arquivo ${file.name} não é uma imagem válida.`)
          continue
        }

        const result = await uploadImage(file, productName)
        if (result.success && result.url) {
          const newImage: ProductImage = {
            url: result.url,
            alt_text: `${productName} - Imagem ${images.length + 1}`,
            is_main: images.length === 0, // Primeira imagem é a principal
            display_order: images.length + 1
          }
          onImagesChange([...images, newImage])
        }
      }
    } catch (error) {
      console.error("Erro ao enviar imagens:", error)
      alert("Ocorreu um erro ao enviar as imagens. Tente novamente.")
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const file = files[0]

      // Verificar tamanho do arquivo (limite de 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert("O vídeo deve ter no máximo 100MB.")
        return
      }

      const result = await uploadVideo(file, productName)
      if (result.success && result.url) {
        onVideoChange(result.url)
      }
    } catch (error) {
      console.error("Erro ao enviar vídeo:", error)
      alert("Ocorreu um erro ao enviar o vídeo. Tente novamente.")
    } finally {
      if (videoInputRef.current) {
        videoInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)

    // Se a imagem removida era a principal, definir a primeira imagem como principal
    if (images[index].is_main && newImages.length > 0) {
      newImages[0].is_main = true
    }

    onImagesChange(newImages)
  }

  const handleSetMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_main: i === index,
    }))
    onImagesChange(newImages)
  }

  const handleRemoveVideo = () => {
    onVideoChange(null)
  }

  return (
    <>
      {/* Seção de Imagens */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Imagens do Produto</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative border rounded-lg overflow-hidden group">
              <div className="aspect-square relative">
                <Image 
                  src={image.url || "/placeholder.svg"} 
                  alt={image.alt_text} 
                  fill 
                  className="object-cover" 
                />
                {image.is_main && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Principal
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  {!image.is_main && (
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(index)}
                      className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition-all duration-200 hover:scale-110"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {images.length < 10 && (
            <div className="border border-dashed rounded-lg flex items-center justify-center aspect-square">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 text-gray-500 hover:text-orange-500 transition-all duration-200 hover:scale-105"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                ) : (
                  <>
                    <Plus size={24} className="mb-2" />
                    <span className="text-sm">Adicionar Imagens</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Você pode adicionar até 10 imagens. Clique em uma imagem para defini-la como principal.
        </p>
      </div>

      {/* Seção de Vídeo */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Vídeo do Produto</h3>

        {videoUrl ? (
          <div className="relative aspect-video mb-4">
            <video src={videoUrl} controls className="w-full h-full rounded-lg" />
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="border border-dashed rounded-lg flex items-center justify-center aspect-video mb-4">
            <input 
              type="file" 
              ref={videoInputRef} 
              onChange={handleVideoUpload} 
              accept="video/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-4 text-gray-500 hover:text-orange-500 transition-all duration-200 hover:scale-105"
              disabled={uploadingVideo}
            >
              {uploadingVideo ? (
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              ) : (
                <>
                  <Video size={24} className="mb-2" />
                  <span className="text-sm">Adicionar Vídeo</span>
                </>
              )}
            </button>
          </div>
        )}

        <p className="text-sm text-gray-500">Você pode adicionar um vídeo de até 100MB.</p>
      </div>
    </>
  )
}
