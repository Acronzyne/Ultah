import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DATA_FILE = path.resolve(DATA_DIR, 'surprise.json');

interface MemoryPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  dateLabel: string;
  category: 'Favorit' | 'Perjalanan' | 'Keluarga & Teman';
  featured: boolean;
  createdAt: string;
}

interface BirthdayWish {
  id: string;
  senderName: string;
  relation: string;
  message: string;
  theme: 'ivory' | 'rose' | 'ink';
  pinned: boolean;
  createdAt: string;
}

interface SurpriseProfile {
  recipientName: string;
  age: number;
  dateDisplay: string;
  heroTitle: string;
  heroIntro: string;
  heroPhotoUrl: string;
  senderName: string;
  mainLetterTitle: string;
  mainLetterBody: string;
  secretGiftTitle: string;
  secretGiftBody: string;
  musicPreset?: 'musicbox' | 'piano' | 'custom';
  musicTitle?: string;
  musicUrl?: string;
}

interface SurpriseData {
  profile: SurpriseProfile;
  photos: MemoryPhoto[];
  wishes: BirthdayWish[];
}

function getDefaultData(): SurpriseData {
  return {
    profile: {
      recipientName: 'Nadia Putri',
      age: 24,
      dateDisplay: '19 November 2026',
      heroTitle: 'Selamat Ulang Tahun, Nadia',
      heroIntro:
        'Sebuah ruang kecil untuk menyimpan tawa, potongan perjalanan, dan doa-doa hangat dari orang-orang yang selalu menyayangimu.',
      heroPhotoUrl: '/src/assets/images/hero_birthday_portrait_1795087667397.jpg',
      senderName: 'Raka & Sahabat',
      mainLetterTitle: 'Untukmu di Usia yang Baru',
      mainLetterBody:
        'Terima kasih sudah menjadi pribadi yang selalu membawa kehangatan ke mana pun kamu melangkah. Di usia 24 ini, semoga setiap rencana baik yang sedang kamu susun diam-diam menemukan jalannya dengan tenang.\n\nJangan pernah ragu merayakan hal-hal kecil dalam hidup, dan ingatlah bahwa selalu ada orang-orang yang berdiri di barisan terdepan mendukungmu.',
      secretGiftTitle: 'Kejutan Makan Malam Akhir Pekan Ini',
      secretGiftBody:
        'Satu meja khusus sudah dipesan untuk Sabtu malam pukul 19.00 di restoran taman favoritmu, lengkap dengan kue vanila dan album foto cetak yang sedang kita siapkan.',
      musicPreset: 'musicbox',
      musicTitle: 'Selamat Ulang Tahun (Kotak Musik)',
      musicUrl: '',
    },
    photos: [
      {
        id: 'photo-1',
        imageUrl: '/src/assets/images/memory_garden_dinner_1795087668054.jpg',
        caption: 'Makan malam hangat di halaman belakang bersama orang-orang terdekat',
        dateLabel: 'November 2025',
        category: 'Keluarga & Teman',
        featured: true,
        createdAt: '2026-11-18T10:00:00.000Z',
      },
      {
        id: 'photo-2',
        imageUrl: '/src/assets/images/memory_cafe_toast_1795087667705.jpg',
        caption: 'Kue kecil dan kopi sore untuk merayakan pencapaian pertamamu tahun ini',
        dateLabel: 'Juni 2026',
        category: 'Favorit',
        featured: false,
        createdAt: '2026-11-18T10:05:00.000Z',
      },
      {
        id: 'photo-3',
        imageUrl: '/src/assets/images/memory_sunset_beach_1795087668484.jpg',
        caption: 'Menunggu matahari terbenam di pesisir selatan setelah perjalanan panjang',
        dateLabel: 'Agustus 2026',
        category: 'Perjalanan',
        featured: false,
        createdAt: '2026-11-18T10:10:00.000Z',
      },
      {
        id: 'photo-4',
        imageUrl: '/src/assets/images/memory_picnic_keepsake_1795087668199.jpg',
        caption: 'Piknik tenang di taman kota dengan kamera film dan surat tulisan tangan',
        dateLabel: 'September 2026',
        category: 'Favorit',
        featured: false,
        createdAt: '2026-11-18T10:15:00.000Z',
      },
    ],
    wishes: [
      {
        id: 'wish-1',
        senderName: 'Raka Pratama',
        relation: 'Pasangan',
        message:
          'Selamat ulang tahun, Nad. Semoga hatimu selalu lapang, langkahmu selalu ringan, dan tawa ini tidak pernah hilang dari hari-harimu.',
        theme: 'rose',
        pinned: true,
        createdAt: '2026-11-19T00:01:00.000Z',
      },
      {
        id: 'wish-2',
        senderName: 'Ibu & Ayah',
        relation: 'Keluarga',
        message:
          'Sehat selalu ya Nak. Doa Ibu dan Ayah selalu menyertai setiap usaha, impian, dan perjalananmu di mana pun berada.',
        theme: 'ivory',
        pinned: true,
        createdAt: '2026-11-19T00:05:00.000Z',
      },
      {
        id: 'wish-3',
        senderName: 'Dina Maharani',
        relation: 'Sahabat Kuliah',
        message:
          'Happy 24th! Terima kasih selalu jadi pendengar terbaik sejak zaman skripsi sampai sekarang. Yuk segera atur liburan bareng lagi!',
        theme: 'ivory',
        pinned: false,
        createdAt: '2026-11-19T01:10:00.000Z',
      },
      {
        id: 'wish-4',
        senderName: 'Bagas & Tim Studio',
        relation: 'Rekan Kerja',
        message:
          'Selamat bertambah usia, Nadia! Semoga ide-ide brilianmu terus mengalir dan semua target tahun ini tercapai mulus.',
        theme: 'ink',
        pinned: false,
        createdAt: '2026-11-19T02:20:00.000Z',
      },
    ],
  };
}

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(getDefaultData(), null, 2), 'utf-8');
  }
}

