import axios from 'axios';
import yts from 'yt-search';
import { wrapper } from 'axios-cookiejar-support';
import FormData from 'form-data';
import WebSocket from 'ws';
import * as cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';
import crypto from 'crypto';

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    switch (command) {
        case 'ytmp3':
        case 'yta':
        case 'ytaudio': {
            if (!text.includes('youtu')) return m.reply(` *[ ! ]* Link YouTube Mana ? Contoh: ${usedPrefix + command} https://youtu.be/xxxx`);
            return new Promise(async (resolve) => {
                await conn.sendMessage(
                    m.chat, {
                        react: {
                            text: '🔥',
                            key: m.key
                        }
                    });

                const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
                let link;
                if (regex.test(text)) {
                    const videoId = text.match(regex)[1];
                    link = 'https://www.youtube.com/watch?v=' + videoId;
                } else {
                    link = text;
                };

                await convertMedia(link, 'mp3', '320k', true).then(async (ytdl) => {
                    const result = await googleYoutube(link);
                    const thumb = await thumbnail(result.title, config.name, {
                        thumbnailUrl: result.thumbnail
                    }, ytdl.download, true);
                    const youtubeInfo = `╭───「 🎬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗜𝗡𝗙𝗢 」───
│
│  📌 *Title*: ${result.title || 'No title'}
│  🆔 *Video ID*: ${result.videoId || 'N/A'}
│  ⏳ *Uploaded*: ${result.metadata.ago || 'Unknown'}
│  👤 *Channel*: ${result.author.channelTitle || 'Unknown'}
│  🔗 *URL*: ${result.url || 'Not available'}
│
│  📊 *Engagement*:
│  👁️ ${result.metadata.view || '0'} views
│  💙 ${result.metadata.like || '0'} likes
│  💬 ${result.metadata.comment || '0'} comments
│
╰───────────────────────`;

                    await conn.sendMessage(m.chat, {
                        text: youtubeInfo,
                        ...thumb
                    }, {
                        quoted: m
                    });

                    await conn.sendMessage(
                        m.chat, {
                            react: {
                                text: '😆',
                                key: m.key
                            }
                        });

                    const audioRes = await axios.get(ytdl.download, {
                        responseType: "arraybuffer"
                    });
                    const audioBuffer = Buffer.from(audioRes.data, "binary");
                    if (audioRes.length > 1024 * 1024 * 100) {
                        await conn.sendMessage(m.chat, {
                            document: audioBuffer,
                            mimetype: 'audio/mpeg',
                            fileName: `${result.title || 'audio'}.mp3`,
                            caption: '*[✓]* Done'
                        }, {
                            quoted: m
                        });
                    } else {
                        await conn.sendMessage(m.chat, {
                            audio: audioBuffer,
                            mimetype: 'audio/mpeg',
                        }, {
                            quoted: m
                        });
                    }
                }).catch(async (err) => {
                    await conn.sendMessage(
                        m.chat, {
                            react: {
                                text: '❌',
                                key: m.key
                            }
                        });
                    await m.reply(' *[ ! ]* Maaf Mungkin Lu Kebanyakan Request Kali');
                    throw err;
                });
            });
        }
        break;
        case 'ytmp4':
        case 'ytv':
        case 'ytvideo': {
            if (!text.includes('youtu')) return m.reply(` *[ ! ]* Link YouTube + Quality Mana ? Contoh: ${usedPrefix + command} https://youtu.be/xxxx 720`);
            const [url, quality] = text.split(' ');
            const resolution = quality || '720'
            return new Promise(async (resolve) => {
                await conn.sendMessage(
                    m.chat, {
                        react: {
                            text: '🔥',
                            key: m.key
                        }
                    });

                const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
                let link;
                if (regex.test(url)) {
                    const videoId = url.match(regex)[1];
                    link = 'https://www.youtube.com/watch?v=' + videoId;
                } else {
                    link = url;
                };

                await convertMedia(link, 'mp4', resolution + 'p').then(async (ytdl) => {
                    const result = await googleYoutube(link);
                    const thumb = await thumbnail(result.title, config.name, {
                        thumbnailUrl: result.thumbnail
                    }, ytdl.download, true);
                    const youtubeInfo = `╭───「 🎬 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗜𝗡𝗙𝗢 」───
│
│  📌 *Title*: ${result.title || 'No title'}
│  🆔 *Video ID*: ${result.videoId || 'N/A'}
│  ⏳ *Uploaded*: ${result.metadata.ago || 'Unknown'}
│  👤 *Channel*: ${result.author.channelTitle || 'Unknown'}
│  🔗 *URL*: ${result.url || 'Not available'}
│
│  📊 *Engagement*:
│  👁️ ${result.metadata.view || '0'} views
│  💙 ${result.metadata.like || '0'} likes
│  💬 ${result.metadata.comment || '0'} comments
│
╰───────────────────────`;

                    await conn.sendMessage(m.chat, {
                        text: youtubeInfo,
                        ...thumb
                    }, {
                        quoted: m
                    });

                    await conn.sendMessage(
                        m.chat, {
                            react: {
                                text: '😆',
                                key: m.key
                            }
                        });
                    const videoRes = await axios.get(ytdl.download, {
                        responseType: "arraybuffer"
                    });
                    const videoBuffer = Buffer.from(videoRes.data, "binary");
                    if (videoRes.length > 1024 * 1024 * 100) {
                        await conn.sendMessage(m.chat, {
                            document: videoBuffer,
                            mimetype: 'video/mp4',
                            fileName: `${result.title || 'video'}.mp4`,
                            caption: '*[✓]* Done'
                        }, {
                            quoted: m
                        });
                    } else {
                        await conn.sendMessage(m.chat, {
                            video: videoBuffer,
                            caption: '*[✓]* Done'
                        }, {
                            quoted: m
                        });
                    }
                }).catch(async (err) => {
                    await conn.sendMessage(
                        m.chat, {
                            react: {
                                text: '❌',
                                key: m.key
                            }
                        });
                    await m.reply(' *[ ! ]* Maaf Mungkin Lu Kebanyakan Request Kali');
                    throw err;
                });
            });
        };
        break
    }
};

