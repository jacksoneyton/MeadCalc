// Comprehensive database of fermentable ingredients with sugar content
const ingredients = {
    'apple': { sugarContent: 0.13, name: 'Apple (fresh)' },
    'apple-juice': { sugarContent: 0.24, name: 'Apple Juice' },
    'blackberry': { sugarContent: 0.10, name: 'Blackberry' },
    'blueberry': { sugarContent: 0.14, name: 'Blueberry' },
    'cherry': { sugarContent: 0.16, name: 'Cherry (sweet)' },
    'cherry-tart': { sugarContent: 0.12, name: 'Cherry (tart)' },
    'cranberry': { sugarContent: 0.04, name: 'Cranberry' },
    'grape': { sugarContent: 0.16, name: 'Grape (fresh)' },
    'grape-juice': { sugarContent: 0.24, name: 'Grape Juice' },
    'orange': { sugarContent: 0.12, name: 'Orange' },
    'orange-juice': { sugarContent: 0.21, name: 'Orange Juice' },
    'peach': { sugarContent: 0.13, name: 'Peach' },
    'pear': { sugarContent: 0.15, name: 'Pear' },
    'raspberry': { sugarContent: 0.12, name: 'Raspberry' },
    'strawberry': { sugarContent: 0.09, name: 'Strawberry' },
    'elderberry': { sugarContent: 0.07, name: 'Elderberry' },
    'elderflower': { sugarContent: 0.05, name: 'Elderflower' },
    'cane-sugar': { sugarContent: 1.00, name: 'Cane Sugar' },
    'brown-sugar': { sugarContent: 0.97, name: 'Brown Sugar' },
    'maple-syrup': { sugarContent: 0.67, name: 'Maple Syrup' },
    'agave': { sugarContent: 0.76, name: 'Agave Nectar' }
};

// Honey has approximately 80% fermentable sugars
const HONEY_SUGAR_CONTENT = 0.80;

// Conversion constants
const GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON = 46; // Points (1.046 = 46 points)
const ABV_FACTOR = 131.25; // Conversion factor for ABV calculation

// Unit conversion constants
const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;
const OZ_TO_GRAMS = 28.3495;
const GRAMS_TO_OZ = 0.035274;
const GALLONS_TO_LITERS = 3.78541;
const LITERS_TO_GALLONS = 0.264172;

// Current unit settings
let currentWeightUnit = 'imperial'; // 'imperial' or 'metric'
let currentVolumeUnit = 'imperial'; // 'imperial' or 'metric'

// Dynamic ingredients management
let targetIngredients = [];
let ingredientCounter = 0;

// Unit conversion functions
function convertWeightToLbs(amount, unit = currentWeightUnit) {
    if (unit === 'metric') {
        return amount * KG_TO_LBS; // Convert kg to lbs
    }
    return amount; // Already in lbs
}

function convertLbsToDisplayWeight(lbs, unit = currentWeightUnit) {
    if (unit === 'metric') {
        return lbs * LBS_TO_KG; // Convert lbs to kg
    }
    return lbs; // Already in lbs
}

function convertVolumeToGallons(amount, unit = currentVolumeUnit) {
    if (unit === 'metric') {
        return amount * LITERS_TO_GALLONS; // Convert liters to gallons
    }
    return amount; // Already in gallons
}

function convertGallonsToDisplayVolume(gallons, unit = currentVolumeUnit) {
    if (unit === 'metric') {
        return gallons * GALLONS_TO_LITERS; // Convert gallons to liters
    }
    return gallons; // Already in gallons
}

function displayMetricWeight(kg) {
    if (kg >= 1) {
        return `${kg.toFixed(2)} kg`;
    } else {
        const grams = kg * 1000;
        return `${grams.toFixed(0)} g`;
    }
}

function displayImperialWeight(lbs) {
    const wholeLbs = Math.floor(lbs);
    const remainderLbs = lbs - wholeLbs;
    const oz = Math.round(remainderLbs * 16);
    
    if (wholeLbs === 0 && oz === 0) {
        return "0 lbs";
    } else if (wholeLbs === 0) {
        return `${oz} oz`;
    } else if (oz === 0) {
        return `${wholeLbs} lbs`;
    } else if (oz === 16) {
        return `${wholeLbs + 1} lbs`;
    } else {
        return `${wholeLbs} lbs ${oz} oz`;
    }
}

