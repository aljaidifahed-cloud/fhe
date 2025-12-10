/**
 * BACKEND SERVER IMPLEMENTATION (Node.js + Express + PostgreSQL)
 */

import express from 'express';
import pg from 'pg';
const { Pool } = pg;
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ksa_hrms',
    password: process.env.DB_PASS || 'password',
    port: 5432,
});

app.use(cors());
app.use(express.json());
// --- FILE UPLOAD CONFIGURATION ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

// Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL to access the file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// --- REQUESTS ENGINE ENDPOINTS ---

// 1. GET Requests (With Filtering)
app.get('/api/requests', async (req, res) => {
    try {
        const companyId = 'COMP-001';
        const { type, status } = req.query;

        // Build Dynamic Query
        let queryText = `
            SELECT r.*, e.full_name as user_name, e.avatar_url 
            FROM requests r
            JOIN employees e ON r.user_id = e.id
            WHERE r.company_id = $1
        `;
        const values = [companyId];
        let paramIndex = 2;

        if (type) {
            queryText += ` AND r.type = $${paramIndex++}`;
            values.push(type);
        }
        if (status) {
            queryText += ` AND r.status = $${paramIndex++}`;
            values.push(status);
        }

        queryText += ` ORDER BY r.created_at DESC`;

        const result = await pool.query(queryText, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// 2. POST New Request (Validation based on Type)
app.post('/api/requests', async (req, res) => {
    try {
        const { userId, type, details } = req.body;
        const companyId = 'COMP-001';

        // Basic Backend Validation Strategy
        if (!details) return res.status(400).json({ error: "Details are required" });

        // Type-Specific Validation
        switch (type) {
            case 'LEAVE':
                if (!details.startDate || !details.endDate) return res.status(400).json({ error: "Dates required" });
                break;
            case 'ASSET':
                if (!details.itemName) return res.status(400).json({ error: "Item name required" });
                break;
        }

        const result = await pool.query(
            `INSERT INTO requests (company_id, user_id, type, status, details) 
             VALUES ($1, $2, $3, 'PENDING_MANAGER', $4) 
             RETURNING *`,
            [companyId, userId, type, details]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// 3. PATCH Status (Approval Workflow)
app.patch('/api/requests/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approverId } = req.body; // status: APPROVED | REJECTED

        const result = await pool.query(
            `UPDATE requests 
             SET status = $1, approver_id = $2, updated_at = NOW() 
             WHERE id = $3 
             RETURNING *`,
            [status, approverId, id]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: "Request not found" });
        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// --- EXISTING ENDPOINTS (Truncated for brevity, assume they exist) ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});