// Environment variables this repository reads. Declaring them lets code use
// dot access, satisfying both Biome's useLiteralKeys and TypeScript's
// noPropertyAccessFromIndexSignature.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly CONTINUITY_IMAGE_MODEL?: string;
      readonly OPENAI_API_KEY?: string;
    }
  }
}

export {};
