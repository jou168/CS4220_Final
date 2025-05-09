// API Read Access Token: eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYWQ5ZmFjYjJjM2UyMjcxMjRhMjUzZjQ5NzNiYWFlZSIsIm5iZiI6MTc0MjI2OTM5MS4zMjMsInN1YiI6IjY3ZDhlYmNmZTFlM2NkY2JmOWM2OWU3OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.n_eYUWQ6tbeWUbWmwIIcMiAet7xmkvKjbkXyo9xilyQ
// API key: dad9facb2c3e227124a253f4973baaee
// Example API request below
// https://api.themoviedb.org/3/movie/550?api_key=dad9facb2c3e227124a253f4973baaee
import axios from 'axios';
const BASE_URL = 'https://api.themoviedb.org/3/';
const KEYWORD_URL = `${BASE_URL}search/multi`; // Accommodates movie/tv/people
const DETAILS_URL = `${BASE_URL}`;
const API_KEY = 'dad9facb2c3e227124a253f4973baaee';
const BEARER_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYWQ5ZmFjYjJjM2UyMjcxMjRhMjUzZjQ5NzNiYWFlZSIsIm5iZiI6MTc0MjI2OTM5MS4zMjMsInN1YiI6IjY3ZDhlYmNmZTFlM2NkY2JmOWM2OWU3OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.n_eYUWQ6tbeWUbWmwIIcMiAet7xmkvKjbkXyo9xilyQ';

// Function to fetch data based on user keyword
export async function searchByKeyword(userKeyword) {
    try {
        // Validate user input
        if (!userKeyword) {
            throw new Error('Please provide a search keyword.');
        }

        // Configure the API request options
        const options = {
            method: 'GET',
            url: KEYWORD_URL,
            params: {
                query: userKeyword, // Dynamically set the query
                include_adult: 'false',
                language: 'en-US',
                page: '1'
            },
            headers: {
                accept: 'application/json',
                Authorization: BEARER_TOKEN
            }
        };

        // Make the API request
        const response = await axios.request(options);

        return response.data.results; // Returning the results instead of logging them
    } catch (error) {
        throw new Error(`Error fetching search results: ${error.message}`);
    }
}

// function to search by ID 
export async function searchById(media_type, id){
    try{
        if (!media_type || !id) throw new Error('Invalid media type or ID provided.');

        const options = {
            method : 'GET',
            url: `${DETAILS_URL}${media_type}/${id}`,
            params : {api_key : API_KEY},
            headers :{
                accept: 'application/json',
                Authorization: BEARER_TOKEN
            }
        };
        const response= await axios.request(options);
        return response.data;
    }catch(error){
        throw new Error(`Error fetching details for id- ${id}: ${error.message}`);
    }
}

