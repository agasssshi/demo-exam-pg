document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (!user) return;

    setupLogoutButton();
    document.getElementById('userName').textContent = 'Привет, ' + user.full_name;

    // Слайдер
    let currentSlide = 0;
    const slides = document.querySelector('.slides');
    const totalSlides = slides ? slides.children.length : 0;
    if (slides) {
        document.querySelector('.prev').addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            slides.style.transform = `translateX(-${currentSlide * 100}%)`;
        });
        document.querySelector('.next').addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            slides.style.transform = `translateX(-${currentSlide * 100}%)`;
        });
        // Автоматическая прокрутка каждые 3 секунды
        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            slides.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 3000);
    }

    // Загрузка бронирований
    async function loadBookings() {
        const resp = await fetch('/api/bookings');
        const bookings = await resp.json();
        const container = document.getElementById('bookingsList');
        if (bookings.length === 0) {
            container.innerHTML = '<p>У вас пока нет заявок. <a href="/new-booking.html">Создать заявку</a></p>';
            return;
        }
        let html = '<table><thead><tr><th>Помещение</th><th>Дата начала</th><th>Способ оплаты</th><th>Статус</th><th>Отзыв</th><th>Действия</th></tr></thead><tbody>';
        const statusMap = { 'new': 'Новая', 'assigned': 'Банкет назначен', 'completed': 'Банкет завершен' };
        const paymentMap = { 'cash': 'Наличные', 'transfer': 'Перевод' };
        bookings.forEach(b => {
            const startDate = b.start_date ? b.start_date.slice(0,10) : '';
            html += `<tr>
                <td>${b.hall}</td>
                <td>${startDate}</td>
                <td>${paymentMap[b.payment_method] || b.payment_method}</td>
                <td>${statusMap[b.status] || b.status}</td>
                <td>${b.review || '—'}</td>
                <td>`;
            if (b.status === 'completed' && !b.review) {
                html += `<form class="reviewForm" data-id="${b.id}">
                            <input type="text" name="review" placeholder="Ваш отзыв" required>
                            <button type="submit">Отправить</button>
                        </form>`;
            } else if (b.status === 'completed' && b.review) {
                html += 'Отзыв оставлен';
            } else {
                html += '—';
            }
            html += `</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        document.querySelectorAll('.reviewForm').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const bookingId = form.dataset.id;
                const review = form.querySelector('input[name="review"]').value.trim();
                if (!review) {
                    showError('Отзыв не может быть пустым');
                    return;
                }
                const resp = await fetch('/api/bookings/review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId, review })
                });
                const data = await resp.json();
                if (resp.ok) {
                    loadBookings();
                } else {
                    showError(data.error || 'Ошибка отправки отзыва');
                }
            });
        });
    }

    loadBookings();
});