/**
 * Database Search and Filtering Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const cards = document.querySelectorAll('.db-card');

    if (!searchInput) return;

    // The Legal Filter: Replaces real agency names with fictional game aliases
    function _legal_text_filter(query) {
        let filteredQuery = query;
        // Case-insensitive replacements
        filteredQuery = filteredQuery.replace(/CIA/gi, "The Obsidian Oversight");
        filteredQuery = filteredQuery.replace(/FBI/gi, "Bureau of Internal Security");
        filteredQuery = filteredQuery.replace(/NSA/gi, "Signal Reach Network");
        return filteredQuery;
    }

    searchInput.addEventListener('input', (e) => {
        const rawQuery = e.target.value.toLowerCase();
        
        // If the user searches for "NSA", update the input visually to "Signal Reach Network"
        // This keeps them immersed in the game world.
        const filteredQuery = _legal_text_filter(e.target.value);
        if (e.target.value !== filteredQuery) {
            e.target.value = filteredQuery;
        }

        const searchQuery = filteredQuery.toLowerCase();

        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            const category = card.querySelector('.db-category').textContent.toLowerCase();

            if (title.includes(searchQuery) || desc.includes(searchQuery) || category.includes(searchQuery)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