async function googleYoutube(url) {
    const result = {};
    try {
        const formatSubscriberCount = subscriberCount => {
            const count = parseInt(subscriberCount);
            if (count >= 1_000_000_000) {
                return (count / 1_000_000_000).toFixed(1).replace('.0', '') + 'B';
            } else if (count >= 1_000_000) {
                return (count / 1_000_000).toFixed(1).replace('.0', '') + 'M';
                p
            } else if (count >= 1_000) {
                return (count / 1_000).toFixed(1).replace('.0', '') + 'K';
            } else {
                return count.toString();
            }
        };

        const formatRelativeTime = publishedAt => {
            const now = new Date();
            const publishedDate = new Date(publishedAt);
            const diffInMs = now - publishedDate;
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            const diffInMonths = Math.floor(diffInDays / 30);
            const diffInYears = Math.floor(diffInDays / 365);

            if (diffInYears >= 1) {
                return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
            } else if (diffInMonths >= 1) {
                return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
            } else {
                return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
            }
        };

        const formatDuration = duration => {
            const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            const hours = match[1] ? parseInt(match[1]) : 0;
            const minutes = match[2] ? parseInt(match[2]) : 0;
            const seconds = match[3] ? parseInt(match[3]) : 0;

            if (hours > 0) {
                return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        };

        const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?![^\s]*\?is=)/;
        const match = url.match(regex);
        const videoId = match[1];

        const videoResponse = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&fields=items(id,snippet(title,description,publishedAt,channelId,channelTitle),statistics(likeCount,commentCount,viewCount),contentDetails(duration))&id=${videoId}&key=${apiKey}`
        );

        const videoData = videoResponse.data.items[0];
        const channelResponse = await axios.get(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${videoData.snippet.channelId}&key=${apiKey}`
        );

        const channelData = channelResponse.data.items[0];

        return {
            title: videoData.snippet.title,
            description: videoData.snippet.description,
            videoId: videoData.id,
            thumbnail: `https://i.ytimg.com/vi/${videoData.id}/hqdefault.jpg`,
            metadata: {
                like: await formatSubscriberCount(videoData.statistics.likeCount),
                comment: await formatSubscriberCount(videoData.statistics.commentCount),
                view: await formatSubscriberCount(videoData.statistics.viewCount),
                duration: formatDuration(videoData.contentDetails.duration),
                ago: await formatRelativeTime(videoData.snippet.publishedAt),
                jadwal_upload: new Date(videoData.snippet.publishedAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }),
            },
            author: {
                channelTitle: videoData.snippet.channelTitle,
                channelId: videoData.snippet.channelId,
                channelLink: `https://www.youtube.com/channel/${videoData.snippet.channelId}`,
                Subscribe: await formatSubscriberCount(channelData.statistics.subscriberCount),
                Tentang: channelData.snippet.description,
                ago: await formatRelativeTime(channelData.snippet.publishedAt),
                Bergabung: new Date(channelData.snippet.publishedAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }),
            },
            url: `https://www.youtube.com/watch?v=${videoData.id}`,
        };
    } catch (e) {
        console.log('Error:', e);
        return result;
    }
}

// Configurations
const config = {
    apiBase: {
        video: 'https://amp4.cc',
        audio: 'https://amp3.cc'
    },
    headers: {
        Accept: 'application/json',
        'User-Agent': 'Postify/1.0.0'
    },
    ytRegex: /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/,
    formats: {
        video: ['144p', '240p', '360p', '480p', '720p', '1080p'],
        audio: ['64k', '128k', '192k', '256k', '320k']
    }
};

