const { Client, Message } = require('discord.js');

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = (client, message) => {
  if (message.author.bot) return;

  if (message.content === 'hello') {
    message.reply('hello');
  }
};