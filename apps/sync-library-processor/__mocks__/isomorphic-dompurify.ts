// Mock for isomorphic-dompurify to avoid jsdom ESM issues in Jest
// In tests, we just pass through the input without sanitization
export default {
  sanitize: (input: string) => input,
}
