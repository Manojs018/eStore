const fs = require('fs');
const path = require('path');
const { svg2png, initialize } = require('svg2png-wasm');

async function generateIcons() {
    try {
        await initialize(fs.readFileSync(path.join(__dirname, 'node_modules/svg2png-wasm/svg2png_wasm_bg.wasm')));

        const svgBuffer = fs.readFileSync(path.join(__dirname, 'frontend/public/logo.svg'), 'utf8');

        // Generate 192x192
        const png192 = await svg2png(svgBuffer, {
            scale: 1, // Base scale, will resize
            width: 192,
            height: 192,
        });
        fs.writeFileSync(path.join(__dirname, 'frontend/public/logo192.png'), png192);
        console.log('Generated logo192.png');

        // Generate 512x512
        const png512 = await svg2png(svgBuffer, {
            scale: 1,
            width: 512,
            height: 512,
        });
        fs.writeFileSync(path.join(__dirname, 'frontend/public/logo512.png'), png512);
        console.log('Generated logo512.png');

        // Generate favicon.ico (64x64 PNG fallback)
        const favicon = await svg2png(svgBuffer, {
            scale: 1,
            width: 64,
            height: 64,
        });
        fs.writeFileSync(path.join(__dirname, 'frontend/public/favicon.ico'), favicon);
        console.log('Generated favicon.ico');

    } catch (err) {
        console.error('Error generating icons:', err);
        process.exit(1);
    }
}

generateIcons();
