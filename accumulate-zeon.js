let zeonACT = token.actor.system.mystic.act.main.final.value;
let zeonBaseTotal = token.actor.system.mystic.zeon.max;
let zeonBaseCurr = token.actor.system.mystic.zeon.value;
let zeonAcum = token.actor.system.mystic.zeon.accumulated;
let fatigueCurr = token.actor.system.characteristics.secondaries.fatigue.value;
let zeonMant = token.actor.system.mystic.zeonMaintained.value;

if (zeonAcum == null) {
    zeonAcum = 0;
}

async function updateAcumulation(mode, cansancioUsado, cansancioModificacion) {
    let updateZeon = 0;
    var chatNotification = "<b>" + token.name + "</b>";

    let cansancioEffect = cansancioUsado * cansancioModificacion;

    let updatedFatigue = fatigueCurr - cansancioUsado;
    if (updatedFatigue < 0) {
        updatedFatigue = 0;
    }
    token.actor.update({"system.characteristics.secondaries.fatigue.value": updatedFatigue});

    if (mode == 0) {
        chatNotification = chatNotification + " ha acumulado de forma plena ";

        let updateZeonBase = zeonBaseCurr - (zeonACT + cansancioEffect);
        if (updateZeonBase < 0) {
            updateZeonBase = 0;
        }
        token.actor.update({"system.mystic.zeon.value": updateZeonBase});

        updateZeon = zeonAcum + (zeonACT + cansancioEffect);
        token.actor.update({"system.mystic.zeon.accumulated": updateZeon});

        chatNotification = chatNotification + "<b>" + (zeonACT + cansancioEffect) + "</b> puntos de zeon este turno y tiene acumulado ";
    } else {
        chatNotification = chatNotification + " ha acumulado de forma parcial ";

        let updateZeonBase = zeonBaseCurr - (Math.round(zeonACT / 2) + cansancioEffect);
        if (updateZeonBase < 0) {
            updateZeonBase = 0;
        }
        token.actor.update({"system.mystic.zeon.value": updateZeonBase});

        updateZeon = zeonAcum + (Math.round(zeonACT / 2) + cansancioEffect);
        token.actor.update({"system.mystic.zeon.accumulated": updateZeon});

        chatNotification = chatNotification + "<b>" + (Math.round(zeonACT / 2) + cansancioEffect) + "</b> puntos de zeon este turno y tiene acumulado ";
    }
    chatNotification = chatNotification + "<b>" + updateZeon + "</b> puntos de zeon";
    
    chatNotification = chatNotification + `<br><b>Cansancio actual:</b> ${updatedFatigue}`;

    ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({token: actor}),
        content: chatNotification
    });
}

async function returnAccumulatedZeon(option) {
    if (zeonAcum <= 0) {
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ token: actor }),
            content: `<b>${token.name}</b> no tiene zeón acumulado para devolver.`
        });
        return;
    }

    let zeonToReturn;
    if (option === "all") {
        zeonToReturn = zeonAcum;
    } else {
        zeonToReturn = Math.max(0, zeonAcum - 10);
    }

    let updatedZeonBase = Math.min(zeonBaseTotal, zeonBaseCurr + zeonToReturn);

    await token.actor.update({
        "system.mystic.zeon.value": updatedZeonBase,
        "system.mystic.zeon.accumulated": 0
    });

    let chatNotification = `<b>${token.name}</b> ha devuelto <b>${zeonToReturn}</b> puntos de zeon a su tanque.`;
    ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ token: actor }),
        content: chatNotification
    });
}

