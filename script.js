let vegetables = {
    bomull: { unlocked: true, energy: 10, unlockCost: 0, sellPrice: 10, quantity: 0 },
    poteter: { unlocked: false, energy: 50, unlockCost: 10000, sellPrice: 200, quantity: 0 },
    gulrot: { unlocked: false, energy: 5, unlockCost: 200000, sellPrice: 150, quantity: 0 },
    asparges: { unlocked: false, energy: 60, unlockCost: 2500000, sellPrice: 8000, quantity: 0 },
    brokkoli: { unlocked: false, energy: 16, unlockCost: 30000000, sellPrice: 5000, quantity: 0 },
    eple: { unlocked: false, energy: 30, unlockCost: 200000000, sellPrice: 15000, quantity: 0 },
    aubergine: { unlocked: false, energy: 100, unlockCost: 3000000000, sellPrice: 50000, quantity: 0 },
    jordbær: { unlocked: false, energy: 25, unlockCost: 45000000000, sellPrice: 40000, quantity: 0 },
    sukkererter: { unlocked: false, energy: 12, unlockCost: 900000000000, sellPrice: 60000, quantity: 0 },
    banan: { unlocked: false, energy: 40, unlockCost: 5000000000000, sellPrice: 150000, quantity: 0 }
};

let money = 0;
let energy = 100;
let numWorkers = 1;
let energyUpgradeLevel = 0;
let workerUpgradeLevel = 0;
let energyReductionUpgradeLevel = 0;
const maxLevel = 50;
const baseMaxEnergy = 100;

let energyRegenRate = 0;
let maxEnergy = baseMaxEnergy;

let energyRegenInterval;

function startGame() {
    money = 0;
    energy = 100;
    numWorkers = 1;
    energyUpgradeLevel = 0;
    workerUpgradeLevel = 0;
    energyReductionUpgradeLevel = 0;
    maxEnergy = baseMaxEnergy;

    for (let veg in vegetables) {
        vegetables[veg].quantity = 0;
        vegetables[veg].unlocked = false;
    }
    vegetables.bomull.unlocked = true;
    updateStatus();
}

function unlockVegetable(vegetable) {
    if (!vegetables[vegetable].unlocked && money >= vegetables[vegetable].unlockCost) {
        money -= vegetables[vegetable].unlockCost;
        vegetables[vegetable].unlocked = true;
        updateStatus();
    }
}

let workerCost;

function buyWorker() {
    workerCost = getWorkerUpgradeCost();
    if (money >= workerCost) {
        money -= workerCost;
        workerUpgradeLevel++;
        numWorkers++;
        updateStatus();
    }
}

function getWorkerUpgradeCost() {
    const baseWorkerCost = 100;
    const workerCostMultiplier = 1.1;
    const linearComponent = 20 * workerUpgradeLevel;

    let cost = Math.floor(baseWorkerCost * Math.pow(workerCostMultiplier, workerUpgradeLevel) + linearComponent);

    if (skillCosts[19].bought) {
        cost = Math.floor(cost / 2);
    }

    return cost;
}
function buyEnergyUpgrade() {
    const energyUpgradeCost = getEnergyUpgradeCost();
    if (money >= energyUpgradeCost) {
        money -= energyUpgradeCost;
        energyUpgradeLevel++;
        updateStatus();
    }
}

function getEnergyUpgradeCost() {
    const baseUpgradeCost = 500;
    const costMultiplier = 1.4;
    let energyCost = Math.floor(baseUpgradeCost * Math.pow(costMultiplier, energyUpgradeLevel));
    if (skillCosts[19].bought) {
        energyCost = Math.floor(energyCost / 2);
    }

    return energyCost;
}


function buyEnergyReductionUpgrade() {
    const cost = getEnergyReductionUpgradeCost();
    if (money >= cost && energyReductionUpgradeLevel < maxLevel) {
        money -= cost;
        energyReductionUpgradeLevel++;
        updateStatus();
    } else if (energyReductionUpgradeLevel >= maxLevel) {
        alert(`Du har nådd maksimalt nivå for energiforbruksreduksjon (${maxLevel}).`);
    }
}

