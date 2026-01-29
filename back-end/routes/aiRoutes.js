const express = require('express');
const router = express.Router();
// ה- ../ אומר לצאת מתיקיית routes ולהיכנס ל-controllers
const aiController = require('../controllers/aiController'); 

router.post('/generate-mood', aiController.generateMoodSticker);
router.post('/generate-from-emoji', aiController.generateFromEmoji);
module.exports = router;