async function modifyZeonMaintainedDialog() {
    let maintainedPerTurn = token.actor.system.mystic.selectedSpells || [];
    let maintainedDaily = token.actor.system.mystic.spellMaintenances || [];

    let spellListPerTurn = maintainedPerTurn.map(spell => `
        <li id="spell-${spell._id}">
            <b>${spell.name}</b> - Coste: ${spell.system.cost.value} Zeón/turno
            <button data-spell-id="${spell._id}" class="delete-spell-per-turn">Eliminar</button>
        </li>
    `).join("");

    let spellListDaily = maintainedDaily.map(spell => `
        <li id="spell-${spell._id}">
            <b>${spell.name}</b> - Coste: ${spell.system.cost.value} Zeón/día
            <button data-spell-id="${spell._id}" class="delete-spell-daily">Eliminar</button>
        </li>
    `).join("");

    let content = `
        <div>
            <h3>Hechizos mantenidos por turno:</h3>
            <ul id="list-per-turn">${spellListPerTurn}</ul>
        </div>
        <div>
            <h3>Hechizos mantenidos diarios:</h3>
            <ul id="list-daily">${spellListDaily}</ul>
        </div>
    `;

    let dialog = new Dialog({
        title: "Modificar Zeon Mantenido",
        content: content,
        buttons: {
            
            cancel: {
                label: "Cancelar",
                callback: () => {}
            }
        },
        render: (html) => {
            html.find('.delete-spell-per-turn').on('click', async (event) => {
                let spellId = event.currentTarget.dataset.spellId;
                spellCost = maintainedPerTurn.find(spell => spell._id === spellId).system.cost.value;
                maintainedPerTurn = maintainedPerTurn.filter(spell => spell._id !== spellId);
                token.actor.update({ 'system.mystic.zeonMaintained.value': (Number(zeonMant) ?? 0) - Number(spellCost) });
                await token.actor.update({ "system.mystic.selectedSpells": maintainedPerTurn });
                html.find(`#spell-${spellId}`).remove();

                ChatMessage.create({
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker({ token: actor }),
                    content: `<b>${token.name}</b> ha eliminado el hechizo de mantenimiento por turno.`
                });
            });

            html.find('.delete-spell-daily').on('click', async (event) => {
                let spellId = event.currentTarget.dataset.spellId;
                console.log(spellId);

                maintainedDaily = maintainedDaily.filter(spell => spell._id !== spellId);
                console.log(maintainedDaily);
                await token.actor.update({ "system.mystic.spellMaintenances": maintainedDaily });
                html.find(`#spell-${spellId}`).remove();

                ChatMessage.create({
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker({ token: actor }),
                    content: `<b>${token.name}</b> ha eliminado el hechizo de mantenimiento diario.`
                });
            });
        }
    });

    dialog.render(true);
}


let dialogContent = `
    <div>
        <center><h3>Acumulación de zeón</h3></center>
    </div>
    <div>
        <center><i>La Acumulación Parcial te permite acumular zeon de forma pasiva mientras realizas otras acciones, al coste de reducir la acumulación a la mitad. La Acumulación Plena te permite acumular todo el zeon que te correspondería, pero te inhibe de realizar acciones activas este turno fuera de lanzar conjuros.</i></center>
    </div>
    <div>
        <center>
            <h2>Zeon acumulado: ${zeonAcum}</h2>
            Zeon máximo: ${zeonBaseTotal}, Zeon actual: ${zeonBaseCurr}<br>
            Fatiga actual: ${fatigueCurr}, Zeon Mantenido: ${zeonMant}
        </center>
    </div>
    <div class="flexrow flex-center">
        <div class="flexrow">
            <center>
                <h2>ACT Plena</h2> ${zeonACT} <br>
            </center>
        </div>
        <div class="flexrow">
            <center>
                <h2>ACT Parcial</h2> ${Math.round(zeonACT / 2)} <br>
            </center>
        </div>
    </div>
    <div class="form-group">
        <label for="cansancioUsado">Cansancio Usado:</label>
        <input type="number" id="cansancioUsado" name="cansancioUsado" value="0">
    </div>
    <div class="form-group">
        <label for="cansancioModificacion">Cansancio Modificación:</label>
        <input type="number" id="cansancioModificacion" name="cansancioModificacion" value="15">
    </div>
    <br>
`;

let stayOpen = false;
let d = new Dialog({
    title: "Zeon Accumulation",
    content: dialogContent,
    buttons: {
        done: {
            label: "Acum. Plena",
            callback: (html) => {
                stayOpen = false;
                let cansancioUsado = parseFloat(html.find('#cansancioUsado').val()) || 0;
                let cansancioModificacion = parseFloat(html.find('#cansancioModificacion').val()) || 1;
                updateAcumulation(0, cansancioUsado, cansancioModificacion);
            }
        },
        show: {
            label: "Acum. Parcial",
            callback: (html) => {
                stayOpen = false;
                let cansancioUsado = parseFloat(html.find('#cansancioUsado').val()) || 0;
                let cansancioModificacion = parseFloat(html.find('#cansancioModificacion').val()) || 1;
                updateAcumulation(1, cansancioUsado, cansancioModificacion);
            }
        },
        return: {
            label: "Devolver Zeon",
            callback: async () => {
                new Dialog({
                    title: "Opciones de Devolución",
                    content: `<p>Selecciona una opción para devolver el zeón acumulado:</p>`,
                    buttons: {
                        all: {
                            label: "Devolver Todo",
                            callback: () => returnAccumulatedZeon("all")
                        },
                        minusTen: {
                            label: "Devolver Todo -10",
                            callback: () => returnAccumulatedZeon("minusTen")
                        }
                    },
                    default: "all"
                }).render(true);
            }
        },
        modify: {
            label: "Hechizos Mantenidos",
            callback: () => {
                modifyZeonMaintainedDialog();
            }
        }
    },
    default: "done",
    close: () => {
        if (stayOpen) {
            stayOpen = false;
            d.render(true);
        }
    }
}).render(true);
