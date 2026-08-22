(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  toggle.addEventListener('click', function () { var open = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
  links.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { links.classList.remove('open'); }); });
  document.getElementById('year').textContent = new Date().getFullYear();
  var navigation = document.querySelector('.site-nav');
  var progress = document.querySelector('.scroll-progress');
  window.addEventListener('scroll', function () {
    navigation.classList.toggle('scrolled', window.scrollY > 16);
    var height = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (height > 0 ? window.scrollY / height * 100 : 0) + '%';
  }, { passive: true });
  var revealItems = document.querySelectorAll('section:not(.hero) .section-head, section:not(.hero) .card, section:not(.hero) .timeline-item');
  revealItems.forEach(function (item) { item.classList.add('scroll-reveal'); });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) { entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: .12 });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else { revealItems.forEach(function (item) { item.classList.add('visible'); }); }
}());
