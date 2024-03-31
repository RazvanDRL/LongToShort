import axios from 'axios';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://oepfdpopvlyvxrmpstiy.supabase.co',
    process.env.SUPABASE_API_KEY || ''
);

const API_KEY = process.env.PERSPECTIVE_API_KEY;
const DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';

const checkScore = async (text, language) => {
    const analyzeRequest = {
        comment: { text },
        languages: [language],
        requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {},
            SEXUALLY_EXPLICIT: {}
        }
    };

    return google.discoverAPI(DISCOVERY_URL)
        .then((client: any) => { // Add type annotation to specify the correct type
            return new Promise((resolve, reject) => {
                client.comments.analyze({
                    key: API_KEY,
                    resource: analyzeRequest
                }, (err, response) => {
                    if (err) reject(err);
                    else resolve(response.data);
                });
            });
        })
        .then((responseData: any) => {
            let isToxic = false;
            const expectedAttributes = [
                'TOXICITY', 'SEVERE_TOXICITY', 'INSULT', 'PROFANITY', 'THREAT', 'SEXUALLY_EXPLICIT'
            ];

            for (const attribute of expectedAttributes) {
                const summaryScore = responseData.attributeScores[attribute]?.summaryScore?.value;
                if (summaryScore > 0.5) {
                    isToxic = true;
                    break;
                }
            }
            return isToxic;
        });
};

const fillCache = async () => {
    const { data: words } = await axios.get('https://random-word-api.herokuapp.com/word?number=1');
    const word = words[0];

    if (word) {
        const isToxic = await checkScore(word, 'en');
        const { data, error } = await supabase
            .from('profanity')
            .insert([
                { word: word, language: 'en', bad: isToxic },
            ])
            .select()
        if (data != null)
            console.log(data);
    }
};

setInterval(fillCache, 250);