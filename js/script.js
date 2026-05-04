// ============================================================
// script.js — Splash, Confetti, Countdown, Music, Guestbook
// ============================================================

// ===================== KONFIGURASI =====================
const PASSWORD      = 'AANKIAFOREVER!231025';
const SUPABASE_URL  = 'https://lbemglcekogtasnclkqt.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZW1nbGNla29ndGFzbmNsa3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTE1ODcsImV4cCI6MjA5MzI4NzU4N30.MqDx7ntZoAcGFngxp2xhsykO6PCCHLR08IENz3G8NmY';

// Tanggal ulang tahun
const BIRTHDAY = new Date(2026, 4, 14, 0, 0, 0); // bulan dimulai dari 0, jadi Mei = 4
// Website bisa dibuka mulai tanggal berapa (13 Mei 23:59)
const UNLOCK_DATE = new Date(2026, 4, 1, 23, 59, 0);

// ===================== CEK LOCK =====================
function checkLock() {
  const now = new Date();
  const btn = document.getElementById('splash-btn');
  const lockedMsg = document.getElementById('locked-msg');

  if (now < UNLOCK_DATE) {
    // Masih terkunci
    btn.disabled = true;
    btn.textContent = ' Belum waktunya...';
    if (lockedMsg) lockedMsg.style.display = 'block';
  } else {
    // Sudah bisa dibuka
    btn.disabled = false;
    btn.textContent = 'Buka Kejutan! ';
    if (lockedMsg) lockedMsg.style.display = 'none';
  }
}
checkLock();
// Re-cek setiap menit
setInterval(checkLock, 60000);

// ===================== BINTANG DI SPLASH =====================
const starsEl = document.getElementById('splash-stars');
if (starsEl) {
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 3 + 1;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random()*100}%;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*3+2}s;
      animation-delay:${Math.random()*3}s;
    `;
    starsEl.appendChild(s);
  }
}

// ===================== BUBBLE HERO =====================
const bubblesEl = document.getElementById('bubbles');
if (bubblesEl) {
  for (let i = 0; i < 10; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = Math.random() * 80 + 20;
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*10+8}s;
      animation-delay:${Math.random()*6}s;
    `;
    bubblesEl.appendChild(b);
  }
}

// ===================== CONFETTI =====================
const confCanvas = document.getElementById('confetti-canvas');
const confCtx    = confCanvas ? confCanvas.getContext('2d') : null;
let confPieces   = [];
let confActive   = false;
let confRAF      = null;

function resizeConfetti() {
  if (!confCanvas) return;
  confCanvas.width  = window.innerWidth;
  confCanvas.height = window.innerHeight;
}
resizeConfetti();
window.addEventListener('resize', resizeConfetti);

function launchConfetti() {
  if (!confCanvas || !confCtx) return;
  const colors = ['#6495ED','#FFB7C5','#FFD700','#98FB98','#DDA0DD','#B8D4FF','#ffffff','#00008B'];
  confPieces = [];
  for (let i = 0; i < 180; i++) {
    confPieces.push({
      x:        Math.random() * confCanvas.width,
      y:        Math.random() * confCanvas.height - confCanvas.height,
      w:        Math.random() * 10 + 5,
      h:        Math.random() * 6 + 3,
      color:    colors[Math.floor(Math.random() * colors.length)],
      vx:       Math.random() * 2 - 1,
      vy:       Math.random() * 3 + 2,
      rot:      Math.random() * 360,
      rotSpeed: Math.random() * 5 - 2.5,
      opacity:  1
    });
  }
  confActive = true;
  if (confRAF) cancelAnimationFrame(confRAF);
  animateConfetti();

  // Suara terompet
  const trumpet = document.getElementById('trumpet-sfx');
  if (trumpet) {
    trumpet.currentTime = 0;
    trumpet.play().catch(() => {});
  }
}

function animateConfetti() {
  if (!confActive || !confCtx) return;
  confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
  let alive = 0;
  confPieces.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.rot += p.rotSpeed;
    if (p.y > confCanvas.height * 0.75) p.opacity -= 0.012;
    if (p.opacity > 0) {
      alive++;
      confCtx.save();
      confCtx.globalAlpha = Math.max(0, p.opacity);
      confCtx.translate(p.x, p.y);
      confCtx.rotate(p.rot * Math.PI / 180);
      confCtx.fillStyle = p.color;
      confCtx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      confCtx.restore();
    }
  });
  if (alive > 0) confRAF = requestAnimationFrame(animateConfetti);
  else {
    confActive = false;
    confCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
  }
}

// Tombol ulang konfeti
function repeatConfetti() { launchConfetti(); }

