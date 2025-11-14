// 搜索功能
const searchInput = document.getElementById('searchInput');

// 更新搜索功能以支持动态添加的工具卡片
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // 使用应用实例的搜索方法
    if (window.app && window.app.isInitialized) {
        window.app.handleSearch(searchTerm);
    } else {
        // 如果应用未初始化，使用简单的搜索逻辑
        console.warn('应用未初始化，使用简单搜索');
        simpleSearch(searchTerm);
    }
}

// 简单搜索逻辑（应用未初始化时的后备方案）
function simpleSearch(searchTerm) {
    const categories = document.querySelectorAll('.category');
    
    categories.forEach(category => {
        let hasVisibleCards = false;
        const cards = category.querySelectorAll('.tool-card');
        
        cards.forEach(card => {
            const name = card.getAttribute('data-name').toLowerCase();
            const desc = card.getAttribute('data-desc').toLowerCase();
            
            const matchesSearch = searchTerm === '' || 
                                name.includes(searchTerm) || 
                                desc.includes(searchTerm);
            
            if (matchesSearch) {
                card.classList.remove('hidden');
                hasVisibleCards = true;
            } else {
                card.classList.add('hidden');
            }
        });
        
        if (hasVisibleCards || searchTerm === '') {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });
}

// 防抖搜索函数
let searchTimeout;
function debouncedSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300); // 300ms 延迟
}

// 实时搜索函数
function realTimeSearch() {
    performSearch();
}

// 绑定搜索事件
searchInput.addEventListener('input', debouncedSearch);
searchInput.addEventListener('keyup', function(e) {
    // 按 Enter 键立即搜索
    if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        performSearch();
    }
    // 按 Escape 键清空搜索
    if (e.key === 'Escape') {
        searchInput.value = '';
        clearTimeout(searchTimeout);
        performSearch();
    }
});

// 返回顶部按钮
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 平滑滚动到分类
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navHeight = document.querySelector('.category-nav').offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化主应用
    if (window.app) {
        await window.app.init();
    } else {
        console.error('应用实例未找到');
    }
});