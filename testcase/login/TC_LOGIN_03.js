const { createDriver } = require('../../config/webdriver');
const { By } = require('selenium-webdriver');

describe('TC_LOGIN_03 - Test login with valid email and password', function () {
    let driver;

    // Tăng timeout lên 20 giây
    this.timeout(50000);

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('should login successfully with valid email and password', async function () {
        // Mở trang login
        await driver.get('http://localhost:3000/auth/login');

        // Đặt kích thước cửa sổ
        await driver.manage().window().setRect({ width: 1382, height: 744 });

        // Click vào trường email và nhập địa chỉ email hợp lệ
        const emailField = await driver.findElement(By.name('email'));
        await emailField.click();
        await emailField.sendKeys('ABC12@gmail.com');

        // Click vào trường mật khẩu và nhập mật khẩu
        const passwordField = await driver.findElement(By.id('password'));
        await passwordField.click();
        await passwordField.sendKeys('123');

        // Click vào nút Login
        const loginButton = await driver.findElement(By.css('.login100-form-btn'));
        await loginButton.click();
    });
});
