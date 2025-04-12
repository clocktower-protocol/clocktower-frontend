import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr'

export default defineConfig(() => {
    return {
        server: {
            port: 3000,
            host: true
        },
        build: {
            outDir: 'build',
        },
        plugins: [react(), 
            svgr({ 
                svgrOptions: {
                    exportType: 'named', // Ensure named exports like ReactComponent
                  },
                  include: '**/*.svg', // Process all SVG files
            })
        ],
    };
});