# PromptSync

Aplicación web ligera para gestionar prompts de IA con sincronización en la nube usando Google Drive (carpeta AppData) o Microsoft 365 (OneDrive).

## Configuración rápida
1. Descarga este proyecto como ZIP (botón **Code > Download ZIP** en GitHub) o clona el repo.
2. Publica los archivos en GitHub Pages (guía completa más abajo) o en cualquier host estático.
3. Genera credenciales OAuth para que la sincronización funcione:
   - **Google**: habilita la API de Drive, crea un OAuth Client tipo Web y autoriza el origen de tu app. Copia el `client_id` y reemplaza `CAMBIA_CLIENT_ID_GOOGLE` en `src/main.js`.
   - **Microsoft 365**: registra una app en Azure AD, permite el scope `Files.ReadWrite` y copia el `clientId`. Reemplaza `CAMBIA_CLIENT_ID_MICROSOFT` en `src/main.js` (usa `tenant` `common` para multiorg, o tu tenant ID).
4. Abre `index.html` en tu navegador o entra a la URL publicada. Desde ahí podrás iniciar sesión con Google o Microsoft y sincronizar.

## Uso
- Carga la aplicación, crea prompts con título, texto, notas y etiquetas.
- Usa el buscador y el orden personalizado (recientes, alfabético, más usados) o arrastra tarjetas para reordenar manualmente.
- Exporta/Importa un backup XML desde la sección Respaldo.
- Pulsa **Sincronizar** para subir el XML a la nube y **Cargar** para leerlo desde el proveedor conectado.

## Distribución portátil
La app es puramente estática: basta con subir `index.html` y la carpeta `src/`. No necesita servidor propio; puede alojarse en GitHub Pages o cualquier CDN estática.

## Publicar en GitHub Pages (paso a paso para principiantes)
1. **Crear cuenta**: abre [github.com](https://github.com), regístrate e inicia sesión.
2. **Nuevo repositorio**: haz clic en **New**, ponle nombre (ej. `prompt-sync`), deja visibilidad **Public** y crea el repo.
3. **Subir archivos**: en el nuevo repo, pulsa **Add file > Upload files** y arrastra el contenido de esta carpeta (`index.html`, `src/`, `README.md`). Confirma con **Commit changes**.
4. **Habilitar Pages**:
   - Entra en **Settings > Pages**.
   - En **Source**, elige **Deploy from a branch**.
   - En **Branch**, selecciona `main` y carpeta raíz `/` (o `/docs` si prefieres mover los archivos allí).
   - Guarda los cambios; GitHub mostrará la URL pública en unos segundos (ej. `https://tuusuario.github.io/prompt-sync`).
5. **Insertar credenciales**:
   - Edita `src/main.js` en GitHub (botón **pencil**). Sustituye `CAMBIA_CLIENT_ID_GOOGLE` y `CAMBIA_CLIENT_ID_MICROSOFT` por tus IDs reales.
   - Guarda con **Commit changes**. Tras el despliegue automático, la app usará esas credenciales en la URL pública.
6. **Probar**: abre la URL de GitHub Pages en modo incógnito para validar inicio de sesión, sincronización y carga/guardado de XML.

### Cómo obtener los IDs de cliente
- **Google Drive**
  1. Ve a [Google Cloud Console](https://console.cloud.google.com/), crea un proyecto y habilita la **Google Drive API**.
  2. En **Credenciales**, crea un **ID de cliente OAuth** tipo **Aplicación web**.
  3. En **Orígenes JavaScript autorizados**, añade tu URL de Pages (ej. `https://tuusuario.github.io`).
  4. Copia el `ID de cliente` y reemplázalo en `src/main.js`.

- **Microsoft 365 / OneDrive**
  1. Abre [portal.azure.com](https://portal.azure.com/) > **Azure Active Directory** > **App registrations** > **New registration**.
  2. Nombra la app y deja **Supported account types** en **Accounts in any organizational directory and personal Microsoft accounts** para uso amplio.
  3. En **Redirect URI**, elige **Web** y pon tu URL de Pages (ej. `https://tuusuario.github.io`).
  4. En **API Permissions**, añade **Microsoft Graph** > **Delegated** > `Files.ReadWrite` y concédelo con **Grant admin consent** si aplica.
  5. Copia el **Application (client) ID** y actualiza `src/main.js`. Ajusta `tenant` a `common` (multi-tenant) o tu tenant ID.

### Opción sin GitHub (solo para pruebas rápidas)
1. Descarga el ZIP y descomprímelo.
2. Edita `src/main.js` para poner tus client IDs.
3. Abre `index.html` en el navegador. Como es un sitio estático, funciona sin servidor, aunque la autorización OAuth requiere que el navegador acepte el origen (usa `http://localhost` o la URL de Pages para las redirecciones).
