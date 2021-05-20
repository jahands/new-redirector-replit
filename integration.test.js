const fetch = require('node-fetch');

// These tests test the actual http redirects of the service
// to ensure that the correct responses are being given.
// run with `jest` or `npm run test`

async function match(req_path, path_to_match) {
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
    const headers = {
        'User-Agent': userAgent
    }
    const url = 'https://new-redirector.amasad.repl.co' + req_path
    const res = await fetch(url, { headers: headers, redirect: 'manual' })
    return res.headers.get('Location')
        .replace('https://replit.com', '')
}

test('No parameters:\n\t/ -> /new/bash', () => {
    return match('/').then(path => {
        expect(path).toBe('/new/bash')
    });
});

test('Name but no language:\n\t/some_name -> /new/bash?name=some_name', () => {
    return match('/some_name').then(path => {
        expect(path).toBe('/new/bash?name=some_name')
    });
});

test('Language (non-shortcut):\n\t/deno -> /new/deno', () => {
    return match('/deno').then(path => {
        expect(path).toBe('/new/deno')
    });
});

test('Language (non-shortcut) + name:\n\t/deno/some_name -> /new/deno?name=some_name', () => {
    return match('/deno/some_name').then(path => {
        expect(path).toBe('/new/deno?name=some_name')
    });
});

test('Language (shortcut):\n\t/py -> /new/python3', () => {
    return match('/py').then(path => {
        expect(path).toBe('/new/python3')
    });
});

test('Language (shortcut) + name:\n\t/py/some_name -> /new/python3?name=some_name', () => {
    return match('/py/some_name').then(path => {
        expect(path).toBe('/new/python3?name=some_name')
    });
});