function readData(): SurpriseData {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as SurpriseData;
  } catch {
    const fresh = getDefaultData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
    return fresh;
  }
}

function writeData(data: SurpriseData): void {
  ensureStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function persistImageIfDataUrl(imageInput: string): string {
  if (!imageInput.startsWith('data:image/')) {
    return imageInput;
  }
  const match = imageInput.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
  if (!match) {
    return imageInput;
  }
  ensureStorage();
  const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], 'base64');
  const filename = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

function persistAudioIfDataUrl(audioInput: string): string {
  if (!audioInput.startsWith('data:audio/')) {
    return audioInput;
  }
  const match = audioInput.match(/^data:audio\/(mpeg|mp3|wav|ogg|mp4|x-m4a|aac|webm);base64,(.+)$/i);
  if (!match) {
    return audioInput;
  }
  ensureStorage();
  const rawType = match[1].toLowerCase();
  const ext = rawType === 'mpeg' ? 'mp3' : rawType === 'x-m4a' ? 'm4a' : rawType;
  const buffer = Buffer.from(match[2], 'base64');
  const filename = `audio_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function startServer() {
  ensureStorage();
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/surprise', (_req, res) => {
    const data = readData();
    res.json(data);
  });

  app.put('/api/surprise/profile', (req, res) => {
    const data = readData();
    const body = req.body as Partial<SurpriseProfile>;
    const updatedHeroPhoto =
      typeof body.heroPhotoUrl === 'string' && body.heroPhotoUrl.trim()
        ? persistImageIfDataUrl(body.heroPhotoUrl.trim())
        : data.profile.heroPhotoUrl;

    const updatedMusicUrl =
      typeof body.musicUrl === 'string'
        ? body.musicUrl.trim()
          ? persistAudioIfDataUrl(body.musicUrl.trim())
          : ''
        : data.profile.musicUrl ?? '';

    const nextMusicPreset =
      body.musicPreset === 'piano' || body.musicPreset === 'custom' || body.musicPreset === 'musicbox'
        ? body.musicPreset
        : data.profile.musicPreset ?? 'musicbox';

    data.profile = {
      ...data.profile,
      recipientName: body.recipientName?.trim() || data.profile.recipientName,
      age:
        typeof body.age === 'number' && Number.isFinite(body.age) && body.age > 0
          ? Math.round(body.age)
          : data.profile.age,
      dateDisplay: body.dateDisplay?.trim() || data.profile.dateDisplay,
      heroTitle: body.heroTitle?.trim() || data.profile.heroTitle,
      heroIntro: body.heroIntro?.trim() || data.profile.heroIntro,
      heroPhotoUrl: updatedHeroPhoto,
      senderName: body.senderName?.trim() || data.profile.senderName,
      mainLetterTitle: body.mainLetterTitle?.trim() || data.profile.mainLetterTitle,
      mainLetterBody: body.mainLetterBody?.trim() || data.profile.mainLetterBody,
      secretGiftTitle: body.secretGiftTitle?.trim() || data.profile.secretGiftTitle,
      secretGiftBody: body.secretGiftBody?.trim() || data.profile.secretGiftBody,
      musicPreset: nextMusicPreset,
      musicTitle:
        typeof body.musicTitle === 'string' && body.musicTitle.trim()
          ? body.musicTitle.trim()
          : data.profile.musicTitle ?? 'Selamat Ulang Tahun (Kotak Musik)',
      musicUrl: updatedMusicUrl,
    };

    writeData(data);
    res.json(data);
  });

  app.post('/api/surprise/photos', (req, res) => {
    const data = readData();
    const items = Array.isArray(req.body?.items) ? req.body.items : [req.body];
    const added: MemoryPhoto[] = [];

    for (const item of items) {
      if (!item || typeof item.imageUrl !== 'string' || !item.imageUrl.trim()) {
        continue;
      }
      const savedUrl = persistImageIfDataUrl(item.imageUrl.trim());
      const category =
        item.category === 'Perjalanan' || item.category === 'Keluarga & Teman'
          ? item.category
          : 'Favorit';
      const photo: MemoryPhoto = {
        id: `photo-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        imageUrl: savedUrl,
        caption: typeof item.caption === 'string' && item.caption.trim()
          ? item.caption.trim()
          : 'Momen berharga yang diabadikan',
        dateLabel: typeof item.dateLabel === 'string' && item.dateLabel.trim()
          ? item.dateLabel.trim()
          : data.profile.dateDisplay,
        category,
        featured: Boolean(item.featured),
        createdAt: new Date().toISOString(),
      };
      data.photos.unshift(photo);
      added.push(photo);
    }

    if (added.length === 0) {
      res.status(400).json({ error: 'Tidak ada foto valid yang dikirim.' });
      return;
    }

    writeData(data);
    res.status(201).json({ added, data });
  });

  app.patch('/api/surprise/photos/:id', (req, res) => {
    const data = readData();
    const idx = data.photos.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Foto tidak ditemukan.' });
      return;
    }

    const existing = data.photos[idx];
    const body = req.body as Partial<MemoryPhoto>;
    data.photos[idx] = {
      ...existing,
      caption: typeof body.caption === 'string' ? body.caption.trim() : existing.caption,
      dateLabel: typeof body.dateLabel === 'string' ? body.dateLabel.trim() : existing.dateLabel,
      category:
        body.category === 'Favorit' ||
        body.category === 'Perjalanan' ||
        body.category === 'Keluarga & Teman'
          ? body.category
          : existing.category,
      featured: typeof body.featured === 'boolean' ? body.featured : existing.featured,
    };

    writeData(data);
    res.json(data);
  });

  app.delete('/api/surprise/photos/:id', (req, res) => {
    const data = readData();
    const target = data.photos.find((p) => p.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Foto tidak ditemukan.' });
      return;
    }

    data.photos = data.photos.filter((p) => p.id !== req.params.id);

    if (target.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(UPLOADS_DIR, path.basename(target.imageUrl));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // Ignore file unlink errors
        }
      }
    }

    writeData(data);
    res.json(data);
  });

  app.post('/api/surprise/wishes', (req, res) => {
    const data = readData();
    const body = req.body as Partial<BirthdayWish>;
    const senderName = body.senderName?.trim();
    const message = body.message?.trim();

    if (!senderName || !message) {
      res.status(400).json({ error: 'Nama pengirim dan isi ucapan wajib diisi.' });
      return;
    }

    const theme: BirthdayWish['theme'] =
      body.theme === 'rose' || body.theme === 'ink' ? body.theme : 'ivory';

    const wish: BirthdayWish = {
      id: `wish-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      senderName,
      relation: body.relation?.trim() || 'Teman',
      message,
      theme,
      pinned: Boolean(body.pinned),
      createdAt: new Date().toISOString(),
    };

    data.wishes.unshift(wish);
    writeData(data);
    res.status(201).json({ added: wish, data });
  });

  app.patch('/api/surprise/wishes/:id', (req, res) => {
    const data = readData();
    const idx = data.wishes.findIndex((w) => w.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Ucapan tidak ditemukan.' });
      return;
    }

    const existing = data.wishes[idx];
    const body = req.body as Partial<BirthdayWish>;
    data.wishes[idx] = {
      ...existing,
      senderName: typeof body.senderName === 'string' && body.senderName.trim()
        ? body.senderName.trim()
        : existing.senderName,
      relation: typeof body.relation === 'string' && body.relation.trim()
        ? body.relation.trim()
        : existing.relation,
      message: typeof body.message === 'string' && body.message.trim()
        ? body.message.trim()
        : existing.message,
      theme:
        body.theme === 'ivory' || body.theme === 'rose' || body.theme === 'ink'
          ? body.theme
          : existing.theme,
      pinned: typeof body.pinned === 'boolean' ? body.pinned : existing.pinned,
    };

    writeData(data);
    res.json(data);
  });

  app.delete('/api/surprise/wishes/:id', (req, res) => {
    const data = readData();
    data.wishes = data.wishes.filter((w) => w.id !== req.params.id);
    writeData(data);
    res.json(data);
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
