# SETUP.md

## step 1: get the code
copy this repo to your computer:
```bash
git clone https://github.com/hdhw/js-auth.git
cd js-auth
```

## step 2: install stuff
your computer needs to download some helper files:
```bash
npm install
```
wait for it to finish downloading everything.

## step 3: start it up
```bash
npm start
```
you should see something like "server running on port 3000"

## step 4: test it works
open your web browser and go to:
- `http://localhost:3000/register` - make a new account
- `http://localhost:3000/login` - sign in

## that's it!

if something breaks:
1. make sure you have node.js installed on your computer
2. make sure you're in the js-auth folder when you run commands
3. check that no other apps are using port 3000

## common problems

**"command not found: npm"**
- you need to install node.js first from nodejs.org

**"port 3000 already in use"**
- something else is using that port
- kill other apps or change the port in server.js

**pages don't load**
- wait a few seconds after running npm start
- make sure you see "server running" message
- try refreshing your browser

**can't register/login**
- check if backend/db/ folder exists
- the app creates files automatically but needs write permissions

done. now you have login pages that work.
