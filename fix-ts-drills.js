const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

// 1. Move authOptions
const authRoutePath = 'app/api/auth/[...nextauth]/route.ts';
let authCode = fs.readFileSync(authRoutePath, 'utf8');
const authLibPath = 'lib/auth.ts';

if (authCode.includes('export const authOptions: NextAuthOptions')) {
    fs.writeFileSync(authLibPath, authCode.replace('const handler = NextAuth(authOptions)\nexport { handler as GET, handler as POST }', ''));

    let newRouteCode = `import NextAuth from "next-auth"\nimport { authOptions } from "@/lib/auth"\n\nconst handler = NextAuth(authOptions)\nexport { handler as GET, handler as POST }\n`;
    fs.writeFileSync(authRoutePath, newRouteCode);
}

// Global find/replace for authOptions import
function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            replaceInDir(p);
        } else if (p.endsWith('.ts') || p.endswith?.('.tsx') || p.endsWith('.tsx')) {
            let content = fs.readFileSync(p, 'utf8');
            if (content.includes('@/app/api/auth/[...nextauth]/route')) {
                content = content.replace(/@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route/g, '@/lib/auth');
                fs.writeFileSync(p, content);
            }
        }
    }
}
replaceInDir('app');
replaceInDir('lib');

// 2. Fix running-words
const rwPath = 'app/drills/running-words/page.tsx';
if (fs.existsSync(rwPath)) {
    let rwCode = fs.readFileSync(rwPath, 'utf8');
    if (!rwCode.includes('getRandomPassage')) {
        rwCode = rwCode.replace('import { fallbackPassage } from "@/lib/passages"', 'import { fallbackPassage } from "@/lib/passages";\nimport { getRandomPassage } from "@/lib/actions/content";');
    }
    rwCode = rwCode.replace(/fetchPassage\(/g, 'setPassage(');
    fs.writeFileSync(rwPath, rwCode);
}

// 3. Fix fixation-breaker
const fbPath = 'app/drills/fixation-breaker/page.tsx';
if (fs.existsSync(fbPath)) {
    let fbCode = fs.readFileSync(fbPath, 'utf8');
    if (!fbCode.includes('fallbackPassage')) {
        fbCode = fbCode.replace('import { getRandomPassage } from "@/lib/actions/content"', 'import { getRandomPassage } from "@/lib/actions/content";\nimport { fallbackPassage } from "@/lib/passages";');
    }
    fbCode = fbCode.replace(/selectedPassage\._id/g, '(selectedPassage as any)?._id');
    fbCode = fbCode.replace(/selectedPassage\.content/g, '(selectedPassage as any)?.content');
    fbCode = fbCode.replace(/selectedPassage\.category/g, '(selectedPassage as any)?.category');
    fs.writeFileSync(fbPath, fbCode);
}

// 4. Fix speed-sprint
const ssPath = 'app/drills/speed-sprint/page.tsx';
if (fs.existsSync(ssPath)) {
    let ssCode = fs.readFileSync(ssPath, 'utf8');
    if (!ssCode.includes('fallbackPassage')) {
        ssCode = ssCode.replace('import { getRandomPassage } from "@/lib/actions/content"', 'import { getRandomPassage } from "@/lib/actions/content";\nimport { fallbackPassage } from "@/lib/passages";');
    }
    ssCode = ssCode.replace(/selectedPassage\._id/g, '(selectedPassage as any)?._id || (selectedPassage as any)?.id');
    fs.writeFileSync(ssPath, ssCode);
}

// 5. Fix comprehension-time
const ctPath = 'app/drills/comprehension-time/page.tsx';
if (fs.existsSync(ctPath)) {
    let ctCode = fs.readFileSync(ctPath, 'utf8');
    ctCode = ctCode.replace(/selectedPassage\._id/g, '(selectedPassage as any)?._id || (selectedPassage as any)?.id');
    fs.writeFileSync(ctPath, ctCode);
}
