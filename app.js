let Banks = {
    ABC: { buy: 0.01, sell: -0.005 },
    NEW: { buy: 0.02, sell: -0.01 },
    AME: { buy: 0.015, sell: -0.015 },
    RED: { buy: 0.005, sell: -0.005 }
};

let fromCurrency = 'RUB';
let toCurrency = 'USD';
let currentRate = null;
let activeBank = 'NEW';

let maxAmount = 10000;

let amountIn = document.getElementById('amount-in');
let amountOut = document.getElementById('amount-out');
let rateTextIn = document.getElementById('rate-text-in');
let rateTextOut = document.getElementById('rate-text-out');
let buyRate = document.getElementById('buy-rate');
let sellRate = document.getElementById('sell-rate');
let allTabs = document.querySelectorAll('.tabs');
let fromTabs = allTabs[0];
let toTabs = allTabs[1];
let bankTabs = allTabs[2];


function formatNumber(num) {
    if (num == null || isNaN(num)) return '';
    return num.toFixed(4);
}

function validateInput(value) {
    let num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > maxAmount) { return false; }
    return true;
}

function showError(message) {
    let errorMsg = document.getElementById('error-msg');
    errorMsg.textContent = message;
    if (message) {
        errorMsg.classList.remove('hidden');
    } else {
        errorMsg.classList.add('hidden');
    }
}

function updateUI() {
    if (currentRate == null) return;

    let amount = parseFloat(amountIn.value) || 0;

    rateTextIn.textContent = `1 ${fromCurrency} = ${formatNumber(currentRate)} ${toCurrency}`;
    rateTextOut.textContent = `1 ${toCurrency} = ${formatNumber(1 / currentRate)} ${fromCurrency}`;
    buyRate.value = `${formatNumber(amount * currentRate * (1 + Banks[activeBank].buy))}`;
    sellRate.value = `${formatNumber(amount * currentRate * (1 + Banks[activeBank].sell))}`;
}

function calculate(input) {
    if (currentRate == null) return;

    if (input === 'in') {
        if (!validateInput(amountIn.value)) {
            showError(`Zəhmət olmasa 0 ilə ${maxAmount} arasında bir rəqəm daxil edin.`);
            return;
        }
        showError('');
        amountOut.value = formatNumber(parseFloat(amountIn.value) * currentRate);

    } else {
        if (!validateInput(amountOut.value)) {
            showError(`Zəhmət olmasa 0 ilə ${maxAmount} arasında bir rəqəm daxil edin.`);
            return;
        }
        showError('');
        amountIn.value = formatNumber(parseFloat(amountOut.value) / currentRate);
    }
}

function loadRate() {
    if (fromCurrency === toCurrency) {
        currentRate = 1;
        updateUI();
        return;
    }

    fetch('https://open.er-api.com/v6/latest/' + fromCurrency)
        .then(response => response.json())
        .then(data => {
            currentRate = data.rates[toCurrency];
            localStorage.setItem(`rate_${fromCurrency}_${toCurrency}`, JSON.stringify(currentRate));
            showError('');
            updateUI();
        }).catch(() => {
            let cachedRate = localStorage.getItem(`rate_${fromCurrency}_${toCurrency}`);
            if (cachedRate) {
                currentRate = JSON.parse(cachedRate);
                showError('');
                updateUI();
            } else {
                currentRate = null;
                showError('API əlçatmaz və keş də yoxdur.');

                buyRate.value = '';
                sellRate.value = '';
            }
        })
}


fromTabs.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        fromTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        fromCurrency = tab.textContent;
        loadRate();
    });
});


toTabs.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        toTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        toCurrency = tab.textContent;
        loadRate();
    });
});


bankTabs.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        bankTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeBank = tab.textContent;
        updateUI();
    });
});

function normalizeInput(el) {
    el.value = el.value.replace(/,/g, '.');
    el.value = el.value.replace(/[^0-9.]/g, '');

    const parts = el.value.split('.');
    if (parts.length > 2) {
        el.value = parts[0] + '.' + parts[1];
    }
    if (parts.length === 2 && parts[1].length > 4) {
        el.value = parts[0] + '.' + parts[1].slice(0, 4);
    }
};

amountIn.addEventListener('input', () => {
    normalizeInput(amountIn);
    if (!validateInput(amountIn.value)) {
        showError(`Zəhmət olmasa 0 ilə ${maxAmount} arasında bir rəqəm daxil edin.`);
        return;
    }
    showError('');
    calculate('in');
    updateUI();
})

amountOut.addEventListener('input', () => {
    normalizeInput(amountOut);
    if (!validateInput(amountOut.value)) {
        showError(`Zəhmət olmasa 0 ilə ${maxAmount} arasında bir rəqəm daxil edin.`);
        return;
    }
    showError('');
    calculate('out');
    updateUI();
})

window.addEventListener('offline', () => {
    document.getElementById('offline').classList.remove('hidden');
});

window.addEventListener('online', () => {
    document.getElementById('offline').classList.add('hidden');
    loadRate();
});

loadRate();