function getEnergyReductionUpgradeCost() {
    const baseUpgradeCost = 1000;
    const costMultiplier = 1.5;

    let redCost = Math.floor(baseUpgradeCost * Math.pow(costMultiplier, energyReductionUpgradeLevel));

    if (skillCosts[19].bought) {
        redCost = Math.floor(redCost / 2);
    }

    return redCost;
}
function getEnergyConsumption(vegetable) {


    let baseConsumption = vegetables[vegetable].energy;
    if (energyReductionUpgradeLevel > 0) {
        let discountPercent = getEnergyReductionDiscountPercent();
        let discountedConsumption = baseConsumption * (1 - discountPercent);
        baseConsumption = Math.max(1, Math.round(discountedConsumption));
    }


    if (skillCosts[20].bought) {
        baseConsumption *= 0.75;
    }

    return Math.max(1, Math.round(baseConsumption));
}


function getEnergyReductionDiscountPercent() {
    const baseDiscountPercent = 0.01;
    return baseDiscountPercent * energyReductionUpgradeLevel;
}

function getEnergyGain() {
    let baseEnergyGain = 10;
    const energyGainIncrement = 0.5;
    if (skillCosts[20].bought) {
        baseEnergyGain += 25;
    }
    return baseEnergyGain + (energyGainIncrement * energyUpgradeLevel);
}



function pickVegetable(vegetable) {
    const energyConsumption = getEnergyConsumption(vegetable);
    let quantity = numWorkers;

    if (skillCosts[1].bought && Math.random() < 0.05) {
        quantity *= 2;
    }

    if (skillCosts[10].bought) {
        quantity *= 1.15;
    }

    if (skillCosts[18].bought) {
        quantity *= 1.25;
    }

    if (skillCosts[20].bought) {
        quantity *= 1.25;
    }

    let jalapenoChance = 0.001;
    if (skillCosts[8].bought) {
        jalapenoChance = 0.002;
    }

    if (skillCosts[3].bought && Math.random() < jalapenoChance) {
        addJalapeno();
    }


    if (skillCosts[15].toggle) {
        quantity *= 2;
    }


    if (currentWeather === "Sol") {
        quantity *= 1.2;
    } else if (currentWeather === "Regn") {
        quantity *= 1.1;
    } else if (currentWeather === "Storm") {
        quantity *= 0.9;
    }
    if (skillCosts[16].bought && energy === maxEnergy) {
        quantity *= 4;
    }

    quantity *= cropGainMultiplier;

    const integerPart = Math.floor(quantity);
    const fractionalPart = quantity - integerPart;

    if (Math.random() < fractionalPart) {
        quantity = integerPart + 1;
    } else {
        quantity = integerPart;
    }

    if (energy > 0 && vegetables[vegetable].unlocked && energy >= energyConsumption) {
        if (!skillCosts[15].toggle) {
            energy -= energyConsumption;
            vegetables[vegetable].quantity += quantity;
        } else {
            energy -= energyConsumption * 2;
            vegetables[vegetable].quantity += quantity;
        }
    }


    updateStatus();
}



console.log("Få ræva di vekk fra F12 før jeg voldtar deg")

function updateJalapenoDisplay() {
    const jalapenoDisplay = document.getElementById('jalapenoDisplay');
    if (vegetables.jalapeno) {
        jalapenoDisplay.innerText = `Jalapenos: ${vegetables.jalapeno.quantity}`;
    } else {
        jalapenoDisplay.innerText = 'Jalapenos: 0';
    }
}

function addJalapeno() {
    if (vegetables.jalapeno) {
        vegetables.jalapeno.quantity++;
    } else {
        vegetables.jalapeno = { unlocked: true, energy: 10000000000, unlockCost: 0, sellPrice: 175000, quantity: 1 };
    }
    updateJalapenoDisplay();
}

let cropGainMultiplier = 1;




