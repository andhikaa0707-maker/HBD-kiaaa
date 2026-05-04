// ============================================================
// music.js — Music player yang bisa dipakai di semua halaman
// ============================================================

// Inject HTML audio + player ke halaman manapun
document.addEventListener('DOMContentLoaded', function () {

  // ===================== DAFTAR LAGU =====================
  // Tambah lagu baru di sini saja — otomatis berlaku di semua halaman
  const SONGS = [
    { src: 'audio/Aku Milikmu.mp3',                      name: 'Aku Milikmu - Dewa 19' },
    { src: "audio/I'd like to watch you sleeping.mp3",   name: "I'd Like to Watch - Sal Priadi" },
    { src: "audio/Get You - Daniel Caesar.mp3",           name: "Get You - Daniel Caesar" },
    { src: "audio/Raindance - Dave.mp3",                 name: "Raindance - Dave" },
    { src: "audio/Toronto 2014 - Daniel Caesar.mp3",     name: "Toronto 2014 - Daniel Caesar" },
    // { src: 'audio/lagu-baru.mp3', name: 'Nama Lagu - Artis' }, // ← tambah lagu baru di sini
  ];

  const SFX_SRC = 'audio/25 confetti Sound effect.mp3';

  // ===================== INJECT HTML =====================
  // Buat elemen audio untuk tiap lagu
  SONGS.forEach((s, i) => {
    const audio = document.createElement('audio');
    audio.id    = `song${i}`;
    audio.src   = s.src;
    audio.loop  = true;
    audio.preload = 'auto';
    document.body.appendChild(audio);
  });

  // Buat audio sfx
  const sfx = document.createElement('audio');
  sfx.id      = 'trumpet-sfx';
  sfx.src     = SFX_SRC;
  sfx.preload = 'auto';
  document.body.appendChild(sfx);

  // Inject CSS music player kalau belum ada
  if (!document.getElementById('music-player-style')) {
    const style = document.createElement('style');
    style.id = 'music-player-style';
    style.textContent = `
      .music-player {
        position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 500;
        background: rgba(255,255,255,0.92);
        backdrop-filter: blur(10px);
        border-radius: 999px;
        padding: 0.5rem 1rem;
        display: flex; align-items: center; gap: 0.5rem;
        box-shadow: 0 4px 20px rgba(100,149,237,0.3);
        border: 1px solid rgba(100,149,237,0.2);
        font-family: 'Nunito', sans-serif;
      }
      .music-btn, .music-next, .music-repeat {
        background: none; border: none;
        font-size: 1rem; cursor: pointer;
        transition: transform 0.2s; padding: 0.2rem;
      }
      .music-btn:hover, .music-next:hover, .music-repeat:hover { transform: scale(1.2); }
      .music-info {
        font-size: 0.72rem; color: #00008B;
        font-weight: 600; max-width: 90px;
        white-space: nowrap; overflow: hidden;
        text-overflow: ellipsis;
      }
      @media (max-width: 480px) {
        .music-player { bottom: 1rem; right: 1rem; padding: 0.4rem 0.75rem; }
        .music-info { max-width: 70px; }
      }
    `;
    document.head.appendChild(style);
  }

  // Inject HTML music player
  const player = document.createElement('div');
  player.className = 'music-player';
  player.id        = 'music-player';
  player.innerHTML = `
    <button class="music-btn" id="music-toggle" onclick="toggleMusic()">
      <i class="fa-solid fa-play" style="color:#6495ED"></i>
    </button>
    <div class="music-info" id="music-info">${SONGS[0].name}</div>
    <button class="music-next" onclick="nextSong()">
      <i class="fa-solid fa-forward-step" style="color:#B37FEB"></i>
    </button>
    <button class="music-repeat" onclick="repeatConfetti()" title="Ulang Konfeti">
      <i class="fa-solid fa-wand-sparkles" style="color:#FFD700"></i>
    </button>
  `;
  document.body.appendChild(player);

  // ===================== LOGIC =====================
  let currentSong  = 0;
  let musicPlaying = false;

  window.startMusic = function () { playSong(0); };

  window.playSong = function (index) {
    SONGS.forEach((_, i) => {
      const el = document.getElementById(`song${i}`);
      if (el) { el.pause(); el.currentTime = 0; }
    });
    currentSong = index;
    const el = document.getElementById(`song${currentSong}`);
    if (el) {
      el.volume = 0.5;
      el.play().then(() => { musicPlaying = true; updateUI(); }).catch(() => {});
    }
  };

  window.toggleMusic = function () {
    const el = document.getElementById(`song${currentSong}`);
    if (!el) return;
    if (musicPlaying) { el.pause(); musicPlaying = false; }
    else { el.play().catch(() => {}); musicPlaying = true; }
    updateUI();
  };

  window.nextSong = function () {
    playSong((currentSong + 1) % SONGS.length);
  };

  // repeatConfetti dipanggil dari script.js juga, tapi di halaman lain tidak ada
  // jadi kita buat versi fallback di sini
  if (!window.repeatConfetti) {
    window.repeatConfetti = function () { /* tidak ada konfeti di halaman ini */ };
  }

  function updateUI() {
    const btn  = document.getElementById('music-toggle');
    const info = document.getElementById('music-info');
    if (btn) btn.innerHTML = musicPlaying
      ? '<i class="fa-solid fa-pause" style="color:#6495ED"></i>'
      : '<i class="fa-solid fa-play" style="color:#6495ED"></i>';
    if (info) info.textContent = SONGS[currentSong].name;
  }

  // Auto play saat halaman dibuka (di halaman selain index)
  // Di index.html, startMusic() dipanggil setelah splash
  const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
  if (!isIndex) {
    setTimeout(() => { playSong(0); }, 500);
  }
});
