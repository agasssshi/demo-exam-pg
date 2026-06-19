function checkAuth(redirectOnFail = true) {
    return fetch('/api/me')
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                return data.user;
            } else {
                if (redirectOnFail) location.href = '/login.html';
                return null;
            }
        })
        .catch(() => {
            if (redirectOnFail) location.href = '/login.html';
            return null;
        });
}

function logout() {
    fetch('/api/logout', { method: 'POST' })
        .then(() => location.href = '/login.html');
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    if (el) {
        el.textContent = msg;
        el.classList.add('error');
    }
}

function setupLogoutButton() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
        btn.addEventListener('click', logout);
    }
}