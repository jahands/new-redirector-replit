const express = require('express');
const path = require('path');

const app = express();

const langMap = {
    // PYTHON 3
    'python': 'python3', // python2 is deprecated so default to 3
    'py': 'python3',
    'py3': 'python3',

    // PYTHON 2
    'python2': 'python',
    'py2': 'python',

    // JS languages
    'js': 'nodejs',
    'ts': 'typescript',

    // MSC language shortcuts
    'sh': 'bash', // Just to make it consistent
    'lol': 'lolcode',
    'cs': 'coffeescript',
    'c++': 'cpp', // This way you can use either cpp or c++
    'css': 'html', // Seems logical

    // Requests
    // https://twitter.com/_pranavnt/status/1373751282784108547
    'node': 'nodejs',
    'next': 'nextjs', // Goes to template spotlight page
    'golang': 'go',

    // https://twitter.com/replit/status/1373774122778513408
    'kb': 'kaboom'
};

// Help page. WIP
app.get('/help', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'help.html'));
});

app.get('/:lang?', (req, res) => {
    let lang = req.params.lang || 'bash';
    if (langMap.hasOwnProperty(lang)) {
        lang = langMap[lang];
    }
    res.redirect(`https://repl.it/languages/${lang}`);
});

app.listen(3000, () => {
    console.log('server started');
});