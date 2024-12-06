const { createDriver } = require('../../config/webdriver');
const { By } = require('selenium-webdriver');

describe('TC_POST_01 - Test post creation with missing title', function () {
    let driver;

    // Tăng timeout lên 20 giây
    this.timeout(20000);

    before(async function () {
        driver = await createDriver();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('should show error when title is missing', async function () {
        // Mở trang người dùng
        await driver.get('http://localhost:3000/user');

        // Đặt kích thước cửa sổ
        await driver.manage().window().setRect({ width: 1382, height: 744 });

        // Click vào nút Skip
        const skipButton = await driver.findElement(By.linkText('Skip'));
        await skipButton.click();

        // Click vào trường tiêu đề (title) nhưng không nhập gì
        const titleField = await driver.findElement(By.name('title'));
        await titleField.click();

        // Click vào nút Post
        const postButton = await driver.findElement(By.css('.post-btn'));
        await postButton.click();

        // Kiểm tra thông báo lỗi
        const errorElement = await driver.findElement(By.css('.error-message:nth-child(2)'));
        const errorText = await errorElement.getText();

        if (errorText !== 'tiêu đề không được để trống') {
            throw new Error(`Expected error message "tiêu đề không được để trống", but found: ${errorText}`);
        }
    });
});
