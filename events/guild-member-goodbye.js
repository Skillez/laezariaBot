const { bot } = require('../app');
const config = require("../bot-settings.json");

//////////////////////////////////////////////////////////////////////////////////////////////
//                           MEMBER LEAVE GOODBYE MESSAGE HANDLER                           //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('guildMemberRemove', async member => {
    const goodbyeChannel = member.guild.channels.cache.find(ch => ch.id === config.channels.goodbyeChannelID);
    let goodbyeEmojiReact = member.guild.emojis.cache.find(emoji => emoji.name === 'pepoHug');
    let goodbyeEmojiSad = member.guild.emojis.cache.find(emoji => emoji.name === 'apeepoSadLove');
    let goodbyeEmojiLaezaria = member.guild.emojis.cache.find(emoji => emoji.name === 'laezaria');

    if (!goodbyeChannel) return;

    if (!goodbyeEmojiReact) goodbyeEmojiReact = '😭';
    if (!goodbyeEmojiLaezaria) goodbyeEmojiLaezaria = '';
    if (!goodbyeEmojiSad) goodbyeEmojiSad = '';

    goodbyeChannel.send(`**${member.user.tag}** just left Laezaria ${goodbyeEmojiLaezaria}. Bye bye ${member.user.tag}... ${goodbyeEmojiSad}`)
        .then(message => message.react(goodbyeEmojiReact).catch(() => { return }))
        .catch((() => { return }));
});