const { Discord, errorLog } = require('../app');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "image",
    description: "Posts an image using the bot.",
    type: "manager",
    usage: `ℹ️ Format: **${config.BotPrefix}image imageURL messageText(optional)**\n\nℹ️ imageURL requirements:\n• Starts with: http or https\n• Ends with: png, jpg, gif or jpeg\n\nℹ️ Examples:\n${config.BotPrefix}image laezaria\n${config.BotPrefix}image <https://skillez.eu/images/discord/laezicon.png>\n${config.BotPrefix}image <https://i.imgur.com/10OGBDT.png> Laezaria Server Icon`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                     image URL content                                    //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (!message.channel.permissionsFor(message.guild.me).has('ATTACH_FILES')) return message.channel.send(`Permissions are missing!\n⭕ ATTACH_FILES`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return }); // ATTACH_FILES IS REQUIRED TO USE

    if (args[0]) {
        if (args[0].toLowerCase() === 'laezaria') return AttachTheImage('https://skillez.eu/images/discord/laezicon.png');

        let text2send = args.slice(1).join(" ");
        return AttachTheImage(args[0], text2send); // Run the function to attach an image
    } else return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    //////////////////////////////////////////////////////////////////////////////////////////////

    function AttachTheImage(link, text) {
        if (!link.toLocaleLowerCase().startsWith('http' || 'https')) return message.channel.send(`Wrong URL format, Your link doesn't start with http or https!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        if (link.toLocaleLowerCase().endsWith('png') || link.toLowerCase().endsWith('jpg') || link.toLocaleLowerCase().endsWith('gif') || link.toLocaleLowerCase().endsWith('jpeg')) {

            // Create the attachment using MessageAttachment
            const attachment = new Discord.MessageAttachment(link);

            if (text) {
                message.channel.send(text, attachment)
                    .catch(error => errorLog(`image.js:1 AttachTheImage()\nError to send the message probably missing SEND_MESSAGE.`, error));
            } else {
                message.channel.send(attachment)
                    .catch(error => {
                        if (error.message.includes('ENOENT: no such file or directory, stat')) return message.channel.send(`Wrong URL, make sure link starts with: http/https and ends with png, jpg, gif or jpeg!`)
                            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

                        errorLog(`image.js:2 AttachTheImage()\nError to send the message probably missing SEND_MESSAGE.`, error)
                    });
            }

            // IF NOT END WITH DEFINED IMAGE FILE EXTENSION
        } else return message.channel.send(`Wrong URL format, your link doesn't end with png, jpg, gif or jpeg `)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    }
}