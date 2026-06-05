const API_KEY = 'CG-yY8T2xc9QH1fkNFNpq4gbYw4';
const API_URL = 'https://api.coingecko.com/api/v3/';

const cryptoDashboardContainer = document.getElementById('cryptoDataContainer');
const coinPagesContainer = document.getElementById('coinPagesContainer');
const cryptoDataTable = document.getElementById('cryptoDataTable');
const cryptoDataHeader = document.getElementById('cryptoDataHeader');
const cryptoDataBody = document.getElementById('cryptoDataBody');
const cryptoDataLoadingDiv = document.getElementById('cryptoDataLoadingDiv');
const cryptoDataErrorDiv = document.getElementById('cryptoDataErrorDiv');
const logoHeader = document.getElementById('logoHeader');
let refreshTimer;

logoHeader.addEventListener('click', showCryptoData);

async function getCryptoData() {
	const currency = 'usd';
	const currentPage = '1';
	const perPage = '10';
	const priceChangePercentage = '1h,24h,7d';
	const url = `${API_URL}coins/markets?vs_currency=${currency}&per_page=${perPage}&page=${currentPage}&price_change_percentage=${priceChangePercentage}&x_cg_demo_api_key=${API_KEY}`;

	try {
		toggleLoading(true);
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		showErrorMessage(
			error,
			'Oops! Something went wrong on our end.<br> Please come back later.',
		);
		return [];
	} finally {
		toggleLoading(false);
	}
}

function showErrorMessage(error, message) {
	setContainerContent(
		cryptoDataErrorDiv,
		`<p class='errorMessage'>${message}</p>`,
	);
}

function toggleLoading(isLoading) {
	if (isLoading) {
		showLoading();
	} else {
		showCryptoData();
	}
}

function showLoading() {
	cryptoDataTable.style.display = 'none';
	setContainerContent(
		cryptoDataLoadingDiv,
		'<p class="loadingStateText">Loading...</p>',
	);
}

function showCryptoData() {
	document.title = 'Crypto Dashboard';
	cryptoDashboardContainer.style.display = 'block';
	cryptoDataTable.style.display = 'block';
	setContainerContent(cryptoDataLoadingDiv, '');
	setContainerContent(cryptoDataErrorDiv, '');
	setContainerContent(coinPagesContainer, '');
}

function setContainerContent(container, content) {
	container.innerHTML = content;
}

async function updateCryptoData() {
	try {
		const response = await getCryptoData();
		renderCryptoData(response);
		resetCryptoTimer();
	} catch (error) {
		showErrorMessage(
			error,
			'Oops! Something went wrong.<br> Please come back later.',
		);
	}
}

function renderCryptoData(response) {
	cryptoDataBody.innerHTML = '';
	response.forEach((crypto, index) => {
		const cryptoInfoRow = getCryptoInfoRow(crypto, index);
		cryptoDataBody.appendChild(cryptoInfoRow);
	});
}

function resetCryptoTimer() {
	clearTimeout(refreshTimer);
	refreshTimer = setTimeout(updateCryptoData, 60 * 1000);
}

function getCryptoInfoRow(crypto, index) {
	const { price_change_percentage_24h } = crypto;
	const cryptoInfoRow = createCryptoInfoRow(crypto, index);

	if (price_change_percentage_24h < 0) {
		cryptoInfoRow.querySelector('.price-change-24h').style.color =
			'var(--negative-change-color)';
	} else {
		cryptoInfoRow.querySelector('.price-change-24h').style.color =
			'var(--positive-change-color)';
	}

	return cryptoInfoRow;
}

function createCryptoInfoRow(crypto, index) {
	const {
		id,
		symbol,
		name,
		image,
		current_price,
		price_change_percentage_24h,
	} = crypto;

	const infoRow = document.createElement('tr');
	infoRow.addEventListener('click', () => renderCoinPage(crypto, index));
	infoRow.classList.add('crypto-info');
	infoRow.innerHTML = `
					<td class='crypto-index'>${index + 1}</td>
					<td class='crypto-details'>
						<img src="${image}" alt="${name} logo" class="crypto-image">
						<h2 class="crypto-name">${name}</h2>
						<p class="crypto-id">${symbol.toUpperCase()}</p>
					</td>
					<td class='crypto-price'>$${current_price.toLocaleString()}</td>
					<td class='crypto-change price-change-24h'>${price_change_percentage_24h.toFixed(1)}%</td>
				`;
	return infoRow;
}

function renderCoinPage(crypto, index) {
	const {
		id,
		symbol,
		name,
		image,
		current_price,
		price_change_percentage_24h,
	} = crypto;

	document.title = name;

	cryptoDashboardContainer.style.display = 'none';
	coinPagesContainer.style.display = 'block';
	coinPagesContainer.innerHTML = `
		<div class="coin-page-header">
			<img src="${image}" alt="${name} logo" class="crypto-image">
			<h1>${name} ${symbol.toUpperCase()} Price ${index + 1}</h1>
		</div>
		<h1>$${current_price.toLocaleString()}</h1>
		<p class='crypto-change price-change-24h'>${price_change_percentage_24h.toFixed(1)}% (24h)</p>
	`;

	if (price_change_percentage_24h < 0) {
		coinPagesContainer.querySelector('.price-change-24h').style.color =
			'var(--negative-change-color)';
	} else {
		coinPagesContainer.querySelector('.price-change-24h').style.color =
			'var(--positive-change-color)';
	}
}

updateCryptoData();
