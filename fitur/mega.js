const { File } = await (await import('megajs'));
const { fromBuffer } = await (await import('file-type')).default

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    if (!text.includes('mega')) return m.reply(` *[ ! ]* Maaf Anda Masukan Link Nya Dulu Contoh: ${usedPrefix + command}  https://mega.nz/file/xxxxx`)
    new Promise(async (revolse) => {
        try {
            const file = await File.fromURL(text);
            if (file.size >= 300000000) return m.reply('Error: File size is too large (Maximum Size: 300MB)');
            await file.loadAttributes();

            const formatBytes = (bytes, decimals = 2) => {
                if (bytes === 0) return '0 Bytes';

                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

                const i = Math.floor(Math.log(bytes) / Math.log(k));
                const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

                return `${value} ${sizes[i]}`;
            };

            let caption = `╭────────────────────────────╮
│  *Downloader Mega File*   │
├────────────────────────────┤
│  📁 *FileName:* *( ${file.name || ''} )* │ 
│  🗃️ *Size:* *( ${formatBytes(file.size) || '0kb'} )* │ 
╰────────────────────────────╯`;

            await m.reply(caption);
            const buffer = await file.downloadBuffer()
            const {
                ext,
                mime
            } = await fromBuffer(buffer)
            await conn.sendMessage(m.chat, {
                document: await file.downloadBuffer(),
                mimetype: mime,
                fileName: `${file.name || ''}`,
                caption: '✔️ Nih File Nya'
            }, {
                quoted: m
            });
        } catch (err) {
            m.reply(' *[ ! ]* Maaf Mungkin Anda Kebanyakan Request!');
            await console.error('Error:', err);
        }
    })
}

handler.help = ['mega', 'megadl'];
handler.tags = ['downloader'];
handler.command = /^(mega|megadl)$/i;

export default handler;
