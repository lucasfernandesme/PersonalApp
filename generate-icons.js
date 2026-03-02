const Jimp = require('jimp');

async function createWhiteIcon(inputPath, outputPath, size) {
    try {
        const image = await Jimp.read(inputPath);
        const background = new Jimp(size, size, '#FFFFFF');

        // Resize original to fit inside the new square if needed, or just overlay
        image.resize(size, size);

        background.composite(image, 0, 0);
        await background.writeAsync(outputPath);
        console.log(`Successfully created ${outputPath}`);
    } catch (error) {
        console.error(`Error creating ${outputPath}:`, error);
    }
}

async function main() {
    await createWhiteIcon('./public/logo.png', './public/icon-white-bg.png', 512);
    await createWhiteIcon('./public/logo.png', './public/apple-touch-icon.png', 512);
}

main();
