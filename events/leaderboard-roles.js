const { bot, errorLog } = require('../laezariaBot');
const config = require("../bot-settings.json");
const fs = require('fs');
const cron = require('node-cron');

bot.on('ready', async () => {
    // Update Leaderboard Message - https://crontab.guru/examples.html
    cron.schedule('0 13 * * *', () => { // At 1pm daily.
        console.log('leaderboard-roles.js: Leaderboard roles update:', currentUTCDate());
        top1LeaderboardDonatorRole('points_overall', config.leaderboard.top1_OverallLB_RoleID);
        top1LeaderboardDonatorRole('points_current', config.leaderboard.top1_CurrentLB_RoleID);
        top10LeaderboardDonatorRole('points_current', config.leaderboard.top10_CurrentLB_RoleID);
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

    async function top1LeaderboardDonatorRole(leaderboardFile, roleID) {

        // Load leaderboardFile.json file and parse it to javascript object
        try {
            const fileContent = fs.readFileSync(`./points_system/${leaderboardFile}.json`, "utf8");
            var leaderboardObject = JSON.parse(fileContent);
        } catch (error) {
            return errorLog(`leaderboard-roles.js:1 top1LeaderboardDonatorRole()\nError to LOAD/PARSE ${leaderboardFile}.json.`);
        }

        // Define top1role
        const top1role = bot.guilds.cache.get(config.laezariaServerID).roles.cache.get(roleID);
        if (!top1role) return errorLog('leaderboard-roles.js:2 top1LeaderboardDonatorRole()\ntop1role is undefined, probably wrong ID or role has been removed from the server!');

        // If there is at least one person in leaderboardObject database
        if (leaderboardObject[0]) {
            const top1user = bot.guilds.cache.get(config.laezariaServerID).members.cache.get(leaderboardObject[0].id);

            // Remove roles from the wrong people
            top1role.members.forEach(async roleMember => {
                // If roleMember is not part of leaderboardObject[0]
                if (roleMember != top1user) await roleMember.roles.remove(top1role)
                    .catch(error => errorLog(`leaderboard-roles.js:3 top1LeaderboardDonatorRole()\nError to remove role(${top1role.name}) from ${roleMember.user.tag}!`, error));
            });

            // If top1 left the guild
            if (!top1user) return;
            // Add top1role to top1user if he missing it
            else if (!top1role.members.find(user => user.id === top1user.user.id)) await top1user.roles.add(top1role)
                .catch(error => errorLog(`leaderboard-roles.js:4 top1LeaderboardDonatorRole()\nError to add role(${top1role.name}) to ${top1user.user.tag}!`, error));
        }
        // Else if leaderboardObject is empty - remove role from everyone
        else {
            // Remove any remaining people from the role
            if (top1role.members.size >= 1) {
                top1role.members.forEach(async user => {
                    await user.roles.remove(top1role)
                        .catch(error => errorLog(`leaderboard-roles.js:5 top1LeaderboardDonatorRole()\nError to remove role(${top1role.name}) from ${user.user.tag}!`, error));
                });
            }
        }
    }

    async function top10LeaderboardDonatorRole(leaderboardFile, roleID) {

        // Load leaderboardFile.json file and parse it to javascript object
        try {
            const fileContent = fs.readFileSync(`./points_system/${leaderboardFile}.json`, "utf8");
            var leaderboardObject = JSON.parse(fileContent);
        } catch (error) {
            return errorLog(`leaderboard-roles.js:1 top10LeaderboardDonatorRole()\nError to LOAD/PARSE ${leaderboardFile}.json.`);
        }

        const top10role = bot.guilds.cache.get(config.laezariaServerID).roles.cache.get(roleID);
        // If top10role is missing
        if (!top10role) return errorLog(`leaderboard-roles.js:2 top10LeaderboardDonatorRole()\ntop10role is undefined, probably wrong ID or role has been removed from the server!`);

        // If there is at least two people in leaderboardObject database
        if (leaderboardObject[1]) {

            // Build an array with top10 users as elements
            const top10Array = [];
            for (let index = 1; index <= 9; index++) {
                if (leaderboardObject[index]) {
                    const element = bot.guilds.cache.get(config.laezariaServerID).members.cache.get(leaderboardObject[index].id);
                    if (element) {
                        // console.log(element);
                        top10Array.push(element);
                    }
                }
            }

            // Add role for top10 people in the leaderboardObject database
            top10Array.forEach(async top10Element => {
                // Check if top10role already has top10Element added
                if (!top10role.members.find(user => user.id === top10Element.user.id)) await top10Element.roles.add(top10role)
                    .catch(error => errorLog(`leaderboard-roles.js:3 top10LeaderboardDonatorRole()\nError to add role(${top10role.name}) to ${top10Element.user.tag}!`, error));
            });

            // Remove roles from the wrong people
            top10role.members.forEach(async roleMember => {
                // Check if roleMember is in top10 of leaderboardObject database
                if (!top10Array.includes(roleMember)) await roleMember.roles.remove(top10role)
                    .catch(error => errorLog(`leaderboard-roles.js:4 top10LeaderboardDonatorRole()\nError to remove role(${top10role.name}) from ${roleMember.user.tag}!`, error));
            });
        }
        // Else if leaderboardObject doesnt have 2 people
        else {
            // Remove any remaining people from the role
            if (top10role.members.size >= 1) {
                top10role.members.forEach(async user => {
                    await user.roles.remove(top10role)
                        .catch(error => errorLog(`leaderboard-roles.js:5 top10LeaderboardDonatorRole()\nError to remove role(${top10role.name}) from ${user.user.tag}!`, error));
                });
            }
        }
    }
});