const { bot, errorLog } = require('../app');
const fs = require('fs');
const cron = require('node-cron');

//////////////////////////////////////////////////////////////////////////////////////////////
//                               LEADERBOARD JSON FILE HANDLER                              //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('ready', async () => {
    // Update Leaderboard Messages - https://crontab.guru/examples.html
    cron.schedule('30 12 * * *', () => { // At 12:30pm daily.
        console.log('leaderboard-json.js: Leaderboard JSON files update:', currentUTCDate());
        createJSONleaderboardFile('points_current', 'current_season');
        createJSONleaderboardFile('points_overall', 'overall_points');
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

    function createJSONleaderboardFile(leaderboardFile, folder) {
        // Create array variable
        const files = [];

        // Open 'points_system/folder' folder and put data from each file into 'files' array
        fs.readdirSync(`./points_system/${folder}`).forEach(filename => {
            // console.error(filename);
            const fileContent = fs.readFileSync(`./points_system/${folder}/${filename}`, 'utf8');

            try {
                var userDataFile = JSON.parse(fileContent);
            } catch (error) {
                errorLog(`leaderboard-json.js:1 createJSONleaderboardFile() [${leaderboardFile}] ❌ Error to parse the file: ${filename}`, error);
            }

            if (userDataFile) files.push({ "id": userDataFile.id, "tag": userDataFile.tag, "points": userDataFile.points });
        });

        // Sort the array by its values (from the highest to lowest)
        files.sort(function (a, b) {
            return b.points - a.points;
        });

        // Write array data into leaderboardFile.json
        try {
            fs.writeFileSync(`./points_system/${leaderboardFile}.json`, JSON.stringify(files, null, 2), 'utf8');
        } catch (error) {
            console.error(`❌ Error to write data from 'files' array into ${leaderboardFile}.json`, error);
            errorLog(`leaderboard-json.js:2 createJSONleaderboardFile() ❌ Error to write data from 'files' array into ${leaderboardFile}.json`, error);
        }

        // Print the results
        // return console.log(files.length);
    }
});