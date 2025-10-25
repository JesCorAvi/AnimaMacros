// Macro con DialogV2 para crear / actualizar masa

async function runMasaMacro() {
  const selectedToken = canvas.tokens.controlled[0];
  if (!selectedToken) {
    return ui.notifications.error("¡No hay ningún token seleccionado!");
  }

  const actor = selectedToken.actor;
  if (!actor) {
    return ui.notifications.error("¡El token seleccionado no tiene un actor asociado!");
  }

  // Función interna para actualizar masa existente
  async function actualizarMasa(actor, masaData) {
    const currentHP = actor.system.characteristics.secondaries.lifePoints.value;
    const totalPV = masaData.totalOriginal;
    const numOriginal = masaData.numOriginal;
    const tipo = masaData.tipo;

let currentEnemies = 0;

if (tipo === "acumulacion") {
  const basePV = masaData.basePV;
  const maxBase = basePV + 49 * (basePV / 2);
  if (currentHP <= basePV) {
    currentEnemies = 1;
  } else if (currentHP <= maxBase) {
    currentEnemies = 1 + Math.ceil((currentHP - basePV) / (basePV / 2));
  } else {
    const adicional = basePV < 1000 ? 100 : 250;
    const extraPV = currentHP - maxBase;
    currentEnemies = 50 + Math.ceil(extraPV / adicional);
  }
} else {
  const pvPorUnidad = masaData.pvPorUnidad;
  const maxBase = pvPorUnidad * 100;
  if (currentHP <= maxBase) {
    currentEnemies = Math.ceil(currentHP / pvPorUnidad);
  } else {
    const adicional = pvPorUnidad < 250 ? 10 : 25;
    const extraPV = currentHP - maxBase;
    currentEnemies = 100 + Math.ceil(extraPV / adicional);
  }
}
    currentEnemies = Math.max(0, Math.min(currentEnemies, numOriginal));

    const thresholds = [
      { min: 100, bonus: 150 }, { min: 50, bonus: 130 },
      { min: 25, bonus: 110 }, { min: 15, bonus: 90 },
      { min: 10, bonus: 70 }, { min: 5, bonus: 50 },
      { min: 3, bonus: 30 }
    ];
    const bonusHO = thresholds.find(t => currentEnemies >= t.min)?.bonus || 0;
    const nuevoHO = masaData.hoBase + bonusHO;

    const content = `
      <div class="masa-update">
        <h2>Información de Masa: ${selectedToken.name}</h2>
        <div class="grid grid-3col">
          <div class="flexcol">
            <div class="flexcol">
              <label>Unidades Activas</label>
              <div class="value">${currentEnemies} <small>/ ${numOriginal}</small></div>
            </div>
          </div>
        </div>
      </div>
    `;

    await ChatMessage.create({
      content,
      speaker: ChatMessage.getSpeaker({ actor: actor })
    });

    await actor.update({
      "system.combat.attack.base.value": nuevoHO,
      "system.combat.attack.final.value": nuevoHO,
      "system.general.description.value": `
        <div class="masa-info">
          <p>⚔️ <strong>HO Actual:</strong> ${nuevoHO} (+${bonusHO})</p>
          <p>❤️ <strong>PV Restantes:</strong> ${currentHP}/${totalPV}</p>
          <p>👥 <strong>Unidades Activas:</strong> ${currentEnemies}/${numOriginal}</p>
          <p>🔢 <em>Tipo: ${tipo === "acumulacion" ? "Acumulación" : "Normal"}</em></p>
        </div>
      `,
      "flags.masa-enemigos.currentEnemies": currentEnemies
    });

    ui.notifications.info(`Masa actualizada: ${currentEnemies} enemigos restantes`);
  }

  // ¿Ya es masa?
  if (actor.system.general.settings.defenseType.value === "mass") {
    const masaData = actor.flags["masa-enemigos"];
    if (!masaData || masaData.version !== 2) {
      return ui.notifications.error("¡Este actor no es una masa válida!");
    }
    return actualizarMasa(actor, masaData);
  }

  // Si no es masa: creación de masa nueva mediante DialogV2
  // Construimos el input form con DialogV2.input o directamente con `content` + campos
  const { NumberField } = foundry.data.fields;

  const numEnemiesField = new NumberField({
    label: "Número de Enemigos:",
    initial: 1,
    min: 1,
    step: 1
  }).toFormGroup({}, { name: "numEnemies" }).outerHTML;

  // Usamos DialogV2.prompt para pedir ese número
  const result = await foundry.applications.api.DialogV2.prompt({
    window: { title: "Crear Masa de Enemigos" },
    content: `<form>${numEnemiesField}</form>`,
    ok: {
      label: "Crear",
      callback: async (_event, button) => {
        const formData = new FormDataExtended(button.form).object;
        return formData.numEnemies;
      }
    },
    rejectClose: true
  });

  // Si el usuario cerró o canceló, result puede ser null o lanzar error
  if (result == null) {
    return; // usuario canceló
  }

  const numEnemies = parseInt(result);
  if (isNaN(numEnemies) || numEnemies < 1) {
    return ui.notifications.error("Número de enemigos inválido.");
  }

  // Lógica de cálculo (igual que tu versión original)
  const avgPV = actor.system.characteristics.secondaries.lifePoints.value;
  const avgHO = actor.system.combat.attack.final.value;

  const defenseType = actor.system.general.settings.defenseType.value;
  const dañoAcumulativo = (defenseType === "resistance");

  let totalPV, calculationData = {};
  let tipoMasa = "";
  const equippedWeapon = actor.items.find(i => i.type === "weapon" && i.system.equipped?.value);
  const avgDano = equippedWeapon ? equippedWeapon.system.damage.final.value : 0;

  if (!dañoAcumulativo) {
    const pvPorUnidad = Math.floor(avgPV / 50) * 50;
    if (numEnemies <= 100) {
      totalPV = pvPorUnidad * numEnemies;
    } else {
      const adicional = pvPorUnidad < 250 ? 10 : 25;
      totalPV = (100 * pvPorUnidad) + ((numEnemies - 100) * adicional);
    }
    tipoMasa = "Normal";
    calculationData = { tipo: "normal", pvPorUnidad };
  } else {
    const basePV = Math.floor(avgPV / 100) * 100;
    if (numEnemies <= 50) {
      totalPV = basePV + (numEnemies - 1) * (basePV / 2);
    } else {
      const adicional = basePV < 1000 ? 100 : 250;
      totalPV = basePV + 49 * (basePV / 2) + ((numEnemies - 50) * adicional);
    }
    tipoMasa = "Acumulación";
    calculationData = { tipo: "acumulacion", basePV };
  }

  const thresholds = [
    { min: 100, bonus: 150 }, { min: 50, bonus: 130 },
    { min: 25, bonus: 110 }, { min: 15, bonus: 90 },
    { min: 10, bonus: 70 }, { min: 5, bonus: 50 },
    { min: 3, bonus: 30 }
  ];
  const bonusHO = thresholds.find(t => numEnemies >= t.min)?.bonus || 0;
  const HO = avgHO + bonusHO;
  const danoMass = Math.floor(avgDano * 0.5);

  await actor.update({
    "system.characteristics.secondaries.lifePoints": {
      value: totalPV,
      max: totalPV
    },
    "system.combat.attack.base.value": HO,
    "system.combat.attack.final.value": HO,
    "system.general.description.value": `
      <div class="masa-info">
        <p>⚔️ <strong>HO Actual:</strong> ${HO} (+${bonusHO})</p>
        <p>❤️ <strong>PV Totales:</strong> ${totalPV}</p>
        <p>👥 <strong>Unidades:</strong> ${numEnemies}</p>
        <p>🔢 <em>Tipo: ${tipoMasa}</em></p>
      </div>
    `,
    "system.general.settings.defenseType.value": "mass",
    "system.general.modifiers.extraDamage.value": danoMass,
    "flags.masa-enemigos": {
      version: 2,
      ...calculationData,
      totalOriginal: totalPV,
      numOriginal: numEnemies,
      hoBase: avgHO
    }
  });

  ui.notifications.info("Masa creada exitosamente");
}

// Ejecutar
runMasaMacro();
