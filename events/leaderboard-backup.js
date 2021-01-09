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
        // const lastUpdate = new Date(Date.now()).toUTCString();
        console.log('leaderboard-backup.js: Laezaria Points backup:', currentUTCDate());
        leaderboardSpreadsheetUpdate(config.leaderboard.spreadsheetID, config.leaderboard.spreadsheet_sheet_CurrentID, 'points_current');
        leaderboardSpreadsheetUpdate(config.leaderboard.spreadsheetID, config.leaderboard.spreadsheet_sheet_OverallID, 'points_overall');
        leaderboardFileBackup();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function currentUTCDate() {

        function pad2(number) {
            return (number < 10 ? '0' : '') + number;
        }

        function dayOfWeekAsString(dayIndex) {
            return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex] || '';
        }

        function MonthAsString(dayIndex) {
            return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][dayIndex] || '';
        }

        function formatAMPM(date) {
            var hours = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }

        // const date = new Date(2000, 4, 13, 13, 0, 0, 0);
        const date = new Date();
        // return `${date.getUTCDate()} ${MonthAsString(date.getUTCMonth())} ${date.getUTCFullYear()} • ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
        return `${date.getUTCDate()} ${MonthAsString(date.getUTCMonth())} ${date.getUTCFullYear()} • ${formatAMPM(date)} UTC`;
    }

    async function leaderboardSpreadsheetUpdate(spreadsheedID, sheetID, leaderboardFile) {
        const doc = new GoogleSpreadsheet(spreadsheedID); // Leaderboard Spreadsheet
        await doc.useServiceAccountAuth(key);

        // loads document properties and worksheets
        await doc.loadInfo();

        // get sheet by its ID
        const sheet = doc.sheetsById[sheetID]; // use doc.sheetsById[id] or doc.sheetsByIndex[index]

        // Error log when there is not sheet with provided ID
        if (!sheet) return errorLog(`leaderboard-backup.js:1 leaderboardSpreadsheetUpdate()\nLeaderboard(${leaderboardFile}) spreadsheet(${sheetID}) not found.`);

        // clear the spreadsheet
        await sheet.clear();

        // set a new header row for the sheet
        await sheet.setHeaderRow(["id", "tag", "points"]);

        // Load ${leaderboardFile}.json file and parse it to javascript object
        try {
            const fileContent = fs.readFileSync(`./points_system/${leaderboardFile}.json`, "utf8");
            var leaderboardObject = JSON.parse(fileContent);
        } catch (error) {
            return errorLog(`leaderboard-backup.js:2 leaderboardSpreadsheetUpdate()\nError to LOAD/PARSE '${leaderboardFile}.json'`, error);
        }

        // Add rows from the leaderboardObject array
        await sheet.addRows(leaderboardObject)
        // .then(() => { console.log(`Leaderboard(${leaderboardFile}) spreadsheed(${sheetID}) has been updated!`); });
    }

    function leaderboardFileBackup() {
        const scopes = [
            'https://www.googleapis.com/auth/drive'
        ];

        const auth = new google.auth.JWT(
            key.client_email, null,
            key.private_key, scopes
        );

        const drive = google.drive({ version: "v3", auth });

        drive.files.list({}, (error, res) => {
            if (error) return errorLog('leaderboard-backup.js:1 leaderboardFileBackup() Google Drive API Error', error);
            const files = res.data.files;

            const laezBotFolder = files.find(file => file.name === 'laezaria-bot');
            const laezPointsCurrent = files.find(file => file.name === 'points_current.json');
            const laezPointsOverall = files.find(file => file.name === 'points_overall.json');
            if (!laezBotFolder || !laezPointsCurrent || !laezPointsOverall) return errorLog('leaderboard-backup.js:2 leaderboardFileBackup()\nlaezaria-bot folder or points_current.json or points_overall.json not found.');

            // Update points files
            if (laezPointsCurrent && laezPointsOverall) {
                const mediaCurrentLB = {
                    mimeType: 'application/json',
                    body: fs.createReadStream('./points_system/points_current.json')
                };

                const mediaOverallLB = {
                    mimeType: 'application/json',
                    body: fs.createReadStream('./points_system/points_overall.json')
                };

                drive.files.update({
                    fileId: laezPointsCurrent.id,
                    media: mediaCurrentLB
                }, (error, file) => {
                    if (error) errorLog('leaderboard-backup.js:3 leaderboardFileBackup()\nError to update current leaderboard file.', error);
                    // else console.log('Updated Current LB - Status: ', file.statusText);
                });

                drive.files.update({
                    fileId: laezPointsOverall.id,
                    media: mediaOverallLB
                }, (error, file) => {
                    if (error) errorLog('leaderboard-backup.js:4 leaderboardFileBackup()\nError to update current leaderboard file.', error);
                    // else console.log('Updated Overall LB - Status: ', file.statusText);
                });
            }
        });
    }
});