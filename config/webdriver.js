const { Builder } = require('selenium-webdriver');

async function createDriver(browser = 'chrome') {
    return new Builder()
        .forBrowser(browser)
        .build();
}

module.exports = { createDriver };
