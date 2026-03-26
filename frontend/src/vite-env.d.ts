/// <reference types="vite/client" />

declare module 'virtual:i18next-loader' {
  import type { Resource } from 'i18next'
  const resources: Resource
  export default resources
}
