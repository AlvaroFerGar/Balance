class DomainEngine {
    constructor(domain, physicsEngine) {
        this.domain = domain;
        this.physicsEngine = physicsEngine;
    }

    handleCollisions(paperBalls) {
        for (let i = 0; i < paperBalls.length; i++) {
            this.updateBallPosition(i, paperBalls[i]);
            this.checkAndResolveCollision(i, paperBalls[i]);
            this.updateBallPosition(i, paperBalls[i]);
        }
    }

    updateBallPosition(index, paperBall) {
        if (this.domain.contains(this.physicsEngine.getBalls()[index])) {
            paperBall.position.x = this.physicsEngine.getBalls()[index].x;
            paperBall.position.y = this.physicsEngine.getBalls()[index].y;
        } else {
            this.revertPosition(index, paperBall);
        }
    }

    revertPosition(index, paperBall) {
        paperBall.position.x = this.physicsEngine.getBalls()[index].prev_x;
        paperBall.position.y = this.physicsEngine.getBalls()[index].prev_y;
        this.physicsEngine.getBalls()[index].x = this.physicsEngine.balls[index].prev_x;
        this.physicsEngine.getBalls()[index].y = this.physicsEngine.balls[index].prev_y;
    }

    checkAndResolveCollision(index, paperBall) {
        let dist = paperBall.position.getDistance(this.domain.getNearestPoint(paperBall.position));
        if (dist < this.physicsEngine.getBalls()[index].radius) {
            this.physicsEngine.resolveCollision(index, this.domain.getNearestPoint(paperBall.position));
        }
    }
}