import { createHash, randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addComment, allowAction, listComments, persistent, removeComment } from '@/lib/commentStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_TEXT = 500;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'cache-control': 'no-store' } });
const uidOf = (email: string) => createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 16);
const cleanSlug = (v: string | null) => {
  const s = (v ?? '').trim();
  return s && s.length <= 200 ? s : '';
};

async function me() {
  const s = await getServerSession(authOptions);
  const email = s?.user?.email;
  if (!email) return null;
  return { uid: uidOf(email), name: (s?.user?.name || email.split('@')[0]).slice(0, 60), image: s?.user?.image ?? '' };
}

export async function GET(req: NextRequest) {
  const slug = cleanSlug(req.nextUrl.searchParams.get('slug'));
  if (!slug) return json({ error: 'bad_request', message: 'Slug tidak valid.' }, 400);
  try {
    const [comments, user] = await Promise.all([listComments(slug), me()]);
    return json({ comments, me: user?.uid ?? '', persistent });
  } catch {
    return json({ error: 'store_error', message: 'Komentar tidak dapat dimuat.' }, 502);
  }
}

export async function POST(req: NextRequest) {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'bad_request', message: 'Format tidak valid.' }, 415);
  const user = await me();
  if (!user) return json({ error: 'unauthorized', message: 'Login dulu untuk berkomentar.' }, 401);

  let body: { slug?: string; text?: string };
  try { body = await req.json(); } catch { return json({ error: 'bad_request', message: 'Format tidak valid.' }, 400); }

  const slug = cleanSlug(body.slug ?? null);
  const text = String(body.text ?? '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!slug) return json({ error: 'bad_request', message: 'Slug tidak valid.' }, 400);
  if (!text) return json({ error: 'empty', message: 'Komentar tidak boleh kosong.' }, 400);
  if (text.length > MAX_TEXT) return json({ error: 'too_long', message: `Maksimal ${MAX_TEXT} karakter.` }, 400);
  if (/https?:\/\/|www\./i.test(text)) return json({ error: 'links', message: 'Komentar tidak boleh berisi link.' }, 400);

  try {
    if (!(await allowAction(user.uid, 10))) return json({ error: 'rate_limited', message: 'Terlalu cepat, tunggu beberapa detik.' }, 429);
    const c = { id: randomUUID(), uid: user.uid, name: user.name, image: user.image, text, ts: Date.now() };
    await addComment(slug, c);
    return json({ comment: c }, 201);
  } catch {
    return json({ error: 'store_error', message: 'Komentar gagal disimpan.' }, 502);
  }
}

export async function DELETE(req: NextRequest) {
  const user = await me();
  if (!user) return json({ error: 'unauthorized', message: 'Login dulu.' }, 401);
  const slug = cleanSlug(req.nextUrl.searchParams.get('slug'));
  const id = (req.nextUrl.searchParams.get('id') ?? '').slice(0, 64);
  if (!slug || !id) return json({ error: 'bad_request', message: 'Parameter tidak valid.' }, 400);
  try {
    const ok = await removeComment(slug, id, user.uid);
    return ok ? json({ ok: true }) : json({ error: 'not_found', message: 'Komentar tidak ditemukan.' }, 404);
  } catch {
    return json({ error: 'store_error', message: 'Komentar gagal dihapus.' }, 502);
  }
}
