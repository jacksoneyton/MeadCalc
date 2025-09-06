// Simple mode switching function
function switchUnifiedMode(mode) {
    if (mode === 'ingredients-from-abv') {
        renderUnifiedCalculator('ingredients-from-abv');
    } else {
        // Switch back to ABV mode - need to render the ABV interface
        renderUnifiedCalculator('abv-from-ingredients');
    }
}


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
let isInitialLoad = true; // Track if this is the initial page load

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
        const wholeKg = Math.floor(kg);
        const remainderKg = kg - wholeKg;
        const grams = Math.round(remainderKg * 1000);
        
        if (wholeKg === 0 && grams === 0) {
            return "0 g";
        } else if (grams === 0) {
            return `${wholeKg} kg`;
        } else if (wholeKg === 0) {
            return `${grams} g`;
        } else {
            return `${wholeKg} kg ${grams} g`;
        }
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
    
    // Reset all calculations when units change (always reset for now)
    resetAllCalculations();
    
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
    
    // Reset all calculations when units change (always reset for now)
    resetAllCalculations();
    
    // Update volume labels
    updateVolumeLabels();
}

function updateWeightLabels() {
    const honeyLabel = document.getElementById('honey-label');
    const fruitLabel = document.getElementById('fruit-label');
    const unifiedHoneyLabel = document.getElementById('unified-abv-honey-label');
    
    if (currentWeightUnit === 'imperial') {
        if (honeyLabel) honeyLabel.textContent = 'Honey (lbs):';
        if (fruitLabel) fruitLabel.textContent = 'Amount (lbs):';
        if (unifiedHoneyLabel) unifiedHoneyLabel.textContent = 'Honey (lbs):';
    } else {
        if (honeyLabel) honeyLabel.textContent = 'Honey (kg):';
        if (fruitLabel) fruitLabel.textContent = 'Amount (kg):';
        if (unifiedHoneyLabel) unifiedHoneyLabel.textContent = 'Honey (kg):';
    }
}

function updateVolumeLabels() {
    const batchLabel = document.getElementById('batch-label');
    const targetBatchLabel = document.getElementById('target-batch-label');
    const unifiedABVBatchLabel = document.getElementById('unified-abv-batch-label');
    const unifiedTargetBatchLabel = document.getElementById('unified-target-batch-label');
    
    if (currentVolumeUnit === 'imperial') {
        if (batchLabel) batchLabel.textContent = 'Batch Size (gallons):';
        if (targetBatchLabel) targetBatchLabel.textContent = 'Batch Size (gallons):';
        if (unifiedABVBatchLabel) unifiedABVBatchLabel.textContent = 'Batch Size (gallons):';
        if (unifiedTargetBatchLabel) unifiedTargetBatchLabel.textContent = 'Batch Size (gallons):';
    } else {
        if (batchLabel) batchLabel.textContent = 'Batch Size (liters):';
        if (targetBatchLabel) targetBatchLabel.textContent = 'Batch Size (liters):';
        if (unifiedABVBatchLabel) unifiedABVBatchLabel.textContent = 'Batch Size (liters):';
        if (unifiedTargetBatchLabel) unifiedTargetBatchLabel.textContent = 'Batch Size (liters):';
    }
}

