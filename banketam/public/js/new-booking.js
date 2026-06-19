document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (!user) return;

    const form = document.getElementById('newBookingForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hall = document.getElementById('hall').value;
        const start_date = document.getElementById('start_date').value.trim();
        const payment_method = document.getElementById('payment_method').value;

        if (!hall || !start_date || !payment_method) {
            showError('Заполните все поля');
            return;
        }

        const resp = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hall, start_date, payment_method })
        });
        const data = await resp.json();
        if (resp.ok) {
            location.href = '/dashboard.html';
        } else {
            showError(data.error || 'Ошибка создания заявки');
        }
    });
});