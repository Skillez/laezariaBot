const { errorLog } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "reload",
    description: "Reloads or load new commands.",
    type: "owner",
    usage: `ℹ️ Format: **${config.BotPrefix}reload commandName**\n\nℹ️ Example: ${config.BotPrefix}reload apply`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                    reload commandName                                    //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (!args.length) return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    const commandName = args[0].toLowerCase();
    const command = bot.commands.get(commandName);

    if (command) {
        delete require.cache[require.resolve(`./${command.help.name}.js`)];
        try {
            const reloadCommand = require(`./${command.help.name}.js`);
            bot.commands.set(reloadCommand.help.name, reloadCommand);

            return message.reply(`The command \`${command.help.name}\` has been reloaded!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        } catch (error) {
            errorLog(`reload.js:1 Error while reloading a command`, error);
            message.channel.send(`There was an error while reloading a command \`${command.help.name}\`:\n\`${error.message}\``)
                .then(message => message.delete({ timeout: 20000 })).catch(() => { return });
        }
    } else {
        try {
            const loadCommand = require(`./${commandName}.js`);
            bot.commands.set(loadCommand.help.name, loadCommand);
            return message.channel.send(`The command \`${commandName}\` has been loaded, ${message.author}!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
        }
        catch (error) {
            message.reply(`There is no \`${commandName}\` command and cannot be reloaded!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
        }
    }

}