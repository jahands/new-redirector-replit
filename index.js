const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const Database = require("@replit/database");

const db = new Database();

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
    'rb': 'ruby',

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

let language_keys_memcache = {
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
    const dbkey = 'x:language_keys_cache';
    const max_age = 86400 * 1000; // 1 day
    now = Date.now();
    if (now - language_keys_memcache.timestamp < max_age) {
        return language_keys_memcache.language_keys;
    }
    let cached = null;
    try {
        cached = await db.get(dbkey);
        // Use cached data in Replit db if it's still fresh
        // Great for when the repl reboots often
        if (cached !== null && now - cached.timestamp < max_age) {
            language_keys_memcache.language_keys = cached.language_keys;
            language_keys_memcache.timestamp = Date.now();
            return cached.language_keys;
        }
    } catch (e) {
        // Continue and just get from upstream
    }
    try {
        // Update from upstream
        const url = 'https://replit-language-api.uuid.rocks/api/languages/keys';
        const keys = await fetch(url)
            .then(res => res.json()).then(json => json.language_keys)

        if (!keys || keys.length <= 0) {
            throw new Error('Something went wrong getting keys from upstream api')
        }
        language_keys_memcache.language_keys = keys;
        language_keys_memcache.timestamp = Date.now();
        await db.set(dbkey, language_keys_memcache);
        return keys;
    } catch (e) {
        console.log(e)
        // Use cached if we fail to get upstream
        if (language_keys_memcache.language_keys.length > 0)
            return language_keys_memcache.language_keys;
        if (cached !== null && cached.language_keys.length > 0)
            return cached.language_keys;
        throw e // If both of those fail then throw upstream
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
        // Default to valid if anything goes wrong (it probably won't)
        return true;
    }
}