/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEOAPIFY_API_KEY: string,
  readonly VITE_LAN_HOST_IP: string,
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
