//Based on: https://github.com/zalo/zalo.github.io/blob/master/assets/js/Constraints/VerletCollision.js#L39
class Ball {
    constructor(center_x, center_y, radius) {
        this.x = center_x;
        this.y = center_y;

        this.prev_x = this.x;
        this.prev_y =  this.y;

        this.radius=radius;
    }
}

class PhysicsEngine {
    constructor(mouseAuraRadius, num, domainRadius) {
        this.mouseAuraRadius = mouseAuraRadius;
        this.numOfBalls = num;
        this.domainRadius = domainRadius;
        // Actualizar al nuevo centro
        this.domainCenterX = paper.view.center.x;
        this.domainCenterY = paper.view.center.y;  
        // Estado de las bolas
        this.balls = [];
        this.mousePos = { x: 0, y: 0 };
        this.ballRadius = 30;

        // Inicializar las bolas
        this.initializeBalls();
        
        this.updateDomainCenter();
    }

    updateDomainCenter() {
        // Guardar el centro anterior
        const oldCenterX = this.domainCenterX;
        const oldCenterY = this.domainCenterY;
        
        // Actualizar al nuevo centro
        this.domainCenterX = paper.view.center.x;
        this.domainCenterY = paper.view.center.y;
        
        // Calcular el desplazamiento
        const deltaX = this.domainCenterX - oldCenterX;
        const deltaY = this.domainCenterY - oldCenterY;
        console.log(this.numOfBalls);
        // Actualizar la posición de todas las bolas
        for (let i = 0; i < this.numOfBalls; i++) {
            this.balls[i].x += deltaX;
            this.balls[i].y += deltaY;
            this.balls[i].prev_x += deltaX;
            this.balls[i].prev_y += deltaY;
        }
    }

    initializeBalls() {
        this.balls = [];
        for (let i = 0; i < this.numOfBalls; i++) {
            let angle = Math.random() * 2 * Math.PI;
            let distance = Math.random() * (this.domainRadius * 0.9);
            let x_ball = this.domainCenterX + Math.cos(angle) * distance;
            let y_ball = this.domainCenterY + Math.sin(angle) * distance;
            
            let ball = new Ball(x_ball, y_ball, this.ballRadius);
            this.balls.push(ball);
        }
    }

    // Integración de Verlet
    verletIntegrate(ball) {
        var temp_x = ball.x;
        var temp_y = ball.y;
        ball.x += (ball.x - ball.prev_x)*0.01;
        ball.y += (ball.y - ball.prev_y)*0.01;
        ball.prev_x = temp_x;
        ball.prev_y = temp_y;
    }

    // Actualización de la física
    update(mousePos, delta) {
   
        // Actualizar las posiciones de las bolas con física
        let g = 5;
        for (let i = 0; i < this.numOfBalls; i++) {
            this.verletIntegrate(this.balls[i]);
            // Gravedad
            this.balls[i].y += g;
        }
        for (let iter = 0; iter < 5; iter++) {
            // Separar bolas del mouse
            this.mousePos = mousePos;
            this.avoidMouse();
            // Separar bolas entre sí
            this.avoidOtherBalls();
            // Mantener las bolas dentro del dominio
            this.keepBallsInDomain();
        }
    }

    keepBallsInDomain() {
        for (let i = 0; i < this.numOfBalls; i++) {
            let toNext = { x: this.domainCenterX - this.balls[i].x, y: this.domainCenterY - this.balls[i].y };
            let dist = Math.sqrt(toNext.x ** 2 + toNext.y ** 2);

            if (dist >= this.domainRadius - (this.balls[i].radius + 1)) {
                let scale = (this.domainRadius - (this.ballRadius+1)) / dist; // Factor de escala
                // Normalizamos la dirección (invertimos el vector)
                this.balls[i].x = this.domainCenterX-toNext.x * scale; // Mover en dirección opuesta
                this.balls[i].y = this.domainCenterY-toNext.y * scale; // Mover en dirección opuesta
            }
        }
    }

