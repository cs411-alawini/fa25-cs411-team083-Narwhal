require('dotenv').config();
const { get } = require('http');
const mysql = require('mysql2/promise');

//AI Usage: NONE of the database queries were written by AI. All queries were created manually.

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


async function getMedicinesBySymptomsAdvanced(email) {
    const sql = `
        CALL getMedicinesBySymptomsAdvanced(?)
    `;  
    const rows = await query(sql, [email]);
    return [rows[0], rows[1]];
}

async function addUser(email, state, city, address, preferredPharmacy){
    const sql1 = `
        SELECT id FROM stage2_schema.pharmacies
        WHERE address = ?
    `;

    const pharmResult = await query(sql1, [preferredPharmacy]);
    const pharmId = pharmResult[0].id;

    const sql2 = `
        INSERT INTO stage2_schema.users (state, city, address, email, preferred_pharmacy_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    const result = await query(sql2, [state, city, address, email, pharmId]);
    return result;
}

async function addSymptom(email, symptom){
    const sql = `
        INSERT INTO stage2_schema.currentlyHas (user_email, symptom_name)
        VALUES (?, ?)
    `;
    const result = await query(sql, [email, symptom]);
    console.log(result);
    return result;
}

async function removeSymptom(email, symptom){
    const sql = `
        DELETE FROM stage2_schema.currentlyHas
        WHERE user_email = ? AND symptom_name = ?
    `;

    const result = await query(sql, [email, symptom]);
    console.log(result);
    return result;
}

async function getMedicinesBySymptoms(email) {
    const sql = `
        CALL getMedicinesBySymptoms(?)
    `;

    const rows = await query(sql, [email]);
    return rows[0];
}

async function getPharmaciesByMedicine(medicineName) {
    const sql = `
        CALL getPharmaciesByMedicine(?)
    `;

    const rows = await query(sql, [medicineName]);
    return rows[0];
}

async function getUserMedsAndPharmacies(userEmail) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
  
      const medicinessql = `
        SELECT 
            m.name AS medicine_name,
            m.rating AS medicine_rating,
            COUNT(tb.symptom_name) AS symptoms_treated
        FROM stage2_schema.medicines m
        JOIN stage2_schema.treatedBy tb ON m.name = tb.medicine_name
        JOIN stage2_schema.currentlyHas ch ON tb.symptom_name = ch.symptom_name
        WHERE ch.user_email = ?
        GROUP BY m.name, m.rating
        ORDER BY symptoms_treated DESC, m.rating DESC
        LIMIT 15;
      `;
      const medicines = await connection.query(medicinessql, [userEmail]);
  
      const pharmaciessql = `
        SELECT 
            p.id AS pharmacy_id,
            p.address,
            p.city,
            p.state,
            COUNT(DISTINCT c.medicine_name) AS num_medicines_carried
        FROM stage2_schema.pharmacies p
        JOIN stage2_schema.carries c ON p.id = c.pharmacy_id
        JOIN stage2_schema.treatedBy tb ON c.medicine_name = tb.medicine_name
        JOIN stage2_schema.currentlyHas ch ON tb.symptom_name = ch.symptom_name
        WHERE ch.user_email = ?
        GROUP BY p.id, p.address, p.city, p.state
        ORDER BY num_medicines_carried DESC
        LIMIT 15;
      `;
      const pharmacies = await connection.query(pharmaciessql, [userEmail]);
  
      await connection.commit();
      return { medicines: medicines[0], pharmacies: pharmacies[0] };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
  
async function getSymptomsByUser(email){
    const sql = `
        SELECT symptom_name
        FROM stage2_schema.currentlyHas AS currentlyHas
        WHERE user_email = ?;
    `;

    const rows = await query(sql, [email]);
    return rows;
}

async function updateUserAddress(address, email){
    const sql = `
        UPDATE stage2_schema.users
        SET address = ?
        WHERE email = ?
    `;

    const rows = await query(sql, [address, email]);
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

getUserMedsAndPharmacies('a.brooks@outlook.com')
  .then(result => {
    console.log('TRANSACTION RESULT:');
    console.log('Medicines:', result.medicines);
    console.log('Pharmacies:', result.pharmacies);
  })
  .catch(err => console.error('Error in transaction:', err));



module.exports = { pool, query, getMedicinesBySymptoms, getPharmaciesByMedicine, getUserMedsAndPharmacies, addUser, addSymptom, removeSymptom, getSymptomsByUser, updateUserAddress, getMedicinesBySymptomsAdvanced };


// use if need to print symptoms
// debugListSymptoms().catch(err => console.error(err));

// use if need to print symptoms specific to a.brooks@outlook.com
// debugUserSymptoms().catch(err => console.error(err));

//Symptoms for user a.brooks@outlook.com: [
//   { symptom_name: 'Dilatation Of Pupil' },
//   { symptom_name: 'Stomach Pain Epigastric Pain' }
// ]
