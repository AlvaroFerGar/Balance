class BallCounter {
    constructor(leftText, rightText) {
        this.leftText = leftText;
        this.rightText = rightText;
        this.leftCount = 0;
        this.rightCount = 0;
    }

    update(balls, centerX) {
        this.leftCount = 0;
        this.rightCount = 0;

        for (let ball of balls) {
            const distanceFromCenter = ball.x - centerX;
            
            if (Math.abs(distanceFromCenter) <= ball.diameter*0.5) {
                // Ball intersects center line - calculate proportion
                const overlap = (ball.diameter*0.5 - Math.abs(distanceFromCenter)) / (ball.diameter*0.5);
                if (distanceFromCenter < 0) {
                    this.leftCount += (1 - overlap);
                    this.rightCount += overlap;
                } else {
                    this.leftCount += overlap;
                    this.rightCount += (1 - overlap);
                }
            } else if (distanceFromCenter < 0) {
                this.leftCount++;
            } else {
                this.rightCount++;
            }
        }

        this.updateDisplay();
    }

    updateDisplay() {
        this.leftText.content = this.leftCount.toFixed(3);
        this.rightText.content = this.rightCount.toFixed(3);
        //this.rightText.position.x = window.innerWidth - 50;
    }

    getLeftCount() {
        return this.leftCount;
    }

    getRightCount() {
        return this.rightCount;
    }
}