function resetSkillButtonClasses() {
    const skillButtons = document.querySelectorAll('.skill-button');
    skillButtons.forEach(button => {
        const skillId = parseInt(button.id.replace('skill', ''));
        const skillCost = skillCosts[skillId];

        if (skillId > 1) {
            button.classList.add('locked');
        }

        if (skillId > 0) {
            button.classList.remove('bought');
        }

        const weatherShowcase = document.getElementById(weatherDisplay)

        if (weatherShowcase) {
            classlist.add('hidden')

        }


    });
}



function calculateMultiplier() {
    let baseCost = 1000;
    let cappedMultiplier = 1;
    let earnings = totalEarnings;

    while (earnings > baseCost) {
        earnings -= baseCost;
        baseCost *= Math.pow(1.000003, cappedMultiplier);  
        cappedMultiplier++;
    }
    return parseFloat(cappedMultiplier.toFixed(3));
}



function rebirth() {

    multiplier = calculateMultiplier();

    
    for (let key in vegetables) {
        vegetables[key].quantity = 0;
        if (!vegetables[key].initiallyUnlocked) {
            vegetables[key].unlocked = false;
        }
    }

 
    for (let key in skillCosts) {
        skillCosts[key].bought = false;
        skillCosts[key].toggle = false;
    }

   
    energyReductionUpgradeLevel = 0;
    numWorkers = 1;
    energyUpgradeLevel = 0;
    maxEnergy = baseMaxEnergy;
    energy = maxEnergy;
    money = 0;
    workerUpgradeLevel = 0;

    
    workerCost = getWorkerUpgradeCost();

   
    cropGainMultiplier = 0.99 + (multiplier/100);

   
    resetSkillButtonClasses();

  
    weatherDisplay.textContent = '';

  
    document.getElementById("toggleAutoButton").hidden = true;
    document.getElementById("toggleDoubleButton").hidden = true;

    console.log(`${multiplier}`)

 
    updateStatus();

  
    stopEnergyRegen();
}


let totalEarnings = 0

function sellVegetable(vegetable) {
    if (vegetable !== "jalapeno") {
        if (vegetables[vegetable].quantity > 0) {
            let earnings = vegetables[vegetable].quantity * vegetables[vegetable].sellPrice;

            if (skillCosts[2].bought) {
                earnings *= 1.1;
            }
            if (skillCosts[6].bought) {
                earnings *= 1.15;
            }
            if (skillCosts[12].bought) {
                earnings *= 1.2;
            }

            if (skillCosts[20].bought) {
                earnings *= 1.25;
            }
            totalEarnings += earnings;
            money += earnings;

            vegetables[vegetable].quantity = 0;
            updateStatus();
        }
    } 
}


function sellAllVegetables() {
    for (let vegetable in vegetables) {
        if (vegetables[vegetable].quantity > 0) {
            sellVegetable(vegetable);
        }
    }
}

function rest() {
    energy += getEnergyGain();
    if (energy > maxEnergy) {
        energy = maxEnergy;
    }
    updateStatus();
}


function formatMoney(value) {
    if (value >= 1e30) {
        return (value / 1e30).toFixed(1) + "quint";
    } else if (value >= 1e27) {
        return (value / 1e27).toFixed(1) + "qrd";
    } else if (value >= 1e24) {
        return (value / 1e24).toFixed(1) + "quad";
    } else if (value >= 1e21) {
        return (value / 1e21).toFixed(1) + "trd";
    } else if (value >= 1e18) {
        return (value / 1e18).toFixed(1) + "trill";
    } else if (value >= 1e15) {
        return (value / 1e15).toFixed(1) + "brd";
    } else if (value >= 1e12) {
        return (value / 1e12).toFixed(1) + "bill";
    } else if (value >= 1e9) {
        return (value / 1e9).toFixed(1) + "mrd";
    } else if (value >= 1e6) {
        return (value / 1e6).toFixed(1) + "mill";
    } else if (value >= 1e3) {
        return (value / 1e3).toFixed(1) + "k";
    } else {
        return value.toString();
    }
}


