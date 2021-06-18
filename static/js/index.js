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

          const playButton = document.getElementById(`play${song.sha}`);
          const pauseButton = document.getElementById(`pause${song.sha}`);

          document.getElementById(`control${song.sha}`).onmouseover = () => {
            if(waveSurfer.isPlaying()) {
              pauseButton.classList.remove('is-hidden');
            } else {
              playButton.classList.remove('is-hidden');
            }
          }

          document.getElementById(`control${song.sha}`).onmouseout = () => {
            playButton.classList.add('is-hidden');
            pauseButton.classList.add('is-hidden');
          }

          playButton.onclick = () => {
            waveSurfer.play();
            pauseButton.classList.remove('is-hidden');
            playButton.classList.add('is-hidden');
          }

          pauseButton.onclick = () => {
            playButton.classList.remove('is-hidden');
            pauseButton.classList.add('is-hidden');
            waveSurfer.pause();
          }
        }, 5);
      });
    });
}
