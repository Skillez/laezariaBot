const { bot, errorLog } = require('../app');
const config = require("../bot-settings.json");
const fs = require('fs');
const cron = require('node-cron');

bot.on('ready', async () => {
    // Update Leaderboard Message - https://crontab.guru/examples.html
    cron.schedule('0 13 * * *', () => {
        // console.error('Updated Leaderboard Roles:', currentUTCDate());
        topOverallDonatorRole();
        topCurrentDonatorRole();
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

    async function topCurrentDonatorRole() {

        // Load points_current.json file and parse it to javascript object
        const CurrentPointsJSON = fs.readFileSync("./points_current.json", "utf8");
        let currentLB = JSON.parse(CurrentPointsJSON);

        // Sort the points by its values (from the highest to lowest)
        currentLB.sort(function (a, b) {
            return b.points - a.points;
        });

        // If there is at least one person in currentLB database
        if (currentLB[0]) {
            const top10role = bot.guilds.cache.get(config.LaezariaServerID).roles.cache.get(config.Leaderboard_Role_TopCurrentID);

            // If top10role is missing
            if (!top10role) return errorLog(`leaderboard-roles.js:1 topCurrentDonatorRole()\ntop10role is undefined, probably wrong ID or role has been removed from the server!`);

            // Build an array with top10 users as elements
            if (currentLB[0]) var top1user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[0].id);
            if (currentLB[1]) var top2user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[1].id);
            if (currentLB[2]) var top3user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[2].id);
            if (currentLB[3]) var top4user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[3].id);
            if (currentLB[4]) var top5user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[4].id);
            if (currentLB[5]) var top6user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[5].id);
            if (currentLB[6]) var top7user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[6].id);
            if (currentLB[7]) var top8user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[7].id);
            if (currentLB[8]) var top9user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[8].id);
            if (currentLB[9]) var top10user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(currentLB[9].id);

            const top10Array = [
                top1user, top2user, top3user, top4user, top5user, top6user, top7user, top8user, top9user, top10user
            ]

            // Add role for top10 current people in the currentLB database
            top10Array.forEach(async top10Element => {
                if (!top10Element) return;

                // Check if top10role already has top10Element added
                if (top10role.members.find(user => user.id === top10Element.user.id)) return;

                // If top10Element doesn't have the role
                await top10Element.roles.add(top10role)
                    .catch(error => errorLog(`leaderboard-roles.js:2 topCurrentDonatorRole()\nError to add role(${top10role.name}) to ${top10Element.user.tag}!`, error));
            });

            // Remove roles from the wrong people
            top10role.members.forEach(async roleMember => {

                // Check if roleMember is in top10 of currentLB database
                if (top10Array.includes(roleMember)) return;

                // If roleMember is not part of top10 currentLB
                await roleMember.roles.remove(top10role)
                    .catch(error => errorLog(`leaderboard-roles.js:3 topCurrentDonatorRole()\nError to remove role(${top10role.name}) from ${roleMember.user.tag}!`, error));
            });
        }
        // Else if currentLB is empty 
        else {
            const top10role = bot.guilds.cache.get(config.LaezariaServerID).roles.cache.get(config.Leaderboard_Role_TopCurrentID);

            // If top10role is missing
            if (!top10role) return errorLog(`leaderboard-roles.js:4 topCurrentDonatorRole()\ntop10role is undefined, probably wrong ID or role has been removed from the server!`);

            // Remove any remaining people from the role
            if (top10role.members.size >= 1) {
                top10role.members.forEach(async user => {
                    await user.roles.remove(top10role)
                        .catch(error => errorLog(`leaderboard-roles.js:5 topCurrentDonatorRole()\nError to remove role(${top10role.name}) from ${user.user.tag}!`, error));
                });
            }
        }
    }

    async function topOverallDonatorRole() {

        // Load points_overall.json file and parse it to javascript object
        const OverallPointsJSON = fs.readFileSync("./points_overall.json", "utf8");
        let overallLB = JSON.parse(OverallPointsJSON);

        // Sort the points by its values (from the highest to lowest)
        overallLB.sort(function (a, b) {
            return b.points - a.points;
        });

        // If there is at least one person in currentLB database
        if (overallLB[0]) {
            const top1role = bot.guilds.cache.get(config.LaezariaServerID).roles.cache.get(config.Leaderboard_Role_TopOverallID);
            const top1user = bot.guilds.cache.get(config.LaezariaServerID).members.cache.get(overallLB[0].id);

            // If top1role is missing
            if (!top1role) return errorLog('leaderboard-roles.js:1 topOverallDonatorRole()\ntop1role is undefined, probably wrong ID or role has been removed from the server!');

            // If top1 left the guild
            if (!top1user) return;

            // Remove roles from the wrong people
            top1role.members.forEach(async roleMember => {

                // Check if roleMember is in top1 of overallLB database
                if (top1user === roleMember) return;

                // If roleMember is not part of top1 overallLB
                await roleMember.roles.remove(top1role)
                    .catch(error => errorLog(`leaderboard-roles.js:2 topOverallDonatorRole()\nError to remove role(${top1role.name}) from ${roleMember.user.tag}!`, error));
            });

            // Check if the user has role if no, then add it
            if (top1role.members.find(user => user.id === top1user.user.id)) return;
            else await top1user.roles.add(top1role)
                .catch(error => errorLog(`leaderboard-roles.js:3 topOverallDonatorRole()\nError to add role(${top1role.name}) to ${top1user.user.tag}!`, error));
        }
        // Else if overallLB is empty - remove role from everyone
        else {
            const top1role = bot.guilds.cache.get(config.LaezariaServerID).roles.cache.get(config.Leaderboard_Role_TopOverallID);

            // If top1role is missing
            if (!top1role) return errorLog('leaderboard-roles.js:4 topOverallDonatorRole()\ntop1role is undefined, probably wrong ID or role has been removed from the server!');

            // Remove any remaining people from the role
            if (top1role.members.size >= 1) {
                top1role.members.forEach(async user => {
                    await user.roles.remove(top1role)
                        .catch(error => errorLog(`leaderboard-roles.js:5 topOverallDonatorRole()\nError to remove role(${top1role.name}) from ${user.user.tag}!`, error));
                });
            }
        }
    }
});