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

// Calculate ABV from OG and FG
function calculateABV() {
    const og = parseFloat(document.getElementById('og').value);
    const fg = parseFloat(document.getElementById('fg').value);
    
    if (!og || !fg) {
        document.getElementById('abv-result').innerHTML = '<div class="error">Please enter both Original Gravity and Final Gravity</div>';
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

// Calculate specific gravity from ingredients
function calculateSG() {
    const batchSize = parseFloat(document.getElementById('batch-size').value);
    const honeyAmount = parseFloat(document.getElementById('honey-amount').value) || 0;
    const fruitType = document.getElementById('fruit-type').value;
    const fruitAmount = parseFloat(document.getElementById('fruit-amount').value) || 0;
    
    if (!batchSize || batchSize <= 0) {
        document.getElementById('sg-result').innerHTML = '<div class="error">Please enter a valid batch size</div>';
        return;
    }
    
    let totalFermentableSugar = 0;
    let ingredientsList = [];
    
    // Calculate sugar from honey
    if (honeyAmount > 0) {
        const honeySugar = honeyAmount * HONEY_SUGAR_CONTENT;
        totalFermentableSugar += honeySugar;
        ingredientsList.push(`${honeyAmount} lbs honey (${honeySugar.toFixed(2)} lbs fermentable sugar)`);
    }
    
    // Calculate sugar from fruit/sweetener
    if (fruitType && fruitAmount > 0 && ingredients[fruitType]) {
        const fruitSugar = fruitAmount * ingredients[fruitType].sugarContent;
        totalFermentableSugar += fruitSugar;
        ingredientsList.push(`${fruitAmount} lbs ${ingredients[fruitType].name} (${fruitSugar.toFixed(2)} lbs fermentable sugar)`);
    }
    
    if (totalFermentableSugar === 0) {
        document.getElementById('sg-result').innerHTML = '<div class="error">Please add some fermentable ingredients</div>';
        return;
    }
    
    // Calculate specific gravity: SG = 1 + (sugar_lbs / gallons * points_per_lb_per_gallon / 1000)
    const gravityPoints = (totalFermentableSugar / batchSize) * GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON;
    const specificGravity = 1.000 + (gravityPoints / 1000);
    const potentialABV = (specificGravity - 1.000) * ABV_FACTOR;
    
    // Calculate approximate sugar concentration
    const sugarConcentration = (totalFermentableSugar / batchSize) * 16; // oz per gallon
    
    document.getElementById('sg-result').innerHTML = `
        <div class="success">
            <h3>Results for ${batchSize} gallon batch:</h3>
            <p><strong>Estimated Original Gravity:</strong> ${specificGravity.toFixed(3)}</p>
            <p><strong>Potential ABV:</strong> ${potentialABV.toFixed(2)}%</p>
            <p><strong>Total Fermentable Sugar:</strong> ${totalFermentableSugar.toFixed(2)} lbs</p>
            <p><strong>Sugar Concentration:</strong> ${sugarConcentration.toFixed(1)} oz per gallon</p>
            <h4>Ingredients Used:</h4>
            <ul>
                ${ingredientsList.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Calculate required ingredients for target ABV
function calculateIngredients() {
    const targetABV = parseFloat(document.getElementById('target-abv').value);
    const batchSize = parseFloat(document.getElementById('target-batch-size').value);
    const honeyPercentage = parseFloat(document.getElementById('honey-percentage').value) || 100;
    const fruitType = document.getElementById('target-fruit-type').value;
    
    if (!targetABV || !batchSize || targetABV <= 0 || batchSize <= 0) {
        document.getElementById('ingredients-result').innerHTML = '<div class="error">Please enter valid target ABV and batch size</div>';
        return;
    }
    
    if (honeyPercentage < 0 || honeyPercentage > 100) {
        document.getElementById('ingredients-result').innerHTML = '<div class="error">Honey percentage must be between 0 and 100</div>';
        return;
    }
    
    // Calculate required OG for target ABV (assuming complete fermentation to ~1.000)
    const requiredOG = 1.000 + (targetABV / ABV_FACTOR);
    
    // Calculate total fermentable sugar needed
    const gravityPoints = (requiredOG - 1.000) * 1000;
    const totalSugarNeeded = (gravityPoints * batchSize) / GRAVITY_POINTS_PER_LB_SUGAR_PER_GALLON;
    
    // Calculate honey and fruit amounts
    const honeyFraction = honeyPercentage / 100;
    const fruitFraction = 1 - honeyFraction;
    
    let honeyNeeded = 0;
    let fruitNeeded = 0;
    let resultHTML = '';
    
    if (fruitType && fruitFraction > 0 && ingredients[fruitType]) {
        // Mixed fermentation: honey + fruit
        const fruitSugarContent = ingredients[fruitType].sugarContent;
        
        // Solve for amounts: honeyNeeded * 0.8 * honeyFraction + fruitNeeded * fruitSugarContent * fruitFraction = totalSugarNeeded
        // And: honeyNeeded * honeyFraction + fruitNeeded * fruitFraction = totalFermentableWeight
        
        // Simplified approach: distribute sugar proportionally
        const sugarFromHoney = totalSugarNeeded * honeyFraction;
        const sugarFromFruit = totalSugarNeeded * fruitFraction;
        
        honeyNeeded = sugarFromHoney / HONEY_SUGAR_CONTENT;
        fruitNeeded = sugarFromFruit / fruitSugarContent;
        
        resultHTML = `
            <div class="success">
                <h3>Recipe for ${targetABV}% ABV in ${batchSize} gallon batch:</h3>
                <p><strong>Target Original Gravity:</strong> ${requiredOG.toFixed(3)}</p>
                <p><strong>Total Fermentable Sugar Needed:</strong> ${totalSugarNeeded.toFixed(2)} lbs</p>
                <h4>Required Ingredients:</h4>
                <ul>
                    <li><strong>${honeyNeeded.toFixed(2)} lbs Honey</strong> (${honeyFraction * 100}% of fermentables)</li>
                    <li><strong>${fruitNeeded.toFixed(2)} lbs ${ingredients[fruitType].name}</strong> (${fruitFraction * 100}% of fermentables)</li>
                </ul>
                <p><strong>Sugar Contribution:</strong></p>
                <ul>
                    <li>Honey: ${(honeyNeeded * HONEY_SUGAR_CONTENT).toFixed(2)} lbs fermentable sugar</li>
                    <li>${ingredients[fruitType].name}: ${(fruitNeeded * fruitSugarContent).toFixed(2)} lbs fermentable sugar</li>
                </ul>
            </div>
        `;
    } else {
        // Honey-only mead
        honeyNeeded = totalSugarNeeded / HONEY_SUGAR_CONTENT;
        
        resultHTML = `
            <div class="success">
                <h3>Honey-Only Recipe for ${targetABV}% ABV in ${batchSize} gallon batch:</h3>
                <p><strong>Target Original Gravity:</strong> ${requiredOG.toFixed(3)}</p>
                <p><strong>Total Fermentable Sugar Needed:</strong> ${totalSugarNeeded.toFixed(2)} lbs</p>
                <h4>Required Ingredients:</h4>
                <ul>
                    <li><strong>${honeyNeeded.toFixed(2)} lbs Honey</strong></li>
                </ul>
                <p><strong>Honey per gallon:</strong> ${(honeyNeeded / batchSize).toFixed(2)} lbs/gallon</p>
            </div>
        `;
    }
    
    // Add warnings for extreme values
    if (targetABV > 18) {
        resultHTML += '<div class="warning">⚠️ ABV above 18% may require specialized high-alcohol tolerant yeast</div>';
    }
    if (honeyNeeded / batchSize > 4.5) {
        resultHTML += '<div class="warning">⚠️ Very high honey concentration - consider nutrient additions and temperature control</div>';
    }
    
    document.getElementById('ingredients-result').innerHTML = resultHTML;
}

// Utility function to format numbers
function formatNumber(num, decimals = 2) {
    return parseFloat(num.toFixed(decimals));
}

// Input validation and formatting
document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for real-time validation
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
            });
        }
    });
    
    // Add Enter key support for calculations
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.closest('.calc-section')) {
                const section = activeElement.closest('.calc-section');
                const button = section.querySelector('button');
                if (button) {
                    button.click();
                }
            }
        }
    });
});