function getWeightFromInputs(baseId) {
    const mainInput = document.getElementById(baseId);
    const ozInput = document.getElementById(baseId.replace('-amount', '-oz'));
    
    let totalWeight = 0;
    
    if (currentWeightUnit === 'imperial') {
        const lbs = parseFloat(mainInput.value) || 0;
        const oz = parseFloat(ozInput.value) || 0;
        totalWeight = lbs + (oz / 16); // Convert oz to lbs and add
    } else {
        const kg = parseFloat(mainInput.value) || 0;
        const grams = parseFloat(ozInput.value) || 0;
        totalWeight = (kg + (grams / 1000)) * KG_TO_LBS; // Convert to lbs for calculations
    }
    
    return totalWeight;
}

function updateWeightUnits() {
    const selectedUnit = document.querySelector('input[name="weight-units"]:checked').value;
    currentWeightUnit = selectedUnit;
    
    // Update labels and placeholders
    updateWeightLabels();
    
    // Show/hide oz/gram inputs and update their styling
    updateWeightInputs();
    
    // Update any conversion displays
    updateConversions();
}

function updateVolumeUnits() {
    const selectedUnit = document.querySelector('input[name="volume-units"]:checked').value;
    currentVolumeUnit = selectedUnit;
    
    // Update volume labels
    updateVolumeLabels();
}

function updateWeightLabels() {
    const honeyLabel = document.getElementById('honey-label');
    const fruitLabel = document.getElementById('fruit-label');
    
    if (currentWeightUnit === 'imperial') {
        honeyLabel.textContent = 'Honey (lbs):';
        fruitLabel.textContent = 'Amount (lbs):';
    } else {
        honeyLabel.textContent = 'Honey (kg):';
        fruitLabel.textContent = 'Amount (kg):';
    }
}

function updateVolumeLabels() {
    const batchLabel = document.getElementById('batch-label');
    const targetBatchLabel = document.getElementById('target-batch-label');
    
    if (currentVolumeUnit === 'imperial') {
        batchLabel.textContent = 'Batch Size (gallons):';
        targetBatchLabel.textContent = 'Batch Size (gallons):';
    } else {
        batchLabel.textContent = 'Batch Size (liters):';
        targetBatchLabel.textContent = 'Batch Size (liters):';
    }
}

function updateWeightInputs() {
    const honeyAmount = document.getElementById('honey-amount');
    const honeyOz = document.getElementById('honey-oz');
    const fruitAmount = document.getElementById('fruit-amount');
    const fruitOz = document.getElementById('fruit-oz');
    
    if (currentWeightUnit === 'imperial') {
        // Configure for imperial (lbs/oz)
        honeyAmount.step = '1';
        fruitAmount.step = '1';
        honeyOz.style.display = 'inline-block';
        fruitOz.style.display = 'inline-block';
        honeyOz.placeholder = 'oz';
        fruitOz.placeholder = 'oz';
        honeyOz.step = '0.1';
        fruitOz.step = '0.1';
        honeyOz.max = '15.9';
        fruitOz.max = '15.9';
    } else {
        // Configure for metric (kg/g)
        honeyAmount.step = '1';
        fruitAmount.step = '1';
        honeyOz.style.display = 'inline-block';
        fruitOz.style.display = 'inline-block';
        honeyOz.placeholder = 'g';
        fruitOz.placeholder = 'g';
        honeyOz.step = '10';
        fruitOz.step = '10';
        honeyOz.max = '999';
        fruitOz.max = '999';
    }
}

function updateConversions() {
    // Update conversion displays for current inputs
    const honeyAmount = getWeightFromInputs('honey-amount');
    const fruitAmount = getWeightFromInputs('fruit-amount');
    
    updateConversionDisplay('honey-conversion', honeyAmount);
    updateConversionDisplay('fruit-conversion', fruitAmount);
}

function updateConversionDisplay(elementId, weightInLbs) {
    const element = document.getElementById(elementId);
    if (!weightInLbs || weightInLbs === 0) {
        element.textContent = '';
        return;
    }
    
    let conversionText = '';
    if (currentWeightUnit === 'imperial') {
        const kg = weightInLbs * LBS_TO_KG;
        conversionText = `≈ ${kg.toFixed(2)} kg`;
    } else {
        const displayWeight = convertLbsToDisplayWeight(weightInLbs);
        conversionText = `≈ ${(weightInLbs).toFixed(2)} lbs`;
    }
    
    element.textContent = conversionText;
}