    avoidOtherBalls() {
        for (let i = 0; i < this.numOfBalls; i++) {
            for (let j = i + 1; j < this.numOfBalls; j++) {
                let dx = this.balls[j].x - this.balls[i].x;
                let dy = this.balls[j].y - this.balls[i].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                const minDist = Math.max(this.balls[i].radius,this.balls[j].radius) + 1;  // Distancia mínima deseada entre las pelotas
                // Si la distancia entre las pelotas es menor que la mínima
                if (dist < minDist) {
                    // Calcular el vector de corrección (normalizado)
                    let overlap = minDist - dist;  // Qué tan lejos están de la distancia mínima
                    let scale = overlap / dist;  // Proporción del movimiento necesario
    
                    // Mover las pelotas para evitar el cruce
                    let moveX = dx * scale;
                    let moveY = dy * scale;
    
                    // Ajustar las posiciones de las pelotas
                    this.balls[i].x -= moveX / 2;
                    this.balls[i].y -= moveY / 2;
                    this.balls[j].x += moveX / 2;
                    this.balls[j].y += moveY / 2;
                }
            }
        }
    }

    avoidMouse() {
        for (let i = 0; i < this.numOfBalls; i++) {
            let dx = this.mousePos.x - this.balls[i].x;
            let dy = this.mousePos.y - this.balls[i].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.mouseAuraRadius + this.balls[i].radius + 1;  // Distancia mínima deseada entre el ratón y las pelotas    
            // Si la distancia entre la pelota y el ratón es menor que la mínima
            if (dist < minDist) {
                // Calcular el vector de corrección (normalizado)
                let overlap = minDist - dist;  // Qué tan lejos están de la distancia mínima
                let scale = overlap / dist;  // Proporción del movimiento necesario
                
                // Mover la pelota para evitar el ratón
                let moveX = dx * scale;
                let moveY = dy * scale;
    
                // Ajustar la posición de la pelota
                this.balls[i].x -= moveX / 2;
                this.balls[i].y -= moveY / 2;
            }
        }
    }

    getBalls() {
        return this.balls;
    }
}

window.onload = function() {
    // Inicializa el canvas con Paper.js
    paper.setup('myCanvas');
    
    // Ajustar el tamaño del canvas al tamaño de la ventana
    const canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Parámetros de la simulación
    const mouseAuraRadius = 50;
    const domainRadius = 300;
    const num = 30;

    // Crear el motor de física
    const physicsEngine = new PhysicsEngine(mouseAuraRadius, num, domainRadius);

    // Crear el círculo y dominio en Paper.js
    const mouseAura = new paper.Path.Circle(paper.view.center, mouseAuraRadius);
    mouseAura.strokeWidth = 0;
    mouseAura.strokeColor = 'black';

    const domain = new paper.Path.Circle(paper.view.center, domainRadius);
    domain.strokeWidth = 15;
    domain.strokeColor = 'black';

    // Crear las bolas en Paper.js
    const paperBalls = [];
    for (let i = 0; i < num; i++) {
        let paperBall = new paper.Path.Circle(paper.view.center.add(new paper.Point(physicsEngine.getBalls()[i].x, physicsEngine.getBalls()[i].y)), 15);
        paperBall.strokeWidth = 6;
        paperBall.strokeColor = 'black';
        paperBall.fillColor = new paper.Color(0.1, 0.1, 0.1);
        paperBalls.push(paperBall);
    }

    // Manejar el redimensionamiento de la ventana
    window.onresize = function() {
        // Actualizar tamaño del canvas
        //onWindowResize(canvas, domain, physicsEngine);
    };

    // Guardar la posición del mouse
    let mousePos = { x: 0, y: 0 };
    paper.view.onMouseMove = function(event) {
        mousePos = event.point;
    };

    onWindowResize(canvas, domain, physicsEngine);

    // Función de animación
    paper.view.onFrame = function(event) {
        physicsEngine.update(mousePos, event.delta);

        // Actualizar la posición de las bolas en el canvas
        for (let i = 0; i < num; i++) {
            paperBalls[i].position.x = physicsEngine.getBalls()[i].x;
            paperBalls[i].position.y = physicsEngine.getBalls()[i].y;
        }
    };
};

function onWindowResize(canvas, domain, physicsEngine) {
    console.log("resize");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Actualizar view de Paper.js
    paper.view.viewSize = new paper.Size(window.innerWidth, window.innerHeight);

    // Actualizar posición del dominio
    domain.position = paper.view.center;

    // Actualizar el centro del dominio en el motor de física
    physicsEngine.updateDomainCenter();
}
