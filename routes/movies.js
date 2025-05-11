import express from 'express';
import * as api from '../services/api.js';
import db from '../services/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { keyword, index } = req.query;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword parameter is required' });
        }

        const results = await api.searchByKeyword(keyword);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No results found.' });
        }

        // Save keyword to MongoDB
        try {
            const insertResult = await db.insert("SearchHistoryKeyword", { keyword, timestamp: new Date() });
            console.log(`Saved keyword: ${keyword} to SearchHistoryKeyword`, insertResult);
        } catch (dbError) {
            console.error("Error saving keyword to MongoDB:", dbError);
        }

        // If index is provided, return only the selected result **and save selection**
        if (index !== undefined) {
            const selectedIndex = parseInt(index, 10);
            if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= results.length) {
                return res.status(400).json({ error: 'Invalid index. Must be within range of results.' });
            }

            const selectedItem = results[selectedIndex];

            // Fetch full details before saving selection
            const fullDetails = await api.searchById(selectedItem.media_type, selectedItem.id);

            // Save selection to MongoDB with keyword reference
            try {
                await db.insert("SearchHistorySelection", { 
                    identifier: selectedItem.id, 
                    media_type: selectedItem.media_type,
                    display_name: selectedItem.title || selectedItem.name, // Store title/name
                    keyword, // Store the keyword that led to this selection
                    details: fullDetails, // Store full details
                    timestamp: new Date() 
                });
                console.log(`Saved selection: ${selectedItem.id} (${selectedItem.media_type}) from keyword: ${keyword}`);
            } catch (insertError) {
                console.error("Error inserting into SearchHistorySelection:", insertError);
            }

            return res.json(fullDetails); // Return full details of the selected item
        }

        res.json(results); // Return all results if no index is provided
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { media_type } = req.query;

    // Restrict media_type to only "movie"
    if (media_type !== "movie") {
        return res.status(400).json({ error: 'Invalid media type. Only "movie" is allowed.' });
    }

    try {
        const details = await api.searchById(media_type, id);

        // Save selection to MongoDB with display name
        try {
            const insertResult = await db.insert("SearchHistorySelection", { 
                identifier: id, 
                media_type,
                display_name: details.title || details.name, // Store title/name
                details, 
                timestamp: new Date() 
            });
            console.log(`Saved selection: ${id} (${media_type}) to SearchHistorySelection`, insertResult);
        } catch (insertError) {
            console.error("Error inserting into SearchHistorySelection:", insertError);
        }

        res.json(details);
    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).json({ error: 'Failed', message: error.message });
    }
});

export default router;





