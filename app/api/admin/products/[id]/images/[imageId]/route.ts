import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { deletePublicFile } from "@/lib/storage";

export const runtime = "nodejs";

const BUCKET = "product-images";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;
    const supabase = createAdminSupabaseClient();
    const productId = Number(id);
    const imageIdNum = Number(imageId);

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "ID do produto inválido" }, { status: 400 });
    }

    if (!Number.isInteger(imageIdNum)) {
      return NextResponse.json({ error: "ID da imagem inválido" }, { status: 400 });
    }

    console.log('🗑️ [DELETE IMAGE] Excluindo imagem:', { productId, imageId: imageIdNum });

    // pega a URL pra remover do storage
    const { data, error: selErr } = await supabase
      .from("product_images")
      .select("id,url,is_main")
      .eq("id", imageIdNum)
      .eq("product_id", productId)
      .single();

    if (selErr || !data) {
      console.error('❌ [DELETE IMAGE] Imagem não encontrada:', selErr?.message);
      return NextResponse.json({ error: selErr?.message || "Imagem não encontrada" }, { status: 404 });
    }

    console.log('🔍 [DELETE IMAGE] Imagem encontrada:', { url: data.url, is_main: data.is_main });

    // remove do storage
    try {
      const deletedPath = await deletePublicFile(BUCKET, data.url);
      console.log('✅ [DELETE IMAGE] Arquivo removido do storage:', deletedPath);
    } catch (e: any) {
      // segue mesmo assim; às vezes a imagem já não existe no storage
      console.warn("⚠️ [DELETE IMAGE] storage:", e?.message);
    }

    // remove do banco
    const { error: delErr } = await supabase.from("product_images").delete().eq("id", imageIdNum);
    if (delErr) {
      console.error('❌ [DELETE IMAGE] Erro ao remover do banco:', delErr.message);
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    console.log('✅ [DELETE IMAGE] Imagem excluída com sucesso');
    return NextResponse.json({ ok: true });

  } catch (e: any) {
    console.error('❌ [DELETE IMAGE] Erro inesperado:', e);
    return NextResponse.json({ error: e?.message ?? "Erro ao excluir imagem" }, { status: 500 });
  }
}
