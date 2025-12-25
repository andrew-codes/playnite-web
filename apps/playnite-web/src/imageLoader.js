export default function imageLoader({ src, width, quality }) {
  // For cover-art images, serve them directly from the Express static server
  // This bypasses Next.js Image Optimization since files are mounted at runtime
  if (src.startsWith('/cover-art/')) {
    return src
  }
  
  // For other images, use default Next.js optimization
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
}
