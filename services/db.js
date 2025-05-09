import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

/**
 * ES6 module for interacting with Mongo Atlas database
 * @returns {Object} An object containing the functions to interact with MongoDB
 */
const mongo = () => {
    // load env variables
    dotenv.config();

    const { DB_USER, DB_PASSWORD, DB_URL, DB_NAME } = process.env;
    const mongoURL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

    let client;
    let db;

    /**
     * Establishes a connection to the Mongo Atlas database
     * @returns {Promise<void>} Resolves once the connection is established
     */
    async function connect() {
        try {
            client = new MongoClient(mongoURL);
            await client.connect();
            db = client.db();

            console.log('Connected to Mongo');
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Closes the connection to the Mongo Atlas database
     * @returns {Promise<void>} Resolves once the connection is closed
     */
    async function close() {
        try {
            await client.close();

            console.log('Closed connection to Mongo');
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Inserts a new document into the specified collection
     * @param {string} collectionName - name of the collection where the data will be inserted
     * @param {Object} data - data to be inserted into the collection
     * @returns {Promise<Object>} Acknowledgement result of the insert operation
     */
    async function insert(collectionName, data) {
        try {
            const collection = db.collection(collectionName);
            const acknowledgement = await collection.insertOne(data);

            return acknowledgement;
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Finds documents in the specified collection based on a query
     * @param {string} collectionName - name of the collection to query
     * @param {Object|null} query - query object used to filter documents (optional)
     * @returns {Cursor} A MongoDB Cursor object used to extract query results
     */
    async function find(collectionName, query = null) {
        try {
            const collection = db.collection(collectionName);

            if (query) {
                const cursor = await collection.find(query);
                return cursor;
            } else {
                const cursor = await collection.find({});
                console.log(cursor);
                return cursor;
            }
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Updates a document in the specified collection
     * @param {string} collectionName - name of the collection to update
     * @param {Object} query - query used to find the document to update
     * @param {Object} data - data to update the document with
     * @returns {Promise<Object>} Acknowledgement result of the update operation
     */
    async function update(collectionName, query, data) {
        try {
            const collection = db.collection(collectionName);
            const acknowledgement = await collection.updateOne(query, { $set: data });

            return acknowledgement;
        } catch (err) {
            console.error(err);
        }
    }

    return {
        connect,
        close,
        insert,
        find,
        update
    };
};

export default mongo();
