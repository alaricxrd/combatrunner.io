/* ============================================================
   CombatRunner — main.js
   Navigation, gallery, stats counter, download modal + Discord webhook
   ============================================================ */

// ---- YAPILANDIRMA / CONFIGURATION ----
// Dropbox indirme linkinizi buraya yapıştırın.
// Linkin sonu "?dl=0" olsa bile kod bunu otomatik olarak doğrudan indirme linkine ("?dl=1") çevirecektir.
const DROPBOX_URL = 'https://www.dropbox.com/scl/fi/iwtf1y3meb5zuf4gf460k/CombatRunner-Setup.exe?rlkey=3emxmcmm60g8djwadheqhd9mt&st=yttco3ws&dl=0';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1508124047265759435/6Wpu3bRx6w-fR8myclOTpWwTJzVUvkvHh_9KpbEG5tQqqVgeOxNP_b_vSUUCyiFKjDGf';

// ---- GLOBAL GEOLOCATION STORAGE ----
let userGeoInfo = null;
let geoFetchPromise = null;

// Sayfa yüklendiğinde IP ve Konum bilgisini arka planda hemen çekmeye başla (Hız ve kararlılık için)
function prefetchGeoInfo() {
    geoFetchPromise = fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('ipapi failed');
        })
        .then(data => {
            userGeoInfo = data;
        })
        .catch(() => {
            // Birinci servis başarısız olursa hızlı yedek olarak freeipapi kullan
            return fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3000) })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('freeipapi failed');
                })
                .then(data => {
                    userGeoInfo = {
                        ip: data.ipAddress || 'Unknown',
                        city: data.cityName || '',
                        region: data.regionName || '',
                        country_name: data.countryName || 'Unknown',
                        country_code: data.countryCode || ''
                    };
                })
                .catch(() => {
                    // Tüm servisler başarısız olursa boş bilgi set et
                    userGeoInfo = { ip: 'Unknown', city: '', region: '', country_name: 'Unknown', country_code: '' };
                });
        });
}

// Sayfa yüklenir yüklenmez konum bilgisini çek
prefetchGeoInfo();

// ---- NAV SCROLL EFFECT ----
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
}, { passive: true });

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});

function closeMobile() {
    mobileMenu.classList.remove('open');
}

document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('open');
    }
});

// ---- SCREENSHOT GALLERY ----
const shots = ['oyunpp.png', 'oyunpp2.png', 'oyunpp3.png', 'oyunpp4.png'];
const activeShot = document.getElementById('activeShot');
const zoneLabel = document.getElementById('zoneLabel');
const slideCounter = document.getElementById('slideCounter');
const thumbs = document.querySelectorAll('.thumb-item');
let currentIndex = 0;

function switchShot(index) {
    currentIndex = index;
    activeShot.style.opacity = '0';
    activeShot.style.transform = 'scale(0.97)';
    setTimeout(() => {
        activeShot.src = shots[index];
        zoneLabel.textContent = thumbs[index].dataset.zone;
        if (slideCounter) slideCounter.textContent = `0${index + 1} / 04`;
        activeShot.style.opacity = '1';
        activeShot.style.transform = 'scale(1)';
    }, 220);

    thumbs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
}

function galleryNav(dir) {
    const next = (currentIndex + dir + shots.length) % shots.length;
    switchShot(next);
}

if (activeShot) {
    activeShot.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
}

// ---- STATS COUNTER ANIMATION ----
function animateCounter(el, target, suffix = '') {
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-num').forEach(el => {
                const text = el.textContent;
                const target = parseInt(text);
                if (!isNaN(target)) animateCounter(el, target, text.includes('+') ? '+' : '');
            });
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.3 });

const heroEl = document.querySelector('.hero-stats');
if (heroEl) statsObserver.observe(heroEl);

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.about-card, .feature-row').forEach((el, i) => {
    const delay = el.dataset.delay || i * 80;
    el.style.cssText += `
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms;
  `;
    revealObserver.observe(el);
});


// ---- DOWNLOAD MODAL ----
function openDownloadModal() {
    let modal = document.getElementById('downloadModal');
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDownloadModal() {
    let modal = document.getElementById('downloadModal');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

// Close on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('downloadModal');
    if (modal && e.target === modal) closeDownloadModal();
});


// ---- DISCORD WEBHOOK ----
function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Microsoft Edge';
    if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other Browser';
}

function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS') || ua.includes('Macintosh')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown OS';
}

function getHardwareInfo() {
    return {
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || 'Unknown',
        cores: navigator.hardwareConcurrency || 'N/A',
        memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'N/A'
    };
}

