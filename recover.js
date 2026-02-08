const token = canvas.tokens.controlled[0];
if (!token) {
    ui.notifications.warn("⚠️ Selecciona tu token primero.");
    return;
}

const actor = token.actor;

const PATH_HP = "system.characteristics.secondaries.lifePoints";
const PATH_FATIGUE = "system.characteristics.secondaries.fatigue";
const PATH_ZEON = "system.mystic.zeon";
const PATH_ZEON_REGEN = "system.mystic.zeonRegeneration.final.value";
const PATH_KI = "system.domine.kiAccumulation.generic";

const hpData = foundry.utils.getProperty(actor, PATH_HP);
const fatigueData = foundry.utils.getProperty(actor, PATH_FATIGUE);

const zeonVal = foundry.utils.getProperty(actor, `${PATH_ZEON}.value`) || 0;
const zeonMax = foundry.utils.getProperty(actor, `${PATH_ZEON}.max`) || 0;
const zeonRegenVal = foundry.utils.getProperty(actor, PATH_ZEON_REGEN) || 0;

const kiVal = foundry.utils.getProperty(actor, `${PATH_KI}.value`) || 0;
const kiMax = foundry.utils.getProperty(actor, `${PATH_KI}.max`) || 0;

if (!hpData) {
    ui.notifications.error("Error: No se encuentra la vida en la hoja de personaje.");
    return;
}

const hpVal = hpData.value;
const hpMax = (typeof hpData.max === 'object') ? hpData.max.value : hpData.max;

const fatVal = fatigueData ? fatigueData.value : 0;
const fatMax = fatigueData ? ((typeof fatigueData.max === 'object') ? fatigueData.max.value : fatigueData.max) : 0;

let detectedRegen = 0;
const regenPathsToCheck = [
    "system.characteristics.secondaries.regenerationType.final.value",
    "system.characteristics.secondaries.regenerationType.final",
    "system.characteristics.secondaries.regeneration.final.value",
    "system.characteristics.secondaries.regeneration.final"
];

for (const path of regenPathsToCheck) {
    const val = foundry.utils.getProperty(actor, path);
    if (val !== undefined && val !== null) {
        detectedRegen = parseInt(val);
        break;
    }
}

const REGEN_TABLE = {
    0: { rest: 0, active: 0 },
    1: { rest: 10, active: 5 },
    2: { rest: 20, active: 10 },
    3: { rest: 30, active: 15 },
    4: { rest: 40, active: 20 },
    5: { rest: 50, active: 25 },
    6: { rest: 75, active: 30 },
    7: { rest: 100, active: 50 },
    8: { rest: 250, active: 100 },
    9: { rest: 500, active: 200 }
};

const cssStyle = `
    <style>
        .abf-rest-dialog { font-family: 'Signika', sans-serif; color: #eee; }
        .abf-header { display: flex; align-items: center; border-bottom: 2px solid #444; padding-bottom: 8px; margin-bottom: 10px; }
        .abf-header img { width: 40px; height: 40px; border-radius: 5px; border: 1px solid #777; margin-right: 10px; }
        .abf-header h3 { margin: 0; font-size: 1.4em; color: #fff; }
        .abf-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 5px; margin-bottom: 15px; }
        .abf-stat-box { background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 4px; padding: 6px; text-align: center; }
        .abf-stat-label { font-size: 0.7em; text-transform: uppercase; color: #aaa; letter-spacing: 1px; }
        .abf-stat-val { font-size: 1.1em; font-weight: bold; margin-top: 2px; }
        .text-red { color: #ff6666; }
        .text-yellow { color: #ffcc00; }
        .text-purple { color: #d69dfc; }
        .text-green { color: #2ecc71; }
        .abf-control-row { display: flex; justify-content: space-between; align-items: center; background: #2a2a2a; padding: 8px; border-radius: 4px; border: 1px solid #444; margin-bottom: 5px; }
        .abf-input { background: #111; color: #fff; border: 1px solid #555; text-align: center; width: 50px; padding: 4px; border-radius: 3px; }
        .dialog-button {
            background: linear-gradient(to bottom, #4a4a4a, #2b2b2b) !important;
            border: 1px solid #111 !important;
            color: #ffffff !important;
            text-shadow: 0 1px 2px black;
        }
        .dialog-button:hover {
            background: linear-gradient(to bottom, #5a5a5a, #3b3b3b) !important;
            box-shadow: 0 0 5px rgba(255,255,255,0.3);
        }
    </style>
`;