function toggleSkillTreeMenu() {
    var skillTreeMenu = document.getElementById("skillTreeMenu");
    if (skillTreeMenu.style.display === "none") {
        skillTreeMenu.style.display = "block";
    } else {
        skillTreeMenu.style.display = "none";
    }
}

function closeSkillTree() {
    document.getElementById("skillTreeMenu").style.display = "none";
}

const skillCosts = {
    1: { crop: "bomull", amount: 25000, bought: false, description: "Få en 5% sjanse for dobbel grønnsaker", unlocks: [2, 3, 4] },
    2: { crop: "poteter", amount: 20000, bought: false, description: "Alt selger for 10% mer", unlocks: [5, 6] },
    3: { crop: "gulrot", amount: 200000, bought: false, description: "Lås opp de ultra sjeldne Jalapenos,som du plukker opp tilfeldig", unlocks: [7, 8, 9] },
    4: { crop: "bomull", amount: 150000, bought: false, description: "Lås opp en bonde som automatisk plukker for deg", unlocks: [10, 11] },
    5: { crop: "asparges", amount: 80000, bought: false, description: "10% sjanse for å ikke bruke energi" },
    6: { crop: "poteter", amount: 100000, bought: false, description: "Alt selger for 15% mer", unlocks: [12] },
    7: { crop: "jalapeno", amount: 1, bought: false, description: "Regenerer 2% energi per sekund", unlocks: [13] },
    8: { crop: "brokkoli", amount: 200000, bought: false, description: "Øker sjansen for jalapenos til 1/500", unlocks: [14, 15, 16] },
    9: { crop: "jalapeno", amount: 1, bought: false, description: "Dobble Energikapasiteten", unlocks: [17] },
    10: { crop: "gulrot", amount: 1000000, bought: false, description: "Du får 15% mer grønnsaker", unlocks: [18] },
    11: { crop: "eple", amount: 500000, bought: false, description: "Bonden får arbeiderne til å ta ekstra skift" },
    12: { crop: "asparges", amount: 200000, bought: false, description: "Alt selger for 20% mer" },
    13: { crop: "jalapeno", amount: 5, bought: false, description: "Regenerer 10% energi per sekund" },
    14: { crop: "aubergine", amount: 400000, bought: false, description: "Låser opp været, som har både gode og dårlige effekter", unlocks: [19] },
    15: { crop: "jordbær", amount: 500000, bought: false, description: "Dobbel produksjon, men dobbel energi", toggle: false },
    16: { crop: "eple", amount: 750000, bought: false, description: "Den første grønnsaken du plukker når du har full energi gir 4x mengde ", unlocks: [20] },
    17: { crop: "jalapeno", amount: 10, bought: false, description: "Legger til en hotkey, space, som lar deg hvile" },
    18: { crop: "gulrot", amount: 10000000, bought: false, description: "Du får 25% mer grønnsaker" },
    19: { crop: "sukkererter", amount: 7500000, bought: false, description: "Alle oppgraderinger og arbeidere koster 50% mindre" },
    20: { crop: "bomull", amount: 10000000, bought: false, description: "Alt blir 25% bedre" },
};

function showBox1() {
    const box1 = document.getElementById('box1');
    if (box1) {
        box1.hidden = false;
    }
}

function hideBox1() {
    const box1 = document.getElementById('box1');
    if (box1) {
        box1.hidden = true;
    }
}

function showBox2() {
    const box2 = document.getElementById('box2');
    if (box2) {
        box2.hidden = false;
    }
}

function hideBox2() {
    const box2 = document.getElementById('box2');
    if (box2) {
        box2.hidden = true;
    }
}

function showBox3() {
    const box3 = document.getElementById('box3');
    if (box3) {
        box3.hidden = false;
    }
}

function hideBox3() {
    const box3 = document.getElementById('box3');
    if (box3) {
        box3.hidden = true;
    }
}

function showBox4() {
    const box4 = document.getElementById('box4');
    if (box4) {
        box4.hidden = false;
    }
}

