import { createAdminSupabaseClient } from "@/lib/supabase-admin";

/** extrai o path relativo ao bucket a partir de uma publicURL do Supabase */
export function extractStoragePath(publicUrl: string, bucket: string) {
  const marker = `/public/${bucket}/`;
  const i = publicUrl.indexOf(marker);
  if (i >= 0) return publicUrl.slice(i + marker.length).split("?")[0];
  // fallback genérico
  const j = publicUrl.indexOf("/object/");
  return (j >= 0 ? publicUrl.slice(j + "/object/".length) : publicUrl).split("?")[0];
}

export async function deletePublicFile(bucket: string, publicUrl: string) {
  const supabase = createAdminSupabaseClient();
  const path = extractStoragePath(publicUrl, bucket);
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return path;
}

// Função para upload de imagem de produto (mantida para compatibilidade)
export async function uploadProductImage(file: File, productId: number): Promise<string> {
  const supabase = createAdminSupabaseClient();
  
  // Normaliza o nome do arquivo
  const fileName = file.name.replace(/[^\w.-]/g, "_");
  const filePath = `products/${productId}/${Date.now()}-${fileName}`;
  
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Erro no upload: ${error.message}`);
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Função para deletar imagem de produto
export async function deleteProductImage(imageId: number, imageUrl: string): Promise<void> {
  const supabase = createAdminSupabaseClient();
  
  // Extrai o path do storage da URL
  const filePath = extractStoragePath(imageUrl, "product-images");
  
  if (filePath && filePath !== imageUrl) {
    // Remove do storage
    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([filePath]);
    
    if (storageError) {
      console.warn("Erro ao remover do storage:", storageError.message);
    }
  }
  
  // Remove do banco
  const { error: dbError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  
  if (dbError) {
    throw new Error(`Erro ao remover do banco: ${dbError.message}`);
  }
}

// Função para upload de imagem de unidade (mantida para compatibilidade)
export async function uploadUnitImage(file: File, fileName: string) {
  try {
    const supabase = createAdminSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from('unit-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload da imagem da unidade:', error);
      return { url: null, error };
    }

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('unit-images')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Erro inesperado no upload da unidade:', error);
    return { url: null, error };
  }
}
