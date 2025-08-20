import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createAdminSupabaseClient();
    const productId = Number(id);
    const { image_id } = await req.json();

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "ID do produto inválido" }, { status: 400 });
    }

    if (!Number.isInteger(image_id)) {
      return NextResponse.json({ error: "ID da imagem inválido" }, { status: 400 });
    }

    console.log('🔍 [SET MAIN IMAGE] Definindo imagem principal:', { productId, image_id });

    // marca escolhida como principal; o restante fica false
    const { error: upErr } = await supabase
      .from("product_images")
      .update({ is_main: false })
      .eq("product_id", productId);

    if (upErr) {
      console.error('❌ [SET MAIN IMAGE] Erro ao resetar imagens:', upErr.message);
      return NextResponse.json({ error: upErr.message }, { status: 400 });
    }

    const { error } = await supabase
      .from("product_images")
      .update({ is_main: true })
      .eq("id", image_id)
      .eq("product_id", productId);

    if (error) {
      console.error('❌ [SET MAIN IMAGE] Erro ao definir principal:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ [SET MAIN IMAGE] Imagem definida como principal com sucesso');
    return NextResponse.json({ ok: true });

  } catch (e: any) {
    console.error('❌ [SET MAIN IMAGE] Erro inesperado:', e);
    return NextResponse.json({ error: e?.message ?? "Erro ao definir imagem principal" }, { status: 500 });
  }
}