const zeonDisplay = (zeonMax > 0) ? `
    <div class="abf-stat-box" style="border-bottom: 2px solid #9b59b6;">
        <div class="abf-stat-label"><i class="fas fa-star"></i> Zeón</div>
        <div class="abf-stat-val text-purple">${zeonVal} <span style="font-size:0.7em; color:#777;">/ ${zeonMax}</span></div>
    </div>` : `
    <div class="abf-stat-box" style="opacity:0.3;">
        <div class="abf-stat-label">Zeón</div>
        <div class="abf-stat-val">-</div>
    </div>`;

const kiDisplay = (kiMax > 0) ? `
    <div class="abf-stat-box" style="border-bottom: 2px solid #2ecc71;">
        <div class="abf-stat-label"><i class="fas fa-fist-raised"></i> Ki</div>
        <div class="abf-stat-val text-green">${kiVal} <span style="font-size:0.7em; color:#777;">/ ${kiMax}</span></div>
    </div>` : ``; 

const dialogContent = `
    ${cssStyle}
    <div class="abf-rest-dialog">
        <div class="abf-header">
            <img src="${token.document.texture.src}" />
            <h3>${token.name}</h3>
        </div>

        <div class="abf-stats-grid">
            <div class="abf-stat-box" style="border-bottom: 2px solid #993333;">
                <div class="abf-stat-label"><i class="fas fa-heart"></i> Vida</div>
                <div class="abf-stat-val text-red">${hpVal} <span style="font-size:0.7em; color:#777;">/ ${hpMax}</span></div>
            </div>
            <div class="abf-stat-box" style="border-bottom: 2px solid #cc9900;">
                <div class="abf-stat-label"><i class="fas fa-bolt"></i> Cansancio</div>
                <div class="abf-stat-val text-yellow">${fatVal} <span style="font-size:0.7em; color:#777;">/ ${fatMax}</span></div>
            </div>
            ${zeonDisplay}
            ${kiDisplay}
        </div>
        
        <div class="abf-control-row">
            <label style="font-weight: bold;"><i class="fas fa-dna"></i> Nivel de Regeneración</label>
            <input type="number" id="inputRegen" class="abf-input" value="${detectedRegen}">
        </div>

        <div class="abf-control-row">
            <label style="font-weight: bold;"><i class="fas fa-hourglass-half"></i> Horas de Descanso</label>
            <input type="number" id="inputHours" class="abf-input" value="8">
        </div>
        
        <p style="text-align: center; margin-top: 15px; font-size: 0.9em; color: #bbb;">Selecciona el tipo de recuperación:</p>
    </div>
`;

new Dialog({
    title: `Recuperación: ${token.name}`,
    content: dialogContent,
    buttons: {
        rest: {
            label: `<span style="font-family:Signika; font-size:1.1em;">Descansado</span>`,
            callback: (html) => processRecovery(html, 'REST')
        },
        active: {
            label: `<span style="font-family:Signika; font-size:1.1em;">Sin descanso</span>`,
            callback: (html) => processRecovery(html, 'ACTIVE')
        }
    },
    default: "rest",
    render: (html) => html.closest('.app').find('.window-content').css('background', '#1f1f1f')
}).render(true);