function hideBox4() {
    const box4 = document.getElementById('box4');
    if (box4) {
        box4.hidden = true;
    }
}

function showBox5() {
    const box5 = document.getElementById('box5');
    if (box5) {
        box5.hidden = false;
    }
}

function hideBox5() {
    const box5 = document.getElementById('box5');
    if (box5) {
        box5.hidden = true;
    }
}

function showBox6() {
    const box6 = document.getElementById('box6');
    if (box6) {
        box6.hidden = false;
    }
}

function hideBox6() {
    const box6 = document.getElementById('box6');
    if (box6) {
        box6.hidden = true;
    }
}

function showBox7() {
    const box7 = document.getElementById('box7');
    if (box7) {
        box7.hidden = false;
    }
}

function hideBox7() {
    const box7 = document.getElementById('box7');
    if (box7) {
        box7.hidden = true;
    }
}

function showBox8() {
    const box8 = document.getElementById('box8');
    if (box8) {
        box8.hidden = false;
    }
}

function hideBox8() {
    const box8 = document.getElementById('box8');
    if (box8) {
        box8.hidden = true;
    }
}

function showBox9() {
    const box9 = document.getElementById('box9');
    if (box9) {
        box9.hidden = false;
    }
}

function hideBox9() {
    const box9 = document.getElementById('box9');
    if (box9) {
        box9.hidden = true;
    }
}

function showBox10() {
    const box10 = document.getElementById('box10');
    if (box10) {
        box10.hidden = false;
    }
}

function hideBox10() {
    const box10 = document.getElementById('box10');
    if (box10) {
        box10.hidden = true;
    }
}

function showBox11() {
    const box11 = document.getElementById('box11');
    if (box11) {
        box11.hidden = false;
    }
}

function hideBox11() {
    const box11 = document.getElementById('box11');
    if (box11) {
        box11.hidden = true;
    }
}

function showBox12() {
    const box12 = document.getElementById('box12');
    if (box12) {
        box12.hidden = false;
    }
}

function hideBox12() {
    const box12 = document.getElementById('box12');
    if (box12) {
        box12.hidden = true;
    }
}

function showBox13() {
    const box13 = document.getElementById('box13');
    if (box13) {
        box13.hidden = false;
    }
}

function hideBox13() {
    const box13 = document.getElementById('box13');
    if (box13) {
        box13.hidden = true;
    }
}

function showBox14() {
    const box14 = document.getElementById('box14');
    if (box14) {
        box14.hidden = false;
    }
}

function hideBox14() {
    const box14 = document.getElementById('box14');
    if (box14) {
        box14.hidden = true;
    }
}

function showBox15() {
    const box15 = document.getElementById('box15');
    if (box15) {
        box15.hidden = false;
    }
}

function hideBox15() {
    const box15 = document.getElementById('box15');
    if (box15) {
        box15.hidden = true;
    }
}

function showBox16() {
    const box16 = document.getElementById('box16');
    if (box16) {
        box16.hidden = false;
    }
}

function hideBox16() {
    const box16 = document.getElementById('box16');
    if (box16) {
        box16.hidden = true;
    }
}

function showBox17() {
    const box17 = document.getElementById('box17');
    if (box17) {
        box17.hidden = false;
    }
}

function hideBox17() {
    const box17 = document.getElementById('box17');
    if (box17) {
        box17.hidden = true;
    }
}

function showBox18() {
    const box18 = document.getElementById('box18');
    if (box18) {
        box18.hidden = false;
    }
}

function hideBox18() {
    const box18 = document.getElementById('box18');
    if (box18) {
        box18.hidden = true;
    }
}

function showBox19() {
    const box19 = document.getElementById('box19');
    if (box19) {
        box19.hidden = false;
    }
}

function hideBox19() {
    const box19 = document.getElementById('box19');
    if (box19) {
        box19.hidden = true;
    }
}

function showBox20() {
    const box20 = document.getElementById('box20');
    if (box20) {
        box20.hidden = false;
    }
}

