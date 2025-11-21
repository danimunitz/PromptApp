import { setProvider, appState, serializeToXml, importFromXml } from './state.js';
import { createToast } from './ui.js';

const fileName = 'prompt-library.xml';

export function initGoogle(config) {
  const client = google.accounts.oauth2.initTokenClient({
    client_id: config.clientId,
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    callback: (resp) => {
      if (resp.access_token) {
        setProvider('google', 'Google Drive (AppData)', resp.access_token);
        createToast('Conectado con Google');
      }
    }
  });
  return () => client.requestAccessToken();
}

export function initMicrosoft(config) {
  const msalInstance = new msal.PublicClientApplication({ auth: { clientId: config.clientId, authority: `https://login.microsoftonline.com/${config.tenant}` } });
  return async () => {
    const result = await msalInstance.loginPopup({ scopes: ['Files.ReadWrite'] });
    setProvider('microsoft', 'OneDrive', result.accessToken);
    createToast('Conectado con Microsoft 365');
  };
}

export async function syncToCloud() {
  if (!appState.accessToken || !appState.provider) {
    createToast('Conéctate a Google o Microsoft primero');
    return;
  }
  const xml = serializeToXml();
  if (appState.provider === 'google') {
    await uploadGoogle(xml);
  } else {
    await uploadMicrosoft(xml);
  }
}

export async function loadFromCloud() {
  if (!appState.accessToken || !appState.provider) {
    createToast('Conéctate a Google o Microsoft primero');
    return;
  }
  const xml = appState.provider === 'google' ? await downloadGoogle() : await downloadMicrosoft();
  if (xml) importFromXml(xml);
}

async function uploadGoogle(xml) {
  const metadata = { name: fileName, parents: ['appDataFolder'], mimeType: 'application/xml' };
  const boundary = 'promptsync';
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/xml\r\n\r\n${xml}\r\n--${boundary}--`;
  await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${appState.accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  createToast('Datos guardados en Google Drive');
}

async function downloadGoogle() {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?q=name="' + fileName + '" and trashed=false and parents in "appDataFolder"&spaces=appDataFolder&fields=files(id,name)', {
    headers: { Authorization: `Bearer ${appState.accessToken}` },
  });
  const data = await res.json();
  const file = data.files?.[0];
  if (!file) return null;
  const content = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, { headers: { Authorization: `Bearer ${appState.accessToken}` } });
  return await content.text();
}

async function uploadMicrosoft(xml) {
  const endpoint = 'https://graph.microsoft.com/v1.0/me/drive/special/approot:/prompt-library.xml:/content';
  await fetch(endpoint, { method: 'PUT', headers: { Authorization: `Bearer ${appState.accessToken}` }, body: xml });
  createToast('Datos guardados en OneDrive');
}

async function downloadMicrosoft() {
  const endpoint = 'https://graph.microsoft.com/v1.0/me/drive/special/approot:/prompt-library.xml:/content';
  const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${appState.accessToken}` } });
  if (!res.ok) return null;
  return await res.text();
}
