/**
 * script.js – Yogi Patel Portfolio
 *
 * Responsibilities:
 *  1. Typing animation for hero name
 *  2. Mobile nav toggle
 *  3. Active nav link on scroll
 *  4. Fetch GitHub repos and render Projects + Repositories sections
 *  5. Set footer year
 */

'use strict';

/* =============================================
   CONSTANTS
   ============================================= */
const GITHUB_USER   = 'justayogi';
const GITHUB_API    = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
const GITHUB_PROFILE = `https://github.com/${GITHUB_USER}`;

/* =============================================
   TYPING ANIMATION
   ============================================= */
(function initTyping() {
  const target = document.getElementById('typed-name');
  if (!target) return;

  const text  = 'Yogi Patel';
  let   index = 0;

  // Short initial delay before typing starts
  setTimeout(function type() {
    if (index < text.length) {
      target.textContent += text[index];
      index++;
      setTimeout(type, 90);
    }
  }, 400);
})();

/* =============================================
   FOOTER YEAR
   ============================================= */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* =============================================
   MOBILE NAV TOGGLE
   ============================================= */
(function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is clicked
  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* =============================================
   SCROLL-SPY – highlight active nav link
   ============================================= */
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(function (section) { observer.observe(section); });
})();

/* =============================================
   SCROLL ANIMATIONS – fade-in on viewport entry
   ============================================= */
(function initScrollReveal() {
  const cards = document.querySelectorAll('.skill-card, .learning-card');
  if (!('IntersectionObserver' in window)) return;

  // Start invisible
  cards.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  let revealIndex = 0;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = revealIndex * 80;
          revealIndex++;
          setTimeout(function () {
            entry.target.style.opacity  = '1';
            entry.target.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach(function (el) { observer.observe(el); });
})();

/* =============================================
   GITHUB API FETCH
   ============================================= */

/**
 * Fetch repos once and pass the data to both sections.
 * Handles loading, error, and success states for both.
 */
(function fetchRepos() {
  fetch(GITHUB_API)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('GitHub API error: ' + response.status);
      }
      return response.json();
    })
    .then(function (repos) {
      // Filter out forked repos for Projects; show all for Repositories
      const ownRepos = repos.filter(function (r) { return !r.fork; });

      renderProjects(ownRepos.slice(0, 6)); // Show top 6 own repos as featured
      renderRepos(repos);                   // Show all repos in the Repositories section
    })
    .catch(function (err) {
      console.error('Failed to load GitHub repos:', err);
      showError('projects');
      showError('repos');
    });
})();

/* ---- Helpers ---- */

/**
 * Toggle loading/error/content states.
 * @param {'projects'|'repos'} section
 */
function showError(section) {
  if (section === 'projects') {
    document.getElementById('projects-loading').classList.add('hidden');
    document.getElementById('projects-error').classList.remove('hidden');
  } else {
    document.getElementById('repos-loading').classList.add('hidden');
    document.getElementById('repos-error').classList.remove('hidden');
  }
}

/** Escape HTML to prevent XSS when injecting user content */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Format ISO date string to "Month Year" */
function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString(navigator.language || 'en-GB', {
    year:  'numeric',
    month: 'short',
  });
}

/* ---- Render: Projects ---- */

/**
 * Renders an array of repos as project cards.
 * @param {Array} repos
 */
function renderProjects(repos) {
  const loading = document.getElementById('projects-loading');
  const grid    = document.getElementById('projects-grid');

  loading.classList.add('hidden');

  if (!repos.length) {
    grid.innerHTML = '<p style="color:var(--text-muted)">No repositories found.</p>';
    grid.classList.remove('hidden');
    return;
  }

  const fragment = document.createDocumentFragment();

  repos.forEach(function (repo, i) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.style.animationDelay = (i * 0.06) + 's';
    card.setAttribute('aria-label', 'Project: ' + escapeHTML(repo.name));

    const description = repo.description
      ? escapeHTML(repo.description)
      : '<em style="color:var(--text-muted)">No description provided.</em>';

    const language = repo.language
      ? '<span title="Primary language">⬡ ' + escapeHTML(repo.language) + '</span>'
      : '';

    const stars = repo.stargazers_count > 0
      ? '<span title="Stars">★ ' + repo.stargazers_count + '</span>'
      : '';

    const updated = repo.updated_at
      ? '<span title="Last updated">⏱ ' + formatDate(repo.updated_at) + '</span>'
      : '';

    card.innerHTML =
      '<div class="project-card-header">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">' +
          '<path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>' +
        '</svg>' +
        '<span class="project-name">' + escapeHTML(repo.name) + '</span>' +
      '</div>' +
      '<p class="project-desc">' + description + '</p>' +
      '<div class="project-meta">' + language + stars + updated + '</div>' +
      '<div class="project-link">' +
        '<a href="' + escapeHTML(repo.html_url) + '" target="_blank" rel="noopener noreferrer">' +
          'View on GitHub &rarr;' +
        '</a>' +
      '</div>';

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
  grid.classList.remove('hidden');
}

/* ---- Render: Repositories ---- */

/**
 * Renders all repos as compact list rows.
 * @param {Array} repos
 */
function renderRepos(repos) {
  const loading = document.getElementById('repos-loading');
  const list    = document.getElementById('repos-list');

  loading.classList.add('hidden');

  if (!repos.length) {
    list.innerHTML = '<p style="color:var(--text-muted)">No repositories found.</p>';
    list.classList.remove('hidden');
    return;
  }

  const fragment = document.createDocumentFragment();

  repos.forEach(function (repo, i) {
    const row = document.createElement('div');
    row.className = 'repo-row';
    row.style.animationDelay = (i * 0.04) + 's';

    const description = repo.description
      ? escapeHTML(repo.description)
      : '';

    const language = repo.language
      ? '<span class="repo-lang">' + escapeHTML(repo.language) + '</span>'
      : '';

    row.innerHTML =
      '<div class="repo-info">' +
        '<span class="repo-name">' + escapeHTML(repo.name) + '</span>' +
        (description ? '<span class="repo-desc">' + description + '</span>' : '') +
      '</div>' +
      '<div class="repo-right">' +
        language +
        '<span class="repo-link">' +
          '<a href="' + escapeHTML(repo.html_url) + '" target="_blank" rel="noopener noreferrer">' +
            'View →' +
          '</a>' +
        '</span>' +
      '</div>';

    fragment.appendChild(row);
  });

  list.appendChild(fragment);
  list.classList.remove('hidden');
}
