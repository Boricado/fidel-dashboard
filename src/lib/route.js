import { NextResponse } from 'next/server';
import { getInBodyDownloadUrl } from '@/lib/dashboard-api';
import { requireAuthenticatedUser } from '@/lib/auth-server';

export async function GET(request) {
  const auth = await requireAuthenticatedUser(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Ruta de archivo no proporcionada' }, { status: 400 });
  }

  try {
    const url = await getInBodyDownloadUrl(path);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'No se pudo generar el enlace de descarga' },
      { status: 500 }
    );
  }
}