// Collapsible section functionality
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const header = content.previousElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    if (content.style.display === 'block') {
        content.style.display = 'none';
        icon.textContent = '▶';
        header.classList.remove('expanded');
    } else {
        content.style.display = 'block';
        icon.textContent = '▼';
        header.classList.add('expanded');
    }
}

// Dynamic ingredient management functions
function addIngredient() {
    const id = `ingredient-${ingredientCounter++}`;
    const ingredient = {
        id: id,
        type: 'honey',
        percentage: 0
    };
    
    targetIngredients.push(ingredient);
    renderIngredient(ingredient);
    updateTotalPercentage();
    calculateIngredientsRealTime();
}

function removeIngredient(id) {
    targetIngredients = targetIngredients.filter(ing => ing.id !== id);
    document.getElementById(id).remove();
    updateTotalPercentage();
    calculateIngredientsRealTime();
}

function renderIngredient(ingredient) {
    const container = document.getElementById('ingredients-list');
    const div = document.createElement('div');
    div.className = 'ingredient-item';
    div.id = ingredient.id;
    
    const ingredientOptions = Object.keys(ingredients).map(key => 
        `<option value="${key}">${ingredients[key].name}</option>`
    ).join('');
    
    div.innerHTML = `
        <div class="ingredient-controls-row">
            <select class="ingredient-type" onchange="updateIngredient('${ingredient.id}', 'type', this.value)">
                <option value="honey">Honey</option>
                ${ingredientOptions}
            </select>
            <input type="number" class="ingredient-percentage" 
                   value="${ingredient.percentage}" 
                   min="0" max="100" step="1"
                   onchange="updateIngredient('${ingredient.id}', 'percentage', this.value)"
                   oninput="updateIngredient('${ingredient.id}', 'percentage', this.value)">
            <span class="percentage-symbol">%</span>
            <button type="button" class="remove-btn" onclick="removeIngredient('${ingredient.id}')">&times;</button>
        </div>
    `;
    
    container.appendChild(div);
}

function updateIngredient(id, property, value) {
    const ingredient = targetIngredients.find(ing => ing.id === id);
    if (ingredient) {
        if (property === 'percentage') {
            const newValue = parseFloat(value) || 0;
            const maxAllowed = getMaxAllowedPercentage(id);
            ingredient[property] = Math.min(newValue, maxAllowed);
            
            // Update input value if it was clamped
            const input = document.querySelector(`#${id} .ingredient-percentage`);
            if (input.value !== ingredient[property].toString()) {
                input.value = ingredient[property];
            }
        } else {
            ingredient[property] = value;
        }
        
        updateTotalPercentage();
        calculateIngredientsRealTime();
    }
}

function getMaxAllowedPercentage(excludeId) {
    const currentTotal = targetIngredients
        .filter(ing => ing.id !== excludeId)
        .reduce((sum, ing) => sum + ing.percentage, 0);
    return Math.max(0, 100 - currentTotal);
}

function updateTotalPercentage() {
    const total = targetIngredients.reduce((sum, ing) => sum + ing.percentage, 0);
    const totalElement = document.getElementById('total-percentage');
    totalElement.textContent = total.toFixed(0);
    
    // Update styling based on total
    if (total > 100) {
        totalElement.className = 'over-limit';
    } else if (total === 100) {
        totalElement.className = 'at-limit';
    } else {
        totalElement.className = '';
    }
}

function initializeDefaultIngredient() {
    // Add honey as default ingredient at 100%
    targetIngredients = [];
    ingredientCounter = 0;
    
    const honeyIngredient = {
        id: `ingredient-${ingredientCounter++}`,
        type: 'honey',
        percentage: 100
    };
    
    targetIngredients.push(honeyIngredient);
    
    // Clear and re-render
    const container = document.getElementById('ingredients-list');
    container.innerHTML = '';
    renderIngredient(honeyIngredient);
    updateTotalPercentage();
}

