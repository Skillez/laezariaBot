const { bot, Discord } = require('../laezariaBot');
const config = require("../bot-settings.json");

// const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(1550, 400);
const ctx = canvas.getContext('2d');

//////////////////////////////////////////////////////////////////////////////////////////////
//                         NEW GUILD MEMBER WELCOME MESSAGE HANDLER                         //
//////////////////////////////////////////////////////////////////////////////////////////////

bot.on('guildMemberAdd', async member => {
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.id === config.channels.welcomeChannelID);
    let welcomeEmojiReact = member.guild.emojis.cache.find(emoji => emoji.name === 'pikawave');
    let welcomeEmojiEnjoy = member.guild.emojis.cache.find(emoji => emoji.name === 'pepegaShake');
    let welcomeEmojiLaezaria = member.guild.emojis.cache.find(emoji => emoji.name === 'laezaria');

    if (!welcomeChannel) return;

    // Fetch all members from the guild
    bot.guilds.cache.get(config.laezariaServerID).members.fetch();

    // Reset the canvas
    ctx.clearRect(0, 0, 1550, 400);

    const backgroundImg = await loadImage('images/background.png');
    // const avatarOutline = await loadImage('images/circleForAvatar.png');

    // Draw a base background image
    ctx.drawImage(backgroundImg, 0, 0);

    // Draw a member username
    const applyText = (canvas, text) => {
        // Declare a base size of the font
        let fontSize = 51;
        do {
            // Assign the font to the context and decrement it so it can be measured again
            ctx.font = `${fontSize -= 2}px Penumbra Serif Std Bold`;
            // console.log(`-2px to the text`);
            // console.log('current username length ' + ctx.measureText(text).width + 'px');
            // Compare pixel width of the text to the canvas minus the approximate avatar size
        } while (ctx.measureText(text).width > 700/*canvas.width - 180*/);
        // Return the result to use in the actual canvas
        return ctx.font;
    };

    // Assign the decided font to the canvas
    ctx.font = applyText(canvas, member.user.username);
    ctx.fillStyle = '#ffffff';

    const centerUsername = Math.round((700 - ctx.measureText(member.user.username).width) / 2);
    // console.log(centerUsername + 'px');
    // console.error(`Max username length: 700\nUsername length: ${ctx.measureText(member.user.username).width}\nHalf of that: ${ctx.measureText(member.user.username).width / 2}`);

    ctx.fillText(member.user.username, 837 + centerUsername, 266);

    // Fuction to draw member count
    ctx.font = '36px Penumbra Serif Std Bold';
    ctx.fillStyle = '#ffffff';

    const numberString = member.guild.members.cache.size.toString().slice(-1);
    MemberCountFunc(numberString);
    function MemberCountFunc(numberString) {
        switch (numberString) {
            case '1': {
                const memberCountString = `${member.guild.members.cache.size}st member!`;
                const centerMemberCountText = Math.round((397 - ctx.measureText(memberCountString).width) / 2);
                return ctx.fillText(memberCountString, 989 + centerMemberCountText, 346);
            }
            case '2': {
                const memberCountString = `${member.guild.members.cache.size}nd member!`;
                const centerMemberCountText = Math.round((397 - ctx.measureText(memberCountString).width) / 2);
                return ctx.fillText(memberCountString, 989 + centerMemberCountText, 346);
            }
            case '3': {
                const memberCountString = `${member.guild.members.cache.size}rd member!`;
                const centerMemberCountText = Math.round((397 - ctx.measureText(memberCountString).width) / 2);
                return ctx.fillText(memberCountString, 989 + centerMemberCountText, 346);
            }
            default: {
                const memberCountString = `${member.guild.members.cache.size}th member!`;
                const centerMemberCountText = Math.round((397 - ctx.measureText(memberCountString).width) / 2);
                return ctx.fillText(memberCountString, 989 + centerMemberCountText, 346);
            }
        }
    }

    // // Draw user avatar on owl's head
    // ctx.drawImage(await roundedAvatar(), 414, 87, 163, 163);
    // ctx.drawImage(avatar, 414, 87, 163, 163); // without rounding it

    // // Draw a circle around the member's avatar
    // ctx.drawImage(avatarOutline, 410, 82);

    // // Save to the file
    // const out = fs.createWriteStream('images/test.png')
    // canvas.createPNGStream().pipe(out);
    // out.on('finish', () => console.log('The PNG file was created.'));

    // Send a welcome message with canvas attachment
    if (!welcomeEmojiReact) welcomeEmojiReact = '👋';
    if (!welcomeEmojiLaezaria) welcomeEmojiLaezaria = '';
    if (!welcomeEmojiEnjoy) welcomeEmojiEnjoy = '';

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'laezaria-welcome.png');
    await welcomeChannel.send(`${member} - Welcome to **Laezaria** ${welcomeEmojiLaezaria}! Check out the <#${config.channels.informationChannelID}> channel. Enjoy your stay ${welcomeEmojiEnjoy}`, attachment)
        .then(message => message.react(welcomeEmojiReact).catch(() => { return }))
        .catch((() => { return }));

    // Reset the canvas
    ctx.clearRect(0, 0, 1550, 400);

    //////////////////////////////////////////////////////////////////////////////////////////////

    // async function roundedAvatar() {
    //     const canvasAvatar = createCanvas(163, 163);
    //     const ctx = canvasAvatar.getContext('2d');
    //     const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 }));

    //     ctx.drawImage(avatar, 0, 0, 163, 163);
    //     ctx.globalCompositeOperation = 'destination-in';
    //     ctx.beginPath();
    //     ctx.arc(81, 81, 80, 0, Math.PI * 2);
    //     ctx.closePath();
    //     ctx.fill();

    //     // Save to the file
    //     const out = fs.createWriteStream('images/roundedAvatar.png')
    //     canvasAvatar.createPNGStream().pipe(out);
    //     out.on('finish', () => console.log('The avatar PNG file was created.'))

    //     // Return rounded avatar
    //     return canvasAvatar;
    // }
});