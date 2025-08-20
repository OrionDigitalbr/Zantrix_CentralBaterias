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

type Variant = "desktop" | "mobile" | "notebook";

type Props = {
  slideId?: number; // opcional no "add"; obrigatório no "edit" para excluir no DB
  column:
    | "image_pc"
    | "image_mobile"
    | "image_notebook"
    | "image_url"
    | "mobile_image_url"
    | "notebook_image_url";
  label: string;             // "Imagem para Desktop"
  recommended: string;       // "1920×500 pixels"
  value?: string | null;     // URL atual (do DB)
  onChange?: (url: string | null) => void;
  variant: Variant;
  themeColor?: string;       // cor do tema (fallback #f97316)
  placeholder?: string;      // ex: /placeholder.svg?height=300&width=800&text=Imagem Desktop
};

export default function SlideImageSlot({
  slideId,
  column,
  label,
  recommended,
  value,
  onChange,
  variant,
  themeColor = "#f97316",
  placeholder = "/placeholder.svg?height=300&width=800&text=Imagem",
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [url, setUrl] = React.useState<string | null>(value ?? null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const uploadingRef = React.useRef(false); // trava duplo clique

  // Se mudar valor vindo de fora, sincroniza
  React.useEffect(() => setUrl(value ?? null), [value]);

  // puxa cor do tema da tela de Configurações, se existir
  React.useEffect(() => {
    const el = document.getElementById("themeColor") as HTMLInputElement | null;
    if (el?.value) setTheme(el.value);
    const handler = (e: Event) => setTheme((e.target as HTMLInputElement).value);
    el?.addEventListener("input", handler);
    return () => el?.removeEventListener("input", handler);
  }, []);
  const [theme, setTheme] = React.useState(themeColor);

  function openPicker() {
    if (uploadingRef.current) return;
    inputRef.current?.click();
  }

  async function handleUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || uploadingRef.current) return;

    uploadingRef.current = true;
    setUploading(true);
    setProgress(0);

    try {
      const newUrl = await uploadWithProgress("/api/admin/slides/upload", file, variant, (p) =>
        setProgress(Math.round(p)),
      );
      setUrl(newUrl);
      onChange?.(newUrl);
    } catch (err: any) {
      console.error("Upload falhou:", err);
      alert(err?.message ?? "Erro no upload da imagem.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        uploadingRef.current = false;
      }, 500);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function confirmDelete() {
    if (!slideId && !url) {
      // sem ID ainda: apenas limpa localmente
      setUrl(null);
      onChange?.(null);
      setConfirmOpen(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/slides/image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId, column, url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao excluir imagem");

      setUrl(null);
      onChange?.(null);
    } catch (e: any) {
      console.error("Erro ao excluir:", e);
      alert(e?.message ?? "Erro ao excluir imagem");
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mb-8">
      <h3 className="text-md font-medium mb-4">{label}</h3>

      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
        {/* Imagem ou placeholder */}
        {url ? (
          <Image
            alt="Imagem"
            src={url}
            fill
            sizes="(max-width:768px) 100vw, 800px"
            className="object-cover"
          />
        ) : (
          <img
            alt="Sem imagem"
            src={placeholder}
            className="object-cover w-full h-full"
            style={{ position: "absolute", inset: 0 }}
          />
        )}

        {/* Botão X (só quando tem imagem) */}
        {url && (
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
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
                  A imagem será removida do armazenamento e o campo correspondente será limpo no banco.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="text-white"
                  style={{ backgroundColor: theme }}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* overlay de progresso */}
        {uploading && (
          <div
            className="absolute inset-0 flex flex-col justify-end"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.15) 30%, rgba(0,0,0,0) 60%)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-medium drop-shadow">
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-black/25">
              <div
                className="h-2 transition-[width] duration-120"
                style={{ width: `${progress}%`, backgroundColor: theme }}
              />
            </div>
          </div>
        )}

        {/* linha inferior estética */}
        <div
          className="absolute left-0 right-0 bottom-0 h-1"
          style={{ backgroundColor: theme, opacity: 0.9 }}
        />
      </div>

      {/* Botão + input (sem preview secundário) */}
      <div className="mt-4 flex flex-col items-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUploadChange}
        />
        <button
          type="button"
          className="flex items-center text-orange-500 hover:text-orange-600 disabled:opacity-50"
          onClick={openPicker}
          disabled={uploading}
        >
          <svg
            className="mr-1"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" x2="12" y1="3" y2="15"></line>
          </svg>
          Carregar Imagem
        </button>
        <p className="text-sm text-gray-500 mt-2">Tamanho recomendado: {recommended}</p>
      </div>
    </div>
  );
}

/* -------- helper de upload com progresso otimista -------- */
function uploadWithProgress(
  url: string,
  file: File,
  variant: Variant,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    fd.append("variant", variant);

    let optimistic = 0;
    let usingOptimistic = true;
    let rafId: number | null = null;

    const tick = () => {
      if (usingOptimistic && optimistic < 90) {
        const step = optimistic < 30 ? 0.8 : optimistic < 60 ? 0.5 : 0.25;
        optimistic = Math.min(optimistic + step, 90);
        onProgress?.(Math.round(optimistic));
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && evt.total > 0) {
        usingOptimistic = false;
        const pct = (evt.loaded / evt.total) * 100;
        onProgress?.(Math.min(99, Math.max(0, Math.round(pct))));
      }
    };

    xhr.onloadstart = () => onProgress?.(0);
    xhr.onload = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      onProgress?.(100);
      try {
        const ok = xhr.status >= 200 && xhr.status < 300;
        const json = JSON.parse(xhr.response || "{}");
        if (!ok) return reject(new Error(json?.error || "Falha no upload"));
        if (!json?.url) return reject(new Error("Rota não retornou URL"));
        resolve(json.url as string);
      } catch (e) {
        reject(e);
      }
    };
    xhr.onerror = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      reject(new Error("Erro de rede no upload"));
    };

    xhr.open("POST", url, true);
    xhr.send(fd);
  });
}
