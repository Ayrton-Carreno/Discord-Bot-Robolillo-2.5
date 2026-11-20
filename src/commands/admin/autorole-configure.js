const {
  ApplicationCommandOptionType,
  Client,
  Interaction,
  PermissionFlagsBits,
} = require('discord.js');
const AutoRole = require('../../models/AutoRole');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('Solo puedes usar este comando dentro de un servidor.');
      return;
    }

    const targetRoleId = interaction.options.get('role').value;

    try {
      await interaction.deferReply();

      let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

      if (autoRole) {
        if (autoRole.roleId === targetRoleId) {
          interaction.editReply(
            'El auto-rol ya está configurado para ese rol. Para desactivarlo usa `/autorole-disable`'
          );
          return;
        }

        autoRole.roleId = targetRoleId;
      } else {
        autoRole = new AutoRole({
          guildId: interaction.guild.id,
          roleId: targetRoleId,
        });
      }

      await autoRole.save();
      interaction.editReply(
        'El auto-rol ha sido configurado. Para desactivarlo usa `/autorole-disable`'
      );
    } catch (error) {
      console.log(error);
    }
  },

  name: 'autorole-configure',
  description: 'Configure your auto-role for this server.',
  options: [
    {
      name: 'role',
      description: 'The role you want users to get on join.',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.ManageRoles],
};