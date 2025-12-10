/**
 * BACKEND REFERENCE IMPLEMENTATION
 * 
 * Copy this code into your Node.js/Express Controller.
 * Dependencies required: multer, pg (or your DB adapter)
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// 1. SERVE STATIC FILES (In your app.js/main.ts)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. MULTER CONFIGURATION
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure this folder exists!
    cb(null, 'uploads/avatars/'); 
  },
  filename: (req, file, cb) => {
    // Unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// 3. THE UPDATE ROUTE
// Middleware: 'authenticateToken' (Your auth middleware), 'upload.single' (Multer)
router.put('/api/auth/me/update', authenticateToken, upload.single('avatar'), async (req, res) => {
  
  // DEBUG LOGS (Requested)
  console.log('--- PROFILE UPDATE REQUEST ---');
  console.log('Body:', req.body);
  console.log('File:', req.file);

  try {
    const employeeId = req.user.employeeId; // Extracted from JWT
    
    // Extract fields
    const { nationalAddress, city, district, phoneNumber } = req.body;
    
    // 4. DYNAMIC SQL CONSTRUCTION
    // We only update fields that are actually sent.
    
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (nationalAddress !== undefined) {
        fields.push(`national_address = $${paramIndex++}`);
        values.push(nationalAddress);
    }
    if (city !== undefined) {
        fields.push(`city = $${paramIndex++}`);
        values.push(city);
    }
    if (district !== undefined) {
        fields.push(`district = $${paramIndex++}`);
        values.push(district);
    }
    if (phoneNumber !== undefined) {
        fields.push(`phone_number = $${paramIndex++}`);
        values.push(phoneNumber);
    }

    // Handle File Upload
    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(avatarUrl);
    }
    
    // Add Timestamp
    fields.push(`updated_at = NOW()`);

    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    // Add ID as the last parameter
    values.push(employeeId);
    
    const query = `
      UPDATE employees 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;

    // Execute Query (Using generic db adapter)
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
    }

    // 5. RETURN UPDATED OBJECT (Requested)
    res.json({ 
        success: true, 
        message: "Profile updated successfully",
        data: result.rows[0] 
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
