const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Création de la table au démarrage si elle n'existe pas
pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(100),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    )
`).catch(err => console.error('Erreur création table:', err));

// POST /contact — reçoit les données du formulaire et les stocke en BDD
app.post('/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    try {
        await pool.query(
            'INSERT INTO contacts (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5)',
            [name, email, phone || null, subject || null, message]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Erreur BDD:', err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// GET /contacts — consulter tous les messages reçus
app.get('/contacts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
