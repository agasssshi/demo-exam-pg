document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (!user || user.role !== 'admin') {
        location.href = '/login.html';
        return;
    }

    setupLogoutButton();

    let allBookings = [];
    let filteredBookings = [];
    let currentPage = 1;
    const pageSize = 5;

    function renderTable(bookings) {
        const container = document.getElementById('adminBookingsList');
        if (bookings.length === 0) {
            container.innerHTML = '<p>Нет заявок.</p>';
            return;
        }
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, bookings.length);
        const pageData = bookings.slice(start, end);

        let html = '<table><thead><tr><th>ID</th><th>Пользователь</th><th>Помещение</th><th>Дата начала</th><th>Способ оплаты</th><th>Статус</th><th>Отзыв</th><th>Действия</th></tr></thead><tbody>';
        const statusMap = { 'new': 'Новая', 'assigned': 'Банкет назначен', 'completed': 'Банкет завершен' };
        const paymentMap = { 'cash': 'Наличные', 'transfer': 'Перевод' };
        pageData.forEach(b => {
            const startDate = b.start_date ? b.start_date.slice(0,10) : '';
            html += `<tr>
                <td>${b.id}</td>
                <td>${b.full_name} (${b.login})</td>
                <td>${b.hall}</td>
                <td>${startDate}</td>
                <td>${paymentMap[b.payment_method] || b.payment_method}</td>
                <td>${statusMap[b.status] || b.status}</td>
                <td>${b.review || '—'}</td>
                <td>
                    <form class="statusForm" data-id="${b.id}">
                        <select name="status">
                            <option value="new" ${b.status === 'new' ? 'selected' : ''}>Новая</option>
                            <option value="assigned" ${b.status === 'assigned' ? 'selected' : ''}>Банкет назначен</option>
                            <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>Банкет завершен</option>
                        </select>
                        <button type="submit">Изменить</button>
                    </form>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        document.querySelectorAll('.statusForm').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const bookingId = form.dataset.id;
                const status = form.querySelector('select[name="status"]').value;
                const resp = await fetch('/api/admin/update-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId, status })
                });
                const data = await resp.json();
                if (resp.ok) {
                    loadBookings(); // перезагрузить
                } else {
                    showError(data.error || 'Ошибка обновления статуса');
                }
            });
        });

        // Обновить информацию о странице
        document.getElementById('pageInfo').textContent = `Страница ${currentPage} из ${Math.ceil(bookings.length / pageSize) || 1}`;
        document.getElementById('prevPage').disabled = (currentPage === 1);
        document.getElementById('nextPage').disabled = (currentPage >= Math.ceil(bookings.length / pageSize));
    }

    async function loadBookings() {
        const resp = await fetch('/api/admin/bookings');
        allBookings = await resp.json();
        applyFilters();
    }

    function applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        if (statusFilter === 'all') {
            filteredBookings = allBookings;
        } else {
            filteredBookings = allBookings.filter(b => b.status === statusFilter);
        }
        currentPage = 1;
        renderTable(filteredBookings);
    }

    document.getElementById('applyFilter').addEventListener('click', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(filteredBookings);
        }
    });
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < Math.ceil(filteredBookings.length / pageSize)) {
            currentPage++;
            renderTable(filteredBookings);
        }
    });

    loadBookings();
});