// Initialize HTTP client
const jar = new CookieJar();
const client = wrapper(axios.create({
    jar
}));

// Helper functions
function validateUrl(url) {
    if (!url) return {
        error: "Linknya mana? Yakali download kagak ada linknya 🗿"
    };
    const match = url.match(config.ytRegex);
    if (!match) return {
        error: "Lu masukin link apaan sih 🗿 Link Youtube aja bree"
    };
    return {
        id: match[3]
    };
}

function validateFormat(quality, isAudio) {
    const available = isAudio ? config.formats.audio : config.formats.video;
    if (!quality || !available.includes(quality)) {
        return {
            error: "Format kagak ada, pilih yang tersedia aja 🗿",
            available
        };
    }
    return true;
}

// Captcha functions
async function solveCaptcha(challenge) {
    const {
        algorithm,
        challenge: data,
        salt,
        maxnumber
    } = challenge;

    for (let i = 0; i <= maxnumber; i++) {
        const hash = crypto.createHash(algorithm.toLowerCase())
            .update(salt + i)
            .digest('hex');
        if (hash === data) {
            return Buffer.from(JSON.stringify({
                algorithm,
                challenge: data,
                number: i,
                salt,
                signature: challenge.signature,
                took: Date.now()
            })).toString('base64');
        }
    }
    throw new Error('Captcha verification failed');
}

// WebSocket connection
function createWebSocket(id, isAudio) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`wss://${isAudio ? 'amp3' : 'amp4'}.cc/ws`, ['json'], {
            headers: {
                ...config.headers,
                Origin: config.apiBase[isAudio ? 'audio' : 'video']
            },
            rejectUnauthorized: false
        });

        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('Connection timeout'));
        }, 30000);

        let fileInfo = {};

        ws.on('open', () => ws.send(id));
        ws.on('message', (data) => {
            const res = JSON.parse(data);
            if (res.event === 'query' || res.event === 'queue') {
                fileInfo = {
                    thumbnail: res.thumbnail,
                    title: res.title,
                    duration: res.duration,
                    uploader: res.uploader
                };
            } else if (res.event === 'file' && res.done) {
                clearTimeout(timeout);
                ws.close();
                resolve({
                    ...fileInfo,
                    ...res
                });
            }
        });
        ws.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

// Main conversion function
async function convertMedia(url, format, quality, isAudio = false) {
    const urlValidation = validateUrl(url);
    if (urlValidation.error) return {
        error: urlValidation.error
    };

    const formatValidation = validateFormat(quality, isAudio);
    if (formatValidation.error) return formatValidation;

    const baseUrl = config.apiBase[isAudio ? 'audio' : 'video'];
    const videoId = urlValidation.id;

    try {
        // Get CSRF token
        const {
            data
        } = await client.get(baseUrl);
        const $ = cheerio.load(data);
        const csrfToken = $('meta[name="csrf-token"]').attr('content');
        if (!csrfToken) throw new Error('CSRF token not found');

        // Prepare form data
        const form = new FormData();
        form.append('url', `https://youtu.be/${videoId}`);
        form.append('format', format);
        form.append('quality', quality);
        form.append('service', 'youtube');
        form.append('_token', csrfToken);
        if (isAudio) form.append('playlist', 'false');

        // Solve captcha if needed
        try {
            const {
                data: captcha
            } = await client.get(`${baseUrl}/captcha`, {
                headers: {
                    ...config.headers,
                    Origin: baseUrl,
                    Referer: baseUrl
                }
            });
            if (captcha) {
                form.append('altcha', await solveCaptcha(captcha));
            }
        } catch (e) {
            console.log('Captcha skipped', e.message);
        }

        // Submit conversion request
        const endpoint = isAudio ? '/convertAudio' : '/convertVideo';
        const {
            data: response
        } = await client.post(`${baseUrl}${endpoint}`, form, {
            headers: {
                ...form.getHeaders(),
                ...config.headers,
                Origin: baseUrl,
                Referer: baseUrl
            }
        });

        if (!response.success) throw new Error(response.message);

        // Connect to WebSocket for results
        const wsResult = await createWebSocket(response.message, isAudio);
        const downloadUrl = `${baseUrl}/dl/${wsResult.worker}/${response.message}/${encodeURIComponent(wsResult.file)}`;

        return {
            title: wsResult.title || "No title",
            type: isAudio ? 'audio' : 'video',
            format,
            thumbnail: wsResult.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            download: downloadUrl,
            id: videoId,
            duration: wsResult.duration,
            quality,
            uploader: wsResult.uploader
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}

handler.help = ['ytmp3', 'yta', 'ytaudio', 'ytmp4', 'ytv', 'ytvideo'].map(v => v + ' *< limk >* ');
handler.tags = ['downloader']
handler.command = /^(ytmp3|yta|ytaudio|ytmp4|ytv|ytvideo)$/i;

export default handler;
