import { readFile } from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.pdf']);

export async function GET(_request, context) {
  try {
    const { fileName } = await context.params;
    const safeFileName = path.basename(fileName);
    const extension = path.extname(safeFileName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: 'Archivo no permitido.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'Inbody', safeFileName);
    const fileBuffer = await readFile(filePath);

    const contentType =
      extension === '.pdf'
        ? 'application/pdf'
        : extension === '.png'
          ? 'image/png'
          : 'image/jpeg';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFileName}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo descargar el archivo.';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
