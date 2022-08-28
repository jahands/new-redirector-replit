gen-lang-list.ps1 adds missing languages parsed from the languages section of replit.com/languages HTML and adds it to languages.json.

May add language descriptions in the future to languages.json

Right now I'm manually copying languages.json to help.html

TODO: Switch to Replit Language API instead of parsing HTML (which has changed, breaking this script): https://replit-language-api.uuid.rocks/api/languages