// const { google } = require('googleapis');
import { supabase } from "@/lib/supabaseClient";

const DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';


const checkScore = async (text: string, language: string) => {
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

    const response = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyzeRequest),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    const responseData = await response.json();
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
};

async function checkCensor(word: string): Promise<boolean> {
    word = word.toLowerCase();

    const { data, error } = await supabase
        .from("profanity")
        .select("*")
        .eq("word", word);
    if (error) {
        console.log(error);
    }

    if (data) {
        if (data.length > 0) {
            return data[0].bad;
        }
        if (data.length == 0) {
            const isToxic = await checkScore(word, 'en');
            const { data, error } = await supabase
                .from('profanity')
                .insert([
                    { word: word, language: 'en', bad: isToxic },
                ])
                .select()
            if (error) {
                console.log(error);
            }
            return isToxic;
        }
    }

    return false;
}

async function censor(word: string): Promise<string> {
    word = word.toString();
    const check = await checkCensor(word);
    if (check) {
        if (word.length <= 2) {
            return word;
        }

        const vowels: string = "aeiouAEIOU";

        for (let i: number = 1; i < word.length - 1; i++) {
            const letter: string = word[i];
            if (vowels.includes(letter)) {
                return word.substring(0, i) + '*' + word.substring(i + 1);
            }
        }

        for (let i: number = 1; i < word.length - 1; i++) {
            const letter: string = word[i];
            if (!vowels.includes(letter)) {
                return word.substring(0, i) + '*' + word.substring(i + 1);
            }
        }
        return word;
    }
    else {
        return word;
    }
}

export { censor };