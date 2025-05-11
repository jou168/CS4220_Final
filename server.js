import express from 'express';

import db from './services/db.js';
import movies from './routes/movies.js';
import history from './routes/history.js';

const PORT = 5252;
const app = express();

app.use(express.json()); // To parse JSON request bodies
// Enable pretty-printing for JSON responses (can be deleted as localhost already provides this function. this just makes it default)
app.set('json spaces', 2);

app.get('/', (req, res) => {
    res.send("Welcome to the Movie Database");
})

app.use('/movies', movies)
app.use('/history', history)

const server = app.listen(PORT, async () => {
    await db.connect();
    console.log(`Server is listening on port: ${PORT}`);
})

const shutdown = async () => {
    // await the close mongo db connection
    await db.close();

    // close the server
    server.close(() => {
        console.log('Server shutdown.');
        process.exit(0);
    });
};
// SIGINT - manual interruption (ex: ctrl + c on Mac)
// SIGTERM - polite terminate (ex: docker shutting down the process)
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);