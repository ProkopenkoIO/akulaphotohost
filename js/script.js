(function () {
  'use strict';

  const IMAGES_JSON = 'images.json';
  const IMAGES_DIR = 'images/';

  const gallery = document.getElementById('gallery');
  const emptyState = document.getElementById('empty-state');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxName = document.getElementById('lightboxName');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const copyImgBtn = document.getElementById('copyImgBtn');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const toast = document.getElementById('toast');

  let images = [];
  let currentIndex = 0;
  let toastTimer = null;

  function getBaseUrl() {
    let path = window.location.pathname;
    if (path.endsWith('/')) path = path.slice(0, -1);
    if (path.endsWith('index.html')) path = path.slice(0, -11);
    return window.location.origin + path;
  }

  function imageUrl(filename) {
    return getBaseUrl() + '/' + IMAGES_DIR + filename;
  }

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toastTimer = setTimeout(function () {
      toast.classList.add('hidden');
    }, 2000);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (_) {
        return false;
      }
    }
  }

  function renderGallery() {
    if (!images.length) {
      gallery.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    gallery.classList.remove('hidden');
    emptyState.classList.add('hidden');

    var html = '';
    for (var i = 0; i < images.length; i++) {
      var item = images[i];
      var url = imageUrl(item.filename);
      var alt = item.title || item.filename;
      html += '<div class="gallery-item" data-index="' + i + '">';
      html += '<img src="' + url + '" alt="' + escapeHtml(alt) + '" loading="lazy">';
      html += '<div class="overlay"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>';
      html += '</div>';
    }

    gallery.innerHTML = html;

    var items = gallery.querySelectorAll('.gallery-item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        openLightbox(idx);
      });
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function openLightbox(index) {
    currentIndex = index;
    var item = images[index];
    var url = imageUrl(item.filename);
    var alt = item.title || item.filename;

    lightboxImg.src = url;
    lightboxImg.alt = alt;
    lightboxName.textContent = alt;
    lightboxCounter.textContent = (index + 1) + ' / ' + images.length;

    resetCopyButtons();
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function resetCopyButtons() {
    copyImgBtn.classList.remove('copied');
    copyImgBtn.textContent = 'Копіювати <img>';
    copyUrlBtn.classList.remove('copied');
    copyUrlBtn.textContent = 'Копіювати URL';
  }

  async function copyImgTag() {
    var item = images[currentIndex];
    var url = imageUrl(item.filename);
    var tag = '<img src="' + url + '" width="860">';
    var ok = await copyToClipboard(tag);
    if (ok) {
      copyImgBtn.classList.add('copied');
      copyImgBtn.textContent = 'Скопійовано!';
      showToast('HTML-код скопійовано!');
    } else {
      showToast('Не вдалося скопіювати');
    }
  }

  async function copyUrl() {
    var item = images[currentIndex];
    var url = imageUrl(item.filename);
    var ok = await copyToClipboard(url);
    if (ok) {
      copyUrlBtn.classList.add('copied');
      copyUrlBtn.textContent = 'Скопійовано!';
      showToast('URL скопійовано!');
    } else {
      showToast('Не вдалося скопіювати');
    }
  }

  function navigate(delta) {
    var newIdx = currentIndex + delta;
    if (newIdx < 0) newIdx = images.length - 1;
    if (newIdx >= images.length) newIdx = 0;
    if (newIdx !== currentIndex) {
      openLightbox(newIdx);
    }
  }

  async function loadImages() {
    try {
      var resp = await fetch(IMAGES_JSON);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      images = Array.isArray(data) ? data : [];
    } catch (_) {
      images = [];
    }
    renderGallery();
  }

  // Events
  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-overlay')) {
      closeLightbox();
    }
  });

  copyImgBtn.addEventListener('click', copyImgTag);
  copyUrlBtn.addEventListener('click', copyUrl);

  document.addEventListener('keydown', function (e) {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
  });

  loadImages();
})();
