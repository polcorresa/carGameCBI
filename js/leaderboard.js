// Leaderboard Manager - stores scores in localStorage for session persistence
class Leaderboard {
    constructor() {
        this.storageKey = 'highwayRacerLeaderboard';
        this.maxEntries = 10;
        this.scores = this.loadScores();
    }
    
    loadScores() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Could not load leaderboard from localStorage');
            return [];
        }
    }
    
    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (e) {
            console.warn('Could not save leaderboard to localStorage');
        }
    }
    
    addScore(name, score, time) {
        const entry = {
            name: name || 'Anonymous',
            score: score,
            time: time,
            timestamp: Date.now()
        };
        
        this.scores.push(entry);
        this.scores.sort((a, b) => b.score - a.score);
        
        // Keep only top entries
        if (this.scores.length > this.maxEntries) {
            this.scores = this.scores.slice(0, this.maxEntries);
        }
        
        this.saveScores();
        return this.getRank(entry);
    }
    
    clearScores() {
        this.scores = [];
        this.saveScores();
    }
    
    getRank(entry) {
        return this.scores.findIndex(s => s.timestamp === entry.timestamp) + 1;
    }
    
    getScores() {
        return this.scores;
    }
    
    render() {
        const listEl = document.getElementById('leaderboard-list');
        if (!listEl) return;
        
        if (this.scores.length === 0) {
            listEl.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
            return;
        }
        
        listEl.innerHTML = this.scores.map((entry, index) => {
            const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            return `
                <div class="leaderboard-entry ${rankClass}">
                    <span class="leaderboard-rank">${medal}</span>
                    <span class="leaderboard-name">${entry.name}</span>
                    <span class="leaderboard-score">${entry.score} pts</span>
                </div>
            `;
        }).join('');
    }
}
