const fetch = require('node-fetch');

// These tests test the actual http redirects of the service
// to ensure that the correct responses are being given.
// Run with `jest` or `npm run test`

describe(`Redirector`, () => {
    const baseUrl = 'https://new-redirector.util.repl.co'
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
    const headers = {
        'User-Agent': userAgent
    };

    async function match(req_path) {
        const url = baseUrl + req_path;
        const res = await fetch(url, { headers: headers, redirect: 'manual' });
        return res.headers.get('Location')
            .replace('https://replit.com', '');
    }

    test(`No parameters:
        / -> /new/bash`, async () => {
            const path = await match('/');
            expect(path).toBe('/new/bash');
        });

    test(`Name but no language:
        /some_name -> /new/bash?name=some_name`, async () => {
            const path = await match('/some_name');
            expect(path).toBe('/new/bash?name=some_name');
        });

    test(`Language (non-shortcut):
        /deno -> /new/deno`, async () => {
            const path = await match('/deno');
            expect(path).toBe('/new/deno');
        });

    test(`Language (non-shortcut) + name:
        /deno/some_name -> /new/deno?name=some_name`, async () => {
            const path = await match('/deno/some_name');
            expect(path).toBe('/new/deno?name=some_name');
        });

    test(`Language (shortcut):
        /py -> /new/python3`, async () => {
            const path = await match('/py');
            expect(path).toBe('/new/python3');
        });

    test(`Language (shortcut) + name:
        /py/some_name -> /new/python3?name=some_name`, async () => {
            const path = await match('/py/some_name');
            expect(path).toBe('/new/python3?name=some_name');
        });

    test(`Make sure help page appears to exist`, async () => {
        const res = await fetch(baseUrl + '/help', { headers: headers })
        expect(res.status).toBe(200);
        const text = await res.text()
        expect(text.indexOf('<!doctype html>')).toBe(0)
    });
})


describe('Replit Language API', () => {
    const keysUrl = 'https://replit-language-api.uuid.rocks/api/languages/keys'
    it('Should have a list of language_keys', async () => {
        const res = await fetch(keysUrl)
        const data = await res.json()
        expect(data.api_version).toBe(1)
        const keys = data.language_keys
        // Make sure it's the right type
        expect(typeof keys).toBe('object')
        expect(Array.isArray(keys)).toBe(true)
        // Make sure all language keys are strings
        expect(keys.every((k) => typeof k === 'string')).toBe(true)
        // Make sure there are some keys
        expect(keys.length).toBeGreaterThan(0)
    })
})