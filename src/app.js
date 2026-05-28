const API_KEY = 'CG-yY8T2xc9QH1fkNFNpq4gbYw4';
const API_URL = 'https://api.coingecko.com/api/v3/';

const cryptoDataTable = document.getElementById('cryptoDataTable');
const cryptoDataHeader = document.getElementById('cryptoDataHeader');
const cryptoDataBody = document.getElementById('cryptoDataBody');
const cryptoDataLoadingDiv = document.getElementById('cryptoDataLoadingDiv');
const cryptoDataErrorDiv = document.getElementById('cryptoDataErrorDiv');
let isLoading = true;

async function getAllCryptoData() {
	const currency = 'usd';
	const perPage = 10;
	const priceChangePercentage = '1h';
	const url = `${API_URL}coins/markets?vs_currency=${currency}&per_page=${perPage}&price_change_percentage=${priceChangePercentage}&x_cg_demo_api_key=${API_KEY}`;

	try {
		isLoading = true;
		isLoadingState(isLoading);
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching crypto data:', error);
		cryptoDataErrorDiv.innerHTML = `
			<div id='cryptoDataErrorDiv'>
				<p class='errorMessage'>Oops! Something went wrong on our end.<br> Please come back later.</p>
			</div>
		`;
		return [];
	} finally {
		isLoading = false;
		isLoadingState(isLoading);
	}
}

function isLoadingState(isLoading) {
	if (isLoading) {
		cryptoDataTable.style.display = 'none';
		cryptoDataTable.innerHTML = '';
		cryptoDataLoadingDiv.innerHTML = `
			<div id='cryptoDataLoadingDiv'>
				<p class='loadingStateText'>Loading...</p>
			</div>
		`;
		return;
	}
	cryptoDataLoadingDiv.innerHTML = '';
	return;
}

let refreshTimer;

async function updateCryptoData() {
	try {
		const response = await getAllCryptoData();
		response.forEach((crypto, index) => {
			const cryptoInfoRow = getCryptoInfoRow(crypto, index);
			cryptoDataBody.appendChild(cryptoInfoRow);
		});

		clearTimeout(refreshTimer);
		refreshTimer = setTimeout(updateCryptoData, 60 * 1000);
		return;
	} catch (error) {
		console.error(error);
		cryptoDataErrorDiv.innerHTML = `
			<div id='cryptoDataErrorDiv'>
				<p class='errorMessage'>Oops! Something went wrong.<br> Please come back later.</p>
			</div>
		`;
	}
}

function getCryptoInfoRow(crypto, index) {
	const {
		id,
		symbol,
		name,
		image,
		current_price,
		price_change_percentage_24h,
	} = crypto;

	// Create a new row for the crypto data
	const cryptoInfoRow = createCryptoInfoRow(crypto, index);

	// Set color based on price change
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
	const infoRow = document.createElement('tr');
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

// isLoadingState(isLoading);
updateCryptoData();
