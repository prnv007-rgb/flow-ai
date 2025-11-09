import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: resolve(__dirname, '../../'), // Adjust relative to your apps/web folder
  },
  output: 'standalone', // <-- MOVED IT HERE, to the top level
}
export default nextConfig