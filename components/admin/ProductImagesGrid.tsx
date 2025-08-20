"use client";

import Image from "next/image";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ProductImage = {
  id: number;
  url: string;
  alt_text?: string | null;
  is_main?: boolean | null;
};

export function ProductImagesGrid({
  productId,
  images,
  onChanged,
  themeColor = "#f97316",
}: {
  productId: number;
  images: ProductImage[];
  onChanged?: () => void; // chame para recarregar após mudanças
  themeColor?: string; // cor principal (ex.: do Settings)
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function setAsMain(imageId: number) {
    try {
      setBusy(imageId);
      const res = await fetch(`/api/admin/products/${productId}/images/main`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao definir principal");
      
      console.log('✅ Imagem definida como principal:', imageId);
      onChanged?.();
    } catch (e: any) {
      console.error('❌ Erro ao definir principal:', e);
      alert(e?.message ?? "Erro ao definir principal");
    } finally {
      setBusy(null);
    }
  }

  async function deleteImage(imageId: number) {
    try {
      setBusy(imageId);
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao excluir");
      
      console.log('✅ Imagem excluída:', imageId);
      onChanged?.();
    } catch (e: any) {
      console.error('❌ Erro ao excluir:', e);
      alert(e?.message ?? "Erro ao excluir");
    } finally {
      setBusy(null);
      setConfirmDeleteId(null);
    }
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma imagem cadastrada para este produto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Imagens do Produto</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <button
              type="button"
              onClick={() => setAsMain(img.id)}
              className="block w-full h-32 overflow-hidden rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              title="Clique para definir como principal"
              disabled={busy === img.id}
            >
              <Image
                src={img.url}
                alt={img.alt_text || "Imagem do produto"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </button>

            {/* badge "Principal" */}
            {img.is_main ? (
              <span
                className="absolute top-1 left-1 text-[10px] font-semibold px-2 py-0.5 rounded text-white shadow"
                style={{ backgroundColor: themeColor }}
              >
                Principal
              </span>
            ) : (
              <span className="absolute top-1 left-1 text-[10px] px-2 py-0.5 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Definir capa
              </span>
            )}

            {/* botão X (abre AlertDialog) */}
            <AlertDialog open={confirmDeleteId === img.id} onOpenChange={(o) => setConfirmDeleteId(o ? img.id : null)}>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                  title="Excluir imagem"
                >
                  <span className="sr-only">Excluir</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir esta imagem?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A imagem será removida do produto e do armazenamento.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteImage(img.id)}
                    disabled={busy === img.id}
                    className="text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {busy === img.id ? "Excluindo..." : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Loading overlay */}
            {busy === img.id && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Clique na imagem para defini-la como principal. Use o X para excluir.
      </p>
    </div>
  );
}
