const { createDriver } = require('../../config/webdriver');
const { By } = require('selenium-webdriver');

describe('TC_LOGIN_02 - Test login with missing password', function () {
    let driver;

    // Tăng timeout lên 20 giây
    this.timeout(20000);

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('should show error when password is missing', async function () {
        // Mở trang login
        await driver.get('http://localhost:3000/auth/login');

        // Đặt kích thước cửa sổ
        await driver.manage().window().setRect({ width: 1382, height: 744 });

        // Click vào trường mật khẩu nhưng không nhập gì
        const passwordField = await driver.findElement(By.id('password'));
        await passwordField.click();

        // Click vào nút Login
        const loginButton = await driver.findElement(By.css('.login100-form-btn'));
        await loginButton.click();
    });
});
