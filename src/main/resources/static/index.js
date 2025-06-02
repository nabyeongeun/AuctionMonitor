function formatNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatTimeAgo(updatedAtString) {
    const updatedAt = new Date(updatedAtString); // API에서 받은 시간을 Date 객체로 변환
    const now = new Date(); // 현재 시간

    const diffMilliseconds = now.getTime() - updatedAt.getTime(); // 밀리초 단위의 차이

    const seconds = Math.floor(diffMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30); // 대략적인 월 계산
    const years = Math.floor(days / 365); // 대략적인 연도 계산

    if (seconds < 60) {
        return `${seconds}초전`;
    } else if (minutes < 60) {
        return `${minutes}분전`;
    } else if (hours < 24) {
        return `${hours}시간전`;
    } else if (days < 30) {
        return `${days}일전`;
    } else if (months < 12) {
        return `${months}개월전`;
    } else {
        return `${years}년전`;
    }
}

// Function to create an item card HTML
function createItemCard(item, notificationType, basePrice) {
    const quantityHtml = item.quantity ? `<span class="item-quantity text-gray-300 text-sm ml-1">[${item.itemOption.each}개]</span>` : '';
    const minQuantityHtml = item.minQuantity ? `<span class="item-min-quantity text-gray-400 text-xs ml-1">[최소 ${item.itemOption.price}개]</span>` : '';

    let highlightClass = '';
    const itemPrice = item.itemPrice;

    if (notificationType === 'buy') {
        // Highlight if the item price is less than or equal to the base price for 'buy' notifications
        if (itemPrice >= basePrice) {
            highlightClass = 'highlight-buy';
        }
    } else if (notificationType === 'sell') {
        // Highlight if the item price is greater than or equal to the base price for 'sell' notifications
        if (itemPrice <= basePrice) {
            highlightClass = 'highlight-sell';
        }
    }

    return `
        <div class="item-card item-card-bg rounded-lg p-4 mb-3 flex flex-col gap-2 shadow-md relative ${highlightClass}">
            <div class="item-header flex items-center justify-between flex-wrap">
                <span class="item-title font-bold text-lg text-gray-50">${item.itemName}</span>
                ${quantityHtml}
                ${minQuantityHtml}
                <div class="user-info flex items-center ml-auto">
                    <img src="${item.traderDiscordInfo.avatar}" alt="User Avatar" class="user-avatar w-6 h-6 rounded-full mr-1 bg-gray-600">
                    <span class="username text-gray-300 text-sm">${item.traderDiscordInfo.global_name}</span>
                </div>
            </div>
            <div class="item-details flex items-baseline">
                <span class="price price-color text-2xl font-bold">${formatNumberWithCommas(item.itemPrice)}</span>
                <span class="currency text-gray-200 ml-1">메소</span>
            </div>
            <div class="tags flex gap-1 flex-wrap">
                <span class="tag tag-type text-white px-2 py-1 rounded text-xs">${item.comment}</span>
            </div>
            <div class="item-actions flex justify-end items-center mt-auto">
                <span class="time-ago text-gray-400 text-xs mr-2">${formatTimeAgo(item.created_at)}</span>
                <a href="#" class="btn-detail bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200">자세히보기</a>
            </div>
        </div>
    `;
}

// Function to fetch data and render items
async function fetchAndRenderItems() {
    const sellItemList = document.getElementById('sell-item-list');
    const buyItemList = document.getElementById('buy-item-list');
    const notificationType = document.getElementById('notification-type').value;
    const basePrice = parseInt(document.getElementById('base-price').value, 10);

    // Show loading indicators
    sellItemList.innerHTML = '<p class="text-center text-gray-400">데이터 로딩 중...</p>';
    buyItemList.innerHTML = '<p class="text-center text-gray-400">데이터 로딩 중...</p>';

    try {
        const response = await fetch('http://localhost:8080/api/request/' + document.getElementById("item-code").value);
        const data = await response.json();

        const sell = data.filter(item => item !== null && item !== undefined && item.tradeType === 'sell');
        const buy = data.filter(item => item !== null && item !== undefined && item.tradeType === 'buy');
        console.log(sell);
        console.log(buy);

        // Clear existing items
        sellItemList.innerHTML = '';
        buyItemList.innerHTML = '';

        // Render sell items
        if (sell && sell.length > 0) {
            sell.forEach(item => {
                sellItemList.innerHTML += createItemCard(item, notificationType, basePrice);
            });
        } else {
            sellItemList.innerHTML = '<p class="text-center text-gray-400">판매 아이템이 없습니다.</p>';
        }

        // Render buy items
        if (buy && buy.length > 0) {
            buy.forEach(item => {
                buyItemList.innerHTML += createItemCard(item, notificationType, basePrice);
            });
        } else {
            buyItemList.innerHTML = '<p class="text-center text-gray-400">구매 아이템이 없습니다.</p>';
        }

    } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error);
        sellItemList.innerHTML = '<p class="text-center text-red-400">데이터 로딩 실패.</p>';
        buyItemList.innerHTML = '<p class="text-center text-red-400">데이터 로딩 실패.</p>';
    }
}

let refreshIntervalId; // to store the interval ID for clearing

// Function to update the refresh interval
function updateRefreshInterval() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId); // Clear previous interval
    }
    const intervalSeconds = parseInt(document.getElementById('refresh-interval').value, 10);
    if (intervalSeconds && intervalSeconds > 0) {
        refreshIntervalId = setInterval(fetchAndRenderItems, intervalSeconds * 1000);
    }
}

// Initial fetch and render
fetchAndRenderItems();

// Set up initial auto-refresh based on default value
updateRefreshInterval();

// Listen for changes on the refresh interval input
document.getElementById('refresh-interval').addEventListener('change', updateRefreshInterval);

// Add event listener for the new "적용" button
document.getElementById('apply-settings-btn').addEventListener('click', () => {
    fetchAndRenderItems(); // Re-fetch data immediately
    updateRefreshInterval(); // Also update the interval if it was changed

    // Show the modal message
    const applyMessageModal = document.getElementById('apply-message-modal');
    applyMessageModal.classList.remove('hidden'); // Make it visible

    // Hide the message after 2 seconds
    setTimeout(() => {
        applyMessageModal.classList.add('hidden'); // Hide it again
    }, 2000);
});