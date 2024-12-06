const { createDriver } = require('../../config/webdriver');
const { By, until } = require('selenium-webdriver');

describe('TC_LOGIN_01 - Test login with missing email', function () {
    let driver;

    // Tăng timeout lên 20 giây
    this.timeout(20000);

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('should show error when email is missing', async function () {
        // Mở trang login
        await driver.get('http://localhost:3000/auth/login');

        // Đặt kích thước cửa sổ
        await driver.manage().window().setRect({ width: 1382, height: 744 });

        // Click vào trường email nhưng không nhập gì
        const emailField = await driver.findElement(By.name('email'));
        await emailField.click();

        // Click ra ngoài form login
        const formWrapper = await driver.findElement(By.css('.wrap-login100'));
        await formWrapper.click();

        // Click vào nút Login
        const loginButton = await driver.findElement(By.css('.login100-form-btn'));
        await loginButton.click();
    });
});
