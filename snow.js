/* ============================================================
   FROSTBLADE — snow.js
   Animated snow particle system on canvas
   ============================================================ */

(function () {
    const canvas = document.getElementById('snowCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, flakes = [], RAF;

    const CONFIG = {
        count: 130,
        colors: ['rgba(255,106,0,0.8)', 'rgba(255,150,0,0.9)', 'rgba(255,80,0,0.6)', 'rgba(200,80,0,0.7)'],
        minR: 1.2,
        maxR: 4.0,
        minSpeed: 0.4,
        maxSpeed: 1.8,
        wind: 0.25,
    };

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function randomFlake() {
        const r = CONFIG.minR + Math.random() * (CONFIG.maxR - CONFIG.minR);
        return {
            x: Math.random() * W,
            y: Math.random() * H - H,
            r,
            speed: CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed),
            drift: (Math.random() - 0.5) * 0.6,
            opacity: 0.4 + Math.random() * 0.6,
            color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.005 + Math.random() * 0.015,
        };
    }

    function init() {
        flakes = [];
        for (let i = 0; i < CONFIG.count; i++) {
            const f = randomFlake();
            f.y = Math.random() * H; // spread on load
            flakes.push(f);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (const f of flakes) {
            ctx.save();
            ctx.globalAlpha = f.opacity;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fillStyle = f.color;
            ctx.shadowColor = f.color;
            ctx.shadowBlur = f.r * 3;
            ctx.fill();
            ctx.restore();
        }
    }

    function update() {
        for (const f of flakes) {
            f.wobble += f.wobbleSpeed;
            f.x += Math.sin(f.wobble) * f.drift + CONFIG.wind;
            f.y += f.speed;

            if (f.y > H + 10) {
                Object.assign(f, randomFlake());
                f.y = -10;
                f.x = Math.random() * W;
            }
            if (f.x > W + 10) f.x = -10;
            if (f.x < -10) f.x = W + 10;
        }
    }

    function loop() {
        update();
        draw();
        RAF = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => { resize(); init(); });
    resize();
    init();
    loop();
})();
