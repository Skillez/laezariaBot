const { bot, errorLog } = require('../app');
const config = require("../bot-settings.json");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require('fs');
const cron = require('node-cron');
const { google } = require('googleapis');
const key = require('../Laezaria-Bot-292d692ec77c.json');

//////////////////////////////////////////////////////////////////////////////////////////////
//                                LEADERBOARD BACKUP HANDLER                                //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', () => {
    // Backup Laezaria Points - https://crontab.guru/examples.html
    cron.schedule('0 21 * * *', () => { //  At 9pm daily.
        const lastUpdate = new Date(Date.now()).toUTCString();
        // console.error('Backup Laezaria Points:', lastUpdate);
        currentLeaderboardSpreadsheet();
        overallLeaderboardSpreadsheet();
        JSONfileBackup();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    async function currentLeaderboardSpreadsheet() {
        const doc = new GoogleSpreadsheet(config.Leaderboard_SpreadsheetID); // Leaderboard Spreadsheet
        await doc.useServiceAccountAuth(key);

        await doc.loadInfo(); // loads document properties and worksheets
        // console.log(`Loaded: ${doc.title}`);

        // create a sheet and set the header row
        // const sheet = await doc.addSheet({ headerValues: ['id', 'tag', 'points'] });

        // get sheet by its ID
        const sheet = doc.sheetsById[config.Leaderboard_Spreadsheet_Sheet_CurrentID]; // use doc.sheetsById[id] or doc.sheetsByIndex[index]

        // Error log when there is not sheet with provided ID
        if (!sheet) return errorLog('leaderboard-backup.js:1 currentLeaderboardSpreadsheet()\nCurrent leaderboard spreadsheet not found.');

        // clear the spreadsheet
        await sheet.clear();

        // set a new header row for the sheet
        await sheet.setHeaderRow(["id", "tag", "points"]);

        // Load points_current.json file and parse it to javascript object
        const currentPointsJSON = fs.readFileSync("./points_current.json", "utf8");
        const currentLB = JSON.parse(currentPointsJSON);

        // Sort the points by its values (from the highest to lowest)
        await currentLB.sort(function (a, b) {
            return b.points - a.points;
        });

        // Add rows from the currentLB array
        await sheet.addRows(currentLB)
        // .then(() => { console.log(`Current leaderboard spreadsheed has been updated!`); });
    }

    async function overallLeaderboardSpreadsheet() {
        const doc = new GoogleSpreadsheet(config.Leaderboard_SpreadsheetID); // Leaderboard Spreadsheet
        await doc.useServiceAccountAuth(key);

        await doc.loadInfo(); // loads document properties and worksheets
        // console.log(`Loaded: ${doc.title}`);

        // get sheet by its ID
        const sheet = doc.sheetsById[config.Leaderboard_Spreadsheet_Sheet_OverallID]; // use doc.sheetsById[id] or doc.sheetsByIndex[index]

        // Error log when there is not sheet with provided ID
        if (!sheet) return errorLog('leaderboard-backup.js:1 overallLeaderboardSpreadsheet()\nOverall leaderboard spreadsheet not found.');

        // clear the spreadsheet
        await sheet.clear();

        // set a new header row for the sheet
        await sheet.setHeaderRow(["id", "tag", "points"]);

        // Load points_overall.json file and parse it to javascript object
        const overallPointsJSON = fs.readFileSync("./points_overall.json", "utf8");
        const overallLB = JSON.parse(overallPointsJSON);

        // Sort the points by its values (from the highest to lowest)
        await overallLB.sort(function (a, b) {
            return b.points - a.points;
        });

        // Add rows from the overallLB array
        await sheet.addRows(overallLB)
        // .then(() => { console.log(`Overall leaderboard spreadsheed has been updated!`); });
    }

    function JSONfileBackup() {
        const scopes = [
            'https://www.googleapis.com/auth/drive'
        ];

        const auth = new google.auth.JWT(
            key.client_email, null,
            key.private_key, scopes
        );

        const drive = google.drive({ version: "v3", auth });

        drive.files.list({}, (error, res) => {
            if (error) return errorLog('leaderboard-backup.js:1 JSONfileBackup() Google Drive API Error', error);
            const files = res.data.files;

            const laezBotFolder = files.find(file => file.name === 'laezaria-bot');
            const laezPointsCurrent = files.find(file => file.name === 'points_current.json');
            const laezPointsOverall = files.find(file => file.name === 'points_overall.json');
            if (!laezBotFolder || !laezPointsCurrent || !laezPointsOverall) return errorLog('leaderboard-backup.js:2 JSONfileBackup()\nlaezaria-bot folder or points_current.json or points_overall.json not found.');

            // Update points files
            if (laezPointsCurrent && laezPointsOverall) {
                const mediaCurrentLB = {
                    mimeType: 'application/json',
                    body: fs.createReadStream('./points_current.json')
                };

                const mediaOverallLB = {
                    mimeType: 'application/json',
                    body: fs.createReadStream('./points_overall.json')
                };

                drive.files.update({
                    fileId: laezPointsCurrent.id,
                    media: mediaCurrentLB
                }, (error, file) => {
                    if (error) errorLog('leaderboard-backup.js:3 JSONfileBackup()\nError to update current leaderboard file.', error);
                    // else console.log('Updated Current LB - Status: ', file.statusText);
                });

                drive.files.update({
                    fileId: laezPointsOverall.id,
                    media: mediaOverallLB
                }, (error, file) => {
                    if (error) errorLog('leaderboard-backup.js:4 JSONfileBackup()\nError to update current leaderboard file.', error);
                    // else console.log('Updated Overall LB - Status: ', file.statusText);
                });
            }
        });


    }
});