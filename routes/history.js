import express from 'express';
import db from '../services/db.js';

const router = express.Router(); // Create the Express router

router.get('/', async (req, res) => {
    const { type } = req.query;

    // Validate type parameter
    if (!type || !['keywords', 'selections'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type parameter. Must be "keywords" or "selections".' });
    }

    // Determine collection name based on type
    const collectionName = type === 'keywords' ? 'SearchHistoryKeyword' : 'SearchHistorySelection';

    try {
        const historyRecords = await db.find(collectionName);
        if (!historyRecords) {
            return res.status(404).json({ error: `No records found in ${collectionName}.` });
        }

        const history = await historyRecords.toArray();

        // Format response based on type
        const cleanHistory = type === 'keywords'
            ? history.map(({ _id, details, ...rest }) => rest) // Remove `_id` and `details` from keywords
            : history.map(({ _id, identifier, details, ...rest }) => ({
                ...rest,
                details: details ? Object.fromEntries(Object.entries(details).filter(([key]) => key !== 'id')) : {},
            })); // Remove `_id`, `identifier`, and `id` from selections

        res.json(cleanHistory);
    } catch (error) {
        console.error(`Error fetching history from ${collectionName}:`, error);
        res.status(500).json({ error: `Failed to fetch history: ${error.message}` });
    }
});

export default router;




