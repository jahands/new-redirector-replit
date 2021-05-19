const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

const langMap = {
    // Python 3
    'python': 'python3', // python2 is deprecated so default to 3
    'py': 'python3',
    'py3': 'python3',

    // Python 2
    'python2': 'python',
    'py2': 'python',

    // JS languages
    'js': 'nodejs',
    'ts': 'typescript',
    'react': 'reactjs', // 'react' doesn't work.

    // Msc language shortcuts
    'sh': 'bash', // Just to make it consistent
    'lol': 'lolcode',
    'cs': 'coffeescript',
    'c++': 'cpp', // This way you can use either cpp or c++
    'css': 'html', // Seems logical
    'brainf': 'brainfuck', // to match the name shown in the UI
    'r': 'rlang', // This seems more expected to me
    'draw': 'bash', // I kept doing /draw to make a quick drawing lol

    // Requests
    // https://twitter.com/_pranavnt/status/1373751282784108547
    'node': 'nodejs',
    'next': 'nextjs', // Goes to template spotlight page
    'golang': 'go',

    // https://twitter.com/replit/status/1373774122778513408
    'kb': 'kaboom',

    // https://twitter.com/mirobotdev/status/1373866600420540418
    'web': 'html' // A bit generic but I think it's a good mapping
};

let language_keys_cache = {
    timestamp: 0,
    language_keys: []
};

// For static html, etc
app.use('/static', express.static('public'));
// Help page. WIP
app.get('/help', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'help.html'));
});

app.get('/:lang?/:name?', async (req, res) => {
    let lang = req.params.lang || 'bash';
    if (langMap.hasOwnProperty(lang)) {
        lang = langMap[lang];
    }
    let name = req.params.name || ''
    const isValidLang = await isValidLanguageKey(lang);
    if (!isValidLang) {
        if (name === '') {
            // Assume they only specified the name
            name = lang;
            lang = 'bash';
        } else {
            // They specified a name but an invalid language
            // default to bash
            lang = 'bash';
        }
    }
    let nameParam = name !== '' ? `?name=${name}` : '';
    res.redirect(`https://replit.com/new/${lang}${nameParam}`);
});

app.listen(3000, () => {
    console.log('server started');
});

async function getLanguageKeys() {
    now = Date.now()
    if (now - language_keys_cache.timestamp < 86400) {
        return language_keys_cache.language_keys;
    }
    try {
        // Update from upstream
        const url = 'https://replit-language-api.uuid.rocks/api/languages/keys';
        const res = await fetch(url);
        const json = await res.json();
        const keys = json.language_keys;
        language_keys_cache.language_keys = keys;
        language_keys_cache.timestamp = Date.now();
        return keys;
    } catch (e) {
        // Use cached if we fail to get upstream
        return language_keys_cache.language_keys;
    }
}
async function isValidLanguageKey(name) {
    try {
        if (langMap.hasOwnProperty(name)) {
            return true;
        }
        const keys = await getLanguageKeys()
        if (keys.length === 0) {
            return true; // In case something bad happens
        }
        const valid = keys.indexOf(name) > -1;
        return valid;
    } catch (e) {
        // Default to valid if anything goes wrong
        return true;
    }
}