function hideBox20() {
    const box20 = document.getElementById('box20');
    if (box20) {
        box20.hidden = true;
    }
}




const weatherDisplay = document.getElementById('weatherDisplay');

const weatherTypes = {
    Sol: { bonus: 1.2, description: "Sunny weather boosts crop yield by 20%." },
    Regn: { bonus: 0.8, description: "Rainy weather reduces crop yield by 20% but increases water reserves." },
    Storm: { bonus: 0.5, description: "Stormy weather severely reduces crop yield by 50%." }
};

let currentWeather;

let weatherInterval;

function startWeatherSystem() {
    if (skillCosts[14].bought) {
        changeWeather();
        weatherInterval = setInterval(changeWeather, 5 * 60 * 1000);
    }
}


function stopWeatherSystem() {
    clearInterval(weatherInterval);
}

function changeWeather() {
    const weatherKeys = Object.keys(weatherTypes);
    const randomWeather = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
    currentWeather = randomWeather;

    applyWeatherBonus();
    updateWeatherDisplay();
}

function applyWeatherBonus() {
    const weatherBonus = weatherTypes[currentWeather].bonus;


}

function updateWeatherDisplay() {
    weatherDisplay.textContent = `Vær: ${currentWeather}`;
}

function isWeatherSystemActive() {
    return !!weatherInterval;
}


startWeatherSystem();

function toggleBuffMenu() {
    var BuffMenu = document.getElementById("buffMenu");
    if (BuffMenu.style.display === "none") {
        BuffMenu.style.display = "block";
    } else {
        BuffMenu.style.display = "none";
    }
    updateStatus();
}

function closeBuffMenu() {
    document.getElementById("buffMenu").style.display = "none";
}




function createToggleDoubleButton() {
    const toggleDoubleButton = document.createElement('button');
    toggleDoubleButton.id = 'toggleDoubleButton';
    toggleDoubleButton.innerText = 'Dobbel Høsting: Av';
    toggleDoubleButton.onclick = toggleDoubleEffect;
    document.body.appendChild(toggleDoubleButton);
}

const toggleDoubleButton = document.getElementById('toggleDoubleButton');
let isDoubleEffectActive = false;

toggleDoubleButton.addEventListener('click', () => {
    isDoubleEffectActive = !isDoubleEffectActive;
    toggleDoubleButton.textContent = `Dobbel Høsting ${isDoubleEffectActive ? 'På' : 'Av'}`;
    toggleDoubleEffect()
});

function toggleDoubleEffect() {
    const skill = skillCosts[15];
    skill.toggle = !skill.toggle;
    updateStatus();
}

const toggleAutoButton = document.getElementById('toggleAutoButton');
let isAutoEffectActive = false;

document.getElementById('toggleAutoButton').addEventListener('click', () => {
    isAutoEffectActive = !isAutoEffectActive;
    document.getElementById('toggleAutoButton').textContent = `Bonde: ${isAutoEffectActive ? 'På' : 'Av'}`;
    toggleAutoEffect();
});

let autoEffectInterval;

function toggleAutoEffect() {
    if (isAutoEffectActive) {
        autoEffectInterval = setInterval(() => {
            let unlockedCrops = Object.keys(vegetables).filter(veg => vegetables[veg].unlocked && veg !== 'jalapeno');
            if (unlockedCrops.length > 0) {
                let randomCrop = unlockedCrops[Math.floor(Math.random() * unlockedCrops.length)];
                let quantity;

                if (skillCosts[11].bought) {
                    quantity = 2 * numWorkers * cropGainMultiplier;
                } else if (skillCosts[4].bought) {
                    quantity = 2 * cropGainMultiplier;
                } else {
                    quantity = cropGainMultiplier; 
                }

               
                const integerPart = Math.floor(quantity);
                const fractionalPart = quantity - integerPart;

                if (Math.random() < fractionalPart) {
                    quantity = integerPart + 1;
                } else {
                    quantity = integerPart;
                }

                vegetables[randomCrop].quantity += quantity;
                updateStatus();
            }
        }, 1000);
    } else {
        clearInterval(autoEffectInterval);
    }
    updateStatus();
}



