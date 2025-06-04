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

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Copied:', text);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    const copyMessageModal = document.getElementById('copy-message-modal');
    copyMessageModal.classList.remove('hidden'); // Make it visible

    // Hide the message after 2 seconds
    setTimeout(() => {
        copyMessageModal.classList.add('hidden'); // Hide it again
    }, 1000);
}