async function notifyDiscord() {
    const now = new Date();
    const timestamp = now.toISOString();

    // Eğer IP/konum bilgisi henüz yüklenmediyse, maksimum 1.5 saniye yüklenmesini beklemeyi dene
    if (!userGeoInfo && geoFetchPromise) {
        await Promise.race([
            geoFetchPromise,
            new Promise(resolve => setTimeout(resolve, 1500))
        ]);
    }

    let location = 'Unknown';
    let ip = 'Unknown';
    let countryFlag = '';

    if (userGeoInfo) {
        ip = userGeoInfo.ip || 'Unknown';
        const city = userGeoInfo.city || '';
        const region = userGeoInfo.region || '';
        const country = userGeoInfo.country_name || '';
        location = [city, region, country].filter(Boolean).join(', ') || 'Unknown';

        if (userGeoInfo.country_code) {
            const code = userGeoInfo.country_code.toUpperCase();
            countryFlag = String.fromCodePoint(
                ...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
            );
        }
    }

    const browserName = getBrowserName();
    const osName = getOS();
    const nowLocal = new Intl.DateTimeFormat('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(now);

    const payload = {
        username: "Download Bot",
        avatar_url: "https://i.imgur.com/pWDblua.png",
        embeds: [
            {
                title: "❄️ New Download!",
                description: "Someone just braved the storm. download initiated.",
                color: 0x0099ff, // Reference Blue
                fields: [
                    {
                        name: "🌍 Location",
                        value: `\`${location}\` ${countryFlag || ''}`,
                        inline: false
                    },
                    {
                        name: "🖥️ IP Address",
                        value: `\`${ip}\``,
                        inline: false
                    },
                    {
                        name: "⌚ Time",
                        value: `\`${nowLocal}\``,
                        inline: false
                    },
                    {
                        name: "🔗 Platform",
                        value: `\`${osName}\``,
                        inline: false
                    },
                    {
                        name: "🌐 Browser",
                        value: `\`${browserName}\``,
                        inline: false
                    }
                ],
                footer: {
                    text: "anan oc knk",
                    icon_url: "https://i.imgur.com/pWDblua.png"
                },
                timestamp: timestamp
            }
        ]
    };

    try {
        // keepalive: true sayesinde tarayıcı indirme yapsa veya sekme kapansa bile istek arka planda tamamlanır.
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        });
    } catch (_) { /* silent */ }
}

// Dropbox linkini otomatik olarak doğrudan indirme linkine çeviren yardımcı fonksiyon
function getDropboxDownloadUrl(url) {
    if (!url) return '';
    let cleanUrl = url.trim();
    
    // dl=0 varsa bunu dl=1 ile değiştir
    if (cleanUrl.includes('dl=0')) {
        cleanUrl = cleanUrl.replace('dl=0', 'dl=1');
    } 
    // Eğer dl=1 veya raw=1 yoksa, linkin sonuna dl=1 ekle
    else if (!cleanUrl.includes('dl=1') && !cleanUrl.includes('raw=1')) {
        if (cleanUrl.includes('?')) {
            cleanUrl += '&dl=1';
        } else {
            cleanUrl += '?dl=1';
        }
    }
    return cleanUrl;
}

// ---- START ACTUAL FILE DOWNLOAD ----
function startFileDownload() {
    const downloadUrl = getDropboxDownloadUrl(DROPBOX_URL);
    
    // Kullanıcı linki değiştirmemişse uyar
    if (!downloadUrl || downloadUrl.includes('BURAYA_DROPBOX_LINKINIZI_YAPISTIRIN')) {
        alert('Lütfen main.js dosyasının en üstündeki DROPBOX_URL değişkenine geçerli bir Dropbox indirme linki yapıştırın!');
        return;
    }
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank'; // Yeni sekmede açarak indirmeyi tetikler (sayfayı bozmaz/kapatmaz)
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 150);
}

// ---- TOAST SYSTEM ----
// (Not: Yukarıdaki mükerrer tanım yerine tek bir temiz Toast fonksiyonu kullanıyoruz)
function showToast(msg) {
    const toast = document.getElementById('downloadToast');
    const span = toast ? toast.querySelector('span') : null;
    if (!toast || !span) return;

    span.textContent = msg;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ---- TRIGGER DOWNLOAD (main entry point) ----
async function triggerDownload() {
    showToast('Download starting...');

    // Webhook gönderimini başlat (arkaplanda)
    notifyDiscord();

    // İndirmeyi başlat
    setTimeout(() => {
        startFileDownload();
    }, 600);
}

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
