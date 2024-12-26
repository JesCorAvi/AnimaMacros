// Especifica la lista de reproducción y la canción
const playlistName = "Ending";
const songName = "Ending";

const playlist = game.playlists.getName(playlistName);

if (playlist) {
  const sound = playlist.sounds.find(s => s.name === songName);

  if (sound) {
    playlist.playSound(sound);
    ui.notifications.info(`Reproduciendo ahora: ${songName}`);
  } else {
    ui.notifications.warn(`No se encontró la canción "${songName}" en la lista "${playlistName}".`);
  }
} else {
  ui.notifications.error(`No se encontró la lista de reproducción "${playlistName}".`);
}

setTimeout(() => {
  const endMessage = "FIN DE SESIÓN";
  ui.notifications.info(endMessage);
  ChatMessage.create({
    content: `
      <div style="
        background-color: #f8f0d9;
        border: 5px solid #8b4513;
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size: 24px;
        color: #4b2e02;
        text-shadow: 1px 1px 2px #8b4513;
        line-height: 1.5;
      ">
        <h2 style="margin: 0; font-size: 32px; text-transform: uppercase;">${endMessage}</h2>
      </div>
    `,
    whisper: [] 
  });


game.macros.getName("final2").execute();

}, 3000); 