/**
 * URL base de la API, leída del archivo .env (variable NG_APP_API_URL)
 * mediante @ngx-env/builder al compilar.
 * Es el único lugar del frontend donde se obtiene la dirección del backend.
 */
export const API_URL: string = import.meta.env.NG_APP_API_URL;

if (!API_URL) {
  throw new Error(
    'Falta la variable NG_APP_API_URL. Copie FrontEnd/.env.example como FrontEnd/.env y complete los valores.'
  );
}
