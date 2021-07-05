const { Discord, LaezariaIconURL } = require('../laezariaBot');
const config = require("../bot-settings.json");

module.exports.help = {
    name: "color",
    description: "Shows embed with provided hexCode color.",
    type: "public",
    usage: `ℹ️ Format: **${config.botPrefix}color #hexCode**\nColor Picker: <https://htmlcolorcodes.com/color-picker>\n\nℹ️ Example: ${config.botPrefix}color #0095ff`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                           color                                          //
    //////////////////////////////////////////////////////////////////////////////////////////////

    if (!args[0]) return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    let argHex = args[0].toString().replace(/[#]/g, ""); // remove # from hex code
    return checkHex(argHex);
    /////////////////////////////////////////////////////////////////////////////////////////

    function checkHex(value) {
        let hexTest = /^#([A-Fa-f0-9]{3}$)|([A-Fa-f0-9]{6}$)/.test(value);
        // console.error(hexTest);

        if (hexTest === false) return message.channel.send(`Wrong hexCode format, check out <https://htmlcolorcodes.com/color-picker>!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        if (value.toLowerCase() === 'ffffff') var value = 'feffff'

        // define the embed: send embed with valid hex color argument
        let embed_color = new Discord.MessageEmbed()
            .setColor(value)
            .setAuthor('Laezaria - Color', LaezariaIconURL)
            .setDescription(`Hex Value: ${value.toUpperCase()}`)
            .setTimestamp()
            .setFooter(`by ${message.author.tag}`)
        message.channel.send(embed_color);
    }
}