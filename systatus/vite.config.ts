import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { exec, spawn } from 'child_process';

export default defineConfig({
    build: { target: 'esnext' },
    base: './',
    plugins: [
	    solidPlugin(),
        {
            name: 'restart-zebar',
            closeBundle() {
                exec('taskkill /IM zebar.exe /F', () => {
                    const child = spawn('zebar.exe', ['startup'], {
                        detached: true,
                        stdio: 'ignore',
                    });
                    child.unref(); // detach from parent process completely
                    console.log('[zebar] Restarted.');
                });
            }
        }
    ],
});
