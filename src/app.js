const API_KEY = 'CG-yY8T2xc9QH1fkNFNpq4gbYw4';
const API_URL = 'https://api.coingecko.com/api/v3';

const cryptoDataContainer = document.getElementById('cryptoDataContainer');
const coinPagesContainer = document.getElementById('coinPagesContainer');
const cryptoDataTable = document.getElementById('cryptoDataTable');
const cryptoDataHeader = document.getElementById('cryptoDataHeader');
const cryptoDataBody = document.getElementById('cryptoDataBody');
const skeletonLoadingDiv = document.getElementById('skeletonLoadingDiv');
const skeletonLoadingData = document.getElementById('skeletonLoadingData');
const cryptoDataErrorDiv = document.getElementById('cryptoDataErrorDiv');
const pageButtonsContainer = document.getElementById('pageButtonsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageIndex = document.getElementById('pageIndex');
const countdownSeconds = document.getElementById('countdownSeconds');
const priceChangePercentage = '1h,24h,7d';
const currency = 'usd';
const perPage = 10;
let currentPage = 1;
let totalPages;
const pageCache = {};
let refreshTimeout;
const TIMER_DURATION = 60 * 1000;
const COIN_CACHE_DURATION = 60 * 1000;
const TOTAL_PAGES_CACHE_DURATION = 24 * 60 * 60 * 1000;
// let countdownInterval = setInterval(updateTimer, 1000);
// let timeLeft = TIMER_DURATION / 1000;

// function updateTimer() {
// 	timeLeft--;
// 	const seconds = timeLeft % 60;
// 	const formattedSeconds = String(seconds).padStart(2, '0');

// 	countdownSeconds.textContent = `${formattedSeconds}`;

// 	if (timeLeft <= 0) {
// 		clearInterval(countdownInterval);
// 		countdownSeconds.textContent = '00';
// 		console.log("Time's up!");
// 	}
// }

document.addEventListener('DOMContentLoaded', () => {
	const rows = document.querySelectorAll('tr[data-href]');
	rows.forEach((row) => {
		row.addEventListener('click', () => {
			window.location.href = row.dataset.href;
		});
	});
});

prevBtn.addEventListener('click', prevPage);
nextBtn.addEventListener('click', nextPage);

function prevPage() {
	currentPage = currentPage - 1; 
	if (currentPage < 1) { 
		currentPage = 1; 
		return; 
	} 
	updateCryptoData();
}

function nextPage() {
	currentPage = currentPage + 1;
	updateCryptoData();
}

async function getGlobalCryptoData() {
	const url = `${API_URL}/global?x_cg_demo_api_key=${API_KEY}`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		showErrorMessage(error, 'Error fetching from coin/list api.');
		return [];
	}
}

async function getCryptoData() {
	const url = `${API_URL}/coins/markets?vs_currency=${currency}&per_page=${perPage}&page=${currentPage}&price_change_percentage=${priceChangePercentage}&x_cg_demo_api_key=${API_KEY}`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		showErrorMessage(
			error,
			'Oops! Something went wrong on our end.<br> Please come back later.',
		);
		return [];
	}
}

async function setTotalPages() {
	const data = await getGlobalCryptoData();
	const { active_cryptocurrencies } = data.data;
	totalPages = Math.ceil(active_cryptocurrencies / perPage);
	savePageTotalToLocalStorage()
}

function setCurrentPage(page) {
	currentPage = page;
	updateCryptoData();
}

