const API_KEY = 'CG-yY8T2xc9QH1fkNFNpq4gbYw4';
const API_URL = 'https://api.coingecko.com/api/v3';

const params = new URLSearchParams(window.location.search);
const coinId = params.get('id');

const coinImage = document.getElementById('coinImage');
const coinName = document.getElementById('coinName');
const coinPrice = document.getElementById('coinPrice');
const coinChange = document.getElementById('coinChange');

async function getCoinData() {
	const url = `${API_URL}/coins/${coinId}?x_cg_demo_api_key=${API_KEY}`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching coin data:', error);
		return null;
	}
}

async function renderCoinData() {
	const data = await getCoinData();
	if (!data) return;

	const { name, symbol, image, market_data } = data;
	const current_price = market_data.current_price.usd;
	const price_change_percentage_24h = market_data.price_change_percentage_24h;

	document.title = `${name} - Crypto Dashboard`;
	coinImage.src = image.small;
	coinImage.alt = `${name} logo`;
	coinName.textContent = `${name} (${symbol.toUpperCase()})`;
	coinPrice.textContent = `$${current_price.toLocaleString()}`;
	coinChange.textContent = `${price_change_percentage_24h != null ? `${price_change_percentage_24h.toFixed(1)}%` : 'N/A'} (24h)`;

	updatePriceChangeColor(price_change_percentage_24h, coinChange);
}

function updatePriceChangeColor(priceChange, element) {
	if (priceChange < 0) {
		element.style.color = 'var(--negative-change-color)';
	} else if (priceChange > 0) {
		element.style.color = 'var(--positive-change-color)';
	}
}

renderCoinData();
