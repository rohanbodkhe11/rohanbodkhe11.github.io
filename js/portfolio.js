(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  toggle.addEventListener('click', function () { var open = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
  links.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { links.classList.remove('open'); }); });
  document.getElementById('year').textContent = new Date().getFullYear();
  var saved = JSON.parse(localStorage.getItem('rohanPortfolioProjects') || 'null');
  if (!saved || !saved.length) return;
  document.getElementById('project-list').innerHTML = saved.filter(function (project) { return project.published !== false; }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); }).map(function (project) {
    var tags = (project.technologies || '').split(',').filter(Boolean).map(function (tag) { return '<span class="tag">' + escapeHtml(tag.trim()) + '</span>'; }).join('');
    return '<article class="card"><img class="card-media" src="' + escapeHtml(project.thumbnail || 'images/proj_1.jpg') + '" alt="' + escapeHtml(project.title) + '" loading="lazy"><div class="card-body"><h3><a href="' + escapeHtml(project.url || '#') + '">' + escapeHtml(project.title) + '</a></h3><p>' + escapeHtml(project.description || '') + '</p><div class="tags">' + tags + '</div></div></article>';
  }).join('');
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (character) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]; }); }
}());
