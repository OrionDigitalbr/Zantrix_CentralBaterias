import { createAdminSupabaseClient } from './supabase'

interface NotificationData {
  user_id: string | number; // Aceitar tanto string quanto number
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export async function createNotification(data: NotificationData) {
  try {
    const supabase = createAdminSupabaseClient();
    
    // Verificar se a tabela notifications existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.warn('⚠️ [NOTIFICATIONS] Tabela notifications não encontrada, pulando criação:', tableError.message);
      return true; // Retornar true para não quebrar o fluxo
    }
    
    const { error } = await supabase.from('notifications').insert([data]);
    if (error) {
      console.error('❌ [NOTIFICATIONS] Erro ao criar notificação:', error);
      // Não lançar erro, apenas logar
      return false;
    }
    
    console.log('🔔 [NOTIFICATIONS] Notificação criada com sucesso:', data.title);
    return true;
  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Falha ao criar notificação:', error);
    // Não quebrar o fluxo principal
    return false;
  }
}