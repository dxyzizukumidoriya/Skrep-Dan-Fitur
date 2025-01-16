/**
 > Scraper: https://whatsapp.com/channel/0029Vb2mOzL1Hsq0lIEHoR0N/120
 > Kalian .skrep --add SpotifyDL
 > Ch1
 > https://whatsapp.com/channel/0029VadFS3r89inc7Jjus03W
 > Ch2
 > https://whatsapp.com/channel/0029VateyJuKWEKhJMRKEL20
**/

const axios = require('axios');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const {
    wrapper
} = require('axios-cookiejar-support');

const cookieJar = new tough.CookieJar();
const axiosInstance = wrapper(axios.create({
    jar: cookieJar
}));

function xUrl(originalUrl) {
    const baseUrl = "https://spowload.com/spotify";
    const urlParts = originalUrl.split('/');
    const trackId = urlParts[urlParts.length - 1];
    return `${baseUrl}/track-${trackId}`;
}

function cleanUrl(url) {
    return url.replace(/\\\\/g, '/').replace(/\\/g, '');
}

async function downloadTrack(songUrl, coverImage, csrfToken) {
        const baseUrl = "https://spowload.com";
        const url = `${baseUrl}/convert`;

        const requestData = {
            urls: cleanUrl(songUrl),
            cover: coverImage,
        };

        try {
            const response = await axiosInstance.post(url, requestData, {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
            });

            if (response.data.error === false) {
                return response.data.url;
            } else {
                throw new Error(response.data.status);
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
            console.error("Error:", error.response ? error.response.data : error.message);
        }
    }

class SpotifyDL {
    spotifydl = async function(originalUrl) {
        const convertedUrl = xUrl(originalUrl);
        try {
            const response = await axiosInstance.get(convertedUrl);
            const html = response.data;
            const $ = cheerio.load(html);
            const scripts = $('script');

            let urldata = null;
            let csrfToken = $('meta[name="csrf-token"]').attr('content');

            scripts.each((index, script) => {
                const scriptContent = $(script).html();
                const jsonMatch = scriptContent.match(/let urldata = "(.*?)";/);
                if (jsonMatch && jsonMatch[1]) {
                    urldata = jsonMatch[1].replace(/\\\"/g, '"');
                    return false;
                }
            });

            if (urldata) {
                const trackData = JSON.parse(urldata);
                const downloadUrl = await downloadTrack(trackData.external_urls.spotify, cleanUrl(trackData.album.images[0].url), csrfToken);

                return {
                    success: true,
                    title: trackData.name,
                    artist: trackData.artists[0].name,
                    album: trackData.album.name,
                    releaseDate: trackData.album.release_date,
                    totalTracks: trackData.album.total_tracks,
                    thumbnail: cleanUrl(trackData.album.images[0].url),
                    popularity: trackData.popularity,
                    music: downloadUrl
                };
            } else {
                return {
                    success: false,
                    message: "Data tidak ditemukan."
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
            console.log('Error:' + error);
        }
    }
}

module.exports = new SpotifyDL()
