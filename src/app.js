const API_KEY = 'CG-yY8T2xc9QH1fkNFNpq4gbYw4';
const API_URL = 'https://api.coingecko.com/api/v3/';

// Variables
const cryptoDataDiv = document.getElementById('cryptoDataDiv');

async function getCryptoData() {
	const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&names=Bitcoin&symbols=btc&category=layer-1&price_change_percentage=1h&x_cg_demo_api_key=${API_KEY}`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching crypto data:', error);
		return [];
	}
}

async function displayCryptoData() {
	try {
		const response = await getCryptoData();
		response.forEach((crypto) => {
			const { id, symbol, name, image } = crypto;
			const cryptoInfoDiv = document.createElement('div');

			cryptoInfoDiv.innerHTML = `
				<img src='${image}' alt='${id}'>
				<h2>${name}, (${symbol})</h2>
			`

			cryptoDataDiv.appendChild(cryptoInfoDiv);
		})
	} catch (error) {
		console.error(error);
	}
}

// displayCryptoData();