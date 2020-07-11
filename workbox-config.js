module.exports = {
  globDirectory: "build/",
  globPatterns: ["**/*.{js,ico,css,html,txt,json}"],
  swDest: "build/sw.js",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: "StaleWhileRevalidate",
      options: {
        // Use a custom cache name.
        cacheName: "google-fonts-stylesheets",
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: "StaleWhileRevalidate",
      options: {
        // Use a custom cache name.
        cacheName: "google-fonts-stylesheets",
      },
    },
  ],
};
