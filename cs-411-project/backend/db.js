const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONN_LIMIT || 5),
    queueLimit: 0,
});

async function query(sql, params) {
    const [rows] = await pool.query(sql, params);
    return rows;
}

query('SELECT 1 + 1 AS solution').then(rows => {
    console.log('Database connected, test query result:', rows[0].solution);
}).catch(err => {
    console.error('Database connection failed:', err);
})

async function getMedicinesBySymptoms(symptoms) {
    const sql = `
        SELECT medicines.name AS medicine_name, medicines.rating AS medicine_rating
        FROM stage2_schema.medicines AS medicines
        JOIN stage2_schema. treatedBy AS treatedBy ON medicines.name = treatedBy.medicine_name
        JOIN stage2_schema. currentlyHas AS currentlyHas ON treatedBy.symptom_name = currentlyHas.symptom_name
        WHERE currentlyHas.user_email = 'a.brooks@outlook.com'
        GROUP BY medicines.name
        ORDER BY symptoms_treated DESC, medicine_rating DESC
        LIMIT 15;
    `;
    const rows = await query(sql, [symptoms]);
    return rows;
}

module.exports = { pool, query, getMedicinesBySymptoms };