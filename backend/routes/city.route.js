import express from 'express';
import { getCitiesWithProperties } from '../controllers/city.controller.js';

const router = express.Router();

// GET /api/cities
router.get('/cities', getCitiesWithProperties);

export default router;