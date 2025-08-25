(async () => {
  await customElements.whenDefined("home-assistant-main");
  await customElements.whenDefined("home-assistant-main");
  await import("./advanced-ui-cards-app.js");
})();
