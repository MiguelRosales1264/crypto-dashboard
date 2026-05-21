const API_KEY = 'CG-yY8T2xc9QH1fkNFNpq4gbYw4';
const API_URL = 'https://api.coingecko.com/api/v3/';

// Variables
const cryptoDataDiv = document.getElementById('cryptoDataDiv');

async function getAllCryptoData() {
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
		const response = await getAllCryptoData();
		console.log(response[0]);
		response.forEach((crypto, index) => {
			const {
				id,
				symbol,
				name,
				image,
				current_price,
				price_change_percentage_24h,
			} = crypto;
			if (index >= 10) return; // Limit to top 10
			const cryptoInfoDiv = document.createElement('div');

			cryptoInfoDiv.innerHTML = `
				<div id="cryptoDataDiv">
					<div class="crypto-info">
						<p class="crypto-index">${index + 1}</p>
						<div class='crypto-details'>
							<img src='${image}' alt='${id}' class='crypto-image'>
							<h2 class="crypto-name">${name}</h2>
							<p class="crypto-id">${symbol}</p>
						</div> 
						<div class='crypto-stats'>
							<p>Price: $${current_price} USD</p>
							<p>24h Price Change: ${price_change_percentage_24h}% </p>
						</div>
					</div>
				</div>
			`;

			cryptoDataDiv.appendChild(cryptoInfoDiv);
		})
	} catch (error) {
		console.error(error);
	}
}

displayCryptoData();