function updateWeightInputs() {
    const honeyAmount = document.getElementById('honey-amount');
    const honeyOz = document.getElementById('honey-oz');
    const fruitAmount = document.getElementById('fruit-amount');
    const fruitOz = document.getElementById('fruit-oz');
    const unifiedHoneyAmount = document.getElementById('unified-honey-amount');
    const unifiedHoneyOz = document.getElementById('unified-honey-oz');
    
    if (currentWeightUnit === 'imperial') {
        // Configure for imperial (lbs/oz)
        if (honeyAmount) honeyAmount.step = '1';
        if (fruitAmount) fruitAmount.step = '1';
        if (unifiedHoneyAmount) unifiedHoneyAmount.step = '1';
        
        if (honeyOz) {
            honeyOz.style.display = 'inline-block';
            honeyOz.placeholder = 'oz';
            honeyOz.step = '1';
            honeyOz.max = '15';
        }
        if (fruitOz) {
            fruitOz.style.display = 'inline-block';
            fruitOz.placeholder = 'oz';
            fruitOz.step = '1';
            fruitOz.max = '15';
        }
        if (unifiedHoneyOz) {
            unifiedHoneyOz.style.display = 'inline-block';
            unifiedHoneyOz.placeholder = 'oz';
            unifiedHoneyOz.step = '1';
            unifiedHoneyOz.max = '15';
        }
        
        // Update oz labels
        document.querySelectorAll('.oz-label').forEach(label => {
            label.textContent = 'oz';
            label.style.display = 'inline-block';
        });
    } else {
        // Configure for metric (kg/g)
        if (honeyAmount) honeyAmount.step = '1';
        if (fruitAmount) fruitAmount.step = '1';
        if (unifiedHoneyAmount) unifiedHoneyAmount.step = '1';
        
        if (honeyOz) {
            honeyOz.style.display = 'inline-block';
            honeyOz.placeholder = 'g';
            honeyOz.step = '10';
            honeyOz.max = '999';
        }
        if (fruitOz) {
            fruitOz.style.display = 'inline-block';
            fruitOz.placeholder = 'g';
            fruitOz.step = '10';
            fruitOz.max = '999';
        }
        if (unifiedHoneyOz) {
            unifiedHoneyOz.style.display = 'inline-block';
            unifiedHoneyOz.placeholder = 'g';
            unifiedHoneyOz.step = '10';
            unifiedHoneyOz.max = '999';
        }
        
        // Update g labels
        document.querySelectorAll('.oz-label').forEach(label => {
            label.textContent = 'g';
            label.style.display = 'inline-block';
        });
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

// Unified Calculator Variables
let unifiedABVIngredients = [];
let unifiedTargetIngredients = [];
let unifiedABVCounter = 0;
let unifiedTargetCounter = 0;

// Unified Calculator Functions
function renderUnifiedCalculator(mode) {
    const contentDiv = document.getElementById('unified-calculator-content');
    
    // Clear ingredient arrays when switching modes to prevent duplicates
    unifiedABVIngredients = [];
    unifiedTargetIngredients = [];
    unifiedABVCounter = 0;
    unifiedTargetCounter = 0;
    console.log('Cleared ingredient arrays for mode:', mode);
    
    if (mode === 'abv-from-ingredients') {
        contentDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; min-height: 400px;">
                <!-- Input Section -->
                <div style="background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%); padding: 25px; border-radius: 8px; border: 1px solid #555;">
                    <h3 style="color: #d4af37; font-size: 1.4rem; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 8px;">Recipe Inputs</h3>
                    
                    <div class="input-group">
                        <label for="unified-batch-size" id="unified-abv-batch-label">Batch Size (gallons):</label>
                        <input type="number" id="unified-batch-size" step="0.1" min="0.1" max="50" value="1" placeholder="1">
                    </div>

                    <div class="input-group honey-input">
                        <label for="unified-honey-amount" id="unified-abv-honey-label">Honey (lbs):</label>
                        <div class="weight-input-container">
                            <input type="number" id="unified-honey-amount" step="1" min="0" placeholder="3">
                            <input type="number" id="unified-honey-oz" step="1" min="0" max="15" placeholder="0" class="oz-input" style="display:inline-block;">
                            <span class="oz-label" style="display:inline-block;">oz</span>
                        </div>
                        <small id="unified-honey-conversion" class="conversion-display"></small>
                    </div>

                    <div class="ingredients-section">
                        <h4>Additional Ingredients</h4>
                        <div id="unified-abv-ingredients-list">
                            <!-- Dynamic ingredient inputs will be added here -->
                        </div>
                        <div class="ingredient-controls">
                            <button type="button" id="unified-abv-add-ingredient-btn" class="add-btn">+ Add Ingredient</button>
                            <button type="button" id="unified-abv-reset-btn" class="reset-btn" style="margin-left: 10px;">Reset All</button>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div style="background: linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%); padding: 25px; border-radius: 8px; border: 1px solid #4a7c59;">
                    <h3 style="color: #d4af37; font-size: 1.4rem; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 8px;">Calculated Results</h3>
                    <div id="unified-abv-results">
                        <div style="color: #90ee90; margin-bottom: 15px;">Enter ingredients to see calculated ABV and gravity</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        contentDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; min-height: 400px;">
                <!-- Input Section -->
                <div style="background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%); padding: 25px; border-radius: 8px; border: 1px solid #555;">
                    <h3 style="color: #d4af37; font-size: 1.4rem; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 8px;">Target Recipe</h3>
                    
                    <div class="input-group">
                        <label for="unified-target-abv">Target ABV (%):</label>
                        <input type="number" id="unified-target-abv" step="0.1" min="0" max="20" placeholder="12">
                    </div>

                    <div class="input-group">
                        <label for="unified-target-batch-size" id="unified-target-batch-label">Batch Size (gallons):</label>
                        <input type="number" id="unified-target-batch-size" step="0.1" min="0.1" max="50" value="1" placeholder="1">
                    </div>

                    <div class="ingredients-section">
                        <h4>Fermentable Ingredients</h4>
                        <div id="unified-target-ingredients-list">
                            <!-- Dynamic ingredient inputs will be added here -->
                        </div>
                        <div class="ingredient-controls">
                            <button type="button" id="unified-target-add-ingredient-btn" class="add-btn">+ Add Ingredient</button>
                            <button type="button" id="unified-target-reset-btn" class="reset-btn" style="margin-left: 10px;">Reset All</button>
                            <div class="total-percentage">
                                <span>Total: </span><span id="unified-total-percentage">0</span>%
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div style="background: linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%); padding: 25px; border-radius: 8px; border: 1px solid #4a7c59;">
                    <h3 style="color: #d4af37; font-size: 1.4rem; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 8px;">Required Ingredients</h3>
                    <div id="unified-target-results">
                        <div style="color: #90ee90; margin-bottom: 15px;">Enter target ABV and ingredients to see required amounts</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add event listeners for the new inputs
    setupUnifiedEventListeners(mode);
    
    // Initialize target mode with default honey ingredient
    if (mode === 'ingredients-from-abv') {
        // Add default honey ingredient only if none exist
        setTimeout(() => {
            console.log('Target ingredients before adding:', unifiedTargetIngredients.length);
            if (unifiedTargetIngredients.length === 0) {
                console.log('Adding default honey ingredient');
                addUnifiedTargetIngredient();
                console.log('Target ingredients after adding:', unifiedTargetIngredients.length);
                if (unifiedTargetIngredients.length === 1) {
                    unifiedTargetIngredients[0].percentage = 100;
                    const input = document.querySelector(`#${unifiedTargetIngredients[0].id} .ingredient-percentage`);
                    if (input) input.value = '100';
                    updateUnifiedTargetTotalPercentage();
                }
            }
        }, 50);
    }
    
    // Update units for unified calculator
    updateWeightLabels();
    updateVolumeLabels();
    updateWeightInputs();
}

function setupUnifiedEventListeners(mode) {
    if (mode === 'abv-from-ingredients') {
        // Add event listener for ABV add ingredient button
        const abvBtn = document.getElementById('unified-abv-add-ingredient-btn');
        if (abvBtn) {
            abvBtn.addEventListener('click', addUnifiedABVIngredient);
        }
        
        // Add event listener for ABV reset button
        const abvResetBtn = document.getElementById('unified-abv-reset-btn');
        if (abvResetBtn) {
            abvResetBtn.addEventListener('click', resetUnifiedABVMode);
        }
        
        // Add input listeners for real-time calculation
        const inputs = ['unified-batch-size', 'unified-honey-amount', 'unified-honey-oz'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', calculateUnifiedABVMode);
                input.addEventListener('change', calculateUnifiedABVMode);
            }
        });
        
        // Add weight overflow handling for honey inputs
        const honeyOzInput = document.getElementById('unified-honey-oz');
        if (honeyOzInput) {
            honeyOzInput.addEventListener('input', function() {
                handleUnifiedWeightOverflow(this, 'unified-honey-amount');
                calculateUnifiedABVMode();
            });
        }
        
    } else {
        // Add event listener for target add ingredient button
        const targetBtn = document.getElementById('unified-target-add-ingredient-btn');
        if (targetBtn) {
            targetBtn.addEventListener('click', addUnifiedTargetIngredient);
        }
        
        // Add event listener for target reset button
        const targetResetBtn = document.getElementById('unified-target-reset-btn');
        if (targetResetBtn) {
            targetResetBtn.addEventListener('click', resetUnifiedTargetMode);
        }
        
        // Add input listeners for real-time calculation
        const inputs = ['unified-target-abv', 'unified-target-batch-size'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', calculateUnifiedTargetMode);
                input.addEventListener('change', calculateUnifiedTargetMode);
            }
        });
        
        // Add default honey ingredient if no ingredients exist
        if (unifiedTargetIngredients.length === 0) {
            addUnifiedTargetIngredient();
            // Set default percentage to 100% for the first ingredient
            setTimeout(() => {
                if (unifiedTargetIngredients.length === 1) {
                    unifiedTargetIngredients[0].percentage = 100;
                    const input = document.querySelector(`#${unifiedTargetIngredients[0].id} .ingredient-percentage`);
                    if (input) input.value = '100';
                    updateUnifiedTargetTotalPercentage();
                    calculateUnifiedTargetMode();
                }
            }, 100);
        }
    }
}

