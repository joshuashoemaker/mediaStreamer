'use strict'

const fs = require('fs');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  fs.readFile('./index.html', (err, html) => res.end(html));
});

app.get('/vids/:movieName', (req, res) => {
  let movieName = req.params.movieName;
  let movieFile = `./movies/${movieName}` + '.mp4';
  fs.stat(movieFile, (err, stats) => {
    if (err) {
      console.log(err);
      return res.status(404).end('<h1>Movie Not found</h1>');
    }
    // Variables required to assemble the chunk header correctly
    let range = req.headers.range;
    let size = stats.size;
    let start = Number((range || '').replace(/bytes=/, '').split('-')[0]);
    let end = size - 1;
    let chunkSize = (end - start) + 1;
    // Define Chunk Headers
    res.set({
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    });
    // It is important to use status 206-Partial Content for the streaming function
    res.status(206);
    // Using ReadStream of Node.js
    // Will read a file and upload it into parts via stream. pipe ()
    let stream = fs.createReadStream(movieFile, { start, end });
    stream.on('open', () => stream.pipe(res));
    stream.on('error', (streamErr) => res.end(streamErr));
    
    console.log("range = " + range);
    console.log("Start = " + start);
  });
});

app.listen(3000, () => console.log('API on port 3000'));
