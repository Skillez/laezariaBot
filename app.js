const Discord = require('discord.js');
const fs = require('fs');
const config = require("./bot-settings.json");
require('console-stamp')(console, 'dd/mm/yyyy - HH:MM:ss');

const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

// define current bot version
const BotVersion = '1.6d';

// define global embed color
const embedColors = {
	'AppReaction': '#ffa500',				//	application-reaction.js
	'AppRejected': '#7b68ee',				//		- reject
	'AppAccepted': '#40ff00',				//		- welcome
	'DMredirect': '#0095ff',				//	dm-redirection.js
	'ReadyEvent': '#cc33ff',				//	ready-event.js
	'GuildMemberEvent': '#99004d',			//	guild-member-goodbye.js && guild-member-welcome.js
	'DirectMessage': '#ff00ff',				//	dm.js
	'EditMessage': '#c71585',				//	edit.js
	'SayMessage': '#a64dff',				//	say.js
	'PointsColor': '#F0E68C',				//	points.js
	'StatusMessage': '#008080',				//	status.js
	'ClubApplications': '#A447E4',			//	club-applications.js
	'InfoReactionLog': "#FFFEFF",			//  information-remove-guest.js
	'pollMessage': "#9d5fff",				// poll.js
	'DefaultMessage': "#ff9933",			//  default color for embeds

	'LightSalmon': '#FFA07A',
	'additionalcolor': '#e60073'
}

const emojiCharacters = {
	a: '🇦', b: '🇧', c: '🇨', d: '🇩',
	e: '🇪', f: '🇫', g: '🇬', h: '🇭',
	i: '🇮', j: '🇯', k: '🇰', l: '🇱',
	m: '🇲', n: '🇳', o: '🇴', p: '🇵',
	q: '🇶', r: '🇷', s: '🇸', t: '🇹',
	u: '🇺', v: '🇻', w: '🇼', x: '🇽',
	y: '🇾', z: '🇿', 0: '0⃣', 1: '1⃣',
	2: '2⃣', 3: '3⃣', 4: '4⃣', 5: '5⃣',
	6: '6⃣', 7: '7⃣', 8: '8⃣', 9: '9⃣',
	10: '🔟', '#': '#⃣', '*': '*⃣',
	'!': '❗', '?': '❓', 'i': 'ℹ️',
};

// // define the embed color by role
// let roleColor = message.guild.me.displayHexColor === "#000000" ? "#ffffff" : message.guild.me.displayHexColor;

// define icon image url for embeds
const LaezariaIconURL = 'https://i.imgur.com/wplVBfr.png';

// bot.setMaxListeners(25);

// Load command and events
bot.commands = new Discord.Collection();

