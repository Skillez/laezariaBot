const { errorLog } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "botusername",
    description: "Modifies the bot username.",
    type: "owner",
    usage: `ℹ️ Format: **${config.BotPrefix}botusername userName(2-32 characters)**\n\nℹ️ Example: ${config.BotPrefix}botusername LaezBot`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                   botusername userName                                   //
    //////////////////////////////////////////////////////////////////////////////////////////////

    let BotUserName = args.join(" ")
    for (let i = 0; i < BotUserName.length; i++) {
    }

    if (args[0]) {
        let BotUserName = args.join(" ")
        return ChangeBotUsername(BotUserName);

    } else return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    async function ChangeBotUsername(A1) {

        if (BotUserName.length < 2) return message.channel.send(`Provided username is too short!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        if (BotUserName.length > 32) return message.channel.send(`Provided username is too long!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        let BotUsernameChanged = await bot.user.setUsername(A1)
            .catch(error => {
                switch (error.message) {
                    case "Invalid Form Body\nusername: You are changing your username or Discord Tag too fast. Try again later.": {
                        return message.channel.send(`❌ You are changing username too fast. Try again later.`)
                            .then(message => { message.delete({ timeout: 5000 }).catch(() => { return; }) });
                    }
                    case "Invalid Form Body\nusername: Too many users have this username, please try another.": {
                        return message.channel.send(`❌ Too many users have this username, please try another.`)
                            .then(message => { message.delete({ timeout: 5000 }).catch(() => { return; }) });
                    }
                    default: {
                        return message.channel.send(`❌ You can't change bot username right now.`)
                            .then(message => {
                                message.delete({ timeout: 5000 }).catch(() => { return; })
                                return errorLog(`botusername.js:1 ChangeBotUsername()\nError to change the bot username.`, error);
                            });
                    }
                }
            });

        if (BotUsernameChanged) {
            if (BotUsernameChanged.username === A1) {
                return message.channel.send(`✅ Done!\nNew bot username: **${A1}**`)
                    .then(message => { message.delete({ timeout: 5000 }).catch(() => { return; }) }); // Success message
            }
        }
    }
}