const API_KEY = 'CG-yY8T2xc9QH1fkNFNpq4gbYw4';
const API_URL = 'https://api.coingecko.com/api/v3/';

// Variables
const cryptoDataHeader = document.getElementById('cryptoDataHeader');
const cryptoDataBody = document.getElementById('cryptoDataBody');

async function getAllCryptoData() {
	// Fetch crypto data from the CoinGecko API
	const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&names=Bitcoin&symbols=btc&category=layer-1&price_change_percentage=1h&x_cg_demo_api_key=${API_KEY}`;

	// Handle errors gracefully by using try-catch and returning an empty array if the fetch fails
	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching crypto data:', error); // Log the error to the console for debugging purposes
		return [];
	}
}

let refreshTimer;

async function updateCryptoData() {
	// Fetch crypto data and update it in the table
	try {
		const response = await getAllCryptoData();
		response.forEach((crypto, index) => {
			if (index >= 10) return; // Limit to top 10
			const cryptoInfoRow = createCryptoInfoRow(crypto, index);
			cryptoDataBody.appendChild(cryptoInfoRow); // Append the new row to the table body
		});

		clearTimeout(refreshTimer);
		refreshTimer = setTimeout(updateCryptoData, 60 * 1000); // Refresh the data automatically every 60 seconds
	} catch (error) {
		console.error(error); // Handle errors gracefully, for now we just log them to the console
	}
}

function createCryptoInfoRow(crypto, index) {
	// Destructure crypto data for easier access
	const {
		id,
		symbol,
		name,
		image,
		current_price,
		price_change_percentage_24h,
	} = crypto;
	// Create a new row for the crypto data
	const cryptoInfoRow = document.createElement('tr');
	cryptoInfoRow.classList.add('crypto-info');
	cryptoInfoRow.innerHTML = `
					<td class='crypto-index'>${index + 1}</td>
					<td class='crypto-details'>
						<img src="${image}" alt="${name} logo" class="crypto-image">
						<h2 class="crypto-name">${name}</h2>
						<p class="crypto-id">${symbol.toUpperCase()}</p>
					</td>
					<td class='crypto-price'>$${current_price.toLocaleString()}</td>
					<td class='crypto-change price-change-24h'>${price_change_percentage_24h.toFixed(1)}%</td>
				`;
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

updateCryptoData();
