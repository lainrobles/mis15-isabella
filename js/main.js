const intro = document.getElementById('intro');
const openButton = document.getElementById('openInvitation');
const music = document.getElementById('music');
const musicToggle = document.getElementById('musicToggle');
const mainContent = document.getElementById('mainContent');

function prepareHeroLetters() {
  const title = document.querySelector('[data-animate-letters]');
  if (!title || title.dataset.prepared) return;

  const text = title.textContent.trim();
  title.textContent = '';
  [...text].forEach((character, index) => {
    const span = document.createElement('span');
    span.className = character === ' ' ? 'letter space' : 'letter';
    span.style.setProperty('--letter-index', index);
    span.textContent = character === ' ' ? '\u00a0' : character;
    title.appendChild(span);
  });
  title.dataset.prepared = 'true';
}

prepareHeroLetters();

function openInvitation() {
  intro?.classList.add('hidden');
  mainContent?.classList.add('visible');
  mainContent?.setAttribute('aria-hidden', 'false');
  musicToggle?.classList.add('visible');

  if (music) {
    music.volume = 0.4;
    music.play().catch(() => musicToggle?.classList.add('muted'));
  }

  window.setTimeout(() => intro?.remove(), 900);
}

openButton?.addEventListener('click', openInvitation);

musicToggle?.addEventListener('click', () => {
  if (!music) return;
  if (music.paused) {
    music.play().then(() => musicToggle.classList.remove('muted')).catch(() => {});
  } else {
    music.pause();
    musicToggle.classList.add('muted');
  }
});

const eventDate = new Date('2026-09-19T21:00:00-03:00').getTime();

function setFlipValue(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  const nextValue = String(value).padStart(2, '0');
  if (element.dataset.value === nextValue) return;

  element.classList.remove('is-flipping');
  element.parentElement?.classList.remove('is-turning');
  void element.offsetWidth;
  element.textContent = nextValue;
  element.dataset.value = nextValue;
  element.classList.add('is-flipping');
  element.parentElement?.classList.add('is-turning');
  window.setTimeout(() => element.parentElement?.classList.remove('is-turning'), 820);
}

function updateCountdown() {
  const countdown = document.getElementById('countdown');
  if (!countdown) return;

  const distance = eventDate - Date.now();
  if (distance <= 0) {
    countdown.innerHTML = '<h3>¡Llegó el gran día!</h3>';
    return;
  }

  setFlipValue('days', Math.floor(distance / 86400000));
  setFlipValue('hours', Math.floor((distance / 3600000) % 24));
  setFlipValue('minutes', Math.floor((distance / 60000) % 60));
  setFlipValue('seconds', Math.floor((distance / 1000) % 60));
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

document.querySelectorAll('main section').forEach((section, sectionIndex) => {
  const subtitle = section.querySelector('.section-subtitle');
  const title = section.querySelector('.section-title');
  const visual = section.querySelector('.countdown, .quote-card, .gallery-carousel, .photo-share-card, .location-card, .dress-card, .gift-card, .rsvp-text');

  subtitle?.classList.add('motion-item', sectionIndex % 2 ? 'motion-right' : 'motion-left');
  title?.classList.add('motion-item', sectionIndex % 2 ? 'motion-left' : 'motion-right');
  visual?.classList.add('motion-item', 'motion-up');
});

const motionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('motion-visible');
      motionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.motion-item').forEach((element) => motionObserver.observe(element));

const giftButton = document.getElementById('giftButton');
const bankModal = document.getElementById('bankModal');
const dressModal = document.getElementById('dressModal');
const dressExampleButton = document.getElementById('dressExampleButton');
const copyCbuButton = document.getElementById('copyCbuButton');
const copyStatus = document.getElementById('copyStatus');

giftButton?.addEventListener('click', () => bankModal?.showModal());
dressExampleButton?.addEventListener('click', () => dressModal?.showModal());

document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog')?.close());
});

document.querySelectorAll('.invitation-modal').forEach((modal) => {
  modal.addEventListener('click', (event) => {
    const bounds = modal.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) modal.close();
  });
});

