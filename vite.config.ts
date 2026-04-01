import { UserConfigFn } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { overrideVaadinConfig } from './vite.generated';

const customConfig: UserConfigFn = (env) => ({
  // Here you can add custom Vite parameters
  // https://vitejs.dev/config/
  plugins: [tailwindcss()],
});

export default overrideVaadinConfig(customConfig);
