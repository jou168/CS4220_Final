import express from 'express';

import * as api from '../services/api.js';
import db from '../services/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword parameter is required' });
        }

        const result = await api.searchByKeyword(keyword);
        await db.insert("SearchHistoryKeyword", { keyword });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/:id', async (req, res) => {
    const movieId = req.params.id;
    try {
        const movieDetails = await api.searchById('movie', movieId);

        try {
          await db.insert("SearchHistorySelection", { 
            identifier: movieId, 
            details: movieDetails, 
            timestamp: new Date() 
          });
        } catch(insertError) {
          console.error("Error inserting into SearchHistorySelection:", insertError);
        }
        
        res.json(movieDetails);
    } catch (error) {
        console.error("Error in /:id route:", error);
        res.status(500).json({ error: 'Failed', message: error.message });
    }
});

export default router;