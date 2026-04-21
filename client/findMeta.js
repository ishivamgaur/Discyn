import fs from 'fs';
import path from 'path';

function searchDirectory(dir) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                if (!['.git', 'dist', 'build', 'docs', 'test', 'tests'].includes(file)) {
                    searchDirectory(filePath);
                }
            } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('import.meta')) {
                    console.log(`Found in: ${filePath}`);
                }
            }
        }
    } catch (e) {
        // ignore errors
    }
}

searchDirectory(path.join(process.cwd(), 'node_modules'));
