const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'banketam_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// ---- API ----

app.get('/api/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Не авторизован' });
    }
});

app.post('/api/register', async (req, res) => {
    const { login, password, full_name, phone, email } = req.body;
    const existing = await db.findUserByLogin(login);
    if (existing) {
        return res.status(400).json({ error: 'Логин уже занят' });
    }
    try {
        await db.createUser(login, password, full_name, phone, email);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    const user = await db.findUserByLogin(login);
    if (!user || !(await db.bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    req.session.user = {
        id: user.id,
        login: user.login,
        full_name: user.full_name,
        role: user.role
    };
    res.json({ user: req.session.user });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.get('/api/bookings', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const bookings = await db.getBookingsByUserId(req.session.user.id);
    res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const { hall, start_date, payment_method } = req.body;
    if (!hall || !start_date || !payment_method) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    // Преобразование даты (если пришла в формате ДД.ММ.ГГГГ)
    let formattedDate = start_date;
    if (start_date.includes('.')) {
        const parts = start_date.split('.');
        if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else {
            return res.status(400).json({ error: 'Неверный формат даты' });
        }
    } else {
        const dateObj = new Date(start_date);
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ error: 'Неверный формат даты' });
        }
        formattedDate = start_date;
    }
    try {
        await db.createBooking(req.session.user.id, hall, formattedDate, payment_method);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/bookings/review', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const { bookingId, review } = req.body;
    if (!review || review.trim() === '') {
        return res.status(400).json({ error: 'Отзыв не может быть пустым' });
    }
    const booking = await db.findBookingById(bookingId);
    if (!booking || booking.user_id !== req.session.user.id) {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    if (booking.status !== 'completed') {
        return res.status(400).json({ error: 'Отзыв можно оставить только после завершения банкета' });
    }
    await db.updateBookingReview(bookingId, review.trim());
    res.json({ success: true });
});

app.get('/api/admin/bookings', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const bookings = await db.getAllBookings();
    res.json(bookings);
});

app.post('/api/admin/update-status', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещён' });
    }
    const { bookingId, status } = req.body;
    const allowed = ['new', 'assigned', 'completed'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Недопустимый статус' });
    }
    await db.updateBookingStatus(bookingId, status);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});