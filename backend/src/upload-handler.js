const multer = require('multer');
const path = require('path');
const fs = require('fs');

const audioPath = path.join(__dirname, '../public/uploads/audio/');
const imagePath = path.join(__dirname, '../public/uploads/images/');

// Ensure directories exist
if (!fs.existsSync(audioPath)) {
    fs.mkdirSync(audioPath, { recursive: true });
    console.log('Created audio directory:', audioPath);
}

if (!fs.existsSync(imagePath)) {
    fs.mkdirSync(imagePath, { recursive: true });
    console.log('Created image directory:', imagePath);
}

console.log('Audio path:', audioPath);
console.log('Image path:', imagePath);

//add audio to folder
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioPath);
    },
    filename: (req, file, cb) => {
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, Date.now() + '-' + sanitizedName);
    }
});

//add image to folder
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagePath);
    },
    filename: (req, file, cb) => {
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, Date.now() + '-' + sanitizedName);
    }
});

// Audio file filter
const audioFileFilter = (req, file, cb) => {
    const allowedMimes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid audio file type. Allowed: webm, ogg, mp4, mp3, wav'), false);
    }
};

// Image file filter
const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid image file type. Allowed: jpeg, jpg, png, gif, webp'), false);
    }
};

const uploadAudio = multer({ 
    storage: audioStorage,
    fileFilter: audioFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadImage = multer({ 
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = {
    uploadAudio,
    uploadImage
}