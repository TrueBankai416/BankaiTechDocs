import React, { useRef, useEffect, useState } from 'react';

// --- Simple Space Invaders Game (Python logic, emoji sprites) ---
const INVADER_ROWS = 3;
const INVADER_COLS = 8;
const INVADER_SIZE = 32;
const PLAYER_SIZE = 24;
const BULLET_SIZE = 8;
const INVADER_SPEED = 2.5;
const PLAYER_SPEED = 10;
const BULLET_SPEED = 16;
const INVADER_BULLET_SPEED = 8;

// Short, browser-supported sound effects
const shootSoundUrl = '/audio/laser.wav';
const hitSoundUrl = '/audio/explosion2.wav';
const playerHitSoundUrl = '/audio/explosion.wav';

function playSound(url: string) {
  try {
    const audio = new window.Audio(url);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch {}
}

function drawInvader(ctx, x, y) {
  ctx.save();
  ctx.font = `${INVADER_SIZE}px monospace`;
  ctx.fillText('👾', x, y);
  ctx.restore();
}

function drawPlayer(ctx, x, y) {
  ctx.save();
  ctx.font = `${PLAYER_SIZE}px monospace`;
  ctx.fillText('🚀', x, y);
  ctx.restore();
}

function drawBullet(ctx, x, y, color = '#fff') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x, y, BULLET_SIZE, BULLET_SIZE * 2);
  ctx.restore();
}

const SpaceInvaders404: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // Game objects
    let playerX = canvas.width / 2;
    let playerY = canvas.height - 120; // Move ship up so it's always visible
    let bullets: { x: number; y: number }[] = [];
    let invaderBullets: { x: number; y: number }[] = [];
    let invaders: { x: number; y: number; alive: boolean }[] = [];
    let invaderDir = 1;
    let frames = 0;
    let scoreVal = 0;
    let livesVal = 3;
    let over = false;

    // Initialize invaders
    const totalWidth = INVADER_COLS * INVADER_SIZE + (INVADER_COLS - 1) * 24;
    const startX = (canvas.width - totalWidth) / 2;
    for (let r = 0; r < INVADER_ROWS; r++) {
      for (let c = 0; c < INVADER_COLS; c++) {
        invaders.push({
          x: startX + c * (INVADER_SIZE + 24),
          y: 120 + r * (INVADER_SIZE + 24),
          alive: true,
        });
      }
    }

    const keys = {
      left: false,
      right: false,
      space: false,
    };

    let animationFrameId: number;
    function animate() {
      if (!gameActive) return;
      animationFrameId = window.requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw player
      drawPlayer(ctx, playerX, playerY);
      // Draw invaders
      invaders.forEach(i => {
        if (i.alive) drawInvader(ctx, i.x, i.y);
      });
      // Draw bullets
      bullets.forEach(b => drawBullet(ctx, b.x, b.y));
      invaderBullets.forEach(b => drawBullet(ctx, b.x, b.y, '#f00'));
      // Move player
      if (keys.left) playerX -= PLAYER_SPEED;
      if (keys.right) playerX += PLAYER_SPEED;
      playerX = Math.max(0, Math.min(canvas.width - PLAYER_SIZE, playerX));
      // Move bullets
      bullets.forEach(b => (b.y -= BULLET_SPEED));
      bullets = bullets.filter(b => b.y > 0);
      // Move invader bullets
      invaderBullets.forEach(b => (b.y += INVADER_BULLET_SPEED));
      invaderBullets = invaderBullets.filter(b => b.y < canvas.height);
      // Move invaders
      let aliveInvaders = invaders.filter(i => i.alive);
      if (aliveInvaders.length === 0) {
        setGameOver(true);
        setGameActive(false);
        over = true;
        return;
      }
      let minX = Math.min(...aliveInvaders.map(i => i.x));
      let maxX = Math.max(...aliveInvaders.map(i => i.x));
      if (minX + invaderDir * INVADER_SPEED < 0 || maxX + INVADER_SIZE + invaderDir * INVADER_SPEED > canvas.width) {
        invaderDir *= -1;
        invaders.forEach(i => (i.y += 32));
      } else {
        invaders.forEach(i => (i.x += invaderDir * INVADER_SPEED));
      }
      // Invader fire
      if (frames % 120 === 0 && aliveInvaders.length) {
        let shooters = aliveInvaders.filter(i => Math.random() < 0.03);
        shooters.forEach(i => invaderBullets.push({ x: i.x + INVADER_SIZE / 2, y: i.y + INVADER_SIZE }));
      }
      // Bullet hits
      bullets.forEach(b => {
        invaders.forEach(i => {
          if (i.alive && b.x > i.x && b.x < i.x + INVADER_SIZE && b.y > i.y && b.y < i.y + INVADER_SIZE) {
            i.alive = false;
            b.y = -100;
            scoreVal += 10;
            setScore(scoreVal);
            playSound(hitSoundUrl);
          }
        });
      });
      // Invader bullet hits
      invaderBullets.forEach(b => {
        if (
          b.x > playerX &&
          b.x < playerX + PLAYER_SIZE &&
          b.y > playerY &&
          b.y < playerY + PLAYER_SIZE
        ) {
          livesVal -= 1;
          setLives(livesVal);
          playSound(playerHitSoundUrl);
          if (livesVal === 0) {
            setGameOver(true);
            setGameActive(false);
            over = true;
          }
        }
      });
      // Invader reaches player
      if (aliveInvaders.some(i => i.y + INVADER_SIZE > playerY)) {
        setGameOver(true);
        setGameActive(false);
        over = true;
      }
      frames++;
    }
    animate();

    function handleKeyDown(e: KeyboardEvent) {
      if (over) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
      if (e.key === ' ') {
        bullets.push({ x: playerX + PLAYER_SIZE / 2, y: playerY });
        playSound(shootSoundUrl);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.body.style.overflow = '';
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [gameActive]);

  function handleRetry() {
    setGameOver(false);
    setScore(0);
    setLives(3);
    setGameActive(false);
    setTimeout(() => setGameActive(true), 10);
  }

  return (
    <div style={{ position: 'fixed', width: '100vw', height: '100vh', background: '#000', top: 0, left: 0, overflow: 'hidden', zIndex: 10 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100vw', height: '100vh', background: '#000', position: 'absolute', top: 0, left: 0 }} />
      <div style={{ position: 'fixed', left: 40, top: 20, color: '#fff', fontSize: 24, zIndex: 20 }}>Armor: {lives}</div>
      <div style={{ position: 'fixed', right: 40, top: 20, color: '#fff', fontSize: 24, zIndex: 20 }}>Score: {score}</div>
      {gameOver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#222',
              color: '#fff',
              padding: '40px 60px',
              borderRadius: 16,
              boxShadow: '0 4px 32px #000a',
              textAlign: 'center',
              minWidth: 320,
            }}
          >
            <h2 style={{ fontSize: 32, marginBottom: 24 }}>Game Over</h2>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
              <button
                onClick={handleRetry}
                style={{
                  fontSize: 20,
                  padding: '10px 32px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#4e8cff',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  fontSize: 20,
                  padding: '10px 32px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#222',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  border: '2px solid #fff',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceInvaders404;
