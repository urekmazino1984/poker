"use strict";
// Dedicated layouts: viewport narrower than 700 CSS pixels gets the phone UI.
function updateDeviceLayout(){
  const mobile=window.innerWidth<700;
  document.documentElement.classList.toggle('mobile-layout',mobile);
  document.documentElement.classList.toggle('desktop-layout',!mobile);
  const height=window.visualViewport?.height||window.innerHeight;
  document.documentElement.style.setProperty('--screen-height',height+'px');
}
updateDeviceLayout();
window.addEventListener('resize',updateDeviceLayout,{passive:true});
window.visualViewport?.addEventListener('resize',updateDeviceLayout,{passive:true});