copyCbuButton?.addEventListener('click', async () => {
  const cbu = document.getElementById('cbuValue')?.textContent.trim() || '';
  try {
    await navigator.clipboard.writeText(cbu);
  } catch {
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = cbu;
    temporaryInput.style.position = 'fixed';
    temporaryInput.style.opacity = '0';
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    document.execCommand('copy');
    temporaryInput.remove();
  }

  copyStatus.textContent = '¡CBU copiado!';
  copyCbuButton.textContent = 'Copiado ✓';
  window.setTimeout(() => {
    copyStatus.textContent = '';
    copyCbuButton.textContent = 'Copiar CBU';
  }, 2200);
});

const photoUploadButton = document.getElementById('photoUploadButton');
const configuredUploadUrl = photoUploadButton?.dataset.uploadUrl?.trim();
if (photoUploadButton && configuredUploadUrl) {
  photoUploadButton.href = configuredUploadUrl;
  photoUploadButton.target = '_blank';
  photoUploadButton.rel = 'noopener noreferrer';
}
photoUploadButton?.addEventListener('click', (event) => {
  if (!configuredUploadUrl) {
    event.preventDefault();
    alert('El enlace para subir las fotos estará disponible la noche del evento.');
  }
});

const carousel = document.getElementById('galleryCarousel');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.gallery-slide')];
  const dotsContainer = carousel.querySelector('.carousel-dots');
  let currentSlide = 0;
  let startX = 0;
  let autoPlay;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `carousel-dot${index === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Ver foto ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = [...dotsContainer.querySelectorAll('.carousel-dot')];

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === currentSlide));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentSlide));
  }

  function restartAutoPlay() {
    window.clearInterval(autoPlay);
    autoPlay = window.setInterval(() => showSlide(currentSlide + 1), 4800);
  }

  carousel.querySelector('.carousel-prev')?.addEventListener('click', () => { showSlide(currentSlide - 1); restartAutoPlay(); });
  carousel.querySelector('.carousel-next')?.addEventListener('click', () => { showSlide(currentSlide + 1); restartAutoPlay(); });
  carousel.addEventListener('mouseenter', () => window.clearInterval(autoPlay));
  carousel.addEventListener('mouseleave', restartAutoPlay);
  carousel.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - startX;
    if (Math.abs(distance) > 45) showSlide(currentSlide + (distance < 0 ? 1 : -1));
    restartAutoPlay();
  }, { passive: true });
  restartAutoPlay();
}

const guest = new URLSearchParams(window.location.search).get('nombre');
if (guest) {
  const subtitle = document.querySelector('.hero-subtitle');
  if (subtitle) subtitle.textContent = `Bienvenido, ${guest}`;
}

const butterflyAssets = ['butterfly1.svg', 'butterfly2.svg', 'butterfly3.svg', 'butterfly4.svg'];
const decoratedSections = document.querySelectorAll('main section, main footer');

decoratedSections.forEach((section, sectionIndex) => {
  const amount = section.matches('.gallery-section, .photo-share-section, .location-section') ? 8 : 6;

  for (let index = 0; index < amount; index += 1) {
    const wrapper = document.createElement('span');
    const butterfly = document.createElement('img');
    const side = (sectionIndex + index) % 2 ? 'right' : 'left';

    wrapper.className = `flying-butterfly ${side}${index > 3 ? ' extra' : ''}${index % 4 === 2 ? ' pink' : ''}${index === 5 ? ' blur' : ''}`;
    wrapper.style.top = `${10 + ((sectionIndex * 19 + index * 23) % 76)}%`;
    wrapper.style.setProperty('--fly-size', `${34 + ((sectionIndex + index) % 5) * 7}px`);
    wrapper.style.setProperty('--fly-opacity', `${0.38 + ((sectionIndex + index) % 4) * 0.09}`);
    wrapper.style.setProperty('--fly-duration', `${17 + ((sectionIndex * 2 + index) % 10)}s`);
    wrapper.style.setProperty('--fly-delay', `${-(sectionIndex * 2 + index * 3)}s`);

    butterfly.src = `img/butterflies/${butterflyAssets[(sectionIndex + index) % butterflyAssets.length]}`;
    butterfly.alt = '';
    butterfly.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(butterfly);
    section.appendChild(wrapper);
  }
});
