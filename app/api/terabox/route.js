import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.url) return NextResponse.json({ error: 'URL kosong' }, { status: 400 });

    const res = await fetch('https://xapiverse.com/api/terabox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xAPIverse-Key': process.env.XAPIVERSE_KEY, // <--- Kunci diambil dari Vercel, bukan dari sini
      },
      body: JSON.stringify({ url: body.url }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
