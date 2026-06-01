const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Configura a pasta do cache do Puppeteer para dentro do projeto
  cacheDirectory: join(__dirname, '.puppeteer-cache'),
};
