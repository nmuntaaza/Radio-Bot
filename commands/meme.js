const memeService = require('../services/meme');
const {
  MessageAttachment,
  MessageActionRow,
  MessageButton
} = require('discord.js');

module.exports = {
  name: 'meme',
  description: 'Get memes from subreddit',
  execute: async function ({
    client,
    connection,
    message,
    args
  }) {
    return new Promise((resolve, reject) => {
      memeService
        .getMeme(args.subReddit)
        .then(async memes => {
          if (!memes.nfsw) {
            const attachment = new MessageAttachment(memes.url);
            try {
              const sendMoreAction = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setCustomId('sendMoreMeme')
                    .setLabel('More')
                    .setStyle('PRIMARY')
                );
              if (message.author.bot) {
                await (await message.edit({ files: [attachment], components: [sendMoreAction] }));
              } else {
                await (await message.channel.send({ files: [attachment], components: [sendMoreAction] }));
              }
            } catch (error) {
              console.error(error);
              message.channel
                .send( { content: 'Timeout'} );
            }
            resolve({
              subReddit: args.subReddit,
              message: `Sent meme`
            });
          } else {
            console.log('Getting NFSW meme. Not handled yet');
          }
        })
        .catch(error => {
          console.error('Error @Commands.Meme.Execute():', error);
          message.channel.send({ content: error.message });
        })
    })
  }
}