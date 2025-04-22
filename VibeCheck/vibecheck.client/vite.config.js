import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import dotenv from 'dotenv';
import net from 'net';
import { env } from 'process';

// Incarca variabilele din .env.local
const viteEnv = dotenv.config({ path: '.env.local' }).parsed || {};
const defaultPort = 54894;
const fallbackPort = parseInt(viteEnv.VITE_DEV_PORT || '54999');
// Verificam daca portul este disponibil
async function isPortAvailable(port) {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', () => resolve(false))
            .once('listening', () => tester.once('close', () => resolve(true)).close())
            .listen(port);
    });
}

const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "vibecheck.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], { stdio: 'inherit', }).status) {
        throw new Error("Could not create certificate.");
    }
}

//const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
//    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7253';

const target = 'https://localhost:7253';

export default defineConfig(async () => {
    // Verificam care port este disponibil
    const port = await isPortAvailable(defaultPort) ? defaultPort : fallbackPort;
    console.log(`Vite is starting on port: ${port}`);
    const frontendUrl = `https://localhost:${port}`;
    // Scriu in fisierul frontend-url.json din VibeCheck.Server pentru a-l putea folosi in .NET
    fs.writeFileSync('../VibeCheck.Server/frontend-url.json', JSON.stringify({ frontendUrl }, null, 2));
    return {
        plugins: [plugin()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            port,
            strictPort: true, // ocupat => crash (evitam fallback-ul automat al lui Vite)
            https: {
                key: fs.readFileSync(keyFilePath),
                cert: fs.readFileSync(certFilePath),
            },
            proxy: {
                '^/api': {
                    target,
                    changeOrigin: true,
                    secure: false,
                    rewrite: p => p.replace(/^\/api/, '')
                }
            },
            historyApiFallback: true,
        }
    }
});

