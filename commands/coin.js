module.exports.help = {
    name: "coin",
    description: "Flips a coin",
    type: "public",
    usage: "Type the command without any arguments."
};

module.exports.run = async (bot, message) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                           coin                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

    let FlipResult = coinFlip();
    return message.channel.send(`${message.author} flipped a coin.\nLanded on **${FlipResult}**!`)
        .then(message => { message.delete({ timeout: 30000 }).catch(() => { return; }) }); // remove bot coin result message

    /////////////////////////////////////////////////////////////////////////////////////////

    function coinFlip() {
        return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
    }

}