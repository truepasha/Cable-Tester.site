/* Функція виділення рядків таблиць */
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".md-typeset table:not([class]) tr").forEach(row => {
        row.addEventListener("click", function () {
            // Перевіряємо, чи не є це рядок заголовка
            if (!this.closest('thead')) {
                this.classList.toggle("selected"); // Додаємо або прибираємо клас для css стиля
            }
        });
    });
});
