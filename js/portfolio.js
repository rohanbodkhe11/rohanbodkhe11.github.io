(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  toggle.addEventListener('click', function () { var open = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
  links.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { links.classList.remove('open'); }); });
  document.getElementById('year').textContent = new Date().getFullYear();
}());