function calculateUnifiedABVMode() {
    let batchSize = parseFloat(document.getElementById('unified-batch-size').value) || 0;
    const honeyAmount = parseFloat(document.getElementById('unified-honey-amount').value) || 0;
    const honeyOz = parseFloat(document.getElementById('unified-honey-oz').value) || 0;
    
    // Convert batch size to gallons if needed
    if (currentVolumeUnit === 'metric') {
        batchSize = batchSize * LITERS_TO_GALLONS;
    }
    
    const resultsDiv = document.getElementById('unified-abv-results');
    
    if (batchSize <= 0) {
        resultsDiv.innerHTML = '<div style="color: #90ee90; margin-bottom: 15px;">Enter batch size and ingredients to see results</div>';
        return;
    }
    
    let totalPpg = 0;
    let totalWeight = 0;
    let ingredientBreakdown = [];
    
    // Calculate base honey contribution
    let totalHoneyLbs;
    if (currentWeightUnit === 'imperial') {
        totalHoneyLbs = honeyAmount + (honeyOz / 16);
    } else {
        // Convert kg/g to lbs for calculation
        totalHoneyLbs = (honeyAmount + (honeyOz / 1000)) * KG_TO_LBS;
    }
    
    if (totalHoneyLbs > 0) {
        // Calculate honey PPG using sugar content method
        const honeySugarWeight = totalHoneyLbs * HONEY_SUGAR_CONTENT;
        const honeyPpg = honeySugarWeight * GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON;
        totalPpg += honeyPpg;
        totalWeight += totalHoneyLbs;
        ingredientBreakdown.push({
            name: 'Honey',
            amount: totalHoneyLbs,
            ppg: honeyPpg
        });
    }
    
    // Calculate dynamic ingredients contribution
    unifiedABVIngredients.forEach(ingredient => {
        if (ingredient.type) {
            const ingredientData = ingredients[ingredient.type];
            if (ingredientData) {
                let amount = ingredient.amount || 0;
                
                // Add ounces if in imperial mode
                if (currentWeightUnit === 'imperial') {
                    const ozInput = document.getElementById(`${ingredient.id}-oz`);
                    if (ozInput) {
                        const ozValue = parseFloat(ozInput.value) || 0;
                        amount += (ozValue / 16);
                    }
                } else {
                    // Add grams if in metric mode
                    const gInput = document.getElementById(`${ingredient.id}-oz`);
                    if (gInput) {
                        const gValue = parseFloat(gInput.value) || 0;
                        amount += (gValue / 1000); // Convert grams to kg
                    }
                }
                
                // Only proceed if there's a meaningful amount
                if (amount > 0) {
                    // Convert metric to imperial if needed
                    if (currentWeightUnit === 'metric') {
                        amount *= 2.20462; // kg to lbs
                    }
                    
                    // Calculate PPG from sugar content
                    const sugarWeight = amount * ingredientData.sugarContent;
                    const ppg = sugarWeight * GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON;
                    totalPpg += ppg;
                    totalWeight += amount;
                    
                    ingredientBreakdown.push({
                        name: ingredientData.name,
                        amount: amount,
                        ppg: ppg
                    });
                }
            }
        }
    });
    
    if (totalPpg === 0) {
        resultsDiv.innerHTML = '<div style="color: #90ee90; margin-bottom: 15px;">Add honey or other fermentable ingredients to see results</div>';
        return;
    }
    
    // Calculate final gravity and ABV
    const estimatedOG = 1.000 + (totalPpg / (batchSize * 1000));
    const estimatedABV = (estimatedOG - 1.000) * 131.25;
    const totalWeightPerGallon = totalWeight / batchSize;
    
    // Get display units
    const weightUnit = currentWeightUnit === 'imperial' ? 'lbs' : 'kg';
    const volumeUnit = currentVolumeUnit === 'imperial' ? 'gallon' : 'liter';
    
    // Convert weight per volume to display units
    let displayWeightPerVolume = totalWeightPerGallon;
    if (currentWeightUnit === 'metric') {
        displayWeightPerVolume = totalWeightPerGallon * LBS_TO_KG; // Convert lbs to kg
    }
    if (currentVolumeUnit === 'metric') {
        displayWeightPerVolume = displayWeightPerVolume * GALLONS_TO_LITERS; // Adjust for liters
    }
    
    // Format ingredient breakdown
    let breakdownHtml = '';
    if (ingredientBreakdown.length > 0) {
        breakdownHtml = `
            <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border-left: 3px solid #d4af37;">
                <div style="font-weight: 600; color: #90ee90; margin-bottom: 8px;">Ingredient Breakdown:</div>
                ${ingredientBreakdown.map(ing => {
                    // Format points display to show small contributions better
                    const points = ing.ppg / 10;
                    const pointsDisplay = points < 1 ? points.toFixed(1) : points.toFixed(0);
                    
                    // Convert weight to display units
                    let displayAmount = ing.amount;
                    if (currentWeightUnit === 'metric') {
                        displayAmount = ing.amount * LBS_TO_KG;
                    }
                    
                    // Format weight using smart display
                    let formattedWeight;
                    if (currentWeightUnit === 'imperial') {
                        formattedWeight = displayImperialWeight(displayAmount);
                    } else {
                        formattedWeight = displayMetricWeight(displayAmount);
                    }
                    
                    return `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>${ing.name}:</span>
                            <span>${formattedWeight} (${pointsDisplay} pts)</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    resultsDiv.innerHTML = `
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border-left: 3px solid #d4af37;">
            <div style="font-weight: 600; color: #90ee90; margin-bottom: 4px;">Estimated Original Gravity:</div>
            <div style="font-size: 1.1rem; color: #ffffff;">${estimatedOG.toFixed(3)}</div>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border-left: 3px solid #d4af37;">
            <div style="font-weight: 600; color: #90ee90; margin-bottom: 4px;">Potential ABV:</div>
            <div style="font-size: 1.1rem; color: #ffffff;">${estimatedABV.toFixed(2)}%</div>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border-left: 3px solid #d4af37;">
            <div style="font-weight: 600; color: #90ee90; margin-bottom: 4px;">Total Weight per ${volumeUnit.charAt(0).toUpperCase() + volumeUnit.slice(1)}:</div>
            <div style="font-size: 1.1rem; color: #ffffff;">${currentWeightUnit === 'imperial' ? displayImperialWeight(displayWeightPerVolume) : displayMetricWeight(displayWeightPerVolume)}</div>
        </div>
        ${breakdownHtml}
    `;
}

function calculateUnifiedTargetMode() {
    const targetABV = parseFloat(document.getElementById('unified-target-abv').value) || 0;
    let batchSize = parseFloat(document.getElementById('unified-target-batch-size').value) || 0;
    
    // Convert batch size to gallons if needed
    if (currentVolumeUnit === 'metric') {
        batchSize = batchSize * LITERS_TO_GALLONS;
    }
    
    const resultsDiv = document.getElementById('unified-target-results');
    
    if (targetABV <= 0 || batchSize <= 0) {
        resultsDiv.innerHTML = '<div style="color: #90ee90; margin-bottom: 15px;">Enter target ABV and batch size to see required ingredients</div>';
        return;
    }
    
    // Check if we have ingredients defined
    if (unifiedTargetIngredients.length === 0) {
        resultsDiv.innerHTML = '<div style="color: #90ee90; margin-bottom: 15px;">Add ingredients to calculate required amounts</div>';
        return;
    }
    
    // Check if total percentage is 100%
    const totalPercentage = unifiedTargetIngredients.reduce((sum, ing) => sum + ing.percentage, 0);
    
    if (totalPercentage !== 100) {
        resultsDiv.innerHTML = `
            <div style="color: #ff6b6b; margin-bottom: 15px;">
                Total ingredient percentage must equal 100% (currently ${totalPercentage.toFixed(0)}%)
            </div>
        `;
        return;
    }
    
    // Calculate required original gravity
    const requiredOG = 1.000 + (targetABV / 131.25);
    const requiredTotalPpg = (requiredOG - 1.000) * batchSize * 1000;
    
    // Calculate required amounts for each ingredient
    let ingredientResults = [];
    let totalWeight = 0;
    
    unifiedTargetIngredients.forEach(ingredient => {
        if (ingredient.type && ingredient.percentage > 0) {
            let ingredientData;
            let ppgPerLb;
            
            if (ingredient.type === 'honey') {
                ingredientData = {name: 'Honey'};
                ppgPerLb = HONEY_SUGAR_CONTENT * GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON;
            } else {
                ingredientData = ingredients[ingredient.type];
                ppgPerLb = ingredientData.sugarContent * GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON;
            }
            
            if (ingredientData) {
                const targetPpg = requiredTotalPpg * (ingredient.percentage / 100);
                const requiredAmount = targetPpg / ppgPerLb;
                
                // Convert to display units if needed
                let displayAmount = requiredAmount;
                let displayUnit = 'lbs';
                
                if (currentWeightUnit === 'metric') {
                    displayAmount = requiredAmount / 2.20462; // lbs to kg
                    displayUnit = 'kg';
                }
                
                totalWeight += requiredAmount;
                
                ingredientResults.push({
                    name: ingredientData.name,
                    percentage: ingredient.percentage,
                    amount: displayAmount,
                    unit: displayUnit,
                    ppg: targetPpg
                });
            }
        }
    });
    
    const totalWeightPerGallon = totalWeight / batchSize;
    
    // Get display units
    const weightUnit = currentWeightUnit === 'imperial' ? 'lbs' : 'kg';
    const volumeUnit = currentVolumeUnit === 'imperial' ? 'gallon' : 'liter';
    
    // Convert weight per volume to display units
    let displayWeightPerVolume = totalWeightPerGallon;
    if (currentWeightUnit === 'metric') {
        displayWeightPerVolume = totalWeightPerGallon * LBS_TO_KG; // Convert lbs to kg
    }
    if (currentVolumeUnit === 'metric') {
        displayWeightPerVolume = displayWeightPerVolume * GALLONS_TO_LITERS; // Adjust for liters
    }
    
    // Display results
    let ingredientsHtml = ingredientResults.map(ing => {
        let formattedAmount;
        if (currentWeightUnit === 'imperial') {
            formattedAmount = displayImperialWeight(ing.amount);
        } else {
            formattedAmount = displayMetricWeight(ing.amount);
        }
        
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 8px; background: rgba(255, 255, 255, 0.03); border-radius: 4px;">
            <div>
                <div style="font-weight: 500; color: #ffffff;">${ing.name}</div>
                <small style="color: #cccccc;">${ing.percentage}% of total fermentables</small>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.1rem; color: #d4af37;">${formattedAmount}</div>
                <small style="color: #cccccc;">${(ing.ppg/10).toFixed(0)} pts contribution</small>
            </div>
        </div>
        `;
    }).join('');
    
    resultsDiv.innerHTML = `
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border-left: 3px solid #d4af37;">
            <div style="font-weight: 600; color: #90ee90; margin-bottom: 4px;">Required Original Gravity:</div>
            <div style="font-size: 1.1rem; color: #ffffff;">${requiredOG.toFixed(3)}</div>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border-left: 3px solid #d4af37;">
            <div style="font-weight: 600; color: #90ee90; margin-bottom: 4px;">Total Weight per ${volumeUnit.charAt(0).toUpperCase() + volumeUnit.slice(1)}:</div>
            <div style="font-size: 1.1rem; color: #ffffff;">${currentWeightUnit === 'imperial' ? displayImperialWeight(displayWeightPerVolume) : displayMetricWeight(displayWeightPerVolume)}</div>
        </div>
        <div style="margin-bottom: 15px; padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border-left: 3px solid #d4af37;">
            <div style="font-weight: 600; color: #90ee90; margin-bottom: 12px;">Required Ingredients:</div>
            ${ingredientsHtml}
        </div>
    `;
}

// Unified Ingredient Management Functions
function addUnifiedABVIngredient() {
    const id = `unified-abv-ingredient-${unifiedABVCounter++}`;
    const ingredient = {
        id: id,
        type: '',
        amount: 0
    };
    
    unifiedABVIngredients.push(ingredient);
    renderUnifiedABVIngredient(ingredient);
    calculateUnifiedABVMode();
}

function renderUnifiedABVIngredient(ingredient) {
    const container = document.getElementById('unified-abv-ingredients-list');
    const div = document.createElement('div');
    div.className = 'ingredient-item';
    div.id = ingredient.id;
    
    const ingredientOptions = Object.keys(ingredients).map(key => 
        `<option value="${key}">${ingredients[key].name}</option>`
    ).join('');
    
    const weightUnitMain = currentWeightUnit === 'imperial' ? 'lbs' : 'kg';
    const weightUnitSecondary = currentWeightUnit === 'imperial' ? 'oz' : 'g';
    
    div.innerHTML = `
        <div class="ingredient-controls-row">
            <select class="ingredient-type" onchange="updateUnifiedABVIngredient('${ingredient.id}', 'type', this.value)">
                <option value="">Select ingredient...</option>
                ${ingredientOptions}
            </select>
            <div class="weight-input-container">
                <input type="number" class="ingredient-amount" id="${ingredient.id}-amount"
                       value="${ingredient.amount}" 
                       min="0" step="1"
                       onchange="updateUnifiedABVIngredient('${ingredient.id}', 'amount', this.value)"
                       oninput="updateUnifiedABVIngredient('${ingredient.id}', 'amount', this.value)"
                       placeholder="0">
                <span class="unit-label">${weightUnitMain}</span>
                <input type="number" class="ingredient-oz oz-input" id="${ingredient.id}-oz"
                       min="0" max="${currentWeightUnit === 'imperial' ? '15' : '999'}" step="${currentWeightUnit === 'imperial' ? '1' : '10'}"
                       onchange="handleUnifiedIngredientWeightChange(event)"
                       oninput="handleUnifiedIngredientWeightChange(event)"
                       placeholder="0" style="display:inline-block;">
                <span class="oz-label" style="display:inline-block;">${weightUnitSecondary}</span>
            </div>
            <button type="button" class="remove-btn" onclick="removeUnifiedABVIngredient('${ingredient.id}')">&times;</button>
        </div>
        <small class="conversion-display" id="${ingredient.id}-conversion"></small>
    `;
    
    container.appendChild(div);
}

function updateUnifiedABVIngredient(id, property, value) {
    const ingredient = unifiedABVIngredients.find(ing => ing.id === id);
    if (ingredient) {
        ingredient[property] = property === 'amount' ? parseFloat(value) || 0 : value;
        calculateUnifiedABVMode();
    }
}

function removeUnifiedABVIngredient(id) {
    unifiedABVIngredients = unifiedABVIngredients.filter(ing => ing.id !== id);
    document.getElementById(id).remove();
    calculateUnifiedABVMode();
}

function addUnifiedTargetIngredient() {
    const id = `unified-target-ingredient-${unifiedTargetCounter++}`;
    const ingredient = {
        id: id,
        type: 'honey',
        percentage: 0
    };
    
    unifiedTargetIngredients.push(ingredient);
    renderUnifiedTargetIngredient(ingredient);
    updateUnifiedTargetTotalPercentage();
    calculateUnifiedTargetMode();
}

function renderUnifiedTargetIngredient(ingredient) {
    const container = document.getElementById('unified-target-ingredients-list');
    const div = document.createElement('div');
    div.className = 'ingredient-item';
    div.id = ingredient.id;
    
    const ingredientOptions = Object.keys(ingredients).map(key => 
        `<option value="${key}">${ingredients[key].name}</option>`
    ).join('');
    
    div.innerHTML = `
        <div class="ingredient-controls-row">
            <select class="ingredient-type" onchange="updateUnifiedTargetIngredient('${ingredient.id}', 'type', this.value)">
                <option value="honey">Honey</option>
                ${ingredientOptions}
            </select>
            <input type="number" class="ingredient-percentage" 
                   value="${ingredient.percentage}" 
                   min="0" max="100" step="1"
                   onchange="updateUnifiedTargetIngredient('${ingredient.id}', 'percentage', this.value)"
                   oninput="updateUnifiedTargetIngredient('${ingredient.id}', 'percentage', this.value)">
            <span class="percentage-symbol">%</span>
            <button type="button" class="remove-btn" onclick="removeUnifiedTargetIngredient('${ingredient.id}')">&times;</button>
        </div>
    `;
    
    container.appendChild(div);
}

function updateUnifiedTargetIngredient(id, property, value) {
    const ingredient = unifiedTargetIngredients.find(ing => ing.id === id);
    if (ingredient) {
        const oldValue = ingredient[property];
        ingredient[property] = property === 'percentage' ? parseFloat(value) || 0 : value;
        
        // Auto-adjust honey percentage when other ingredients change
        if (property === 'percentage') {
            autoAdjustHoneyPercentage(id, parseFloat(value) || 0, parseFloat(oldValue) || 0);
        }
        
        // If changing ingredient type, ensure we have a honey base
        if (property === 'type') {
            ensureHoneyBase();
        }
        
        updateUnifiedTargetTotalPercentage();
        calculateUnifiedTargetMode();
    }
}

function removeUnifiedTargetIngredient(id) {
    // Get the removed ingredient info before filtering
    const removedIngredient = unifiedTargetIngredients.find(ing => ing.id === id);
    
    unifiedTargetIngredients = unifiedTargetIngredients.filter(ing => ing.id !== id);
    document.getElementById(id).remove();
    
    // Auto-adjust honey percentage when ingredient is removed
    if (removedIngredient) {
        autoAdjustHoneyPercentage(id, 0, removedIngredient.percentage);
    }
    
    updateUnifiedTargetTotalPercentage();
    calculateUnifiedTargetMode();
}

function autoAdjustHoneyPercentage(changedIngredientId, newPercentage, oldPercentage) {
    // Find the honey ingredient (first ingredient with type 'honey')
    const honeyIngredient = unifiedTargetIngredients.find(ing => ing.type === 'honey');
    
    if (!honeyIngredient || honeyIngredient.id === changedIngredientId) {
        // If no honey ingredient exists or the honey itself was changed, don't auto-adjust
        return;
    }
    
    // Calculate the change in percentage
    const percentageChange = newPercentage - oldPercentage;
    
    // Adjust honey percentage to compensate
    let newHoneyPercentage = honeyIngredient.percentage - percentageChange;
    
    // Handle edge cases
    if (newHoneyPercentage < 0) {
        // If honey would go negative, set it to 0 and cap the changed ingredient
        newHoneyPercentage = 0;
        const maxChangeAllowed = honeyIngredient.percentage + oldPercentage;
        
        // Find the changed ingredient and cap it
        const changedIngredient = unifiedTargetIngredients.find(ing => ing.id === changedIngredientId);
        if (changedIngredient) {
            changedIngredient.percentage = Math.min(changedIngredient.percentage, maxChangeAllowed);
            // Update the changed ingredient's UI
            const changedInput = document.querySelector(`#${changedIngredientId} .ingredient-percentage`);
            if (changedInput) {
                changedInput.value = changedIngredient.percentage.toFixed(0);
            }
        }
    } else if (newHoneyPercentage > 100) {
        // If honey would exceed 100%, cap it at 100%
        newHoneyPercentage = 100;
    }
    
    // Update honey ingredient data
    honeyIngredient.percentage = newHoneyPercentage;
    
    // Update the honey input field in the UI
    const honeyInput = document.querySelector(`#${honeyIngredient.id} .ingredient-percentage`);
    if (honeyInput) {
        honeyInput.value = newHoneyPercentage.toFixed(0);
    }
}

function ensureHoneyBase() {
    // Check if we have at least one honey ingredient
    const hasHoney = unifiedTargetIngredients.some(ing => ing.type === 'honey');
    
    if (!hasHoney && unifiedTargetIngredients.length > 0) {
        // If no honey exists but we have other ingredients, add a honey ingredient
        const remainingPercentage = 100 - unifiedTargetIngredients.reduce((sum, ing) => sum + ing.percentage, 0);
        
        const honeyId = `unified-target-ingredient-${unifiedTargetCounter++}`;
        const honeyIngredient = {
            id: honeyId,
            type: 'honey',
            percentage: Math.max(0, remainingPercentage)
        };
        
        // Add honey as the first ingredient
        unifiedTargetIngredients.unshift(honeyIngredient);
        
        // Render the honey ingredient at the top
        const container = document.getElementById('unified-target-ingredients-list');
        if (container) {
            renderUnifiedTargetIngredient(honeyIngredient);
            // Move the honey ingredient to the top
            const honeyElement = document.getElementById(honeyId);
            if (honeyElement) {
                container.insertBefore(honeyElement, container.firstChild);
            }
        }
    }
}

function updateUnifiedTargetTotalPercentage() {
    const total = unifiedTargetIngredients.reduce((sum, ing) => sum + ing.percentage, 0);
    const totalElement = document.getElementById('unified-total-percentage');
    if (totalElement) {
        totalElement.textContent = total.toFixed(0);
        
        // Update styling based on total
        totalElement.className = '';
        if (total > 100) {
            totalElement.style.color = '#ff6b6b';
        } else if (total === 100) {
            totalElement.style.color = '#4ecdc4';
        } else {
            totalElement.style.color = '#ffffff';
        }
    }
}

function handleUnifiedWeightOverflow(ozInput, lbsInputId) {
    if (currentWeightUnit === 'imperial') {
        const ozValue = parseFloat(ozInput.value) || 0;
        if (ozValue >= 16) {
            const lbsInput = document.getElementById(lbsInputId);
            const currentLbs = parseFloat(lbsInput.value) || 0;
            const additionalLbs = Math.floor(ozValue / 16);
            const remainingOz = ozValue % 16;
            
            lbsInput.value = currentLbs + additionalLbs;
            ozInput.value = remainingOz;
        }
    }
}

function handleUnifiedIngredientWeightChange(event) {
    const input = event.target;
    const baseId = input.id.replace('-oz', '');
    
    if (currentWeightUnit === 'imperial' && input.classList.contains('ingredient-oz')) {
        const ozValue = parseFloat(input.value) || 0;
        if (ozValue >= 16) {
            const lbsInput = document.getElementById(baseId + '-amount');
            const currentLbs = parseFloat(lbsInput.value) || 0;
            const additionalLbs = Math.floor(ozValue / 16);
            const remainingOz = ozValue % 16;
            
            lbsInput.value = currentLbs + additionalLbs;
            input.value = remainingOz;
            
            // Update the ingredient data
            updateUnifiedABVIngredient(baseId, 'amount', lbsInput.value);
        }
    }
    
    // Always recalculate when ounces change (even small amounts)
    calculateUnifiedABVMode();
}

// Reset All Calculations Function
function resetAllCalculations() {
    // Reset Simple ABV Calculator
    const ogInput = document.getElementById('og');
    const fgInput = document.getElementById('fg');
    const abvResult = document.getElementById('abv-result');
    
    if (ogInput) ogInput.value = '';
    if (fgInput) fgInput.value = '';
    if (abvResult) abvResult.innerHTML = '';
    
    // Reset Unified Calculator
    const currentMode = document.querySelector('input[name="calc-mode"]:checked');
    if (currentMode) {
        if (currentMode.value === 'abv-from-ingredients') {
            resetUnifiedABVMode();
        } else {
            resetUnifiedTargetMode();
        }
    }
    
    // Reset Alcohol & Gravity Converter
    const conversionInput = document.getElementById('conversion-input');
    const conversionFromSelect = document.getElementById('conversion-from');
    const conversionResult = document.getElementById('conversion-result');
    
    if (conversionInput) conversionInput.value = '';
    if (conversionFromSelect) conversionFromSelect.selectedIndex = 0;
    if (conversionResult) conversionResult.innerHTML = '';
    
    // Reset Unified Calculator
    resetUnifiedABVMode();
    resetUnifiedTargetMode();
    
    // Clear all conversion displays
    document.querySelectorAll('.conversion-display').forEach(display => {
        display.textContent = '';
    });
}

// Reset Functions for Unified Calculator
function resetUnifiedABVMode() {
    // Clear all input fields
    const batchSizeInput = document.getElementById('unified-batch-size');
    const honeyAmountInput = document.getElementById('unified-honey-amount');
    const honeyOzInput = document.getElementById('unified-honey-oz');
    const ingredientsList = document.getElementById('unified-abv-ingredients-list');
    const resultsDiv = document.getElementById('unified-abv-results');
    const conversionDisplay = document.getElementById('unified-honey-conversion');
    
    if (batchSizeInput) batchSizeInput.value = '1';
    if (honeyAmountInput) honeyAmountInput.value = '';
    if (honeyOzInput) honeyOzInput.value = '';
    
    // Clear all dynamic ingredients
    unifiedABVIngredients = [];
    unifiedABVCounter = 0;
    if (ingredientsList) ingredientsList.innerHTML = '';
    
    // Clear results
    if (resultsDiv) resultsDiv.innerHTML = '<div style="color: #90ee90; margin-bottom: 15px;">Enter ingredients to see calculated ABV and gravity</div>';
    
    // Clear conversion displays
    if (conversionDisplay) conversionDisplay.textContent = '';
    
    // Trigger calculation to update results with current values and units
    calculateUnifiedABVMode();
}

function resetUnifiedTargetMode() {
    // Clear all input fields
    const targetABVInput = document.getElementById('unified-target-abv');
    const targetBatchSizeInput = document.getElementById('unified-target-batch-size');
    const ingredientsList = document.getElementById('unified-target-ingredients-list');
    const resultsDiv = document.getElementById('unified-target-results');
    const totalElement = document.getElementById('unified-total-percentage');
    
    if (targetABVInput) targetABVInput.value = '';
    if (targetBatchSizeInput) targetBatchSizeInput.value = '1';
    
    // Clear all dynamic ingredients
    unifiedTargetIngredients = [];
    unifiedTargetCounter = 0;
    if (ingredientsList) ingredientsList.innerHTML = '';
    
    // Reset percentage display
    if (totalElement) {
        totalElement.textContent = '0';
        totalElement.style.color = '#ffffff';
    }
    
    // Clear results
    if (resultsDiv) resultsDiv.innerHTML = '<div style="color: #90ee90; margin-bottom: 15px;">Enter target ABV and ingredients to see required amounts</div>';
    
    // Add default honey ingredient back (only if the list exists)
    if (ingredientsList) {
        setTimeout(() => {
            addUnifiedTargetIngredient();
            if (unifiedTargetIngredients.length === 1) {
                unifiedTargetIngredients[0].percentage = 100;
                const input = document.querySelector(`#${unifiedTargetIngredients[0].id} .ingredient-percentage`);
                if (input) input.value = '100';
                updateUnifiedTargetTotalPercentage();
            }
            // Trigger calculation to update results with current values and units
            calculateUnifiedTargetMode();
        }, 100);
    }
}

// Input validation and formatting
document.addEventListener('DOMContentLoaded', function() {
    // Initialize unit displays
    updateWeightUnits();
    updateVolumeUnits();
    
    // Simple direct event listeners for unified calculator
    const batchSizeInput = document.getElementById('unified-batch-size');
    const honeyAmountInput = document.getElementById('unified-honey-amount');
    const honeyOzInput = document.getElementById('unified-honey-oz');
    const addBtn = document.getElementById('unified-abv-add-ingredient-btn');
    const resetBtn = document.getElementById('unified-abv-reset-btn');
    
    if (batchSizeInput) {
        batchSizeInput.addEventListener('input', calculateUnifiedABVMode);
    }
    if (honeyAmountInput) {
        honeyAmountInput.addEventListener('input', calculateUnifiedABVMode);
    }
    if (honeyOzInput) {
        honeyOzInput.addEventListener('input', function() {
            handleUnifiedWeightOverflow(this, 'unified-honey-amount');
            calculateUnifiedABVMode();
        });
    }
    if (addBtn) {
        addBtn.addEventListener('click', addUnifiedABVIngredient);
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', resetUnifiedABVMode);
    }
    
    // Mode switching
    const modeRadios = document.querySelectorAll('input[name="calc-mode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'ingredients-from-abv') {
                renderUnifiedCalculator('ingredients-from-abv');
            } else {
                // We're already in ABV mode, just reset
                resetUnifiedABVMode();
            }
        });
    });
    
    // Initial calculation
    calculateUnifiedABVMode();
    
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
    
    
    // Add double-click select all functionality to all input fields
    addSelectAllOnDoubleClick();
    
    // Add event listeners for conversion utility live updates
    addConversionEventListeners();
    
    // Mark initial load as complete
    isInitialLoad = false;
});