// Handle overflow for imperial units (oz > 15.9 -> increment lbs)
function handleImperialOverflow(baseId) {
    const mainInput = document.getElementById(baseId);
    const ozInput = document.getElementById(baseId.replace('-amount', '-oz'));
    
    let oz = parseFloat(ozInput.value) || 0;
    let lbs = parseFloat(mainInput.value) || 0;
    
    if (oz >= 16) {
        const extraLbs = Math.floor(oz / 16);
        lbs += extraLbs;
        oz = oz % 16;
        
        mainInput.value = lbs;
        ozInput.value = oz.toFixed(1);
        return true; // Overflow occurred
    }
    return false; // No overflow
}

// Handle overflow for metric units (g > 999 -> increment kg)
function handleMetricOverflow(baseId) {
    const mainInput = document.getElementById(baseId);
    const gramInput = document.getElementById(baseId.replace('-amount', '-oz'));
    
    let grams = parseFloat(gramInput.value) || 0;
    let kg = parseFloat(mainInput.value) || 0;
    
    if (grams >= 1000) {
        const extraKg = Math.floor(grams / 1000);
        kg += extraKg;
        grams = grams % 1000;
        
        mainInput.value = kg;
        gramInput.value = Math.round(grams / 10) * 10; // Round to nearest 10g
        return true; // Overflow occurred
    }
    return false; // No overflow
}

// Handle weight input changes with overflow logic
function handleWeightInputChange(event) {
    const inputId = event.target.id;
    const isSubUnit = inputId.includes('-oz');
    
    if (isSubUnit) {
        // Handle overflow from oz/g to lbs/kg
        const baseId = inputId.replace('-oz', '-amount');
        let overflowOccurred = false;
        
        if (currentWeightUnit === 'imperial') {
            overflowOccurred = handleImperialOverflow(baseId);
        } else {
            overflowOccurred = handleMetricOverflow(baseId);
        }
        
        // Update conversions after overflow handling
        if (overflowOccurred) {
            setTimeout(() => {
                updateConversions();
                calculateSGRealTime(); // Trigger SG calculation after overflow
            }, 50); // Small delay to ensure DOM updates
        }
    }
    
    // Always update conversions and trigger SG calculation for any weight input change
    updateConversions();
    calculateSGRealTime();
}

// Calculate ABV from OG and FG
function calculateABV() {
    const og = parseFloat(document.getElementById('og').value);
    const fg = parseFloat(document.getElementById('fg').value);
    
    if (!og || !fg) {
        document.getElementById('abv-result').innerHTML = '<div class="info">Enter both Original Gravity and Final Gravity to see ABV results</div>';
        return;
    }
    
    if (og <= fg) {
        document.getElementById('abv-result').innerHTML = '<div class="error">Original Gravity must be higher than Final Gravity</div>';
        return;
    }
    
    const abv = (og - fg) * ABV_FACTOR;
    const potentialABV = (og - 1.000) * ABV_FACTOR;
    const attenuation = ((og - fg) / (og - 1.000)) * 100;
    
    document.getElementById('abv-result').innerHTML = `
        <div class="success">
            <h3>Results:</h3>
            <p><strong>Alcohol By Volume (ABV):</strong> ${abv.toFixed(2)}%</p>
            <p><strong>Potential ABV:</strong> ${potentialABV.toFixed(2)}%</p>
            <p><strong>Apparent Attenuation:</strong> ${attenuation.toFixed(1)}%</p>
        </div>
    `;
}

// Real-time ABV calculation
function calculateABVRealTime() {
    // Only calculate if we have valid inputs to avoid constant error messages
    const og = parseFloat(document.getElementById('og').value);
    const fg = parseFloat(document.getElementById('fg').value);
    
    if (!og && !fg) {
        document.getElementById('abv-result').innerHTML = '';
        return;
    }
    
    calculateABV();
}

