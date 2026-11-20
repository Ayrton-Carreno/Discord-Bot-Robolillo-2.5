const { Client, Interaction, PermissionFlagsBits } = require('discord.js');
const AutoRole = require('../../models/AutoRole');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply(
          'El auto-rol no está configurado en este servidor. Usa `/autorole-configure` para configurarlo.'
        );
        return;
      }

      await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply(
        'El auto-rol ha sido desactivado en este servidor. Usa `/autorole-configure` para configurarlo de nuevo.'
      );
    } catch (error) {
      console.log(error);
    }
  },

  name: 'autorole-disable',
  description: 'Disable auto-role in this server.',
  permissionsRequired: [PermissionFlagsBits.Administrator],
};