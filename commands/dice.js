const config = require("../bot-settings.json");

module.exports.help = {
    name: "dice",
    description: "Rolls the dice.",
    type: "public",
    usage: `ℹ️ Format: **${config.BotPrefix}dice sides**\n\nℹ️ Example: ${config.BotPrefix}dice 20`
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                           dice                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

    let DiceResult = getRandomInt(args[0]);
    if (args[0]) {
        if (args[0].length > 6 || args[0] == 0 || args[0] == 1) return message.channel.send(`Choose a number between 1 and 1,000,000`)
            .then(message => { message.delete({ timeout: 5000 }).catch(() => { return; }) }); // remove bot dice missing number

        if (isNaN(DiceResult)) return message.channel.send(`Are you seriously trying to roll the dice with **${args[0]}** sides? <:pepoDerp:410796212661387286>`)
            .then(message => { message.delete({ timeout: 7000 }).catch(() => { return; }) }); // remove bot dice missing number

        message.channel.send(`${message.author} rolled the dice (**D${args[0]}**).\nLanded on ${Number2Emoji(DiceResult)}`)
            .then(message => { message.delete({ timeout: 30000 }).catch(() => { return; }) }); // remove bot dice result message

    } else return message.channel.send(`Wrong command format, type **${config.BotPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

    /////////////////////////////////////////////////////////////////////////////////////////

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max) + 1);
    }

    function Number2Emoji(num) {
        let ones = [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'];

        let numString = num.toString();

        if (numString.length === 1) return ones[num];
        if (numString.length === 2) return ones[numString[0]] + ' ' + ones[numString[1]];
        if (numString.length === 3) return ones[numString[0]] + ' ' + ones[numString[1]] + ' ' + ones[numString[2]];
        if (numString.length === 4) return ones[numString[0]] + ' ' + ones[numString[1]] + ' ' + ones[numString[2]] + ' ' + ones[numString[3]];
        if (numString.length === 5) return ones[numString[0]] + ' ' + ones[numString[1]] + ' ' + ones[numString[2]] + ' ' + ones[numString[3]] + ' ' + ones[numString[4]];
        if (numString.length === 6) return ones[numString[0]] + ' ' + ones[numString[1]] + ' ' + ones[numString[2]] + ' ' + ones[numString[3]] + ' ' + ones[numString[4]] + ' ' + ones[numString[5]];
    }
}