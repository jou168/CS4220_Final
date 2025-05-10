import express from 'express';
import db from '../services/db.js';

const router = express.Router(); // Create the Express router

const COLLECTION_NAME = 'SearchHistorySelection';

router.post('/save', async (req, res) => {
    const { selectionData } = req.body;
    try {
        if (!selectionData || !selectionData.id || !selectionData.media_type) {
            return res.status(400).json({ error: 'Invalid selection data' });
        }

        const result = await db.insert(COLLECTION_NAME, selectionData);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `Failed to save selection: ${error.message}` });
    }
});

router.get('/history', async (req, res) => {
    try {
        const cursor = await db.find(COLLECTION_NAME);
        const history = await cursor.toArray();
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch selection history: ${error.message}` });
    }
});

export default router; // Export the router to be used in server.js
