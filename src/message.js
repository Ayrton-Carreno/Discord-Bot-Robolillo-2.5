require('dotenv').config();
const {
  Client,
  IntentsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const roles = [
  {
    id: '1375934140897300611',
    label: 'Arichu',
  },
  {
    id: '1400557591024894123',
    label: 'GOAT',
  },
  {
    id: '1573252814367629372',
    label: 'Pepole',
  },
];

client.on('ready', async (c) => {
  try {
    const channel = await client.channels.cache.get('1573229999970848850');
    console.log('Canal:', channel ? channel.name : 'NO ENCONTRADO');
    if (!channel) return;

    const row = new ActionRowBuilder();

    roles.forEach((role) => {
      row.components.push(
        new ButtonBuilder()
          .setCustomId(role.id)
          .setLabel(role.label)
          .setStyle(ButtonStyle.Primary)
      );
    });

    await channel.send({
      content: 'Claim or remove a role below.',
      components: [row],
    });
    process.exit();
  } catch (error) {
    console.log(error);
  }
});

client.login(process.env.TOKEN);