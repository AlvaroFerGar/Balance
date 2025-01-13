class BalanceLogic {
    constructor() {
        this.overlay = this.createOverlay();
        this.balanceStartTime = null;
        this.balanceReached = false;
        this.balanceNeededTime = 5;
        this.effectDuration = 4000;
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(34, 197, 94, 0);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: all 1.5s ease-in-out;
            pointer-events: none;
        `;
        
        const text = document.createElement('div');
        text.style.cssText = `
            font-size: 21rem;
            font-style: italic;
            color: black;
            opacity: 0;
            transition: opacity 1.5s;
        `;
        text.textContent = 'Balance';
        
        overlay.appendChild(text);
        document.body.appendChild(overlay);
        return overlay;
    }

    update(ballCounter, freeze) {
        if (freeze) return true;

        const leftCount = ballCounter.leftText.content;
        const rightCount = ballCounter.rightText.content;

        if (leftCount === rightCount) {
            if (!this.balanceStartTime) {
                this.balanceStartTime = Date.now();
            }
            
            const elapsedTime = (Date.now() - this.balanceStartTime) / 1000;
            
            if (elapsedTime >= this.balanceNeededTime && !this.balanceReached) {
                this.balanceReached = true;
                this.showBalanceEffect();
                return true;
            }
        } else {
            this.balanceStartTime = null;
        }
        
        return false;
    }

    showBalanceEffect() {
        this.overlay.style.opacity = '1';
        this.overlay.style.backgroundColor = 'rgba(34, 197, 94, 0.5)';
        this.overlay.firstChild.style.opacity = '1';

        setTimeout(() => {
            this.overlay.style.opacity = '0';
            this.overlay.style.backgroundColor = 'rgba(34, 197, 94, 0)';
            this.overlay.firstChild.style.opacity = '0';
        }, this.effectDuration);
    }
}
