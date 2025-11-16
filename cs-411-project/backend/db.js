require('dotenv').config();
const { get } = require('http');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3307),
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

async function getMedicinesBySymptoms(symptom) {
    const sql = `
        SELECT 
            medicines.name AS medicine_name,
            medicines.rating AS medicine_rating,
            COUNT(treatedBy.symptom_name) AS symptoms_treated
        FROM stage2_schema.medicines AS medicines
        JOIN stage2_schema.treatedBy AS treatedBy 
            ON medicines.name = treatedBy.medicine_name
        JOIN stage2_schema.currentlyHas AS currentlyHas 
            ON treatedBy.symptom_name = currentlyHas.symptom_name
        WHERE currentlyHas.user_email = 'a.brooks@outlook.com'
        GROUP BY medicines.name, medicines.rating
        ORDER BY symptoms_treated DESC, medicine_rating DESC
        LIMIT 15;
    `;

    const rows = await query(sql, [symptom]);
    return rows;
}

async function getPharmaciesByMedicine(medicineName) {
    const sql = `
        SELECT 
            pharmacies.id AS pharmacy_id,
            COUNT(DISTINCT carries.medicine_name) AS num_medicines_carried,
            pharmacies.address,
            pharmacies.city,
            pharmacies.state
        FROM stage2_schema.pharmacies AS pharmacies
        JOIN stage2_schema.carries AS carries 
            ON pharmacies.id = carries.pharmacy_id
        JOIN stage2_schema.treatedBy AS treatedBy 
            ON carries.medicine_name = treatedBy.medicine_name
        WHERE carries.medicine_name = ?
        GROUP BY pharmacy_id, pharmacies.address, pharmacies.city, pharmacies.state
        LIMIT 15;
    `;

    const rows = await query(sql, [medicineName]);
    return rows;
}



//use this to check available symptoms (called at end)
// async function debugListSymptoms() {
//     const sql = `
//         SELECT DISTINCT treatedBy.symptom_name
//         FROM stage2_schema.treatedBy AS treatedBy
//         LIMIT 20;
//     `;
//     const rows = await query(sql);
//     console.log('Distinct symptoms in treatedBy:', rows);
// }




//use this to check available symptoms specific to a.brooks@outlook.com(called at end)
async function debugUserSymptoms() {
    const sql = `
        SELECT DISTINCT symptom_name
        FROM stage2_schema.currentlyHas
        WHERE user_email = 'a.brooks@outlook.com'
        LIMIT 50;
    `;
    const rows = await query(sql);
    console.log('Symptoms for user a.brooks@outlook.com:', rows);
}

getMedicinesBySymptoms("Dilatation Of Pupil").then(rows => {
    console.log('get meds query result:', rows);
}).catch(err => {
    console.error('Database connection failed:', err);
});

getPharmaciesByMedicine("Terbest Cream").then(rows => {
    console.log('get meds query result:', rows);
}).catch(err => {
    console.error('Database connection failed:', err);
});

module.exports = { pool, query, getMedicinesBySymptoms, getPharmaciesByMedicine };

// use if need to print symptoms
// debugListSymptoms().catch(err => console.error(err));

// use if need to print symptoms specific to a.brooks@outlook.com
// debugUserSymptoms().catch(err => console.error(err));

//Symptoms for user a.brooks@outlook.com: [
//   { symptom_name: 'Dilatation Of Pupil' },
//   { symptom_name: 'Stomach Pain Epigastric Pain' }
// ]
