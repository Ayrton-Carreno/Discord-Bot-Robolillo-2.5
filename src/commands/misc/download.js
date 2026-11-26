const {
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require('discord.js');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'download',
  description: 'Descarga un video o audio (YouTube, TikTok, Instagram, X).',
  options: [
    {
      name: 'url',
      description: 'El enlace del video que quieres descargar.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'formato',
      description: 'Elige si quieres video (MP4) o solo audio (MP3).',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Video (MP4)', value: 'mp4' },
        { name: 'Audio (MP3)', value: 'mp3' },
      ],
      required: true,
    },
  ],

  callback: async (client, interaction) => {
    const url = interaction.options.getString('url');
    const formato = interaction.options.getString('formato');

    // Discord solo da 3 segundos para responder; deferReply evita que expire mientras descarga
    await interaction.deferReply();

    const binDir = path.join(__dirname, '..', '..', '..', 'bin');
    const ytDlpPath = path.join(binDir, 'yt-dlp.exe');
    const tempId = `${Date.now()}_${interaction.user.id}`;
    const outputTemplate = path.join(binDir, `${tempId}.%(ext)s`);

    // Configuramos argumentos para yt-dlp (limitando a < 24 MB para que quepa en Discord)
    const args =
      formato === 'mp3'
        ? [
            '-x',
            '--audio-format',
            'mp3',
            '--ffmpeg-location',
            binDir,
            '-o',
            outputTemplate,
            url,
          ]
        : [
            '-f',
            'bestvideo[filesize<20M][ext=mp4]+bestaudio[filesize<4M][ext=m4a]/best[filesize<24M][ext=mp4]/best[ext=mp4]',
            '--merge-output-format',
            'mp4',
            '--ffmpeg-location',
            binDir,
            '-o',
            outputTemplate,
            url,
          ];

    execFile(ytDlpPath, args, async (error) => {
      if (error) {
        console.error('Error en yt-dlp:', error);
        return interaction.editReply(
          'No pude descargar ese enlace. Verifica que sea público y válido.'
        );
      }

      try {
        // Buscamos el archivo generado que empieza con nuestro tempId
        const files = fs.readdirSync(binDir);
        const downloadedFile = files.find((f) => f.startsWith(tempId));

        if (!downloadedFile) {
          return interaction.editReply(
            'El video supera el límite de tamaño o no se pudo procesar.'
          );
        }

        const fullFilePath = path.join(binDir, downloadedFile);
        const stats = fs.statSync(fullFilePath);
        const fileSizeInMB = stats.size / (1024 * 1024);

        // Límite estándar de subida para bots en Discord (25 MB en servidores sin boost nivel 2)
        if (fileSizeInMB > 24.5) {
          fs.unlinkSync(fullFilePath);
          return interaction.editReply(
            `El archivo pesa **${fileSizeInMB.toFixed(1)} MB** y supera el límite de 25 MB de Discord.`
          );
        }

        const attachment = new AttachmentBuilder(fullFilePath);
        await interaction.editReply({
          content: `Aquí tienes tu descarga en **${formato.toUpperCase()}**:`,
          files: [attachment],
        });

        // Borramos el archivo temporal después de enviarlo
        fs.unlinkSync(fullFilePath);
      } catch (err) {
        console.error('Error al enviar o limpiar archivo:', err);
        await interaction.editReply('Ocurrió un error al enviar el archivo.');
      }
    });
  },
};