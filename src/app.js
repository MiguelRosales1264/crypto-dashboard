const API_KEY = 'CG-yY8T2xc9QH1fkNFNpq4gbYw4';

async function getCryptoData() {
    const url = `https://api.coingecko.com/api/v3/coins/list?x_cg_demo_api_key=${API_KEY}`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		console.log(data);
	} catch (error) {
		console.error('Error fetching crypto data:', error);
	}
}

getCryptoData();
