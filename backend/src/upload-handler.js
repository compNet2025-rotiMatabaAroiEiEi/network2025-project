const multer = require('multer');
const path = require('path')

const audioPath = path.join(__dirname, '../public/uploads/audio/');
const imagePath = path.join(__dirname, '../public/uploads/images/');

console.log(audioPath)
console.log(imagePath)

//add audio to folder
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

//add image to folder
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagePath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
})

const uploadAudio = multer({ storage: audioStorage });
const uploadImage = multer({ storage: imageStorage });

module.exports = {
    uploadAudio,
    uploadImage
}