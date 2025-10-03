\
<script>
(function(){
  // Robust accordion fix v2 - works with <details>/<summary> or custom Elementor titles.
  function initAccordion(containerSelector){
    var container = document.querySelector(containerSelector);
    if(!container) return false;
    // collect details (common) or fallback to items with class .e-n-accordion-item
    var details = Array.prototype.slice.call(container.querySelectorAll('details'));

    // If no <details>, try to find items by elementor structure
    if(details.length === 0){
      var items = Array.prototype.slice.call(container.querySelectorAll('.e-n-accordion-item'));
      if(items.length === 0) return false;
      // wrap pseudo-details for these items
      details = items.map(function(item){
        // create a proxy object with .open property toggled by class 'is-open'
        return {
          _el: item,
          get open(){ return item.classList.contains('is-open') || item.getAttribute('data-open') === 'true'; },
          set open(val){ if(val){ item.classList.add('is-open'); item.setAttribute('data-open','true'); } else { item.classList.remove('is-open'); item.setAttribute('data-open','false'); } },
          addEventListener: function(evt, fn){ /* no-op for these proxies */ }
        };
      });
      // attach click handlers to titles
      items.forEach(function(item, idx){
        var title = item.querySelector('.e-n-accordion-item-title') || item.querySelector('.e-n-accordion-item-title-header') || item;
        if(title){
          title.setAttribute('role','button');
          if(!title.hasAttribute('tabindex')) title.setAttribute('tabindex','0');
          title.addEventListener('click', function(e){
            toggleByIndex(idx);
          });
          title.addEventListener('keydown', function(e){
            if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleByIndex(idx); }
          });
        }
      });
    }

    if(details.length === 0) return false;

    // helper to close others and optionally open target
    function closeOthers(target){
      details.forEach(function(other){
        if(other !== target && other.open){
          other.open = false;
          // try to dispatch toggle if real element
          if(other instanceof Element){
            try{ other.dispatchEvent(new Event('toggle',{bubbles:true})); }catch(e){} 
          }
        }
      });
    }

    // function to toggle by index (for pseudo-details)
    function toggleByIndex(idx){
      var d = details[idx];
      var willOpen = !d.open;
      d.open = willOpen;
      if(willOpen) closeOthers(d);
    }

    // For real <details>, add handlers to summary click/keydown and toggle event
    details.forEach(function(d, idx){
      if(!(d instanceof Element)) return; // skip proxies
      var summary = d.querySelector('summary') || d.querySelector('.e-n-accordion-item-title') || d.querySelector('.e-n-accordion-item-title-header');
      if(summary){
        // ensure focusable
        summary.setAttribute('role','button');
        if(!summary.hasAttribute('tabindex')) summary.setAttribute('tabindex','0');
        // click handler - try native toggle first, if not changed, force toggle
        summary.addEventListener('click', function(ev){
          // allow other handlers to run then check state
          setTimeout(function(){
            if(!d.open){
              // if still closed, open it (native prevented)
              d.open = true;
            }
            closeOthers(d);
          }, 10);
        });
        summary.addEventListener('keydown', function(ev){
          if(ev.key === 'Enter' || ev.key === ' '){
            ev.preventDefault();
            var willOpen = !d.open;
            d.open = willOpen;
            if(willOpen) closeOthers(d);
          }
        });
      } else {
        // fallback: click on detail toggles it
        d.addEventListener('click', function(){ d.open = !d.open; if(d.open) closeOthers(d); });
      }

      // when native toggle happens, close others
      try{
        d.addEventListener('toggle', function(){
          if(d.open) closeOthers(d);
        });
      }catch(e){ /* some proxies may not support this */ }
    });

    return true;
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(!initAccordion('.e-n-accordion')){
      // try a few common containers
      initAccordion('.accordion') || initAccordion('.e-n-accordion') || initAccordion('#faq-accordion');
      var obs = new MutationObserver(function(m, o){
        if(initAccordion('.e-n-accordion') || initAccordion('.accordion')) o.disconnect();
      });
      obs.observe(document.body, {childList:true, subtree:true});
    }
  });
})();
</script>