async function processRecovery(html, mode) {
    const regenLevel = parseInt(html.find("#inputRegen").val());
    const hoursRest = parseInt(html.find("#inputHours").val()) || 0;
    const isHighRegen = regenLevel >= 10;
    
    let healAmount = 0;
    let restoreFatigue = false;
    let restoreZeon = false;
    let restoreKi = false;
    let modeLabel = "";

    if (mode === 'REST') {
        restoreFatigue = true;
        restoreZeon = true; 
        restoreKi = true;  
        modeLabel = `Descanso Diario (${hoursRest}h)`;
        if (isHighRegen) healAmount = hpMax;
        else healAmount = REGEN_TABLE[regenLevel]?.rest || 0;
    } else { 
        restoreFatigue = false;
        restoreZeon = false; 
        restoreKi = false;
        modeLabel = "Recuperación Activa";
        if (isHighRegen) healAmount = hpMax;
        else healAmount = REGEN_TABLE[regenLevel]?.active || 0;
    }

    let newHP = Math.min(hpMax, hpVal + healAmount);
    let hpRecovered = newHP - hpVal;

    let newFat = fatVal;
    let fatRecovered = 0;
    let fatigueMsgHtml = "";

    if (restoreFatigue && fatigueData) {
        newFat = fatMax;
        fatRecovered = newFat - fatVal;
        
        if (fatRecovered > 0) {
            fatigueMsgHtml = `
            <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:13px; color:#ffcc00;">
                <span><i class="fas fa-bolt"></i> Cansancio</span>
                <strong>+${fatRecovered}</strong>
            </div>`;
        } else {
            fatigueMsgHtml = `
            <div style="text-align:center; margin-top:4px; font-size:11px; color:#777;">
                <i class="fas fa-bolt"></i> Cansancio lleno
            </div>`;
        }
    }

    let newZeon = zeonVal;
    let zeonRecovered = 0;
    let zeonMsgHtml = "";

    if (restoreZeon && zeonMax > 0) {
        newZeon = Math.min(zeonMax, zeonVal + zeonRegenVal);
        zeonRecovered = newZeon - zeonVal;

        if (zeonRecovered > 0) {
            zeonMsgHtml = `
            <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:13px; color:#d69dfc;">
                <span><i class="fas fa-star"></i> Zeón</span>
                <strong>+${zeonRecovered}</strong>
            </div>`;
        }
    }

    let newKi = kiVal;
    let kiRecovered = 0;
    let kiMsgHtml = "";

    if (restoreKi && kiMax > 0) {
        const kiRegenTotal = hoursRest * 6;
        newKi = Math.min(kiMax, kiVal + kiRegenTotal);
        kiRecovered = newKi - kiVal;

        if (kiRecovered > 0) {
            kiMsgHtml = `
            <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:13px; color:#2ecc71;">
                <span><i class="fas fa-fist-raised"></i> Ki</span>
                <strong>+${kiRecovered}</strong>
            </div>`;
        }
    }

    if (hpRecovered === 0 && fatRecovered === 0 && zeonRecovered === 0 && kiRecovered === 0) {
        ui.notifications.info("No hay puntos que recuperar.");
        return;
    }

    let updateData = {};
    updateData[`${PATH_HP}.value`] = newHP;
    if (restoreFatigue) updateData[`${PATH_FATIGUE}.value`] = newFat;
    if (restoreZeon && zeonMax > 0) updateData[`${PATH_ZEON}.value`] = newZeon;
    if (restoreKi && kiMax > 0) updateData[`${PATH_KI}.value`] = newKi;

    await actor.update(updateData);

    const chatContent = `
        <div style="background: #222; border: 1px solid #444; border-radius: 5px; font-family: 'Signika', sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
            <div style="background: linear-gradient(90deg, #2c3e50, #000); padding: 8px 10px; border-radius: 5px 5px 0 0; display:flex; align-items:center;">
                <img src="${token.document.texture.src}" style="width:30px; height:30px; border-radius:50%; border:1px solid #fff; margin-right:10px;">
                <div style="color: #fff; font-weight: bold;">${token.name}</div>
            </div>

            <div style="padding: 10px; color: #ccc;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; text-align:center; border-bottom:1px solid #333; padding-bottom:4px;">
                    ${modeLabel}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(0,255,0,0.1); padding: 8px; border-radius: 4px; border-left: 3px solid #4caf50; margin-bottom: 5px;">
                    <span style="font-weight:bold; color: #4caf50;"><i class="fas fa-heart"></i> Salud</span>
                    <span style="font-size:1.2em; font-weight:bold; color: #fff;">+${hpRecovered}</span>
                </div>
                
                ${fatigueMsgHtml}
                ${zeonMsgHtml}
                ${kiMsgHtml}

                <div style="margin-top: 10px; text-align: right; font-size: 10px; color: #666;">
                    PV: ${newHP}/${hpMax} ${zeonMax > 0 ? `| Zeón: ${newZeon}/${zeonMax}` : ''} ${kiMax > 0 ? `| Ki: ${newKi}/${kiMax}` : ''}
                </div>
            </div>
        </div>
    `;

    ChatMessage.create({
        content: chatContent,
        speaker: ChatMessage.getSpeaker({token: token})
    });
}