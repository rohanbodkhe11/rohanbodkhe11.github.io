import { supabase } from './supabase-client.js';

if (supabase) {
  const queries = [
    ['projects', '#project-list', renderProjects],
    ['profiles', null, renderProfile],
    ['certifications', '#certification-list', renderCards],
    ['gallery', '#gallery-list', renderGallery],
    ['experiences', '#experience-list', renderTimeline],
    ['education', null, renderEducation],
    ['skills', null, renderSkills],
    ['achievements', null, renderAchievements]
  ];
  for (const [table, selector, renderer] of queries) {
    const query = supabase.from(table).select('*');
    const { data, error } = table === 'profiles'
      ? await query.order('updated_at', { ascending: false })
      : await query.eq('published', true).order('display_order', { ascending: true });
    if (!error && data?.length) renderer(data, selector);
  }
  const contactForm = document.querySelector('#contact-form');
  contactForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.querySelector('#contact-status');
    const values = Object.fromEntries(new FormData(contactForm));
    const { error } = await supabase.from('contact_messages').insert(values);
    status.textContent = error ? 'Unable to send. Please email directly.' : 'Message sent.';
    if (!error) contactForm.reset();
  });
}

function renderProjects(projects, selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.innerHTML = projects.map(project => `<article class="card"><img class="card-media" src="${safe(project.thumbnail_url || 'images/proj_1.jpg')}" alt="${safe(project.title)}" loading="lazy"><div class="card-body"><h3><a href="${safe(project.live_url || project.github_url || '#')}">${safe(project.title)}</a></h3><p>${safe(project.short_description || '')}</p><div class="tags">${(project.technologies || []).map(technology => `<span class="tag">${safe(technology)}</span>`).join('')}</div></div></article>`).join('');
}
function renderProfile(profiles) {
  const profile = profiles[0];
  document.querySelectorAll('[data-profile-name]').forEach(element => { element.textContent = profile.name; });
  document.querySelectorAll('[data-profile-bio]').forEach(element => { element.textContent = profile.bio || ''; });
}
function renderCards(items, selector) { const target = document.querySelector(selector); if (!target) return; target.innerHTML = items.map(item => `<article class="card"><div class="card-body"><p class="eyebrow">${safe(item.organization || item.category || '')}</p><h3>${safe(item.title || item.name || '')}</h3><p>${safe(item.description || item.caption || '')}</p></div></article>`).join(''); }
function renderGallery(items, selector) { const target = document.querySelector(selector); if (!target) return; target.innerHTML = items.map(item => `<article class="card"><img class="card-media" src="${safe(item.image_url)}" alt="${safe(item.title || item.caption || 'Gallery image')}" loading="lazy"><div class="card-body"><h3>${safe(item.title || '')}</h3><p>${safe(item.caption || '')}</p></div></article>`).join(''); }
function renderTimeline(items, selector) { const target = document.querySelector(selector); if (!target) return; target.innerHTML = items.map(item => `<article class="timeline-item"><span class="date">${safe(item.start_date || '')} ${item.currently_working ? '— present' : safe(item.end_date || '')}</span><h3>${safe(item.position || item.institution || '')}</h3><p>${safe(item.description || item.degree || '')}</p></article>`).join(''); }
function renderEducation(items) { const target = document.querySelector('#journey'); if (!target || !items.length) return; }
function renderSkills(items) { document.querySelectorAll('[data-skills]').forEach(target => { target.innerHTML = items.map(item => `<span class="tag">${safe(item.name)}</span>`).join(''); }); }
function renderAchievements(items) { document.querySelectorAll('[data-achievements]').forEach(target => { target.innerHTML = items.map(item => `<article class="card"><div class="card-body"><h3>${safe(item.title)}</h3><p>${safe(item.description || '')}</p></div></article>`).join(''); }); }
function safe(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]); }
