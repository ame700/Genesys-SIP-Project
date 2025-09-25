import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  ///plugins: [basicSsl()],  
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['8be3-5-107-82-168.ngrok-free.app']
  }
});
