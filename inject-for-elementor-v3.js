(function(){
  // Accordion fix v3 - forces content visible and overrides inline heights set by Elementor
  function setOpenStyles(d){
    try{
      d.style.overflow = 'visible';
      d.style.height = 'auto';
      // If there's a inner role=region or content div, ensure it's visible
      var inner = d.querySelector('[role="region"], .elementor-widget-container, .content') || d;
      inner.style.display = 'block';
      inner.style.height = 'auto';
      // remove any explicit inline height on child containers that might clip content
      var children = d.querySelectorAll('[style]');
      children.forEach(function(c){
        if(c.style && c.style.height && c.style.height !== 'auto'){
          c.style.height = 'auto';
        }
      });
      // small delay to re-assert after other scripts run
      setTimeout(function(){ try{ d.style.height = 'auto'; }catch(e){} }, 50);
    }catch(e){}
  }

  function clearOpenStyles(d){
    try{
      // Do not force overflow hidden on close; allow theme to animate out
      d.style.height = '';
      d.style.overflow = '';
      var inner = d.querySelector('[role="region"], .elementor-widget-container, .content') || d;
      if(inner) inner.style.height = '';
    }catch(e){}
  }

  function initAccordion(containerSelector){
    var container = document.querySelector(containerSelector);
    if(!container) return false;
    var details = Array.prototype.slice.call(container.querySelectorAll('details'));

    // Fallback for Elementor items without <details>
    if(details.length === 0){
      var items = Array.prototype.slice.call(container.querySelectorAll('.e-n-accordion-item'));
      if(items.length === 0) return false;
      details = items.map(function(item){ return item; });
      items.forEach(function(item, idx){
        var title = item.querySelector('.e-n-accordion-item-title') || item.querySelector('.e-n-accordion-item-title-header') || item;
        if(title){
          title.setAttribute('role','button');
          if(!title.hasAttribute('tabindex')) title.setAttribute('tabindex','0');
          title.addEventListener('click', function(){ toggleByIndex(idx); });
          title.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleByIndex(idx); } });
        }
      });
    }

    if(details.length === 0) return false;

    function closeOthers(target){
      details.forEach(function(other){
        if(other !== target){
          // if it's a real <details>, close via property
          if(other instanceof Element && other.tagName && other.tagName.toLowerCase() === 'details'){
            if(other.open) other.open = false;
            clearOpenStyles(other);
          } else {
            // else manage class toggle
            try{ other.classList.remove('is-open'); other.setAttribute('data-open','false'); }catch(e){} 
          }
        }
      });
    }

    function toggleByIndex(idx){
      var d = details[idx];
      if(!d) return;
      if(d instanceof Element && d.tagName && d.tagName.toLowerCase() === 'details'){
        var willOpen = !d.open;
        d.open = willOpen;
        if(willOpen){ setOpenStyles(d); closeOthers(d); }
        else { clearOpenStyles(d); }
      } else {
        // non-details element toggle
        var isOpen = d.classList.contains('is-open') || d.getAttribute('data-open') === 'true';
        if(isOpen){ d.classList.remove('is-open'); d.setAttribute('data-open','false'); }
        else { d.classList.add('is-open'); d.setAttribute('data-open','true'); closeOthers(d); }
      }
    }

    details.forEach(function(d){
      // If real details element
      if(d instanceof Element && d.tagName && d.tagName.toLowerCase() === 'details'){
        var summary = d.querySelector('summary') || d.querySelector('.e-n-accordion-item-title') || d.querySelector('.e-n-accordion-item-title-header');
        if(summary){
          summary.setAttribute('role','button');
          if(!summary.hasAttribute('tabindex')) summary.setAttribute('tabindex','0');
          summary.addEventListener('click', function(ev){
            setTimeout(function(){
              if(d.open){ setOpenStyles(d); closeOthers(d); }
              else { clearOpenStyles(d); }
            }, 20);
          });
          summary.addEventListener('keydown', function(ev){
            if(ev.key === 'Enter' || ev.key === ' '){
              ev.preventDefault();
              var willOpen = !d.open;
              d.open = willOpen;
              if(willOpen){ setOpenStyles(d); closeOthers(d); }
              else clearOpenStyles(d);
            }
          });
        } else {
          d.addEventListener('click', function(){ d.open = !d.open; if(d.open){ setOpenStyles(d); closeOthers(d); } else clearOpenStyles(d); });
        }

        // Ensure toggle event forces styles and closes others
        try{
          d.addEventListener('toggle', function(){
            if(d.open){ setOpenStyles(d); closeOthers(d); }
            else clearOpenStyles(d);
          });
        }catch(e){}
      } else {
        // non-details elements - handled by class toggles previously attached
      }
    });

    // Observe attribute changes (height inline) and enforce auto when open
    var mo = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        var target = m.target;
        if(target instanceof Element && target.tagName && target.tagName.toLowerCase() === 'details'){
          if(target.open){
            setOpenStyles(target);
          }
        }
      });
    });
    try{ mo.observe(container, { attributes: true, subtree: true, attributeFilter:['style','class'] }); }
    catch(e){}

    return true;
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(!initAccordion('.e-n-accordion')){
      initAccordion('.accordion') || initAccordion('#faq-accordion') || initAccordion('.e-n-accordion');
      var obs = new MutationObserver(function(m, o){
        if(initAccordion('.e-n-accordion') || initAccordion('.accordion')) o.disconnect();
      });
      obs.observe(document.body, {childList:true, subtree:true});
    }

    // also force dark background to avoid white bottom bars introduced by caching plugins
    try{
      document.documentElement.style.backgroundColor = '#0f0f10';
      document.body.style.backgroundColor = '#0f0f10';
    }catch(e){}
  });
})();