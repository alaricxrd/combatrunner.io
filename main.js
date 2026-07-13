const DROPBOX_URL = 'https://www.dropbox.com/scl/fi/5ptastrqlyphzspaoqc89/CombatRunner-Setup.exe?rlkey=czcn8wjladt9cksr7j9tis2f7&st=39lhqaah&dl=0';

const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
}, { passive: true });

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

document.addEventListener('click', (e) => {
    const modal = document.getElementById('downloadModal');
    if (modal && e.target === modal) closeDownloadModal();
});

function getDropboxDownloadUrl(url) {
    if (!url) return '';
    let cleanUrl = url.trim();
    
    if (cleanUrl.includes('dl=0')) {
        cleanUrl = cleanUrl.replace('dl=0', 'dl=1');
    } 
    else if (!cleanUrl.includes('dl=1') && !cleanUrl.includes('raw=1')) {
        if (cleanUrl.includes('?')) {
            cleanUrl += '&dl=1';
        } else {
            cleanUrl += '?dl=1';
        }
    }
    return cleanUrl;
}

function startFileDownload() {
    const downloadUrl = getDropboxDownloadUrl(DROPBOX_URL);
    
    if (!downloadUrl || downloadUrl.includes('BURAYA_DROPBOX_LINKINIZI_YAPISTIRIN')) {
        alert('Please paste a valid Dropbox download link into the DROPBOX_URL variable at the top of main.js!');
        return;
    }
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
    }, 150);
}

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

function triggerDownload() {
    showToast('Download starting...');

    setTimeout(() => {
        startFileDownload();
    }, 600);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