function showErrorMessage(error, message) {
	cryptoDataErrorDiv.style.display = 'flex';
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

function showCryptoData() {
	cryptoDataTable.style.display = '';
	pageButtonsContainer.style.display = 'flex';
	resetUI();
}

function resetUI() {
	document.title = 'Crypto Dashboard';
	cryptoDataTable.style.display = '';
	skeletonLoadingDiv.style.display = 'none';
	cryptoDataErrorDiv.style.display = 'none';
	updatePageIndex();
}

async function updatePageIndex() {
	if (!totalPages) {
		await setTotalPages();
	}
	pageIndex.textContent = `Showing ${perPage * (currentPage - 1) + 1} to ${perPage * currentPage} of ${totalPages}`;
}

function setContainerContent(container, content) {
	container.innerHTML = content;
}

async function updateCryptoData() {
	if (checkCachedPageData()) {
		toggleLoading(false);
		return;
	}

	try {
		toggleLoading(true);
		const response = await getCryptoData();
		cachePageData(response);
		renderCryptoData(response);
		resetCryptoTimer();
	} catch (error) {
		showErrorMessage(
			error,
			'Oops! Something went wrong.<br> Please come back later.',
		);
	} finally {
		toggleLoading(false);
	}
}

function checkCachedPageData() {
	if (!totalPages) {
		const storedTotalPages = loadCachedDataFromLocalStorage();
		if (storedTotalPages) {
			totalPages = storedTotalPages;
		}
	}

	if (pageCache[currentPage]) {
		renderCryptoData(pageCache[currentPage]);
		return true;
	}

	const storedPageData = loadCachedDataFromLocalStorage(currentPage);
	if (storedPageData) {
		cachePageData(storedPageData);
		renderCryptoData(storedPageData);
		return true;
	}
	return false;
}

function cachePageData(data) {
	pageCache[currentPage] = data;
	savePageDataToLocalStorage(currentPage, data)
}

function savePageDataToLocalStorage(pageIndex, data) {
	const entry = {
		timestamp: Date.now(),
		data: data,
	};
	localStorage.setItem(`cachedPage_${pageIndex}`, JSON.stringify(entry));
}

function savePageTotalToLocalStorage() {
	const entry = {
		timestamp: Date.now(),
		data: totalPages,
	};
	localStorage.setItem(`cachedTotalPages`, JSON.stringify(entry))
}

function loadCachedDataFromLocalStorage(page) {
	const storedData = page ? localStorage.getItem(`cachedPage_${page}`) : localStorage.getItem(`cachedTotalPages`);
	if (!storedData) {
		return null;
	}

	const entry = JSON.parse(storedData);
	const isExpired = Date.now() - entry.timestamp > (page ? COIN_CACHE_DURATION : TOTAL_PAGES_CACHE_DURATION);

	if (isExpired) {
		localStorage.removeItem(page ? `cachedPage_${page}` : `cachedTotalPages`);
		return null;
	}
	return entry.data;
}

function renderCryptoData(response) {
	cryptoDataBody.innerHTML = '';
	response.forEach((crypto, index) => {
		const cryptoInfoRow = getCryptoInfoRow(crypto, index);
		cryptoDataBody.appendChild(cryptoInfoRow);
	});
	updatePageIndex();
}

function resetCryptoTimer() {
	clearTimeout(refreshTimeout);
	refreshTimeout = setTimeout(updateCryptoData, TIMER_DURATION);
}

function getCryptoInfoRow(crypto, index) {
	const { price_change_percentage_24h } = crypto;
	const cryptoInfoRow = createCryptoInfoRow(crypto, index);

	updatePriceChangeColor(price_change_percentage_24h, cryptoInfoRow);

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
	infoRow.setAttribute('data-href', `./coin.html?id=${id}`);
	infoRow.classList.add('crypto-info');
	infoRow.innerHTML = `
					<td class='crypto-index'>${index + 1 + 10 * (currentPage - 1)}</td>
					<td class='crypto-details'>
						<img src="${image}" alt="${name} logo" class="crypto-image">
						<h2 class="crypto-name">${name} <span class="crypto-id">${symbol.toUpperCase()}</span></h2>
					</td>
					<td class='crypto-price'>$${current_price.toLocaleString()}</td>
					<td class='crypto-change price-change-24h'>${price_change_percentage_24h != null ? `${price_change_percentage_24h.toFixed(1)}%` : 'N/A'}</td>
				`;
	return infoRow;
}

function showLoading() {
	cryptoDataTable.style.display = 'none';
	skeletonLoadingDiv.style.display = 'flex';

	let skeletonBodyHTML = '';
	for (let i = 0; i < perPage; i++) {
		skeletonBodyHTML += `
			<div class="skeleton-row">
				<div class="shimmer"></div>
				<div class="skeleton skeleton-index"></div>
				<div class="skeleton-details">
					<div class="skeleton skeleton-image"></div>
					<div class="skeleton skeleton-text"></div>
				</div>
				<div class="skeleton skeleton-text"></div>
				<div class="skeleton skeleton-text"></div>
			</div>
		`
	}

	setContainerContent(
		skeletonLoadingData,
		skeletonBodyHTML,
	);
}

function updatePriceChangeColor(priceChange, container) {
	if (priceChange < 0) {
		container.querySelector('.price-change-24h').style.color =
			'var(--negative-change-color)';
	} else if (priceChange > 0) {
		container.querySelector('.price-change-24h').style.color =
			'var(--positive-change-color)';
	} else {
		container.querySelector('.price-change-24h').style.color = 'black';
	}
}

toggleLoading(true);
updateCryptoData();
