import sharp from 'sharp';

async function main() {
    try {
        const inputImagePath = './public/logo.png';
        const bg1 = './public/icon-bg.png';
        const bg2 = './public/apple-touch-icon.png';

        console.log("Creating icon-bg.png at 512x512...");
        const icon512 = await sharp(inputImagePath).resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).toBuffer();

        await sharp({
            create: {
                width: 512,
                height: 512,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
            .composite([{ input: icon512, gravity: 'center' }])
            .png()
            .toFile(bg1);

        console.log("Creating apple-touch-icon.png at 180x180...");
        const icon180 = await sharp(inputImagePath).resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).toBuffer();

        await sharp({
            create: {
                width: 180,
                height: 180,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
            .composite([{ input: icon180, gravity: 'center' }])
            .png()
            .toFile(bg2);

        console.log("Successfully generated icons.");
    } catch (error) {
        console.error("Error creating images:", error);
    }
}

main();
