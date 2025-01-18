/**=======================
> Arigato Andhika-NdBotz Scrape: Spotify nya
> Source Scrape: https://whatsapp.com/channel/0029VaAMjXT4yltWm1NBJV3J
=======================**/


const axios = require('axios');

function clean(str) {
    const regex = /['"]/g;
    return str.replace(regex, '');
}

async function downloadSpotify(linkk) {
    try {
        const detail = await axios.get('https://spotisongdownloader.to/api/composer/spotify/xsingle_track.php', {
            params: {
                url: linkk
            }
        });
        const {
            song_name,
            artist,
            url
        } = detail.data;

        const data = new URLSearchParams();
        data.append('song_name', clean(song_name));
        data.append('artist_name', clean(artist));
        data.append('url', url);

        const dlrespon = await axios.post('https://spotisongdownloader.to/api/composer/spotify/wertyuht3456.php', data, {
            headers: {
                'Authority': 'spotisongdownloader.to',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': '_ga=GA1.1.1025091365.1737165195; PHPSESSID=7uf4vrc1auogmgab4d6g6su1eg; _ga_X67PVRK9F0=GS1.1.1737165194.1.1.1737165363.0.0.0; quality=m4a',
                'Origin': 'https://spotisongdownloader.to',
                'Pragma': 'no-cache',
                'Referer': 'https://spotisongdownloader.to/track.php',
                'Sec-CH-UA': '"Not-A.Brand";v="99", "Chromium";v="124"',
                'Sec-CH-UA-Mobile': '?1',
                'Sec-CH-UA-Platform': '"Android"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        return {
            ...detail.data,
            dl: encodeURI(dlrespon.data.dlink)
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = downloadSpotify
