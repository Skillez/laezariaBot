const config = require("../bot-settings.json");
const fs = require('fs');
const { Discord, embedColors, errorLog, sendEmbedLog, LaezariaIconURL, embedMessage } = require("../app");

module.exports.help = {
    name: "points",
    description: "Manages user Laezaria Points.",
    type: "manager",
    usage: `ℹ️ Format: **${config.botPrefix}points add/del @mention/userID amount note(optional)**\n\nℹ️ Examples:\n${config.botPrefix}points add @Skillez 100 Event prize\n${config.botPrefix}points del ${config.botOwnerID} 100`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                   points add/del @mention/userID amount note(optional)                   //
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
            case "add": return addPoints(mentionedUser, parseInt(args[2]), args.slice(3).join(" "))
                .then(pointsStatus => { message.channel.send(embedMessage(pointsStatus, message.author)).then(message => message.delete({ timeout: 10000 })).catch(() => { return }); });

            case "del": return delPoints(mentionedUser, parseInt(args[2]), args.slice(3).join(" "))
                .then(pointsStatus => { message.channel.send(embedMessage(pointsStatus, message.author)).then(message => message.delete({ timeout: 10000 })).catch(() => { return }); });

            default: return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        }
    }

    // If wrong command format
    return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    /////////////////////////////////////////////////////////////////////////////////////////

    async function addPoints(user, amount, noteString) {
        // Block 0 and negative amounts of points to add
        if (amount <= 0) return 'You have to add at least **1** point!';
        if (amount > 1000000) return 'You can add up to 1 milion points at once!';

        if (!noteString) noteString = 'Note is not provided';
        const noteStringParts = noteString.match(/.{1,500}/g);

        if (noteStringParts[1]) noteString = `${noteStringParts[0]}...`;
        else noteString = noteStringParts[0];

        var pointsAddedCurrent;
        var pointsAddedOverall;
        await addPointsHandler(user, amount, 'current_season').then(x => { pointsAddedCurrent = x });
        if (pointsAddedCurrent === true) await addPointsHandler(user, amount, 'overall_points').then(x => { pointsAddedOverall = x });

        if (pointsAddedCurrent === true && pointsAddedOverall === true) {
            // System Log
            // console.log(`-----------------------------------------\nLaezaria Points System Log (${user.tag})\ncurrentLB add ${amount} points: ${pointsAddedCurrent}\noverallLB add ${amount} points: ${pointsAddedOverall}\nUser information: ${user.id}\n-----------------------------------------`);
            sendEmbedLog(embedMessageLog(`${message.author} added +${amount.toLocaleString()} points!\n\ncurrent season file: ✅\noverall points file: ✅\n\nNote: ${noteString}`, user), config.botlogs.channelID, 'Laezaria Bot Points - Logs');
            return `📥 You have added **+${amount.toLocaleString()}** points to ${user}!`;
        }
        else if (pointsAddedCurrent === true && pointsAddedOverall != true) {
            // System Log
            // console.log(`-----------------------------------------\nLaezaria Points System Log (${user.tag})\ncurrentLB add ${amount} points: ${pointsAddedCurrent}\noverallLB add ${amount} points: ${pointsAddedOverall}\nUser information: ${user.id}\n-----------------------------------------`);
            sendEmbedLog(embedMessageLog(`${message.author} added +${amount.toLocaleString()} points!\n\ncurrent season file: ✅\noverall points file: ${pointsAddedOverall}\n\nNote: ${noteString}`, user), config.botlogs.channelID, 'Laezaria Bot Points - Logs');
            return `📥 You have added **+${amount.toLocaleString()}** points to ${user}!`;
        }
        else return pointsAddedCurrent;

        async function addPointsHandler(user, amount, folder) {
            // Try to load the JSON file from the database folder
            try {
                fileContent = fs.readFileSync(`./points_system/${folder}/${user.id}.json`, 'utf8');
            } catch (error) {
                if (error.message.includes('ENOENT: no such file or directory, open')) {
                    data = { "id": user.id, "tag": user.tag, "points": amount };
                    fs.writeFileSync(`./points_system/${folder}/${user.id}.json`, JSON.stringify(data, null, 2));
                    return true;
                }
                // console.error(`[${folder} add] ERROR to load ${user.tag} file: ${user.id}`, error);
                return `❌ Error to load user data file!`;
            }

            // File is found and loaded
            if (fileContent) {
                try {
                    var userDataFile = JSON.parse(fileContent);
                } catch (error) {
                    // console.error(`[${folder} add] ERROR: Can't parse ${user.tag} data file: ${user.id}`, error);
                    return `❌ Error to parse user data file!`;
                }

                if (userDataFile) {
                    userDataFile.points = await userDataFile.points + amount;
                    fs.writeFileSync(`./points_system/${folder}/${user.id}.json`, JSON.stringify(userDataFile, null, 2));
                    return true;
                }
            }
        }
    }

    async function delPoints(user, amount, noteString) {
        // Block negative, zero, and over 1m of points to remove
        if (amount <= 0) return 'You have to remove at least **1** point!';
        if (amount > 1000000) return 'You can remove up to 1 milion points at once!';

        if (!noteString) noteString = 'Note is not provided';
        const noteStringParts = noteString.match(/.{1,500}/g);

        if (noteStringParts[1]) noteString = `${noteStringParts[0]}...`;
        else noteString = noteStringParts[0];

        var pointsRemovedResultCurrent;
        var pointsRemovedResultOverall;

        await delPointsHandler(user, amount, 'current_season').then(x => { pointsRemovedResultCurrent = x });
        if (pointsRemovedResultCurrent === true) await delPointsHandler(user, amount, 'overall_points').then(x => { pointsRemovedResultOverall = x });

        if (pointsRemovedResultCurrent === true && pointsRemovedResultOverall === true) {
            // System Log
            // console.log(`-----------------------------------------\nLaezaria Points System Log (${user.tag})\ncurrentLB removed ${amount} points: ${pointsRemovedResultCurrent}\noverallLB removed ${amount} points: ${pointsRemovedResultOverall}\nUser information: ${user.id}\n-----------------------------------------`);
            sendEmbedLog(embedMessageLog(`${message.author} removed -${amount.toLocaleString()} points!\n\ncurrent season file: ✅\noverall points file: ✅\n\nNote: ${noteString}`, user), config.botlogs.channelID, 'Laezaria Bot Points - Logs');
            return `📤 You have removed **-${amount.toLocaleString()}** points from ${user}!`;
        }
        else if (pointsRemovedResultCurrent === true && pointsRemovedResultOverall != true) {
            // System Log
            // console.log(`-----------------------------------------\nLaezaria Points System Log (${user.tag})\ncurrentLB removed ${amount} points: ${pointsRemovedResultCurrent}\noverallLB removed ${amount} points: ${pointsRemovedResultOverall}\nUser information: ${user.id}\n-----------------------------------------`);
            sendEmbedLog(embedMessageLog(`${message.author} removed -${amount.toLocaleString()} points!\n\ncurrent season file: ✅\noverall points file: ${pointsRemovedResultOverall}\n\nNote: ${noteString}`, user), config.botlogs.channelID, 'Laezaria Bot Points - Logs');
            return `📤 You have removed **-${amount.toLocaleString()}** points from ${user}!`;
        }
        else return pointsRemovedResultCurrent;

        async function delPointsHandler(user, amount, folder) {
            // Try to load JSON file from the database folder
            try {
                fileContent = fs.readFileSync(`./points_system/${folder}/${user.id}.json`, 'utf8')
            } catch (error) {
                if (error.message.includes('ENOENT: no such file or directory, open')) return `❌ ${user} doesn't have any points to remove on his account!`;
                // console.error(`[${folder} del] ERROR to load ${user.tag} file: ${user.id}`, error);
                return `❌ Error to load user data file!`;
            }

            // File is found and loaded
            if (fileContent) {
                try {
                    var userDataFile = JSON.parse(fileContent);
                } catch (error) {
                    // console.error(`[${folder} del] ERROR: Can't parse ${user.tag} data file: ${user.id}`, error);
                    return `❌ Error to parse user data file!`;
                }

                // Update points value
                userDataFile.points = await userDataFile.points - amount;

                // If user points result is below 0
                if (userDataFile.points < 0) return `❌ ${user} doesn't have that many points to remove!\nCurrent user balance: ${Math.round(userDataFile.points + amount)}`

                // Check if user has any points left, if not then remove his data file
                if (userDataFile.points <= 0) {
                    fs.unlinkSync(`./points_system/${folder}/${user.id}.json`);
                    return true;
                } else {
                    fs.writeFileSync(`./points_system/${folder}/${user.id}.json`, JSON.stringify(userDataFile, null, 2));
                    return true;
                }
            }
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