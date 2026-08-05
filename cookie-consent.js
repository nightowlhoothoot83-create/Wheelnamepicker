(function () {
  "use strict";
  var key = "cookieConsent";

  function loadAds() {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1904958390525375";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }

  function banner() {
    var existing = document.getElementById("cookie-consent-banner");
    if (existing) return existing;
    var element = document.createElement("section");
    element.id = "cookie-consent-banner";
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-label", "Cookie preferences");
    element.style.cssText = "position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;padding:18px;border:1px solid #45405f;border-radius:14px;background:#12121e;color:#f0eeff;box-shadow:0 12px 40px rgba(0,0,0,.55);font:15px/1.5 system-ui,sans-serif";
    element.innerHTML = '<strong>Cookie choices</strong><p style="margin:7px 0 12px">We use essential storage for your preference. With permission, advertising cookies help keep these tools free. Read our <a href="/cookies.html" style="color:#00d4e8;text-decoration:underline">Cookie Policy</a>.</p><div style="display:flex;gap:9px;flex-wrap:wrap"><button type="button" data-cookie-decline style="padding:9px 14px;border-radius:8px;border:1px solid #777;background:transparent;color:inherit;cursor:pointer">Decline optional cookies</button><button type="button" data-cookie-accept style="padding:9px 14px;border:0;border-radius:8px;background:#00d4e8;color:#071116;font-weight:800;cursor:pointer">Accept optional cookies</button></div>';
    document.body.appendChild(element);
    return element;
  }

  function save(value) {
    localStorage.setItem(key, value);
    banner().style.display = "none";
    if (value === "accepted") loadAds();
  }

  function addSettingsButton() {
    if (document.getElementById("cookie-settings-button")) return;
    var button = document.createElement("button");
    button.id = "cookie-settings-button";
    button.type = "button";
    button.textContent = "Cookie settings";
    button.style.cssText = "position:fixed;z-index:99998;left:12px;bottom:12px;padding:7px 10px;border:1px solid #55506f;border-radius:8px;background:#12121e;color:#f0eeff;font:12px system-ui,sans-serif;cursor:pointer";
    button.addEventListener("click", function () { banner().style.display = "block"; });
    document.body.appendChild(button);
  }

  window.ccAccept = function () { save("accepted"); };
  window.ccDecline = function () { save("declined"); };
  window.reopenCookiePreferences = function () { banner().style.display = "block"; };

  function initialise() {
    var element = banner();
    element.addEventListener("click", function (event) {
      if (event.target.closest("[data-cookie-accept], #cc-accept")) window.ccAccept();
      if (event.target.closest("[data-cookie-decline], #cc-decline")) window.ccDecline();
    });
    var choice = localStorage.getItem(key);
    element.style.display = choice ? "none" : "block";
    if (choice === "accepted") loadAds();
    addSettingsButton();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialise);
  else initialise();
})();
