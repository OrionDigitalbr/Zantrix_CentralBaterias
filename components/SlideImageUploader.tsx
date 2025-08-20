"use client";

import React, { useEffect, useRef, useState } from "react";

type Variant = "desktop" | "mobile" | "notebook";
type Props = {
  variant?: Variant;                 // rótulo pra chave do arquivo no bucket
  defaultSrc?: string;               // placeholder inicial
  onUploaded?: (url: string) => void // recebe a URL pública pra salvar no form
};

export default function SlideImageUploader({
  variant = "desktop",
  defaultSrc = "/placeholder.svg?height=300&width=800&text=Imagem Desktop",
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(defaultSrc);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [themeColor, setThemeColor] = useState<string>("#f97316");

  // pega a cor do tema do input #themeColor (tela de Configurações)
  useEffect(() => {
    const el = document.getElementById("themeColor") as HTMLInputElement | null;
    if (el?.value) setThemeColor(el.value);
    const handler = (e: Event) => {
      const val = (e.target as HTMLInputElement).value;
      setThemeColor(val);
    };
    el?.addEventListener("input", handler);
    return () => el?.removeEventListener("input", handler);
  }, []);

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // preview imediato
    const url = URL.createObjectURL(file);
    setPreview(url);

    try {
      setUploading(true);
      setProgress(0);
      
      const uploadedUrl = await uploadWithProgress("/api/admin/slides/upload", file, variant, (p) => {
        setProgress(p);
      });
      
      // substitui o preview pelo arquivo final
      setPreview(uploadedUrl);
      onUploaded?.(uploadedUrl);
    } catch (err) {
      console.error("Upload falhou:", err);
      alert("Erro no upload da imagem do slide.");
    } finally {
      // segura o overlay por um instante para percepção visual
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
      // permite reenviar mesmo arquivo
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4 border border-gray-200">
        {/* IMAGEM */}
        <img
          alt={`Imagem ${variant.charAt(0).toUpperCase() + variant.slice(1)}`}
          src={preview}
          className="object-cover w-full h-full"
          style={{ position: "absolute", inset: 0 }}
        />

        {/* OVERLAY DE PROGRESSO */}
        {uploading && (
          <div
            className="absolute inset-0 flex flex-col justify-end"
            style={{
              // leve véu por cima da imagem
              background:
                "linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.15) 30%, rgba(0,0,0,0) 60%)",
            }}
          >
            {/* percentual no centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-medium drop-shadow">
                {Math.round(progress)}%
              </span>
            </div>

            {/* barra na base */}
            <div className="w-full h-2 bg-black/25">
              <div
                className="h-2 transition-[width] duration-120 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: themeColor,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* INPUT & BUTTON */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className="flex items-center text-orange-500 hover:text-orange-600 disabled:opacity-50"
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

      <p className="text-sm text-gray-500 mt-2">
        Tamanho recomendado: {variant === "mobile" ? "375×200" : variant === "notebook" ? "1366×400" : "1920×500"} pixels
      </p>
    </div>
  );
}

/**
 * Faz upload com progresso otimista usando XHR.
 * Mantém uma barra que avança suavemente até 90% e só conclui quando o XHR terminar.
 */
function uploadWithProgress(
  url: string,
  file: File,
  variant: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    fd.append("variant", variant);

    let optimistic = 0;              // progresso otimista
    let usingOptimistic = true;      // troca para real quando tiver dados
    let rafId: number | null = null; // animação suave

    const tick = () => {
      // avança devagar até 90%
      if (usingOptimistic && optimistic < 90) {
        const step = optimistic < 30 ? 0.8 : optimistic < 60 ? 0.5 : 0.25;
        optimistic = Math.min(optimistic + step, 90);
        onProgress?.(optimistic);
        rafId = window.requestAnimationFrame(tick);
      }
    };

    // inicia a animação otimista
    rafId = window.requestAnimationFrame(tick);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && evt.total > 0) {
        usingOptimistic = false; // passamos a usar o progresso real
        const pct = (evt.loaded / evt.total) * 100;
        onProgress?.(Math.min(99, Math.max(0, pct))); // segura um pouco antes do 100
      }
    };

    xhr.onloadstart = () => {
      onProgress?.(0);
    };

    xhr.onload = () => {
      // fim: força 100%, limpa animação e resolve
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