function startEnergyRegen() {
    if (energyRegenInterval) {
        clearInterval(energyRegenInterval);
    }
    energyRegenInterval = setInterval(() => {
        if (energy < maxEnergy) {
            energy += energyRegenRate;
            if (energy > maxEnergy) {
                energy = maxEnergy;
            }
            updateStatus();
        }
    }, 1000);
}

function stopEnergyRegen() {
    if (energyRegenInterval) {
        console.log("Stopping energy regen interval");
        clearInterval(energyRegenInterval);
        energyRegenInterval = null;
    }
}


function applySkillEffects(skillId) {
    switch (skillId) {
        case 7:
            energyRegenRate = 2;
            startEnergyRegen();
            break;
        case 9:
            maxEnergy = baseMaxEnergy * 2;
            updateStatus();
            break;
        case 13:
            energyRegenRate = 10;
            startEnergyRegen();
            updateStatus();
            break;
        case 15:

        case 17:
            document.addEventListener('keydown', handleHotkey);
            updateStatus();
            break;
    }
}

function handleHotkey(event) {

    if (skillCosts[17].bought) {

        if (event.keyCode === 32) {

            rest();
        }
    }
}



function buySkill(skillId) {
    const skillCost = skillCosts[skillId];
    if (skillId === 15) {
        document.getElementById("toggleDoubleButton").hidden = false;
    }
    if (skillId === 4) {
        document.getElementById("toggleAutoButton").hidden = false;
    }
    if (skillCosts[14].bought) {
        startWeatherSystem();

    }

    if (!skillCost.bought) {
        const prerequisitesMet = skillId === 1 || Object.values(skillCosts).some(skill => skill.unlocks && skill.unlocks.includes(skillId) && skill.bought);

        if (prerequisitesMet) {
            if (hasEnoughCrops(skillCost)) {
                deductCropCost(skillCost);
                skillCost.bought = true;

                const skillElement = document.getElementById(`skill${skillId}`);
                if (skillElement) {
                    skillElement.classList.add('bought');
                }

                updateStatus();

                if (skillCost.unlocks) {
                    skillCost.unlocks.forEach(skill => {
                        document.getElementById(`skill${skill}`).classList.remove("locked");
                        
                    });
                }

                applySkillEffects(skillId);
            }
        }
    }
}

function hasEnoughCrops(skillCost) {
    const { crop, amount } = skillCost;
    return vegetables[crop].quantity >= amount;
}

function deductCropCost(skillCost) {
    const { crop, amount } = skillCost;
    vegetables[crop].quantity -= amount;
}



document.addEventListener('DOMContentLoaded', () => {
    const skillButtons = document.querySelectorAll('.skill-button');
    skillButtons.forEach(button => {
        button.addEventListener('click', () => {
            const skillId = parseInt(button.id.replace('skill', ''));
            buySkill(skillId);
        });

        button.addEventListener('mouseover', () => {
            const skillId = parseInt(button.id.replace('skill', ''));
            const skillCost = skillCosts[skillId];
            
        });
    });
});



