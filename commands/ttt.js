const { errorLog, removeUserLastMessage } = require('../app');
const config = require("../bot-settings.json");
const fs = require('fs');

module.exports.help = {
    name: "ttt",
    description: "TicTacToe.",
    type: "public",
    usage: "Type the command without any arguments"
};

module.exports.run = async (bot, message, args) => {

    //////////////////////////////////////////////////////////////////////////////////////////////
    //                                            ttt                                           //
    //////////////////////////////////////////////////////////////////////////////////////////////

    // data = { "gameRunning": false };
    // fs.writeFileSync(`./games/ttt.json`, JSON.stringify(data, null, 2));

    // fileContent = fs.readFileSync(`./games/ttt.json`, 'utf8');
    // const DataFile = JSON.parse(fileContent);
    // console.log(DataFile.gameRunning)

    const symbol1 = '🟦';
    const symbol2 = '🟥';

    // const playerSymbol []; // to do
    let gameBoard = ['⬜','⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜']

    console.debug(gameBoard);
    console.debug(gameBoard[0]);

    if (args[0]) {
        const ReplaceMentionToID = args[0].replace(/[\\<>@#&!]/g, ""); // replace mention to an ID

        var player1 = message.author;
        var player2 = bot.users.cache.get(ReplaceMentionToID);



        if (player2) {
            if (player2 === player1) return message.channel.send(`You can't play against yourself!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        } else return message.channel.send(`Error to find 2nd player!`)
            .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

        console.debug(player1);
        console.debug(player2);


        initQuestion();



    } else return message.channel.send(`Wrong command format, type **${config.botPrefix}help ${module.exports.help.name}** to see usage and examples!`)
        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });


    /////////////////////////////////////////////////////////////////////////////////////////

    function initQuestion() {

        if (gameStatus() === true) {
            return message.channel.send(`Game is currently running!`)
                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
        }

        gameStatusSet(true);
        return message.channel.send(`Hey ${player2}, ${player1} wants to play TTT against you!`)
            .then(async Question => {
                try {
                    await Question.react('✅');
                    await Question.react('❌');
                } catch (error) {
                    message.channel.send(`An unknown error occured ;(`)
                        .then(message => message.delete({ timeout: 10000 })).catch(() => { return });
                    Question.delete().catch(() => { return });
                    appStorageMessage.delete().catch(() => { return });
                    errorLog(`ttt.js:1 initQuestion()\nError to add reactions probably wrong emojis.`, error)
                }

                const emojiFilter = (reaction, user) => {
                    return ['✅', '❌'].includes(reaction.emoji.name) && !user.bot && player2 === user;
                }

                Question.awaitReactions(emojiFilter, { max: 1, time: 60000 })
                    .then(collected => {
                        const reaction = collected.first();

                        if (reaction.emoji.name === '✅') {
                            Question.delete();
                            tttChoseFirstPlayer();
                            return console.debug(`${player2.tag} reacted with ${reaction.emoji.name}`);
                        }

                        if (reaction.emoji.name === '❌') {
                            gameStatusSet(false);
                            Question.delete();
                            message.channel.send(`❌ ${player2} rejected your request, ${player1}`)
                                .then(message => message.delete({ timeout: 10000 })).catch(() => { return });

                            return console.debug(`${player2.tag} reacted with ${reaction.emoji.name}`);
                        }
                    })
                    .catch(error => {
                        gameStatusSet(false);
                        if (error.message === "Cannot read property 'emoji' of undefined") return message.channel.send(`${player1} ❌ There was no reaction from your opponent within the time limit (60s)! - cancelling...`)
                            .then(message => {
                                message.delete({ timeout: 10000 }).catch(() => { return });
                                Question.delete().catch(() => { return });
                            }); // remove bot info about time ran out

                        errorLog(`ttt.js:2 initQuestion()\nError when user answer the question.`, error);
                    });
            });
    }

    function tttChoseFirstPlayer() {
        const pickRandom = Math.floor(Math.random() * Math.floor(2));
        if (pickRandom === 0) {
            tttGame(player1);
            console.error(`player1 chosen:`, player1);
            return;
        } else {
            tttGame(player2);
            console.error(`player2 chosen:`, player2);
            return;
        }
    }

    function tttGame(currentPlayer) {
        console.debug(`tttGame triggered currentPlayer: ${currentPlayer.tag}`);

        const filter = m => m.author === currentPlayer;

        message.channel.send(`${currentPlayer} your turn!\n${gameBoard[0]}${gameBoard[1]}${gameBoard[2]}\n${gameBoard[3]}${gameBoard[4]}${gameBoard[5]}\n${gameBoard[6]}${gameBoard[7]}${gameBoard[8]}`)
            .then(botMessage => {
                message.channel.awaitMessages(filter, { max: 1, time: 60000 })
                    .then(Answer => {
                        botMessage.delete().catch(() => { return });
                        if (Answer.first().content.startsWith(config.botPrefix)) return;

                        if (Answer.first().content.toLowerCase() === 'exit' || Answer.first().content.toLowerCase() === 'cancel' || Answer.first().content.toLowerCase() === 'surrender' || Answer.first().content.toLowerCase() === 'ff' || Answer.first().content.toLowerCase() === 'surr' || Answer.first().content.toLowerCase() === 'ff15') {
                            removeUserLastMessage(currentPlayer);
                            gameStatusSet(false);
                            return message.channel.send(`${currentPlayer} ❌ Decided to surrender...`)
                                .then(message => message.delete({ timeout: 5000 })).catch(() => { return });
                        }

                        switch (Answer.first().content.toLowerCase()) {
                            case 'pos1': {
                                if (currentPlayer === player1) {
                                    gameBoard[0] = symbol1;
                                    removeUserLastMessage(currentPlayer);
                                    tttGame(player2);
                                } else {
                                    gameBoard[0] = symbol2;
                                    removeUserLastMessage(currentPlayer);
                                    tttGame(player1);
                                }
                                return console.log(`${currentPlayer.tag} choose pos1`);
                            }

                            case 'pos2': {
                                if (currentPlayer === player1) {
                                    gameBoard[1] = symbol1;
                                    removeUserLastMessage(currentPlayer);
                                    tttGame(player2);
                                } else {
                                    gameBoard[1] = symbol2;
                                    removeUserLastMessage(currentPlayer);
                                    tttGame(player1);
                                }
                                return console.log(`${currentPlayer.tag} choose pos2`);
                            }

                            case 'pos3': {
                                if (currentPlayer === player1) {
                                    gameBoard[2] = symbol1;
                                    removeUserLastMessage(currentPlayer);
                                    tttGame(player2);
                                } else {
                                    gameBoard[3] = symbol2;
                                    removeUserLastMessage(currentPlayer);
                                    tttGame(player1);
                                }
                                return console.log(`${currentPlayer.tag} choose pos2`);
                            }

                            default: {
                                gameStatusSet(false);
                                return console.log(`${currentPlayer.tag} choose no defined answer`);
                            }
                        }


                    }).catch(error => {
                        if (error.message === "Cannot read property 'content' of undefined") return message.channel.send(`${currentPlayer} ❌ There was no message within the time limit (60s)! - cancelling...`)
                            .then(message => message.delete({ timeout: 30000 })).catch(() => { return });
                        errorLog(`apply.js:1 Question1()\nError when user answer the question.`, error);
                    });
            });








        console.debug(`--------------------------\npos1: ${position1}\npos2: ${position2}\npos3: ${position3}\npos4: ${position4}\npos5: ${position5}\npos6: ${position6}\npos7: ${position7}\npos8: ${position8}\npos9: ${position9}`)
    }

    function gameStatus() {
        fileContent = fs.readFileSync(`./games/ttt.json`, 'utf8');
        const DataFile = JSON.parse(fileContent);
        return DataFile.gameRunning;
    }

    function gameStatusSet(value) {
        data = { "gameRunning": value };
        fs.writeFileSync(`./games/ttt.json`, JSON.stringify(data, null, 2));
    }

}