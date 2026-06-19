document.addEventListener('DOMContentLoaded', () => {
    // Регистрация
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const login = document.getElementById('login').value.trim();
            const password = document.getElementById('password').value.trim();
            const full_name = document.getElementById('full_name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();

            const resp = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password, full_name, phone, email })
            });
            const data = await resp.json();
            if (resp.ok) {
                location.href = '/login.html?registered=true';
            } else {
                showError(data.error || 'Ошибка регистрации');
            }
        });
    }

    // Логин
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const login = document.getElementById('login').value.trim();
            const password = document.getElementById('password').value.trim();

            const resp = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
            const data = await resp.json();
            if (resp.ok) {
                if (data.user.role === 'admin') location.href = '/admin.html';
                else location.href = '/dashboard.html';
            } else {
                showError(data.error || 'Ошибка входа');
            }
        });
    }
});