// Function to add smooth select-all functionality to all input fields
function addSelectAllOnDoubleClick() {
    // Get all input elements of type number and text
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"], select');
    
    inputs.forEach(input => {
        if (input.tagName === 'SELECT') return; // Skip select elements
        
        // Add double-click event listener for select all
        input.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.focus();
            this.select();
            // For mobile compatibility
            this.setSelectionRange(0, this.value.length);
        });
        
        // Add click event to select all when field has content
        input.addEventListener('click', function(e) {
            // Only select all if the field has content and isn't already focused
            if (this.value !== '' && document.activeElement !== this) {
                setTimeout(() => {
                    this.select();
                }, 10);
            }
        });
        
        // Ensure text selection works properly on focus
        input.addEventListener('focus', function(e) {
            if (this.value !== '') {
                setTimeout(() => {
                    this.select();
                }, 10);
            }
        });
        
        // Prevent text selection issues on mouseup
        input.addEventListener('mouseup', function(e) {
            if (this.value !== '' && window.getSelection().toString() === '') {
                e.preventDefault();
                this.select();
            }
        });
    });
}

// Function to add event listeners for conversion utility live updates
function addConversionEventListeners() {
    const conversionInput = document.getElementById('conversion-input');
    const conversionFrom = document.getElementById('conversion-from');
    
    if (conversionInput && conversionFrom) {
        // Add input event listener for live updates as user types
        conversionInput.addEventListener('input', performConversion);
        conversionInput.addEventListener('change', performConversion);
        
        // Add change event listener for dropdown changes
        conversionFrom.addEventListener('change', performConversion);
    }
}

