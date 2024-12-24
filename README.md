# Argon
Argon is a private archival and viewing app for art. The goal is to make it easy to save art and then find and view it later on. This app came about due to art being difficult to find, save, organize, and some art being lost to time.

Argon is private due to the fact it's solely meant for those close to me, though anyone can host their own instance of it if they wish.

# To Do
## Client
### Features
- Allow dragging files onto upload page
- Make the config actually affect things
- Random post button
- Reporting
- Bookmarking
### Tweaks
- Give pop-ups Borders
### Fixes
- Allow bigger files
- Volume slider doesn't match volume when loading page
- Don't allow `&` in tag names (causes URL searching issues)

## Server
### Features
- More webhook notifications
- Maybe a login system? Either that or an improved IP whitelist system
- A Discord bot for managing the server
- Make sorting actually work
### Tweaks
- Check over video uploading
- Make all the functions easier to read
- Log grouping?
- Clean up post editing (move more logic into the endpoint file)
- Code documentation of endpoints
### Fixes
- Fix up files.ts#writeFile