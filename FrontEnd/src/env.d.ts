/**
 * Tipos de las variables de entorno leídas del archivo .env por @ngx-env/builder.
 * Solo se exponen al código las variables con prefijo NG_APP_.
 */
declare interface Env {
  readonly NODE_ENV: string;
  /** URL base de la API del backend. */
  readonly NG_APP_API_URL: string;
}

/** Acceso a las variables: import.meta.env.NG_APP_API_URL */
declare interface ImportMeta {
  readonly env: Env;
}
