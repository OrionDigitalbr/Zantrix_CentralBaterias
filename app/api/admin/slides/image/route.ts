export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/**
 * DELETE /api/admin/slides/image
 * body: { slideId: number, column: "image_pc" | "image_mobile" | "image_notebook", path?: string, url?: string }
 * - path é o caminho dentro do bucket (ex.: "slides/desktop-...jpg")
 * - se não vier path, tenta extrair de url
 */
export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json().catch(() => ({}));
    const slideId = Number(body.slideId);
    const column = String(body.column || "");
    const path = String(body.path || "");
    const url = String(body.url || "");

    if (!Number.isInteger(slideId)) {
      return NextResponse.json({ error: "slideId inválido" }, { status: 400 });
    }
    if (!["image_pc", "image_mobile", "image_notebook", "image_url", "mobile_image_url", "notebook_image_url"].includes(column)) {
      return NextResponse.json({ error: "column inválida" }, { status: 400 });
    }

    console.log('🔍 [DELETE IMAGE] Iniciando exclusão:', { slideId, column, path, url });

    const supabase = createAdminSupabaseClient();

    // 1) descobrir o storage path
    const objectPath = path || storagePathFromPublicUrl(url);
    if (!objectPath) {
      console.log('⚠️ [DELETE IMAGE] Sem path; apenas limpando coluna no banco');
      // ainda assim limpar a coluna no banco se solicitado
      const { error: upErr } = await supabase.from("slides").update({ [column]: null }).eq("id", slideId);
      if (upErr) {
        console.error('❌ [DELETE IMAGE] Erro ao limpar coluna:', upErr.message);
        return NextResponse.json({ error: upErr.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, note: "Sem path; apenas coluna limpa." });
    }

    console.log('🗑️ [DELETE IMAGE] Removendo do storage:', objectPath);

    // 2) deletar do bucket
    const { error: delErr } = await supabase.storage.from("slide-images").remove([objectPath]);
    if (delErr) {
      // se não achar o arquivo, seguimos limpando o DB mesmo assim
      console.warn("[DELETE IMAGE] Falha ao remover do storage:", delErr.message);
    } else {
      console.log('✅ [DELETE IMAGE] Arquivo removido do storage');
    }

    // 3) limpar campo da tabela
    console.log('🗑️ [DELETE IMAGE] Limpando coluna no banco:', column);
    const { error: dbErr } = await supabase.from("slides").update({ [column]: null }).eq("id", slideId);
    if (dbErr) {
      console.error('❌ [DELETE IMAGE] Erro ao limpar coluna:', dbErr.message);
      return NextResponse.json({ error: dbErr.message }, { status: 500 });
    }

    console.log('✅ [DELETE IMAGE] Coluna limpa no banco');
    return NextResponse.json({ ok: true, removed: objectPath });
  } catch (e: any) {
    console.error('❌ [DELETE IMAGE] Erro inesperado:', e);
    return NextResponse.json({ error: e?.message ?? "Erro ao deletar imagem" }, { status: 500 });
  }
};

// --- helper: converte URL pública em path do storage
function storagePathFromPublicUrl(publicUrl?: string) {
  if (!publicUrl) return "";
  // Ex.: https://PROJECT.supabase.co/storage/v1/object/public/slide-images/slides/desktop-123.jpg
  // -> queremos: "slides/desktop-123.jpg"
  try {
    const u = new URL(publicUrl);
    const parts = u.pathname.split("/object/public/slide-images/");
    if (parts.length === 2) return decodeURIComponent(parts[1]);
    // fallback para formato /object/slide-images/...
    const parts2 = u.pathname.split("/object/slide-images/");
    if (parts2.length === 2) return decodeURIComponent(parts2[1]);
    return "";
  } catch {
    return "";
  }
}
