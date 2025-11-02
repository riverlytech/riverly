// import { defineConfig, loadEnv, Plugin } from 'vite'
// import { tanstackStart } from '@tanstack/react-start/plugin/vite'
// import viteReact from '@vitejs/plugin-react'
// import viteTsConfigPaths from 'vite-tsconfig-paths'
// import tailwindcss from '@tailwindcss/vite'
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))

// function dbResolverPlugin(isServerless: boolean): Plugin {
//   return {
//     name: 'dbmode',
//     enforce: 'pre',
//     resolveId(source: string) {
//       if (source === '@riverly/app/db') {
//         const dbFile = isServerless ? 'db.serverless.ts' : 'db.server.ts'
//         return path.resolve(__dirname, '../../packages/app/src/db', dbFile)
//       }
//       return null
//     },
//   }
// }

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, __dirname, '') as Record<string, string | undefined>
//   const databaseServerless =
//     env.DATABASE_SERVERLESS ?? process.env.DATABASE_SERVERLESS
//   const isServerless = databaseServerless === '1'

//   return {
//     plugins: [
//       dbResolverPlugin(isServerless),
//       viteTsConfigPaths({
//         projects: ['./tsconfig.json'],
//       }),
//       tailwindcss(),
//       tanstackStart(),
//       viteReact(),
//     ],
//     optimizeDeps: {
//       exclude: ['@google-cloud/cloudbuild', '@google-cloud/storage'],
//     },
//     server: {
//       // Allow local development requests from our custom domain
//       allowedHosts: ['consolelocalweb.riverly.tech'],
//     },
//     // ssr: {
//     //   external: ['@google-cloud/cloudbuild', '@google-cloud/storage'],
//     // },
//   }
// })

import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    exclude: ['@google-cloud/cloudbuild', '@google-cloud/storage'],
  },
  server: {
    // Allow local development requests from our custom domain
    allowedHosts: ['consolelocalweb.riverly.tech'],
  },
  // ssr: {
  //   external: ['@google-cloud/cloudbuild', '@google-cloud/storage'],
  // },
})

export default config
