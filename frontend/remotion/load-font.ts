import { continueRender, delayRender, staticFile } from 'remotion';

interface Font {
    name: string;
    path: string;
    weights: string;
}

let loaded = false;

let fonts: Font[] = [
    {
        name: 'Montserrat',
        path: '/fonts/Montserrat.woff2',
        weights: '100 900',
    },
    {
        name: 'TheBoldFont',
        path: '/fonts/TheBoldFont.woff2',
        weights: '100 900',
    },
    {
        name: 'Komika',
        path: '/fonts/Komika.woff2',
        weights: '100 900',
    },
    {
        name: 'Bangers',
        path: '/fonts/Bangers.woff2',
        weights: '100 900',
    },
    {
        name: 'Geist',
        path: '/fonts/Geist.woff2',
        weights: '100 900',
    },
    {
        name: 'Helvetica',
        path: '/fonts/Helvetica.woff2',
        weights: '100 900',
    }
];

export const loadFonts = async (): Promise<void> => {
    if (loaded) {
        return Promise.resolve();
    }

    const waitForFonts = delayRender();

    loaded = true;

    const fontPromises = fonts.map(async (font) => {
        const fontFace = new FontFace(
            font.name,
            `url('${staticFile(font.path)}') format('woff2')`,
            { weight: font.weights }
        );

        await fontFace.load();
        document.fonts.add(fontFace);
    });

    await Promise.all(fontPromises);

    continueRender(waitForFonts);
};
