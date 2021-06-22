const {
  MessageEmbed
} = require('discord.js');
const { MessageButton } = require('discord-buttons');
const radioService = require('../services/radio');
const userRadioService = require('../services/user-radio');

module.exports = {
  name: 'radio',
  description: 'Show radio list',
  execute: async function ({
    client,
    connection,
    message,
    reaction,
    args
  }) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          currentPlayed,
          radioPagination,
          maxPageList,
          mongoClient
        } = args;
        const radioList = [...await radioService.find(mongoClient), ...await userRadioService.find(mongoClient, { guildId: message.guild.id })];
        const radioListLength = radioList.length;
        const backButton = new MessageButton().setStyle('grey').setLabel('Back').setID('previousPageButton');
        const nextButton = new MessageButton().setStyle('grey').setLabel('Next').setID('nextPageButton');

        let text = currentPlayed ? `🎵 **Playing ${currentPlayed} Now** 🎵\n\n` : '';
        for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
          if (i >= radioListLength) break;
          text += `**[${i + 1}]** ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
        }
        const embedMsg = new MessageEmbed().setDescription(text.trim());
        const maxPagination = Math.ceil(radioListLength / maxPageList);
        if (radioPagination == 1) {
          if (message.author.id != client.user.id) {
            await (await message.channel.send({
              embed: embedMsg,
              buttons: [backButton.setDisabled(), nextButton]
            }))
          } else {
            await (await message.edit({
              embed: embedMsg,
              buttons: [backButton.setDisabled(), nextButton]
            }))
          }
        } else if (radioPagination > 1 && radioPagination < maxPagination) {
          const m = await (await message.edit({
            embed: embedMsg,
            buttons: [backButton, nextButton]
          }))
        } else {
          await (await message.edit({
            embed: embedMsg,
            buttons: [backButton, nextButton.setDisabled()]
          }))
        }
        resolve({
          message: `Sent radio list page ${radioPagination} @${message.guild.name}-${message.guild.id}`
        })
      } catch (error) {
        console.error('Error @Commands.Radio.Execute():', error);
        console.error('Args:', args);
      }
    });
  }
}