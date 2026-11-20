const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require('discord.js');
const ms = require('ms');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const mentionable = interaction.options.get('target-user').value;
    const duration = interaction.options.get('duration').value; // 1d, 1 day, 1s, 5s, 5m
    const reason =
      interaction.options.get('reason')?.value || 'No se proporcionó una razón';

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(mentionable);
    if (!targetUser) {
      await interaction.editReply('Ese usuario no existe en este servidor.');
      return;
    }

    if (targetUser.user.bot) {
      await interaction.editReply('No puedo aislar a un bot.');
      return;
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      await interaction.editReply('Por favor proporciona una duración de aislamiento válida.');
      return;
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      await interaction.editReply(
        'La duración del aislamiento no puede ser menor a 5 segundos ni mayor a 28 días.'
      );
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        'No puedes aislar a ese usuario porque tiene un rol igual o superior al tuyo.'
      );
      return;
    }

    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        'No puedo aislar a ese usuario porque tiene un rol igual o superior al mío.'
      );
      return;
    }

    // Timeout the user
    try {
      const { default: prettyMs } = await import('pretty-ms');

      if (targetUser.isCommunicationDisabled()) {
        await targetUser.timeout(msDuration, reason);
        await interaction.editReply(
          `El aislamiento de ${targetUser} se actualizó a ${prettyMs(msDuration, {
            verbose: true,
          })}\nRazón: ${reason}`
        );
        return;
      }

      await targetUser.timeout(msDuration, reason);
      await interaction.editReply(
        `${targetUser} fue aislado por ${prettyMs(msDuration, {
          verbose: true,
        })}.\nRazón: ${reason}`
      );
    } catch (error) {
      console.log(`There was an error when timing out: ${error}`);
    }
  },

  name: 'timeout',
  description: 'Timeout a user.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to timeout.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'duration',
      description: 'Timeout duration (30m, 1h, 1 day).',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the timeout.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};