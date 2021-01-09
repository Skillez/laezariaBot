const config = require("../../bot-settings.json");
const fs = require('fs');
const { Discord, embedColors, errorLog, sendEmbedLog, LaezariaIconURL, embedMessage } = require("../../app");

module.exports.help = {
    name: "points2",
    description: "Manages user Laezaria Points.",
    type: "manager",
    usage: `ℹ️ Format: **${config.botPrefix}points add/del @mention/userID amount**\n\nℹ️ Examples:\n${config.botPrefix}points add @Skillez 100\n${config.botPrefix}points del ${config.botOwnerID} 100`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                           points add/del @mention/userID amount                          //
    //////////////////////////////////////////////////////////////////////////////////////////////

    // Add/Remove points for other people
    if (args[2]) {
        const ReplaceMentionToID = args[1].toString().replace(/[\\<>@#&!]/g, ""); // replace mention to an ID
        const mentionedUser = await bot.users.cache.get(ReplaceMentionToID);

        if (!mentionedUser) return message.channel.send(embedMessage(`This user is not found as a member of ${message.guild.name}!`, message.author))
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        if (isNaN(args[2])) return message.channel.send(embedMessage(`**${args[2]}** is not a valid number!`, message.author))
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        switch (args[0].toLowerCase()) {
            case "add": return addPoints(mentionedUser, parseInt(args[2]));
            case "del": return delPoints(mentionedUser, parseInt(args[2]));

            default: return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
        }
    }

    // If wrong command format
    return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    /////////////////////////////////////////////////////////////////////////////////////////

    async function addPoints(user, amount) {

        // Block 0 and negative amounts of points to add
        if (amount <= 0) return message.channel.send(embedMessage(`You have to add at least **1** point!`, message.author))
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        // Load points_current.json file and parse it to javascript object
        const currentPointsJSON = fs.readFileSync("./points_current.json", "utf8");
        var currentLB = JSON.parse(currentPointsJSON);

        // User is not in the database
        if (!currentLB.find(u => u.id === user.id)) {
            newPoints = { "id": user.id, "tag": user.tag, "points": amount };

            // Don't allow to add more than 1m points in total
            if (newPoints.points > 1000000) return message.channel.send(embedMessage(`You can't add that many points!`, message.author))
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

            // Add a new data in the database
            await currentLB.push(newPoints);

            // Write a new data to the database
            return fs.writeFile("./points_current.json", JSON.stringify(currentLB), (error) => {
                if (error) errorLog(`points.js:1 addPoints()\nError to write data to points_current.json!\nSet ${amount} points to a new ${user.id}(${user.tag}).`, error);

                // Add points in overall database too
                addOverall(user, amount);

                // Send an embed message confirmation (new user)
                message.channel.send(embedMessage(`You have added **+${amount.toLocaleString()}** points to ${user}!`, message.author))
                    .then(info => {
                        info.delete({ timeout: 10000 })
                        sendEmbedLog(embedMessageLog(`${message.author} added +${amount.toLocaleString()} points!`, user), config.botlogs.channelID, 'Laezaria Bot Points - Logs');
                    }).catch(() => { return });
            });
        }

        // User is already in the database
        if (currentLB.find(u => u.id === user.id)) {
            let addPoints = currentLB.find(u => u.id === user.id).points + amount;

            // Set a new values
            currentLB.find(u => u.id === user.id).points = addPoints;
            currentLB.find(u => u.id === user.id).tag = user.tag;

            // Don't allow to add more than 1m points in total to a single user
            if (addPoints > 1000000) return message.channel.send(embedMessage(`You can't add that many points!\nThe final value cannot be above **1M** points! (${addPoints.toLocaleString()}).`, message.author))
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

            // Write an update to the database
            return fs.writeFile("./points_current.json", JSON.stringify(currentLB), error => {
                if (error) errorLog(`points.js:2 addPoints()\nError to write data to points_current.json!\nSet ${addPoints} points to ${user.id}(${user.tag}).`, error);

                // Add points in overall database too
                addOverall(user, amount, currentLB);

                // Send an embed message confirmation (user update)
                message.channel.send(embedMessage(`${user} received **+${amount.toLocaleString()}** points!\nNew balance: **${currentLB.find(u => u.id === user.id).points.toLocaleString()}**`, message.author))
                    .then(info => {
                        info.delete({ timeout: 10000 })
                        sendEmbedLog(embedMessageLog(`${message.author} added +${amount.toLocaleString()} points!`, user), config.botlogs.channelID, 'Laezaria Bot Points - Logs');
                    }).catch(() => { return });
            });
        }
    }

    async function addOverall(user, amount) {
        // Load points_overall.json file and parse it to javascript object
        const addOverallPointsJSON = fs.readFileSync("./points_overall.json", "utf8");
        var overallLB = JSON.parse(addOverallPointsJSON);

        // User is not in the database
        if (!overallLB.find(u => u.id === user.id)) {
            newPoints = { "id": user.id, "tag": user.tag, "points": amount };

            // Add a new data in the database
            await overallLB.push(newPoints);

            // Write a new data to the overall database
            return fs.writeFile("./points_overall.json", JSON.stringify(overallLB), (error) => {
                if (error) errorLog(`points.js:1 addOverall()\nError to write data to points_overall.json!\nSet ${amount} points to a new ${user.id}(${user.tag}).`, error);
            });
        }

        // User is already in the database
        if (overallLB.find(u => u.id === user.id)) {
            let addPoints = overallLB.find(u => u.id === user.id).points + amount;

            // Set a new values
            overallLB.find(u => u.id === user.id).points = addPoints;
            overallLB.find(u => u.id === user.id).tag = user.tag;

            // Write an update to the overall database
            return fs.writeFile("./points_overall.json", JSON.stringify(overallLB), error => {
                if (error) errorLog(`points.js:2 addOverall()\nError to write data to points_overall.json!\nSet ${addPoints} points to ${user.id}(${user.tag}).`, error);
            });
        }
    }

    function delPoints(user, amount) {

        // Block 0 and negative amounts of points to remove
        if (amount <= 0) return message.channel.send(embedMessage(`You have to remove at least **1** point!`, message.author))
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        // Load points_current.json file and parse it to javascript object
        const pointsJSON = fs.readFileSync("./points_current.json", "utf8");
        var currentLB = JSON.parse(pointsJSON);

        // User is not in the database
        if (!currentLB.find(u => u.id === user.id)) return message.channel.send(embedMessage(`${user} doesn't have any points yet!`, message.author))
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        // User is already in the database
        if (currentLB.find(u => u.id === user.id)) {
            let delPoints = currentLB.find(u => u.id === user.id).points - amount;

            // Don't allow to have negative points
            if (delPoints < 0) return message.channel.send(embedMessage(`${user} doesn't have that many points to remove!\nThe final value cannot be below **0** points! (${delPoints.toLocaleString()})`, message.author))
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

            // Set a new values
            currentLB.find(u => u.id === user.id).points = delPoints;
            currentLB.find(u => u.id === user.id).tag = user.tag;

            // Remove user from the database if final value is 0 or below
            if (delPoints <= 0) {
                // Get user index number from the database and remove
                const index = currentLB.findIndex(element => element.id === user.id);
                currentLB.splice(index, 1);
            }

            // Write an update to the database
            return fs.writeFile("./points_current.json", JSON.stringify(currentLB), error => {
                if (error) errorLog(`points.js:1 delPoints()\nError to write data to points_current.json!\nRemove ${amount} points from ${user.id}(${user.tag}).`, error);

                // Remove points from the overall database too
                delOverall(user, amount);

                // If the user is still on the database
                if (currentLB.find(u => u.id === user.id)) {

                    // Send an embed message confirmation (user update)
                    message.channel.send(embedMessage(`Removed **-${amount.toLocaleString()}** points from ${user}!\nNew balance: **${currentLB.find(u => u.id === user.id).points.toLocaleString()}**`, message.author))
                        .then(info => {
                            info.delete({ timeout: 10000 })
                            sendEmbedLog(embedMessageLog(`${message.author} removed -${amount.toLocaleString()} points!`, user), config.botlogs.channelID, 'Laezaria Bot Points - Logs');
                        }).catch(() => { return });
                } else {
                    // Send an embed message confirmation (removed all user points)
                    message.channel.send(embedMessage(`Removed **-${amount.toLocaleString()}** points from ${user}!\nUser doesn't have any points left, so has been removed from the leaderboard!`, message.author))
                        .then(info => {
                            info.delete({ timeout: 10000 })
                            sendEmbedLog(embedMessageLog(`${message.author} removedd -${amount.toLocaleString()} points!`, user), config.botlogs.channelID, 'Laezaria Bot Points - Logs');
                        }).catch(() => { return });
                }
            });
        }
    }

    function delOverall(user, amount) {

        // Load points_overall.json file and parse it to javascript object
        const delOverallPointsJSON = fs.readFileSync("./points_overall.json", "utf8");
        var overallLB = JSON.parse(delOverallPointsJSON);

        // User is not in the overall database
        if (!overallLB.find(u => u.id === user.id)) return;

        // User is already in the overall database
        if (overallLB.find(u => u.id === user.id)) {
            let delPoints = overallLB.find(u => u.id === user.id).points - amount;

            // Set a new values
            overallLB.find(u => u.id === user.id).points = delPoints;
            overallLB.find(u => u.id === user.id).tag = user.tag;

            // Remove user from the overall database if final value is 0 or below
            if (delPoints <= 0) {
                // Get user index number from the database and remove
                const index = overallLB.findIndex(element => element.id === user.id);
                overallLB.splice(index, 1);
            }

            // Write an update to the overall database
            return fs.writeFile("./points_overall.json", JSON.stringify(overallLB), error => {
                if (error) errorLog(`points.js:1 delOverall()\nError to write data to points_overall.json!\nRemove ${amount} points from ${user.id}(${user.tag}).`, error);
            });
        }
    }

    function embedMessageLog(text, receiver) {
        // Send an embed message
        const embed_message_log = new Discord.MessageEmbed()
            .setAuthor(`Laezaria Points System Log`, LaezariaIconURL)
            .setDescription(text)
            .addFields(
                { name: 'Points Receiver Information', value: `${receiver}\n${message.guild.member(receiver.id).displayName}\n${receiver.tag}\nID: ${receiver.id}`, inline: false })
            .setColor(embedColors.PointsColor)
            .setThumbnail(LaezariaIconURL)
            .setTimestamp()
        return embed_message_log;
    }
}