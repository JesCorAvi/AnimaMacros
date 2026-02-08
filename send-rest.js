const MACRO_UUID = "Macro.WEJMsvA9Nvu6zLap"; // <--- CAMBIA ESTO POR LA UUID DE LA MACRO DE RECUPERACIÓN

const part = MACRO_UUID.split(".");
if (part.length < 2) {
    ui.notifications.error("La UUID está mal copiada. Debe ser 'Macro.ID'");
    return;
}
const macroId = part[1];
const macro = game.macros.get(macroId);

if (!macro) {
    ui.notifications.error(`No encuentro la macro con ID: ${macroId}`);
} else {
    
    const containerStyle = `
        background: url('ui/parchment.jpg') repeat, #1a1a1a;
        background-blend-mode: overlay;
        border: 2px solid #2f2f2f;
        box-shadow: 0 0 10px rgba(0,0,0,0.8);
        padding: 15px;
        text-align: center;
        font-family: 'Signika', sans-serif;
        color: #e0e0e0;
        border-radius: 5px;
        min-width: 250px;
    `;

    const titleStyle = `
        border-bottom: 2px solid #7a1f1f;
        margin: 0 0 10px 0;
        padding-bottom: 5px;
        color: #ff6666;
        font-size: 1.4em;
        text-transform: uppercase;
        text-shadow: 1px 1px 2px black;
    `;


    const buttonWrapperStyle = `
        background: linear-gradient(to bottom, #7a1f1f, #420808);
        border: 1px solid #c9a34e;
        border-radius: 4px;
        box-shadow: 0 0 5px #c9a34e inset, 0 3px 5px rgba(0,0,0,0.5);
        padding: 8px;
        margin: 15px 10px;
        font-weight: bold;
        font-size: 1.1em;
        text-shadow: 1px 1px 0 #000;
        cursor: pointer;
    `;

    const content = `
    <div style="${containerStyle}">
        <h3 style="${titleStyle}">Recuperación</h3>
        
        <p style="font-size: 13px; color: #aaa; margin-bottom: 10px;">
            Tu personaje necesita un respiro. Asegúrate de tener tu token seleccionado.
        </p>
        
            <span style="color: #ffd700; font-weight: bold; font-size: 1.2em;">
                @Macro[${macroId}]{Descansar}
            </span>
        
    </div>
    `;

    ChatMessage.create({
        content: content,
        speaker: ChatMessage.getSpeaker({alias: "Narrador"})
    });
}