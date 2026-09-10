const { Router } = require('express');
const informesController = require('../controllers/informes.controller');

const router = Router();

router.get('/', informesController.getInformes);
router.post('/', informesController.createInforme);

module.exports = router;
