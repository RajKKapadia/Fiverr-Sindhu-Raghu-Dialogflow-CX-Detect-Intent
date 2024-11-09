// const fs = require('fs');

// const { SessionsClient } = require('@google-cloud/dialogflow-cx');

// /**
//  * Replace this things with your actual values
//  * projectId = 'YOUR_GCP_PROJECT_ID'
//  * location = 'LOCATION_OF_THE_AGENT'
//  * agentId = 'DIALOGFLOW_CX_AGENT_ID'
//  * languageCode = 'en'
//  * Provide path of your service account credential file
//  * generally you keep it in the same folder
//  * Also make sure this part has the same location
//  * apiEndpoint: 'us-central1-dialogflow.googleapis.com'
//  */

// const credentials = JSON.parse(fs.readFileSync("youtubedemo-rwcl-c49bceb83c7f.json"));
// const projectId = credentials.project_id;
// const location = "global";
// const agentId = "6c927e85-2e22-4fd8-af7a-f9f8d7e4ed46";
// const languageCode = 'en';

// const client = new SessionsClient({
//     credentials: {
//         client_id: credentials.client_id,
//         client_secret: credentials.client_secret,
//         client_email: credentials.client_email,
//         private_key: credentials.private_key
//     },
//     apiEndpoint: `${location}-dialogflow.googleapis.com`
// });


// const detectIntentText = async (query, sessionId) => {
//     try {
//         const sessionPath = client.projectLocationAgentSessionPath(
//             projectId,
//             location,
//             agentId,
//             sessionId
//         );
//         const request = {
//             session: sessionPath,
//             queryInput: {
//                 text: {
//                     text: query,
//                 },
//                 languageCode,
//             },
//         };
//         const [response] = await client.detectIntent(request);
//         let textResponses = [];
//         for (const message of response.queryResult.responseMessages) {
//             if (message.text) {
//                 textResponses.push(message.text.text[0]);
//             }
//         }
//         if (textResponses.length === 0) {
//             return {
//                 status: 0,
//                 responses: [ERROR_MESSAGE]
//             };
//         } else {
//             return {
//                 status: 1,
//                 responses: textResponses
//             };
//         }
//     } catch (error) {
//         console.log(`Error at detectIntentText -> ${error}`);
//         return {
//             status: 0,
//             responses: [ERROR_MESSAGE]
//         };
//     }
// };

// detectIntentText("hi", "abcdefgh-12345678")
//     .then((res) => {
//         console.log(res);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Function to generate JWT token for authentication
const generateJWT = (credentials) => {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600; // Token expires in 1 hour

    const claim = {
        iss: credentials.client_email,
        sub: credentials.client_email,
        aud: 'https://dialogflow.googleapis.com/',
        iat: iat,
        exp: exp
    };

    return jwt.sign(claim, credentials.private_key, { algorithm: 'RS256' });
};

const detectIntentText = async (query, sessionId) => {
    try {
        // Read and parse credentials
        const credentials = JSON.parse(fs.readFileSync("youtubedemo-rwcl-c49bceb83c7f.json"));
        const projectId = credentials.project_id;
        const location = "global";
        const agentId = "6c927e85-2e22-4fd8-af7a-f9f8d7e4ed46";
        const languageCode = 'en';

        // Generate JWT token
        const token = generateJWT(credentials);

        // Construct the API URL
        const apiUrl = `https://${location}-dialogflow.googleapis.com/v3/projects/${projectId}/locations/${location}/agents/${agentId}/sessions/${sessionId}:detectIntent`;

        // Prepare the request body
        const requestBody = {
            queryInput: {
                text: {
                    text: query
                },
                languageCode: languageCode
            }
        };

        // Make the API request
        const response = await axios({
            method: 'post',
            url: apiUrl,
            data: requestBody,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Process the response
        const textResponses = [];
        for (const message of response.data.queryResult.responseMessages) {
            if (message.text) {
                textResponses.push(message.text.text[0]);
            }
        }

        if (textResponses.length === 0) {
            return {
                status: 0,
                responses: ['Error: No response received']
            };
        } else {
            return {
                status: 1,
                responses: textResponses
            };
        }

    } catch (error) {
        console.error('Error in detectIntentText:', error.response?.data || error.message);
        return {
            status: 0,
            responses: ['An error occurred while processing your request']
        };
    }
};

// Example usage
detectIntentText("hi", "abcdefgh-12345678")
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err);
    });
