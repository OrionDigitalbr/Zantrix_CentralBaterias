// lib/supabase-errors.ts
type AnyErr = unknown;

export function handleAuthError(err: AnyErr) {
  const message =
    err && typeof err === "object" && "message" in err
      ? // @ts-expect-error
        String(err.message)
      : typeof err === "string"
      ? err
      : "Erro de autenticação";

  // Faça aqui o que deseja ao detectar erro de auth:
  // - redirecionar para login
  // - limpar sessão
  // - notificar sentry
  // - etc.
  if (process.env.NODE_ENV !== "production") {
    console.warn("handleAuthError:", message, err);
  }

  return message;
}