fs.readdir('./events/', (err, files) => {
	if (err) console.error(err);

	let jsfiles = files.filter(f => f.split('.').pop() === 'js');
	if (jsfiles.length <= 0) return console.log('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nThere are no events to load...\n\n');

	console.log(`\n▬▬▬▬▬▬▬▬ LOADED EVENTS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
	jsfiles.forEach((f, i) => {
		require(`./events/${f}`);
		console.log(`${i + 1}: ${f}`);
	});
});

fs.readdir('./commands/', (err, files) => {
	if (err) console.error(err);

	let jsfiles = files.filter(f => f.split('.').pop() === 'js');
	if (jsfiles.length <= 0) return console.log('\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\nThere are no commands to load...\n\n');

	console.log(`\n▬▬▬▬▬▬▬▬ LOADED COMMANDS (${jsfiles.length}) ▬▬▬▬▬▬▬▬`);
	jsfiles.forEach((f, i) => {

		let props = require(`./commands/${f}`);
		console.log(`${i + 1}: ${props.help.type} - ${f}`);
		bot.commands.set(props.help.name, props);
	});
});

module.exports = {
	bot: bot, // bot client
	Discord: Discord, // discord module
	embedColors: embedColors, // Global color for embeds
	emojiCharacters: emojiCharacters, // Defines some emojis

	LaezariaIconURL: LaezariaIconURL, //defines icon image url for embeds
	BotVersion: BotVersion, //defines current bot version

	botPermission: function (permission) {
		let BotRolePermissions = bot.guilds.cache.get(config.laezariaServerID).members.cache.get(bot.user.id).permissions;
		if (BotRolePermissions.has(permission) === true) return true;
		else return false;
	},

	ownerDM: function (message) {
		if (!bot.users.cache.get(config.botOwnerID)) return console.warn(`app.js:1 ownerDM() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.botOwnerID)`);
		bot.users.cache.get(config.botOwnerID).send(message).catch(() => { console.warn(`app.js:2 ownerDM() ❌ Owner has DMs disabled.`) });
	},

	errorLog: function (text, error) {
		if (!error) error = '';
		if (!text) text = 'Text is not provided';

		if (!bot.users.cache.get(config.botOwnerID)) return console.warn(`app.js:1 errorLog() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.botOwnerID)`);
		bot.users.cache.get(config.botOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + text + "```" + error)
			.then(() => console.error(`${text}\n`, error))
			.catch(error => { console.warn(`app.js:2 errorLog() ❌ Owner has DMs disabled.`, error) });
	},

	getCommand: function (commandName) {
		return bot.commands.get(commandName);
	},

	botReply: function (text, message, time, deleteStatus, attachFile, embedImage) {
		if (embedImage) {
			if (deleteStatus) {
				if (text) {
					const imageFileSplit = embedImage.split('/').slice(-1).toString();
					const embed_message = new Discord.MessageEmbed()
						.setColor('RANDOM')
						.attachFiles([embedImage])
						.setImage(`attachment://${imageFileSplit}`)
					return message.reply(text, embed_message)
						.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
				} else {
					const imageFileSplit = embedImage.split('/').slice(-1).toString();
					const embed_message = new Discord.MessageEmbed()
						.setColor('RANDOM')
						.attachFiles([embedImage])
						.setImage(`attachment://${imageFileSplit}`)
					return message.reply(embed_message)
						.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
				}
			}
			else if (text) {
				const imageFileSplit = embedImage.split('/').slice(-1).toString();
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
				return message.reply(text, embed_message);
			} else {
				const imageFileSplit = embedImage.split('/').slice(-1).toString();
				const embed_message = new Discord.MessageEmbed()
					.setColor('RANDOM')
					.attachFiles([embedImage])
					.setImage(`attachment://${imageFileSplit}`)
				return message.reply(embed_message);
			}
		}
		else if (attachFile) {
			// Create the attachment using MessageAttachment
			const attachment = new Discord.MessageAttachment(attachFile);

			if (deleteStatus) {
				return message.reply(text, attachment)
					.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
			} else return message.reply(text, attachment);
		}
		else if (deleteStatus) {
			return message.reply(text,)
				.then(message => { if (message && message.deletable) message.delete({ timeout: time }).catch(() => { }); });
		} else return message.reply(text);
	},

	embedMessage: function (text, user, imageFile) {

		if (imageFile) {
			const imageFileSplit = imageFile.split('/').slice(-1).toString();
			const embed_message = new Discord.MessageEmbed()
				.setColor(embedColors.SayMessage)
				.attachFiles([imageFile])
				.setImage(`attachment://${imageFileSplit}`)
			return embed_message;
		}
		else if (!user) {
			// Send an embed message without footer
			const embed_message = new Discord.MessageEmbed()
				.setDescription(text)
				.setColor(embedColors.DefaultMessage)
			return embed_message;
		} else {
			// Send an embed message with footer
			const embed_message = new Discord.MessageEmbed()
				.setDescription(text)
				.setColor(embedColors.DefaultMessage)
				.setFooter(user.tag, user.displayAvatarURL())
			return embed_message;
		}
	},

	getCommands: function () {
		return bot.commands;
	},

	getEmoji: function (serverID, emojiName) {
		let getEmoji = bot.guilds.cache.get(serverID).emojis.cache.find(emoji => emoji.name.toLowerCase() === emojiName.toLowerCase());
		if (getEmoji) return getEmoji;
		else return getEmoji = '🐛';
		// else return undefined;
	},

	messageRemoverWithReact: async function (message, author) {
		try {
			await message.react('❌');
		} catch (error) {
			if (!bot.users.cache.get(config.botOwnerID)) return console.warn(`app.js:1 messageRemoverWithReact() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.botOwnerID)`);
			bot.users.cache.get(config.botOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + `app.js:2 messageRemoverWithReact()\nError to add reactions probably missing ADD_REACTION/READ_MESSAGE_HISTORY or wrong emojis.` + "```" + error)
				.then(() => console.error(`app.js:2 messageRemoverWithReact()\nError to add reactions probably missing ADD_REACTION/READ_MESSAGE_HISTORY or wrong emojis.`, error))
				.catch(() => { console.warn(`app.js:3 messageRemoverWithReact() ❌ Owner has DMs disabled.`) });
		}

		const emojiFilter = (reaction, user) => {
			return ['❌'].includes(reaction.emoji.name) && !user.bot && author === user;
		}

		message.awaitReactions(emojiFilter, { max: 1, time: 60000 })
			.then(collected => {
				const reaction = collected.first();

				if (reaction.emoji.name === '❌') return message.delete().catch(() => { return });

			})
			.catch(error => {
				if (error.message === "Cannot read property 'emoji' of undefined") return message.delete().catch(() => { return });

				if (!bot.users.cache.get(config.botOwnerID)) return console.warn(`app.js:4 messageRemoverWithReact() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.botOwnerID)`);
				bot.users.cache.get(config.botOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + `app.js:5 messageRemoverWithReact()` + "```" + error)
					.then(() => console.error(`app.js:5 messageRemoverWithReact().`, error))
					.catch(() => { console.warn(`app.js:6 messageRemoverWithReact() ❌ Owner has DMs disabled.`) });
			});
	},

	sendEmbedLog: async function (embedMessage, channelID, embedName) {
		// Send a webhook message and create one if missing (no need to provide webhookID in the config file)
		try {
			var logChannel = bot.channels.cache.get(channelID);
			const webhooks = await logChannel.fetchWebhooks();
			const botwebhook = await webhooks.find(webhook => webhook.owner === bot.user && webhook.name === embedName);

			await botwebhook.send(embedMessage);

			// await botwebhook.send('Webhook test', {
			//     username: 'some-username',
			//     avatarURL: 'https://i.imgur.com/wSTFkRM.png',
			//     embeds: [embedMessage],
			// });

		} catch (error) {

			switch (error.message) {
				case "Cannot read property 'send' of undefined": {
					return logChannel.createWebhook(embedName, {
						avatar: LaezariaIconURL,
					})
						.then(webhook => {
							webhook.send(embedMessage);
							return console.info(`app.js:1 sendEmbedLog() Created webhook: '${webhook.name}' for the #${logChannel.name} channel.`);
						});
				}
				case "Cannot read property 'fetchWebhooks' of undefined": {
					if (!bot.users.cache.get(config.botOwnerID)) return console.warn(`app.js:2 sendEmbedLog() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.botOwnerID)`);
					bot.users.cache.get(config.botOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + `app.js:3 sendEmbedLog()\nChannel 'logChannel' not found.` + "```" + error)
						.then(() => console.error(`app.js:3 sendEmbedLog()\nChannel 'logChannel' not found.`, error))
						.catch(() => { console.warn(`app.js:4 sendEmbedLog() ❌ Owner has DMs disabled.`) });
					return;
				}
				case "Missing Permissions": {
					if (!bot.users.cache.get(config.botOwnerID)) return console.warn(`app.js:5 sendEmbedLog() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.botOwnerID)`);
					bot.users.cache.get(config.botOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + `app.js:6 sendEmbedLog()\nProbably: MANAGE_WEBHOOKS.` + "```" + error)
						.then(() => console.error(`app.js:6 sendEmbedLog()\nProbably: MANAGE_WEBHOOKS.`, error))
						.catch(() => { console.warn(`app.js:7 sendEmbedLog() ❌ Owner has DMs disabled.`) });
					return;
				}
				default: {
					if (!bot.users.cache.get(config.botOwnerID)) return console.warn(`app.js:8 sendEmbedLog() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.botOwnerID)`);
					bot.users.cache.get(config.botOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + `app.js:9 sendEmbedLog()\nError trying to send a webhook log.` + "```" + error)
						.then(() => console.error(`app.js:9 sendEmbedLog()\nError trying to send a webhook log.`, error))
						.catch(() => { console.warn(`app.js:10 sendEmbedLog() ❌ Owner has DMs disabled.`) });
					return;
				}
			}
		}
	},

	removeUserLastMessage: function (Member) {
		if (!Member.lastMessage) return; // console.log(`NULL - LAST MESSAGE FROM ${Member.tag} IS NOT FOUND`);

		Member.lastMessage.channel.messages.fetch(Member.lastMessage.id)
			.then(MemberLastMessage => {
				if (MemberLastMessage.deletable) MemberLastMessage.delete({ timeout: 750 }).catch(() => { return });
			}).catch(error => {
				if (!bot.users.cache.get(config.botOwnerID)) return console.warn(`app.js:1 removeUserLastMessage() ❌ The bot Owner is UNDEFINED (probably wrong userID in: config.botOwnerID)`);
				bot.users.cache.get(config.botOwnerID).send(`❌ an issue occurred with the **${bot.user.username}** application!` + "```" + `app.js:2 removeUserLastMessage()` + "```" + error)
					.then(() => console.error(`app.js:2 removeUserLastMessage()`, error))
					.catch(() => { console.warn(`app.js:3 removeUserLastMessage() ❌ Owner has DMs disabled.`) });
			});
	}
}