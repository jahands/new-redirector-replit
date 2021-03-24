$slugs = Get-Content 'languages.html' |
    Where-Object { $_.Contains('language-item"') } |
        ForEach-Object {
            $_.Trim().Substring($_.Trim().IndexOf('language-item"><a href="/languages/') + 35).Replace('"', '')
        }

$names = Get-Content 'languages.html' |
    Where-Object { $_.Contains('language-item-name"') } |
        ForEach-Object {
            $_.Trim().Substring($_.Trim().IndexOf('language-item-name">') + 20).Replace('"', '')
        }

$existing = (Get-Content 'languages.json' | ConvertFrom-Json)

class meta {
    [string]$slug
    [string]$type
}
class Language {
    [string]$name
    [string[]]$shortcuts
    [meta]$meta
    Language() {
        $this.shortcuts = @()
        $this.meta = [meta]::new()
    }
}

$newLanguages = $existing
Write-Host $slugs.length $names.length
for ($i = 0; $i -lt $slugs.Length; $i++) {
    if (-not ($existing.languages.shortcuts.Contains($slugs[$i]) -or $existing.languages.meta.slug.Contains($slugs[$i]))) {
        $l = [Language]::new()
        $l.meta.slug = $slugs[$i]
        $l.shortcuts += $slugs[$i]
        $l.meta.type = 'language'
        $l.name = $names[$i]
        $newLanguages.languages += $l
    }
}
$newLanguages | ConvertTo-Json -Depth 100 | Out-File -Encoding utf8 'languages.json'
