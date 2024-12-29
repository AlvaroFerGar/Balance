class PhysicsEngine {
    constructor(length, num, domainRadius) {
        this.length = length;
        this.num = num;
        this.domainRadius = domainRadius;

        // Estado de las bolas
        this.balls = [];
        this.prevBalls = [];
        this.mousePos = { x: 0, y: 0 };

        this.ballRadius=10;

        // Inicializar las bolas
        for (let i = 0; i < num; i++) {
            let angle = Math.random() * 2 * Math.PI;
            let distance = Math.random() * (domainRadius*0.9);
            let x_ball = 500+Math.cos(angle) * distance;
            let y_ball = 500+Math.sin(angle) * distance;
           
            this.balls.push({ x: x_ball, y: y_ball });
            this.prevBalls.push({ x: x_ball, y: y_ball });
        }
    }

    // Integración de Verlet
    verletIntegrate(curPt, prevPt) {
        var temp = { ...curPt };
        curPt.x += (curPt.x - prevPt.x)*0.01;
        curPt.y += (curPt.y - prevPt.y)*0.01;
        prevPt.x = temp.x;
        prevPt.y = temp.y;
    }

    // Actualización de la física
    update(mousePos, delta) {
   
        // Actualizar las posiciones de las bolas con física
        let g=2.5;
        console.log(g)
        for (let i = 0; i < this.num; i++) {
            this.verletIntegrate(this.balls[i], this.prevBalls[i]);
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

    keepBallsInDomain(){
        for (let i = 0; i < this.num; i++) {
            let toNext = { x: 500 - this.balls[i].x, y: 500 - this.balls[i].y };
            let dist =  Math.sqrt(toNext.x ** 2 + toNext.y ** 2);
            //console.log(i+"  "+this.balls[i].y);
            if (dist >= this.domainRadius - (this.ballRadius+1)) {
                //console.log("borde "+i);
                let scale = (this.domainRadius - (this.ballRadius+1)) / dist; // Factor de escala
                // Normalizamos la dirección (invertimos el vector)
                this.balls[i].x = 500-toNext.x * scale; // Mover en dirección opuesta
                this.balls[i].y = 500-toNext.y * scale; // Mover en dirección opuesta
            }
        }
    }

    avoidOtherBalls() {
        const minDist = this.ballRadius + 1;  // Distancia mínima deseada entre las pelotas
        for (let i = 0; i < this.num; i++) {
            for (let j = i + 1; j < this.num; j++) {
                let dx = this.balls[j].x - this.balls[i].x;
                let dy = this.balls[j].y - this.balls[i].y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                //console.log(i + "-->" + j + ":  " + dist);
    
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
        const minDist = this.length + this.ballRadius + 1;  // Distancia mínima deseada entre el ratón y las pelotas
        for (let i = 0; i < this.num; i++) {
            let dx = this.mousePos.x - this.balls[i].x;
            let dy = this.mousePos.y - this.balls[i].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
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
                // Si prefieres empujar el ratón también, puedes mover la posición del ratón:
                // this.mousePos.x += moveX / 2;
                // this.mousePos.y += moveY / 2;
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

    // Parámetros de la simulación
    const length = 50;
    const num = 100;
    const domainRadius = 100;

    // Crear el motor de física
    const physicsEngine = new PhysicsEngine(length, num, domainRadius);

    // Crear el círculo y dominio en Paper.js
    const circle = new paper.Path.Circle(paper.view.center, length);
    circle.strokeWidth = 0;
    circle.strokeColor = 'black';

    const domain = new paper.Path.Circle(paper.view.center, domainRadius);
    domain.strokeWidth = 5;
    domain.strokeColor = 'black';

    // Crear las bolas en Paper.js
    const paperBalls = [];
    for (let i = 0; i < num; i++) {
        let paperBall = new paper.Path.Circle(paper.view.center.add(new paper.Point(physicsEngine.getBalls()[i].x, physicsEngine.getBalls()[i].y)), 5);
        paperBall.strokeWidth = 6;
        paperBall.strokeColor = 'black';
        paperBall.fillColor = new paper.Color(0.1, 0.1, 0.1);
        paperBalls.push(paperBall);
    }

    // Guardar la posición del mouse
    let mousePos = { x: 0, y: 0 };
    paper.view.onMouseMove = function(event) {
        mousePos = event.point;
    };

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