// ===================== SPLASH =====================
function startCelebration() {
  const splash = document.getElementById('splash');
  if (!splash) return;
  splash.classList.add('hide');
  setTimeout(() => {
    splash.style.display = 'none';
    launchConfetti();
    startMusic();
  }, 800);
}

// ===================== COUNTDOWN =====================
function updateCountdown() {
  const now  = new Date();
  const diff = BIRTHDAY - now;

  const cdDisplay = document.getElementById('countdown-display');
  if (!cdDisplay) return;

  if (diff <= 0) {
    cdDisplay.innerHTML = `
      <div style="font-family:'Playfair Display',serif;font-size:clamp(1.2rem,5vw,2rem);color:var(--blue2);text-align:center;padding:1rem;">
         Selamat Ulang Tahun yang ke-18 Kiaaaa! 
      </div>`;
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);

  const pad = n => String(n).padStart(2, '0');
  document.getElementById('cd-days').textContent  = pad(days);
  document.getElementById('cd-hours').textContent = pad(hours);
  document.getElementById('cd-mins').textContent  = pad(mins);
  document.getElementById('cd-secs').textContent  = pad(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ===================== MUSIC =====================
const songs = [
  { el: document.getElementById('song1'), name: 'Aku Milikmu - Dewa 19' },
  { el: document.getElementById("song2"), name: "I'd Like to Watch You Sleeping - Sal Priadi" }
];
let currentSong = 0;
let musicPlaying = false;

function startMusic() {
  playSong(0);
}

function playSong(index) {
  songs.forEach((s, i) => {
    if (s.el) {
      s.el.pause();
      s.el.currentTime = 0;
    }
  });
  currentSong = index;
  const s = songs[currentSong];
  if (s && s.el) {
    s.el.volume = 0.5;
    s.el.play().then(() => {
      musicPlaying = true;
      updateMusicUI();
    }).catch(() => {});
  }
}

function toggleMusic() {
  const s = songs[currentSong];
  if (!s || !s.el) return;
  if (musicPlaying) {
    s.el.pause();
    musicPlaying = false;
  } else {
    s.el.play().catch(() => {});
    musicPlaying = true;
  }
  updateMusicUI();
}

function nextSong() {
  const next = (currentSong + 1) % songs.length;
  playSong(next);
}

function updateMusicUI() {
  const btn  = document.getElementById('music-toggle');
  const info = document.getElementById('music-info');
  if (btn)  btn.textContent  = musicPlaying ? '⏸' : '▶';
  if (info) info.textContent = songs[currentSong].name;
}

// ===================== PASSWORD =====================
function unlockGallery() {
  const val = document.getElementById('gallery-password').value;
  if (val === PASSWORD) {
    // Redirect ke halaman galeri terpisah
    window.location.href = 'galeri-kia.html';
  } else {
    const err = document.getElementById('gallery-error');
    err.style.display = 'block';
  }
}

function unlockLetter() {
  const val = document.getElementById('letter-password').value;
  if (val === PASSWORD) {
    // Redirect ke halaman pesan terpisah
    window.location.href = 'pesan-rahasia-kia.html';
  } else {
    const err = document.getElementById('letter-error');
    err.style.display = 'block';
  }
}

// Enter key
document.getElementById('gallery-password')?.addEventListener('keydown', e => { if(e.key==='Enter') unlockGallery(); });
document.getElementById('letter-password')?.addEventListener('keydown',  e => { if(e.key==='Enter') unlockLetter(); });

// ===================== SUPABASE GUESTBOOK =====================
async function fetchMessages() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.desc`,
      {
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    if (!res.ok) throw new Error('Fetch gagal');
    const data = await res.json();
    renderMessages(data);
  } catch (e) {
    document.getElementById('messages-list').innerHTML =
      '<p class="empty-msg">Gagal memuat ucapan. Cek koneksi kamu </p>';
  }
}

function renderMessages(data) {
  const list = document.getElementById('messages-list');
  if (!list) return;
  if (!data || data.length === 0) {
    list.innerHTML = '<p class="empty-msg">Belum ada ucapan. Jadilah yang pertama! </p>';
    return;
  }
  list.innerHTML = data.map(m => {
    const date = new Date(m.created_at).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    return `
      <div class="message-card">
        <div class="message-author">${escapeHtml(m.name)}  - Friend </div>
        <div class="message-relation">${escapeHtml(m.relation || '')}</div>
        <div class="message-text">${escapeHtml(m.message)}</div>
        <div class="message-time">${date}</div>
      </div>
    `;
  }).join('');
}

async function submitMessage() {
  const name     = document.getElementById('msg-name').value.trim();
  const relation = document.getElementById('msg-relation').value;
  const message  = document.getElementById('msg-text').value.trim();

  if (!name || !message) {
    alert('Nama dan pesan harus diisi ya! ');
    return;
  }
  if (!relation) {
    alert('Pilih dulu kamu siapanya! ');
    return;
  }

  const btn = document.querySelector('.submit-btn');
  btn.disabled    = true;
  btn.textContent = 'Mengirim... ⏳';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify({ name, relation, message })
    });

    if (!res.ok) throw new Error('Gagal kirim');

    // Reset form
    document.getElementById('msg-name').value     = '';
    document.getElementById('msg-relation').value = '';
    document.getElementById('msg-text').value     = '';

    // Refresh messages
    await fetchMessages();
    launchConfetti();

  } catch (e) {
    alert('Gagal kirim ucapan. Coba lagi ya! ');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Kirim Ucapan ';
  }
}

// Escape HTML biar aman dari XSS
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// Load ucapan saat halaman dibuka
fetchMessages();
// ============================================================
// SPLASH COUNTDOWN (terpisah dari hero countdown)
// ============================================================
function updateSplashCountdown() {
  const now  = new Date();
  const diff = BIRTHDAY - now;
  if (diff <= 0) {
    const el = document.getElementById('splash-countdown');
    if (el) el.innerHTML = '<div style="color:white;font-family:Playfair Display,serif;font-size:1.2rem">Hari ini hari spesialmu!</div>';
    return;
  }
  const pad = n => String(n).padStart(2,'0');
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);
  const d = document.getElementById('scd-days');
  const h = document.getElementById('scd-hours');
  const m = document.getElementById('scd-mins');
  const s = document.getElementById('scd-secs');
  if (d) d.textContent = pad(days);
  if (h) h.textContent = pad(hours);
  if (m) m.textContent = pad(mins);
  if (s) s.textContent = pad(secs);
}
updateSplashCountdown();
setInterval(updateSplashCountdown, 1000);

// ============================================================
// CAROUSEL FOTO DOA
// ============================================================
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dotsContainer = document.getElementById('carousel-dots');

// Buat dots
if (dotsContainer && slides.length > 0) {
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'cdot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
}

function goToSlide(index) {
  slides[currentSlide]?.classList.remove('active');
  dotsContainer?.querySelectorAll('.cdot')[currentSlide]?.classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide]?.classList.add('active');
  dotsContainer?.querySelectorAll('.cdot')[currentSlide]?.classList.add('active');
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

// Auto slide setiap 3 detik
setInterval(nextSlide, 5000);

// Swipe support carousel
let carouselStartX = 0;
const carouselTrack = document.getElementById('doa-track');
if (carouselTrack) {
  carouselTrack.addEventListener('touchstart', e => { carouselStartX = e.touches[0].clientX; }, { passive: true });
  carouselTrack.addEventListener('touchend', e => {
    const diff = carouselStartX - e.changedTouches[0].clientX;
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
  });
}

// ============================================================
// CANDLE GAME — fixed
// ============================================================
const TOTAL_CANDLES = 7;
let blownCount = 0;

function initCandles() {
  const row = document.getElementById('candles-row');
  if (!row) return;
  row.innerHTML = '';
  blownCount = 0;
  updateCandleCount();
  const win = document.getElementById('candle-win');
  if (win) win.style.display = 'none';

  for (let i = 0; i < TOTAL_CANDLES; i++) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.style.cursor = 'pointer';

    const flame = document.createElement('div');
    flame.className = 'candle-flame';
    const body  = document.createElement('div');
    body.className = 'candle-body';
    const base  = document.createElement('div');
    base.className = 'candle-base-small';

    candle.appendChild(flame);
    candle.appendChild(body);
    candle.appendChild(base);

    const blow = function() {
      if (candle.dataset.blown === '1') return;
      candle.dataset.blown = '1';

      // Matikan api via inline style langsung
      flame.style.opacity = '0';
      flame.style.transform = 'scaleY(0) translateY(-5px)';
      flame.style.transition = 'all 0.4s ease';
      flame.style.animation = 'none';
      body.style.background = 'linear-gradient(to right, #d8d8c8, #c8c8b8)';

      candle.style.transform = 'scale(0.9)';
      setTimeout(() => { candle.style.transform = 'scale(1)'; }, 200);

      blownCount++;
      updateCandleCount();

      if (blownCount === TOTAL_CANDLES) {
        setTimeout(() => {
          const w = document.getElementById('candle-win');
          if (w) w.style.display = 'block';
          launchConfetti();
        }, 600);
      }
    };

    candle.addEventListener('click', blow);
    candle.addEventListener('touchstart', function(e) {
      e.preventDefault(); blow();
    }, { passive: false });

    row.appendChild(candle);
  }
}

function updateCandleCount() {
  const el = document.getElementById('candle-count');
  if (el) el.textContent = blownCount;
}

initCandles();