function updateStatus() {
    let statusText = `| 👷‍♂️: ${numWorkers} | 🛏: Nivå ${energyUpgradeLevel} | 👷‍♂️⚡⬇: Nivå ${energyReductionUpgradeLevel}`;
    document.getElementById("status").innerText = statusText;

    let weatherBuff;

    let finalMultiplier = numWorkers * cropGainMultiplier;
    if(skillCosts[10].bought){
        finalMultiplier *= 1.15;
    }
    if(skillCosts[18].bought){
        finalMultiplier *= 1.25;
    }
    if (currentWeather === "Sol") {
        finalMultiplier *= 1.2;
        weatherBuff = 1.2;
    } else if (currentWeather === "Regn") {
        finalMultiplier *= 1.1;
        weatherBuff = 1.1;
    } else if (currentWeather === "Storm") {
        finalMultiplier *= 0.9;
        weatherBuff = 0.9;
    }

    let buffMenuText = `${numWorkers} x ${cropGainMultiplier}`;
    document.getElementById("upgrades").innerText = `${buffMenuText} = ${finalMultiplier}`;

    const cropsContainer = document.getElementById("crops");
    cropsContainer.innerHTML = '';

    const cropsPerRow = 3;
    let row = document.createElement("div");
    let count = 0;
    for (let veg in vegetables) {
        if (vegetables[veg].unlocked) {
            const cropString = `${veg.charAt(0).toUpperCase() + veg.slice(1)}: ${vegetables[veg].quantity}`;
            let cropElement = document.createElement("div");
            cropElement.innerText = cropString;
            row.appendChild(cropElement);
            count++;
            if (count === cropsPerRow) {
                cropsContainer.appendChild(row);
                row = document.createElement("div");
                count = 0;
            }
        }
    }
    if (count > 0) {
        cropsContainer.appendChild(row);
    }

    const formattedMoney = formatMoney(money);

    document.getElementById("moneyDisplay").innerText = ` $${formattedMoney}`;
    document.getElementById("energyDisplay").innerText = `⚡${energy}%`;


    const vegetableButtonsContainer = document.getElementById("vegetableButtons");
    vegetableButtonsContainer.innerHTML = '';

    for (let veg in vegetables) {
        if (vegetables[veg].unlocked) {
            if (veg !== "jalapeno") { 
            let pickButton = document.createElement("button");
            pickButton.innerText = `Plukk ${veg}`;
            pickButton.onclick = function () { pickVegetable(veg) };
            vegetableButtonsContainer.appendChild(pickButton);

            let sellButton = document.createElement("button");
            sellButton.innerText = `Selg ${veg}`;
            sellButton.classList.add("sell");
            sellButton.onclick = function () { sellVegetable(veg) };
            vegetableButtonsContainer.appendChild(sellButton);
            }
        } else {
            let unlockButton = document.createElement("button");
            unlockButton.innerText = `Lås opp ${veg} (${formatMoney(vegetables[veg].unlockCost)}$)`;
            unlockButton.onclick = function () { unlockVegetable(veg) };
            vegetableButtonsContainer.appendChild(unlockButton);
        }
    }
    const workerCost = formatMoney(getWorkerUpgradeCost());
    const energyUpgradeCost = formatMoney(getEnergyUpgradeCost());
    const energyReductionCost = formatMoney(getEnergyReductionUpgradeCost());

    document.getElementById("workerUpgradeButton").innerText = `Kjøp arbeider (${workerCost}$)`;
    document.getElementById("energyUpgradeButton").innerText = `Oppgrader hviling (${energyUpgradeCost}$)`;
    document.getElementById("energyReductionButton").innerText = `Reduser energiforbruk (${energyReductionCost}$)`;
    const nextMultiplier = calculateMultiplier();
    document.getElementById('rebirthButton').innerText = `Restart: ${nextMultiplier-1}% boost` ;
    document.getElementById('currentMultiplier').innerText = `${cropGainMultiplier}`;


    const energyGain = getEnergyGain();
    document.getElementById("restButton").innerText = `Hvile (+${energyGain}%⚡)`;
}



function getCotton() {
    const Amount = 10000000;
    money = 100000000000000;
    vegetables.bomull.quantity += Amount;
    vegetables.poteter.quantity += Amount;
    vegetables.gulrot.quantity += Amount;
    vegetables.asparges.quantity += Amount;
    vegetables.brokkoli.quantity += Amount;
    vegetables.eple.quantity += Amount;
    vegetables.aubergine.quantity += Amount;
    vegetables.jordbær.quantity += Amount;
    vegetables.sukkererter.quantity += Amount;
    vegetables.banan.quantity += Amount;
    for (const veggie in vegetables) {
        if (Object.hasOwnProperty.call(vegetables, veggie)) {
            vegetables[veggie].unlocked = true;
        }
    }
    updateStatus();
}






startGame();
