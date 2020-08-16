const { errorLog } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "botstatus",
    description: "Temporarily sets a new status for the bot.",
    type: "Manager",
    usage: `ℹ️ Format: **${config.BotPrefix}botstatus statusType messageToSet**\n\nAvailable statusType options:  \`\`\`less\n[1] PLAYING\n[2] WATCHING\n[3] LISTENING\n[4] STREAMING\n[5] CLEAR\`\`\`\nℹ️ Examples:\n${config.BotPrefix}botstatus playing with pp\n${config.BotPrefix}botstatus watching youtube\n${config.BotPrefix}listening spotify\n${config.BotPrefix}botstatus streaming twitchUsername visit my cool stream\n${config.BotPrefix}botstatus clear`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                  botstatus type content                                  //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (args[0]) {

        if (args[0].toUpperCase() === 'CLEAR') {
            return SetBotStatus(args[0].toUpperCase());
        }

        if (args[0].toUpperCase() === 'PLAYING' || args[0].toUpperCase() === 'LISTENING' || args[0].toUpperCase() === 'WATCHING') {

            if (!args[1]) return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

            let BotTextStatus = message.content.split(' ').splice(2).join(' ');
            return SetBotStatus(args[0].toUpperCase(), BotTextStatus);
        }

        if (args[0].toUpperCase() === 'STREAMING') {

            if (!args[1] || !args[2]) return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

            let BotTextStatus = message.content.split(' ').splice(3).join(' ');
            return SetBotStatus(args[0].toUpperCase(), BotTextStatus, args[1]);
        }

        return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
    } else return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    async function SetBotStatus(A1, A2, A3) {
        if (A2) {
            // for (let i = 0; i < A2.length; i++) {
            //     console.log(Status2Set.charAt(i));
            // }

            if (A2.length > 50) return message.channel.send('The bot status text is too long (up to 50 characters is allowed)')
                .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // if text status is longer than 50 symbols
        }

        if (A1 === 'CLEAR') {
            // Set the bot user activity
            let botActivityClear = await bot.user.setActivity(null)
                .catch(error => errorLog(`botstatus.js:1 SetBotStatus()\nError to clear the bot status.`, error));

            if (!botActivityClear) return;
            else {
                // console.log(`DEBUG: Activity cleared`)
                message.channel.send(`✅ Bot status cleared!`)
                    .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // Confirm cleared botstatus
            }
        }

        if (A1 === 'STREAMING') {
            // Set the bot user activity
            let botActivityStream = await bot.user.setActivity(A2, {
                type: A1,
                url: `https://twitch.tv/${A3}`
            }).catch(error => errorLog(`botstatus.js:2 SetBotStatus()\nError to add stream as the bot status.`, error));

            if (!botActivityStream) return;
            else {
                // console.log(`DEBUG: Activity set to ${presence.activities[0].type} ${presence.activities[0].name} ${presence.activities[0].url}`)
                message.channel.send(`✅ Bot streaming status set!\nType **${config.BotPrefix}${module.exports.help.name} clear** to clear the status.`)
                    .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
            }
        }

        if (A1 === 'PLAYING' || A1 === 'LISTENING' || A1 === 'WATCHING') {
            // Set the bot user activity
            let botActivityUpdate = await bot.user.setActivity(A2, {
                type: A1
            }).catch(error => errorLog(`botstatus.js:3 SetBotStatus()\nError to add playing/listening/watching as the bot status.`, error));

            if (!botActivityUpdate) return;
            else {
                // console.log(`DEBUG: Activity set to ${presence.activities[0].type} ${presence.activities[0].name}`)
                message.channel.send(`✅ Bot ${A1.toLowerCase()} status set!\nType **${config.BotPrefix}${module.exports.help.name} clear** to clear the status.`)
                    .then(message => message.delete({ timeout: 5000 })).catch(() => { return }); // Confirm changed botstatus playing, listening, watching.
            }
        }

    }
}