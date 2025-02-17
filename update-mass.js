const selectedToken = canvas.tokens.controlled[0];
if (!selectedToken) {
  ui.notifications.error("¡No hay ningún token seleccionado!");
  return;
}

const actor = selectedToken.actor;
if (!actor) {
  ui.notifications.error("¡El token seleccionado no tiene un actor asociado!");
  return;
}

const masaData = actor.flags["masa-enemigos"];
if (!masaData || masaData.version !== 2) {
  ui.notifications.error("¡Este actor no es una masa válida!");
  return;
}

// Datos clave
const currentHP = actor.system.characteristics.secondaries.lifePoints.value;
const totalPV = masaData.totalOriginal;
const numOriginal = masaData.numOriginal;
const tipo = masaData.tipo;

// Calcular enemigos restantes
let currentEnemies = 0;
if (tipo === "acumulacion") {
  const basePV = masaData.basePV;
  if (currentHP < basePV) {
    currentEnemies = 0;
  } else {
    currentEnemies = 1 + Math.ceil((currentHP - basePV) / (basePV / 2));
    if (numOriginal > 50 && currentEnemies > 50) {
      const remainingHP = currentHP - (basePV + 49*(basePV/2));
      currentEnemies = 50 + Math.floor(remainingHP / (basePV < 1000 ? 100 : 250));
    }
  }
} else {
  const pvPorUnidad = masaData.pvPorUnidad;
  currentEnemies = Math.ceil(currentHP / pvPorUnidad);
}
currentEnemies = Math.max(0, Math.min(currentEnemies, numOriginal));

// Actualizar HO
const thresholds = [
  { min: 100, bonus: 150 }, { min: 50, bonus: 130 },
  { min: 25, bonus: 110 }, { min: 15, bonus: 90 },
  { min: 10, bonus: 70 }, { min: 5, bonus: 50 },
  { min: 3, bonus: 30 }
];
const bonusHO = thresholds.find(t => currentEnemies >= t.min)?.bonus || 0;
const nuevoHO = masaData.hoBase + bonusHO;

// Actualizar descripción
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

ui.notifications.info("Masa actualizada");