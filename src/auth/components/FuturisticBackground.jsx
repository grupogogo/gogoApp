import { useEffect, useRef } from 'react';

export const FuturisticBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Detección móvil para ajustar densidad de partículas
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 38 : 75;
    const maxConnectionDistance = isMobile ? 85 : 125;

    // Mouse / Touch tracking
    const pointer = {
      x: null,
      y: null,
      radius: isMobile ? 90 : 140,
    };

    const handlePointerMove = (e) => {
      pointer.x = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      pointer.y = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : null);
    };

    const handlePointerLeave = () => {
      pointer.x = null;
      pointer.y = null;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('touchend', handlePointerLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Sistema de partículas futuristas (nodos de red cuántica / comercial)
    const colors = [
      'rgba(56, 189, 248, ',  // Cyan
      'rgba(99, 102, 241, ',  // Indigo
      'rgba(245, 158, 11, ',  // Ámbar ceremonial Gogo
      'rgba(14, 165, 233, ',  // Sky blue
    ];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.75;
        this.vy = (Math.random() - 0.5) * 0.75;
        this.baseRadius = Math.random() * 2 + 1;
        this.radius = this.baseRadius;
        this.colorBase = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.6 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.pulseAngle = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Rebote en bordes
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Pulso sutil de tamaño y brillo
        this.pulseAngle += this.pulseSpeed;
        this.radius = this.baseRadius + Math.sin(this.pulseAngle) * 0.7;

        // Interacción con puntero / touch
        if (pointer.x !== null && pointer.y !== null) {
          const dx = pointer.x - this.x;
          const dy = pointer.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < pointer.radius) {
            const force = (pointer.radius - distance) / pointer.radius;
            const angle = Math.atan2(dy, dx);
            // Efecto suave de repulsión reactiva
            this.x -= Math.cos(angle) * force * 3;
            this.y -= Math.sin(angle) * force * 3;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorBase}${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${this.colorBase}0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const particles = Array.from({ length: particleCount }, () => new Particle());

    // Animación de cuadrícula digital de fondo
    let gridOffset = 0;

    let isTabActive = true;
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      if (!isTabActive) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Dibujar cuadrícula sutil en la parte inferior (horizonte ciberespacial)
      gridOffset = (gridOffset + 0.3) % 40;
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
      ctx.lineWidth = 1;

      // Líneas verticales de perspectiva
      const gridHorizon = height * 0.45;
      const fov = width / 2;
      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(fov + (x - fov) * 0.15, gridHorizon);
        ctx.stroke();
      }

      // Líneas horizontales en movimiento hacia adelante
      for (let y = height; y > gridHorizon; y -= 24) {
        const perspectiveY = y + gridOffset * ((height - y) / (height - gridHorizon));
        if (perspectiveY <= height && perspectiveY >= gridHorizon) {
          ctx.beginPath();
          ctx.moveTo(0, perspectiveY);
          ctx.lineTo(width, perspectiveY);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Conexiones de la red cuántica / constelación
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectionDistance) {
            const connectionAlpha = (1 - dist / maxConnectionDistance) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${connectionAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Actualizar y dibujar partículas
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('touchend', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="futuristic-bg-wrapper" aria-hidden="true">
      {/* Luces volumétricas / orbes de gradiente */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      {/* Canvas interactivo */}
      <canvas ref={canvasRef} className="futuristic-canvas" />

      {/* Trama cibernética / Scanlines sutiles */}
      <div className="futuristic-scanlines" />
    </div>
  );
};
