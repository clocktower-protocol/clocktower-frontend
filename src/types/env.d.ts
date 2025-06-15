/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUBGRAPH_URL: string
    readonly VITE_TRANSPORT1: string
    readonly VITE_TRANSPORT2: string
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv
}