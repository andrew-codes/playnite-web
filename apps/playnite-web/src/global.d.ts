// global.d.ts
export {}

declare global {
  interface Window {
    __TEST__?: boolean
  }
}
