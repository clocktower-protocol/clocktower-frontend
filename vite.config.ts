import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
//import { visualizer } from 'rollup-plugin-visualizer';

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
            }),
            /*
            visualizer({
                open: true, // Open the visualizer in your browser after build
                filename: 'build/stats.html', // Output to build directory
            }),
            */
        ],
        base: './', // Ensures relative paths for assets
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.ts',
            css: true,
            exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/e2e/**'],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'json', 'html'],
            },
        },
    };
}); 