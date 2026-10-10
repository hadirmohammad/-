import confetti from 'canvas-confetti';

export function fireCelebration() {
  const colors = ['#059669', '#10B981', '#F59E0B', '#D97706', '#34D399'];

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true,
    });
  }, 200);
}
