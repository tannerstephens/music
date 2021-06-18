const template = `
<h1 class="title"><%= title %></h1>
<div class="box">
  <article class="media">
    <div class="media-left">
      <figure class="image is-128x128">
        <div id="control<%= sha %>">
          <img src="<% if (cover) { %>songs/<%= cover %><% } else { %>https://bulma.io/images/placeholders/128x128.png<% } %>" id="i<%= sha %>" class="back is-128x128">
          <img src="static/img/play.png" id="play<%= sha %>" class="control is-hidden">
          <img src="static/img/pause.png" id="pause<%= sha %>" class="control is-hidden">
        </div>
      </figure>
    </div>
    <div class="media-content">
      <div class="content">
        <div id="s<%= sha %>"></div>
    </div>
  </article>
</div>
`;

const getColor = seed => {
  const rng = new Math.seedrandom(seed);

  return "hsl(" + 360 * rng() + ',' +
             (40 + 50 * rng()) + '%,' +
             (55) + '%)'
};

window.onload = () => {
  const rootElement = document.getElementById('root');
  const ejsTemplate = ejs.compile(template);

  fetch('songs/songs.json')
    .then(response => response.json())
    .then(data => data.map(line => ({
        sha: MD5(line.file),
        name: line.file,
        title: line.file.split('.').slice(0, -1).join('.'),
        cover: line.cover
      })))
    .then(songs => {
      const waveSurfers = [];

      songs.forEach(song => {
        rootElement.innerHTML += ejsTemplate(song);

        setTimeout(() => {
          const color = getColor(song.sha);

          const waveSurfer = WaveSurfer.create({
            container: `#s${song.sha}`,
            waveColor: color,
            progressColor: color
          });

          waveSurfer.load(`songs/${song.name}`);

          waveSurfers.push(waveSurfer);

          waveSurfer.on('finish', () => {
            playButton.classList.remove('is-hidden');
            pauseButton.classList.add('is-hidden');
          });

          const playButton = document.getElementById(`play${song.sha}`);
          const pauseButton = document.getElementById(`pause${song.sha}`);

          const controls = document.getElementById(`control${song.sha}`);

          controls.onmouseover = () => {
            if(waveSurfer.isPlaying()) {
              pauseButton.classList.remove('is-hidden');
            } else {
              playButton.classList.remove('is-hidden');
            }
          }

          controls.onmouseout = () => {
            playButton.classList.add('is-hidden');
            pauseButton.classList.add('is-hidden');
          }

          controls.onclick = () => {
            if(waveSurfer.isPlaying()) {
              playButton.classList.remove('is-hidden');
              pauseButton.classList.add('is-hidden');
              waveSurfer.pause();
            } else {
              waveSurfers.forEach(ws => {
                ws.pause();
              });
              waveSurfer.play();
              pauseButton.classList.remove('is-hidden');
              playButton.classList.add('is-hidden');
            }
          }
        }, 5);
      });
    });
}
