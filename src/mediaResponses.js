const fs = require('fs');
const path = require('path');

function loadFile(request, response, url) {
  const file = path.resolve(__dirname, url);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    let { range } = request.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const positions = range.replace(/bytes=/, '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    const contentParse = url.split('.');
    const mediaType = contentParse[contentParse.length - 1];
    // console.log(contentType[contentType.length-1]);
    let contentType = '';

    if (mediaType === 'mp4') {
      contentType = 'video/mp4';
    } else if (mediaType === 'mp3') {
      contentType = 'audio/mpeg';
    }

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': `${contentType}`,
    });

    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
}

const getSummer = (request, response) => {
  loadFile(request, response, '../client/summer/manifest.mpd');
  // const file = path.resolve(__dirname, '../client/summer/manifest.mpd');
  // response.writeHead(206, { 'Content-Type': 'application/dash+xml' });
  // response.end();
};

const getSummerVideo = (request, response) => {
  console.log(`../client${request.url}`);
  loadFile(request, response, `../client${request.url}`);
};

module.exports.getSummer = getSummer;
module.exports.getSummerVideo = getSummerVideo;
