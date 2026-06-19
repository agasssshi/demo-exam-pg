const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'password',
    database: 'banketam',
    port: 5432,
    max: 5
});

pool.on('connect', () => console.log('Подключено к PostgreSQL'));

// ---- Пользователи ----
async function createUser(login, password, full_name, phone, email) {
    const hashed = await bcrypt.hash(password, 10);
    const query = `
        INSERT INTO users (login, password, full_name, phone, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `;
    const values = [login, hashed, full_name, phone, email];
    const res = await pool.query(query, values);
    return res.rows[0].id;
}

async function findUserByLogin(login) {
    const query = 'SELECT * FROM users WHERE login = $1';
    const res = await pool.query(query, [login]);
    return res.rows[0] || null;
}

async function findUserById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
}

// ---- Бронирования ----
async function createBooking(user_id, hall, start_date, payment_method) {
    const query = `
        INSERT INTO bookings (user_id, hall, start_date, payment_method, status)
        VALUES ($1, $2, $3, $4, 'new')
        RETURNING id
    `;
    const values = [user_id, hall, start_date, payment_method];
    const res = await pool.query(query, values);
    return res.rows[0].id;
}

async function getBookingsByUserId(user_id) {
    const query = `
        SELECT * FROM bookings
        WHERE user_id = $1
        ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [user_id]);
    return res.rows;
}

async function getAllBookings() {
    const query = `
        SELECT b.*, u.full_name, u.login
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
    `;
    const res = await pool.query(query);
    return res.rows;
}

async function updateBookingStatus(id, status) {
    const query = 'UPDATE bookings SET status = $1 WHERE id = $2';
    await pool.query(query, [status, id]);
}

async function updateBookingReview(id, review) {
    const query = 'UPDATE bookings SET review = $1 WHERE id = $2';
    await pool.query(query, [review, id]);
}

async function findBookingById(id) {
    const query = 'SELECT * FROM bookings WHERE id = $1';
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
}

module.exports = {
    pool,
    createUser,
    findUserByLogin,
    findUserById,
    createBooking,
    getBookingsByUserId,
    getAllBookings,
    updateBookingStatus,
    updateBookingReview,
    findBookingById,
    bcrypt
};