// Conversion Utility Functions

// Conversion constants and formulas
const CONVERSION_CONSTANTS = {
    // Alcohol density at 20°C (g/mL)
    ALCOHOL_DENSITY: 0.789,
    // Water density at 20°C (g/mL)
    WATER_DENSITY: 1.000
};

// Convert between different gravity and alcohol measurement standards
function performConversion() {
    const inputElement = document.getElementById('conversion-input');
    const inputValue = parseFloat(inputElement.value);
    const fromUnit = document.getElementById('conversion-from').value;
    
    // Clear results if input is empty or invalid
    if (!inputElement.value.trim() || isNaN(inputValue)) {
        document.getElementById('conversion-result').innerHTML = 
            '<div class="info">Enter a value to see conversions</div>';
        return;
    }
    
    if (inputValue <= 0) {
        document.getElementById('conversion-result').innerHTML = 
            '<div class="warning">Please enter a positive number</div>';
        return;
    }
    
    // Validate input ranges
    if (!validateConversionInput(inputValue, fromUnit)) {
        return;
    }
    
    // Perform conversions
    const results = calculateAllConversions(inputValue, fromUnit);
    
    // Display results
    displayConversionResults(results, fromUnit);
}

function validateConversionInput(value, unit) {
    const resultDiv = document.getElementById('conversion-result');
    
    switch(unit) {
        case 'abv':
        case 'abw':
            if (value < 0 || value > 25) {
                resultDiv.innerHTML = '<div class="warning">Alcohol percentage should be between 0% and 25%</div>';
                return false;
            }
            break;
        case 'sg':
            if (value < 0.990 || value > 1.200) {
                resultDiv.innerHTML = '<div class="warning">Specific Gravity should be between 0.990 and 1.200</div>';
                return false;
            }
            break;
        case 'brix':
            if (value < 0 || value > 50) {
                resultDiv.innerHTML = '<div class="warning">BRIX should be between 0° and 50°</div>';
                return false;
            }
            break;
        case 'baume':
            if (value < 0 || value > 25) {
                resultDiv.innerHTML = '<div class="warning">Baumé should be between 0° and 25°</div>';
                return false;
            }
            break;
    }
    return true;
}

