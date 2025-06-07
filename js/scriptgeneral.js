// js/scriptgeneral.js
$(function(){
  // 1) Inject the sidebar markup and initialize toggling
  $('#sidebar-container').load('/components/sidebar.html', function(){
    initSidebarAnimations();
  });

  // 2) Auto‐resize all text and number inputs to fit their content
  function autoSize(input) {
    var len = input.value.length + 1;             // content length + padding
    var ch  = Math.max(3, Math.min(len, 20));     // clamp between 3ch and 20ch

    // enforce a 80px minimum, and override any CSS min/max so our JS size takes effect
    input.style.minWidth = '80px';
    input.style.maxWidth = 'none';

    // set the width in character units
    input.style.width = ch + 'ch';
  }

  // apply autoSize on load and on every input event for both text and number fields
  $('input[type="text"], input[type="number"]').each(function(){
    autoSize(this);
  }).on('input', function(){
    autoSize(this);
  });
});

function initSidebarAnimations() {
  var $menu      = $('#menu'),
      $hamburger = $menu.find('.hamburger'),
      $links     = $menu.find('.menu-inner ul');

  // Hide links initially
  $links.hide();

  // Expand menu and show links on hover
  $menu.add($hamburger).on('mouseenter', function() {
    $menu.addClass('expanded');
    $links.stop(true,true).fadeIn(200);
  });

  // Collapse menu and hide links on mouse leave
  $menu.on('mouseleave', function() {
    $menu.removeClass('expanded');
    $links.stop(true,true).fadeOut(200);
  });
}
//skifter alle "." til "," i outputs.
function formatAllOutputsToDanish() {
  document.querySelectorAll('output').forEach(o => {
    // grab whatever was set
    let v = o.value || o.textContent;
    if (!v) return;
    // replace all dots with commas
    v = v.replace(/\./g, ',');
    // write it back
    if ('value' in o) o.value = v;
    else o.textContent = v;
  });
}

