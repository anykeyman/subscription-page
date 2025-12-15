import { getBorderCharacters, table } from 'table';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function getStartMessage() {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as { version?: string };
    const version = pkg.version || 'unknown';

    return table([['Docs → https://docs.rw\nCommunity → https://t.me/remnawave']], {
        header: {
            content: `Remnawave Subscription Page v${version}`,
            alignment: 'center',
        },
        columnDefault: {
            width: 60,
        },
        columns: {
            0: { alignment: 'center' },
            1: { alignment: 'center' },
        },
        drawVerticalLine: () => false,
        border: getBorderCharacters('ramac'),
    });
}