// Calculate specific gravity from ingredients
function calculateSG() {
    const batchSizeInput = parseFloat(document.getElementById('batch-size').value);
    const honeyAmountLbs = getWeightFromInputs('honey-amount');
    const fruitType = document.getElementById('fruit-type').value;
    const fruitAmountLbs = getWeightFromInputs('fruit-amount');
    
    // Convert batch size to gallons for calculations
    const batchSizeGallons = convertVolumeToGallons(batchSizeInput);
    
    if (!batchSizeInput || batchSizeInput <= 0) {
        document.getElementById('sg-result').innerHTML = '<div class="info">Enter batch size and ingredients to see specific gravity results</div>';
        return;
    }
    
    let totalFermentableSugar = 0;
    let ingredientsList = [];
    
    // Calculate sugar from honey
    if (honeyAmountLbs > 0) {
        const honeySugar = honeyAmountLbs * HONEY_SUGAR_CONTENT;
        totalFermentableSugar += honeySugar;
        
        // Display in user's preferred units
        const honeyDisplayWeight = convertLbsToDisplayWeight(honeyAmountLbs);
        const weightDisplay = currentWeightUnit === 'imperial' ? 
            displayImperialWeight(honeyDisplayWeight) : 
            displayMetricWeight(honeyDisplayWeight);
        const honeySugarDisplay = currentWeightUnit === 'imperial' ? 
            `${displayImperialWeight(honeySugar)} fermentable sugar` : 
            `${displayMetricWeight(honeySugar * LBS_TO_KG)} fermentable sugar`;
        ingredientsList.push(`${weightDisplay} honey (${honeySugarDisplay})`);
    }
    
    // Calculate sugar from fruit/sweetener
    if (fruitType && fruitAmountLbs > 0 && ingredients[fruitType]) {
        const fruitSugar = fruitAmountLbs * ingredients[fruitType].sugarContent;
        totalFermentableSugar += fruitSugar;
        
        // Display in user's preferred units
        const fruitDisplayWeight = convertLbsToDisplayWeight(fruitAmountLbs);
        const weightDisplay = currentWeightUnit === 'imperial' ? 
            displayImperialWeight(fruitDisplayWeight) : 
            displayMetricWeight(fruitDisplayWeight);
        const fruitSugarDisplay = currentWeightUnit === 'imperial' ? 
            `${displayImperialWeight(fruitSugar)} fermentable sugar` : 
            `${displayMetricWeight(fruitSugar * LBS_TO_KG)} fermentable sugar`;
        ingredientsList.push(`${weightDisplay} ${ingredients[fruitType].name} (${fruitSugarDisplay})`);
    }
    
    if (totalFermentableSugar === 0) {
        document.getElementById('sg-result').innerHTML = '<div class="info">Add honey or other fermentable ingredients to see results</div>';
        return;
    }
    
    // Calculate specific gravity: SG = 1 + (sugar_lbs / gallons * points_per_lb_per_gallon / 1000)
    const gravityPoints = (totalFermentableSugar / batchSizeGallons) * GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON;
    const specificGravity = 1.000 + (gravityPoints / 1000);
    const potentialABV = (specificGravity - 1.000) * ABV_FACTOR;
    
    // Calculate approximate sugar concentration in user's units
    let sugarConcentration, concentrationUnit;
    if (currentVolumeUnit === 'imperial') {
        sugarConcentration = (totalFermentableSugar / batchSizeGallons) * 16; // oz per gallon
        concentrationUnit = 'oz per gallon';
    } else {
        // Convert to grams per liter
        const totalFermentableSugarKg = totalFermentableSugar * LBS_TO_KG;
        const batchSizeLiters = batchSizeGallons * GALLONS_TO_LITERS;
        sugarConcentration = (totalFermentableSugarKg * 1000) / batchSizeLiters; // g per liter
        concentrationUnit = 'g per liter';
    }
    
    // Display batch size in user's preferred units
    const batchDisplayVolume = convertGallonsToDisplayVolume(batchSizeGallons);
    const volumeUnit = currentVolumeUnit === 'imperial' ? 'gallon' : 'liter';
    const volumeUnitPlural = currentVolumeUnit === 'imperial' ? 'gallons' : 'liters';
    
    document.getElementById('sg-result').innerHTML = `
        <div class="success">
            <h3>Results for ${batchDisplayVolume.toFixed(1)} ${batchDisplayVolume === 1 ? volumeUnit : volumeUnitPlural} batch:</h3>
            <p><strong>Estimated Original Gravity:</strong> ${specificGravity.toFixed(3)}</p>
            <p><strong>Potential ABV:</strong> ${potentialABV.toFixed(2)}%</p>
            <p><strong>Total Fermentable Sugar:</strong> ${currentWeightUnit === 'imperial' ? displayImperialWeight(totalFermentableSugar) : displayMetricWeight(totalFermentableSugar * LBS_TO_KG)}</p>
            <p><strong>Sugar Concentration:</strong> ${sugarConcentration.toFixed(1)} ${concentrationUnit}</p>
            <h4>Ingredients Used:</h4>
            <ul>
                ${ingredientsList.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Real-time Specific Gravity calculation
function calculateSGRealTime() {
    // Only calculate if we have some inputs to avoid showing empty state constantly
    const batchSizeInput = parseFloat(document.getElementById('batch-size').value);
    const honeyAmountLbs = getWeightFromInputs('honey-amount');
    const fruitAmountLbs = getWeightFromInputs('fruit-amount');
    
    if (!batchSizeInput && honeyAmountLbs === 0 && fruitAmountLbs === 0) {
        document.getElementById('sg-result').innerHTML = '';
        return;
    }
    
    calculateSG();
}

// Calculate required ingredients for target ABV
function calculateIngredients() {
    const targetABV = parseFloat(document.getElementById('target-abv').value);
    const batchSizeInput = parseFloat(document.getElementById('target-batch-size').value);
    
    // Convert batch size to gallons for calculations
    const batchSizeGallons = convertVolumeToGallons(batchSizeInput);
    
    if (!targetABV || !batchSizeInput || targetABV <= 0 || batchSizeInput <= 0) {
        document.getElementById('ingredients-result').innerHTML = '<div class="info">Enter target ABV and batch size to see ingredient requirements</div>';
        return;
    }
    
    // Check if we have any ingredients
    if (targetIngredients.length === 0) {
        document.getElementById('ingredients-result').innerHTML = '<div class="info">Add ingredients to see recipe calculations</div>';
        return;
    }
    
    // Check total percentage
    const totalPercentage = targetIngredients.reduce((sum, ing) => sum + ing.percentage, 0);
    if (totalPercentage === 0) {
        document.getElementById('ingredients-result').innerHTML = '<div class="info">Set ingredient percentages to see recipe calculations</div>';
        return;
    }
    
    if (totalPercentage > 100) {
        document.getElementById('ingredients-result').innerHTML = '<div class="error">Total ingredient percentages cannot exceed 100%</div>';
        return;
    }
    
    // Calculate required OG for target ABV (assuming complete fermentation to ~1.000)
    const requiredOG = 1.000 + (targetABV / ABV_FACTOR);
    
    // Calculate total fermentable sugar needed
    const gravityPoints = (requiredOG - 1.000) * 1000;
    const totalSugarNeeded = (gravityPoints * batchSizeGallons) / GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON;
    
    // Calculate ingredient amounts based on percentages
    const ingredientAmounts = [];
    let totalCalculatedSugar = 0;
    
    for (const ingredient of targetIngredients) {
        if (ingredient.percentage === 0) continue;
        
        const fraction = ingredient.percentage / 100;
        const sugarFromThisIngredient = totalSugarNeeded * fraction;
        
        let sugarContent;
        let name;
        
        if (ingredient.type === 'honey') {
            sugarContent = HONEY_SUGAR_CONTENT;
            name = 'Honey';
        } else if (ingredients[ingredient.type]) {
            sugarContent = ingredients[ingredient.type].sugarContent;
            name = ingredients[ingredient.type].name;
        } else {
            continue; // Skip unknown ingredients
        }
        
        const amountNeeded = sugarFromThisIngredient / sugarContent;
        totalCalculatedSugar += sugarFromThisIngredient;
        
        ingredientAmounts.push({
            name,
            type: ingredient.type,
            percentage: ingredient.percentage,
            amountLbs: amountNeeded,
            sugarContributed: sugarFromThisIngredient,
            sugarContent
        });
    }
    
    // Display setup
    const batchDisplayVolume = convertGallonsToDisplayVolume(batchSizeGallons);
    const weightUnit = currentWeightUnit === 'imperial' ? 'lbs' : 'kg';
    const volumeUnit = currentVolumeUnit === 'imperial' ? 'gallon' : 'liter';
    const volumeUnitPlural = currentVolumeUnit === 'imperial' ? 'gallons' : 'liters';
    
    // Generate ingredient list HTML
    const ingredientListHTML = ingredientAmounts.map(ing => {
        const displayWeight = convertLbsToDisplayWeight(ing.amountLbs);
        const weightDisplay = currentWeightUnit === 'imperial' ? 
            displayImperialWeight(displayWeight) : 
            displayMetricWeight(displayWeight);
        return `<li><strong>${weightDisplay} ${ing.name}</strong> (${ing.percentage}% of fermentables)</li>`;
    }).join('');
    
    // Generate sugar contribution HTML with proper units
    const sugarContributionHTML = ingredientAmounts.map(ing => {
        if (currentVolumeUnit === 'imperial') {
            return `<li>${ing.name}: ${displayImperialWeight(ing.sugarContributed)} fermentable sugar</li>`;
        } else {
            const sugarKg = ing.sugarContributed * LBS_TO_KG;
            return `<li>${ing.name}: ${displayMetricWeight(sugarKg)} fermentable sugar</li>`;
        }
    }).join('');
    
    const resultHTML = `
        <div class="success">
            <h3>Recipe for ${targetABV}% ABV in ${batchDisplayVolume.toFixed(1)} ${batchDisplayVolume === 1 ? volumeUnit : volumeUnitPlural} batch:</h3>
            <p><strong>Target Original Gravity:</strong> ${requiredOG.toFixed(3)}</p>
            <p><strong>Total Fermentable Sugar Needed:</strong> ${currentVolumeUnit === 'imperial' ? displayImperialWeight(totalSugarNeeded) : displayMetricWeight(totalSugarNeeded * LBS_TO_KG)}</p>
            <h4>Required Ingredients:</h4>
            <ul>
                ${ingredientListHTML}
            </ul>
            <p><strong>Sugar Contribution:</strong></p>
            <ul>
                ${sugarContributionHTML}
            </ul>
        </div>
    `;
    
    // Add warnings for extreme values
    let warningsHTML = '';
    if (targetABV > 18) {
        warningsHTML += '<div class="warning">⚠️ ABV above 18% may require specialized high-alcohol tolerant yeast</div>';
    }
    
    // Check for high sugar concentration (approximate based on total ingredients)
    const totalIngredientWeight = ingredientAmounts.reduce((sum, ing) => sum + ing.amountLbs, 0);
    if (totalIngredientWeight / batchSizeGallons > 4.5) {
        warningsHTML += '<div class="warning">⚠️ Very high ingredient concentration - consider nutrient additions and temperature control</div>';
    }
    
    document.getElementById('ingredients-result').innerHTML = resultHTML + warningsHTML;
}

// Real-time Target ABV calculation
function calculateIngredientsRealTime() {
    // Only calculate if we have basic inputs to avoid showing empty state constantly
    const targetABV = parseFloat(document.getElementById('target-abv').value);
    const batchSizeInput = parseFloat(document.getElementById('target-batch-size').value);
    
    if (!targetABV && !batchSizeInput) {
        document.getElementById('ingredients-result').innerHTML = '';
        return;
    }
    
    calculateIngredients();
}

// Utility function to format numbers
function formatNumber(num, decimals = 2) {
    return parseFloat(num.toFixed(decimals));
}

// Input validation and formatting
document.addEventListener('DOMContentLoaded', function() {
    // Initialize unit displays
    updateWeightUnits();
    updateVolumeUnits();
    
    // Initialize default ingredient for Target ABV section
    initializeDefaultIngredient();
    
    // Add event listener for "Add Ingredient" button
    document.getElementById('add-ingredient-btn').addEventListener('click', addIngredient);
    
    // Add input event listeners for ABV calculation with real-time updates
    const gravityInputs = ['og', 'fg'];
    gravityInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (value < 0.900 || value > 1.300) {
                    this.style.borderColor = '#ff6b6b';
                } else {
                    this.style.borderColor = '#ddd';
                }
                
                // Trigger real-time ABV calculation
                calculateABVRealTime();
            });
        }
    });
    
    // Add input event listeners for weight inputs with overflow handling
    const weightInputs = ['honey-amount', 'honey-oz', 'fruit-amount', 'fruit-oz'];
    weightInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', handleWeightInputChange);
            input.addEventListener('change', handleWeightInputChange); // Also handle change events
        }
    });
    
    // Add event listeners for SG calculation inputs
    const sgInputs = ['batch-size', 'fruit-type'];
    sgInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateSGRealTime);
            input.addEventListener('change', calculateSGRealTime);
        }
    });
    
    // Add event listeners for Target ABV calculation inputs
    const targetABVInputs = ['target-abv', 'target-batch-size'];
    targetABVInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculateIngredientsRealTime);
            input.addEventListener('change', calculateIngredientsRealTime);
        }
    });
});