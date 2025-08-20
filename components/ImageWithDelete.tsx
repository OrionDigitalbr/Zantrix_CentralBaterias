"use client";

import * as React from "react";
import Image from "next/image";
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

type Props = {
  slideId: number;
  column:
    | "image_pc"
    | "image_mobile"
    | "image_notebook"
    | "image_url"
    | "mobile_image_url"
    | "notebook_image_url";
  url?: string;         // URL pública da imagem
  path?: string;        // path no bucket (se já tiver salvo)
  onDeleted?: () => void;
  sizes?: string;       // para <Image fill>
  themeColor?: string;  // cor do tema (barra/borda opcional)
};

export function ImageWithDelete({
  slideId,
  column,
  url,
  path,
  onDeleted,
  sizes = "(max-width: 768px) 100vw, 800px",
  themeColor = "#f97316",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/slides/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId, column, url, path }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao excluir imagem");
      onDeleted?.();
    } catch (e: any) {
      console.error("Erro ao excluir:", e);
      alert(e?.message ?? "Erro ao excluir imagem");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
      {url ? (
        <Image
          src={url}
          alt="Imagem"
          fill
          sizes={sizes}
          className="object-cover"
          priority={false}
        />
      ) : (
        <img
          alt="Sem imagem"
          src="/placeholder.svg?height=300&width=800&text=Sem%20imagem"
          className="object-cover w-full h-full"
          style={{ position: "absolute", inset: 0 }}
        />
      )}

      {/* Canto superior direito: botão X */}
      {url && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/70 transition-colors duration-200"
              title="Excluir imagem"
            >
              ✕
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir esta imagem?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A imagem será removida do
                armazenamento e o campo correspondente será limpo no banco.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={loading}
                onClick={handleDelete}
                className="text-white"
                style={{ backgroundColor: themeColor }}
              >
                {loading ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Borda/linha inferior com cor do tema (opcional, só estética) */}
      <div
        className="absolute left-0 right-0 bottom-0 h-1"
        style={{ backgroundColor: themeColor, opacity: 0.9 }}
      />
    </div>
  );
}
