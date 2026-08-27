import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
import {defineConfig} from 'vite';

dotenv.config();

export default defineConfig(() => {
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';

  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLIC_KEY ||
    process.env.VITE_SUPABASE_KEY ||
    '';

  const telegramToken =
    process.env.VITE_TELEGRAM_BOT_TOKEN ||
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    process.env.TELEGRAM_TOKEN ||
    process.env.VITE_BOT_TOKEN ||
    '';

  const telegramChatId =
    process.env.VITE_TELEGRAM_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID ||
    process.env.CHAT_ID ||
    process.env.TELEGRAM_GROUP_ID ||
    process.env.VITE_CHAT_ID ||
    '';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.VITE_TELEGRAM_BOT_TOKEN': JSON.stringify(telegramToken),
      'import.meta.env.VITE_TELEGRAM_CHAT_ID': JSON.stringify(telegramChatId),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
