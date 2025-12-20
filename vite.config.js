import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { resolve } from 'path'
export default defineConfig({
    base: '/threejsportfolio/', 
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                access_denied: resolve(__dirname, 'access_denied.html'),
                unimplemented: resolve(__dirname, 'unimplemented.html')
            }
        }
    },
    plugins: [
        tailwindcss(),
    ]
})