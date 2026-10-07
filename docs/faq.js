/* Accordion for the Collaboration & Applications FAQ; items toggle independently. */
(function () {
  var faq = document.getElementById('faq');
  if (!faq) return;

  faq.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
