const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get('target-user').value;
    const reason =
      interaction.options.get('reason')?.value || 'No se proporcionó una razón';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply('Ese usuario no existe en este servidor.');
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply(
        'No puedes expulsar a ese usuario porque es el dueño del servidor.'
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        'No puedes expulsar a ese usuario porque tiene un rol igual o superior al tuyo.'
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        'No puedo expulsar a ese usuario porque tiene un rol igual o superior al mío.'
      );
      return;
    }

    // Kick the targetUser
    try {
      await targetUser.kick(reason);
      await interaction.editReply(
        `El usuario ${targetUser} fue expulsado\nRazón: ${reason}`
      );
    } catch (error) {
      console.log(`There was an error when kicking: ${error}`);
    }
  },

  name: 'kick',
  description: 'Kicks a member from this server.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to kick.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason you want to kick.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};