function calculateAllConversions(inputValue, fromUnit) {
    let sg, brix, baume, abv, abw;
    
    // Handle direct ABV/ABW conversions first (most accurate)
    if (fromUnit === 'abv') {
        abv = inputValue;
        abw = abv * (CONVERSION_CONSTANTS.ALCOHOL_DENSITY / CONVERSION_CONSTANTS.WATER_DENSITY);
        // Convert ABV to SG for other conversions (approximate)
        sg = 1 + (abv / ABV_FACTOR / 1000);
    } else if (fromUnit === 'abw') {
        abw = inputValue;
        abv = abw * (CONVERSION_CONSTANTS.WATER_DENSITY / CONVERSION_CONSTANTS.ALCOHOL_DENSITY);
        // Convert ABV to SG for other conversions (approximate)
        sg = 1 + (abv / ABV_FACTOR / 1000);
    } else {
        // For gravity-based units, convert to SG first
        switch(fromUnit) {
            case 'sg':
                sg = inputValue;
                break;
            case 'brix':
                // Brix to SG: SG = (Brix / (258.6-((Brix / 258.2)*227.1))) + 1
                sg = (inputValue / (258.6 - ((inputValue / 258.2) * 227.1))) + 1;
                break;
            case 'baume':
                // Baumé to SG: SG = 145 / (145 - Baumé)
                sg = 145 / (145 - inputValue);
                break;
        }
        
        // Convert SG to ABV and ABW (approximate for fermented beverages)
        abv = (sg - 1.000) * ABV_FACTOR;
        abw = abv * (CONVERSION_CONSTANTS.ALCOHOL_DENSITY / CONVERSION_CONSTANTS.WATER_DENSITY);
    }
    
    // Calculate remaining gravity units from SG
    if (sg) {
        // SG to Brix: Brix = (((182.4601 * SG -775.6821) * SG +1262.7794) * SG -669.5622)
        brix = (((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622);
        
        // SG to Baumé: Baumé = 145 - (145 / SG)
        baume = 145 - (145 / sg);
    }
    
    return {
        sg: sg,
        brix: brix,
        baume: baume,
        abv: abv,
        abw: abw
    };
}

function displayConversionResults(results, fromUnit) {
    const resultDiv = document.getElementById('conversion-result');
    
    let html = '<div class="success"><h3>Conversion Results</h3><div class="conversion-grid">';
    
    // Create grid of results, highlighting the input value
    const conversions = [
        { key: 'abv', label: 'ABV', value: results.abv, unit: '%', precision: 2 },
        { key: 'abw', label: 'ABW', value: results.abw, unit: '%', precision: 2 },
        { key: 'sg', label: 'Specific Gravity', value: results.sg, unit: '', precision: 3 },
        { key: 'brix', label: 'BRIX', value: results.brix, unit: '°Bx', precision: 1 },
        { key: 'baume', label: 'Baumé', value: results.baume, unit: '°Bé', precision: 1 }
    ];
    
    conversions.forEach(conv => {
        const isSource = conv.key === fromUnit;
        const cssClass = isSource ? 'conversion-source' : 'conversion-result';
        
        html += `
            <div class="conversion-item ${cssClass}">
                <div class="conversion-label">${conv.label}${isSource ? ' (Input)' : ''}</div>
                <div class="conversion-value">
                    ${conv.value.toFixed(conv.precision)}${conv.unit}
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    resultDiv.innerHTML = html;
}