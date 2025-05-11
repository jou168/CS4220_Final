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
            await db.insert("SearchHistoryKeyword", { keyword });
            console.log(`Saved keyword: ${keyword} to SearchHistoryKeyword`);
        } catch (dbError) {
            console.error("Error saving keyword to MongoDB:", dbError);
        }

        // Format response to match project requirements
        const formattedResults = results.map(item => ({
            display: item.title || item.name, // Use title for movies, name for TV shows/people
            identifier: item.id
        }));

        // If index is provided, return only the selected result **and save selection**
        if (index !== undefined) {
            const selectedIndex = parseInt(index, 10);
            if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= formattedResults.length) {
                return res.status(400).json({ error: 'Invalid index. Must be within range of results.' });
            }

            const selectedItem = results[selectedIndex];

            // Fetch full details before saving selection
            const details = await api.searchById(selectedItem.media_type, selectedItem.id);

            // Extract only important details
            const detailsToSave = {
                id: details.id,
                title: details.title || details.name,
                media_type: selectedItem.media_type,
                overview: details.overview,
                release_date: details.release_date || details.first_air_date,
                original_language: details.original_language, // Moved above vote_average
                vote_average: details.vote_average,
                vote_count: details.vote_count,
            };

            // Save selection to MongoDB (only `details`)
            try {
                await db.insert("SearchHistorySelection", { details: detailsToSave });
                console.log(`Saved selection: ${selectedItem.id} (${selectedItem.media_type}) from keyword: ${keyword}`);
            } catch (insertError) {
                console.error("Error inserting into SearchHistorySelection:", insertError);
            }

            return res.json(detailsToSave); // Return filtered details of the selected item
        }

        res.json(formattedResults); // Return formatted results with only display and identifier
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { media_type } = req.query;

    if (!media_type) {
        return res.status(400).json({ error: 'Media type parameter is required (movie, tv, person)' });
    }

    try {
        const details = await api.searchById(media_type, id);

        // Extract only important details
        const detailsToSave = {
            id: details.id,
            title: details.title || details.name,
            media_type,
            overview: details.overview,
            release_date: details.release_date || details.first_air_date,
            original_language: details.original_language, // Moved above vote_average
            vote_average: details.vote_average,
            vote_count: details.vote_count,
        };

        // Save selection to MongoDB (only `details`)
        try {
            await db.insert("SearchHistorySelection", { details: detailsToSave });
            console.log(`Saved selection: ${id} (${media_type}) to SearchHistorySelection`);
        } catch (insertError) {
            console.error("Error inserting into SearchHistorySelection:", insertError);
        }

        res.json(detailsToSave);
    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).json({ error: 'Failed', message: error.message });
    }
});

export default router;











