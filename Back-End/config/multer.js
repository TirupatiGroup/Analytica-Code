const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads/protocols directory exists
const uploadDir = path.join(__dirname, '../uploads/protocols');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Store files in 'uploads/protocols'
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'protocol-' + uniqueSuffix + ext); // Example: protocol-1671234567890.pdf
    }
});

// File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf/;  // Only allow PDF files
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);  // File is allowed
    } else {
        cb(new Error('Only PDF files are allowed!'), false);  // Reject other file types
    }
};

// Multer middleware configuration
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB file size limit
    fileFilter,
});

module.exports = upload;
