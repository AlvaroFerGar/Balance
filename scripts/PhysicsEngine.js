class PhysicsEngine {
    constructor(mouseAuraRadius, num, domainRadius, ballRadius, domain) {
        this.mouseAuraRadius = mouseAuraRadius;
        this.numOfBalls = num;
        this.domainRadius = domainRadius;
        // Actualizar al nuevo centro
        this.domainCenterX = paper.view.center.x;
        this.domainCenterY = paper.view.center.y;  
        // Estado de las bolas
        this.balls = [];
        this.mousePos = { x: 0, y: 0 };
        this.ballDiameter = ballRadius*2;

        this.domain=domain;

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
        const minDistance = this.ballDiameter;
        let createdBalls = 0;
        for (let i = 0; i < this.numOfBalls; i++) {
            let validPosition = false;
            let maxAttempts = 1000; // Evita bucle infinito
            let x_ball, y_ball;

            while (!validPosition && maxAttempts > 0) {
                let angle = Math.random() * 2 * Math.PI;
                let distance = Math.random() * (this.domainRadius);
                x_ball = this.domainCenterX + Math.cos(angle) * distance;
                y_ball = this.domainCenterY + Math.sin(angle) * distance;
                maxAttempts--;

                // Verifica si la nueva posición está lo suficientemente lejos de las bolas existentes
                validPosition = true;
                for (let j = 0; j < createdBalls; j++) {
                    let dx = x_ball - this.balls[j].x;
                    let dy = y_ball - this.balls[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // Si encontró una posición válida, crea la bola
            if (validPosition) {
                createdBalls++;
                let ball = new Ball(x_ball, y_ball, this.ballDiameter);
                this.balls.push(ball);
            }
            else
            {
                console.warn("No se pudo crear una bola!!");
            }
        }


    }

    // Integración de Verlet
    verletIntegrate(ball) {
        var temp_x = ball.x;
        var temp_y = ball.y;
        ball.x += (ball.x - ball.prev_x)*0;//desactivado
        ball.y += (ball.y - ball.prev_y)*0;//desactivado
        ball.prev_x = temp_x;
        ball.prev_y = temp_y;
    }

    // Actualización de la física
    update(mousePos, domain, paperBalls) {
        //Actualiza el dominio
        this.domain=domain;
        // Actualizar las posiciones de las bolas con física
        let g_max = 9.81;
        for (let i = 0; i < this.numOfBalls; i++) {
            this.verletIntegrate(this.balls[i]);
            // Gravedad
            for(let g=g_max;g>0;g--)
            {
                let new_y=this.balls[i].y + g;
                if(this.updateBallTheoricPosition(i,this.balls[i].x,new_y))
                {
                    break;
                }
            }
        }
        //Evita ratón y bolas
        for (let iter = 0; iter < 5; iter++) {
            this.mousePos = mousePos;
            this.avoidMouse();
            this.avoidOtherBalls();
        }
        //Evita el 
        for (let i = 0; i < paperBalls.length; i++) {
            let ghostBall = new paper.Path.Circle({
                center: new paper.Point(this.balls[i].x , this.balls[i].y),
                radius: this.balls[i].diameter*0.5,
                fillColor: 'black',
                opacity: 0.5,
                strokeWidth: 1,
                strokeColor: 'black',
                fillColor: new paper.Color(0.1, 0.1, 0.1,0)
            });
            ghostBall.visible = false;
            // Opcional: hacer que el círculo desaparezca después de un tiempo
            setTimeout(() => {
                ghostBall.remove();
            }, 50);
//            if (this.domain.contains(this.balls[i])) {
//                paperBalls[i].position.x = this.balls[i].x;
//                paperBalls[i].position.y = this.balls[i].y;
//            }
            //this.updateBallPosition(i, paperBalls[i]);
            this.checkAndResolveCollision(i, ghostBall);
            this.updateBallPosition(i, paperBalls[i]);
        }
    }


    checkValidBallPosition(ballIndex,x,y, domain) {

        const collision_domain_margin=1;
        const collision_balls_margin=5;

        this.domain=domain;
        //Chequea el ball estaría dentro del domain
        let ball_posc = new paper.Point(x, y)
        if(!domain.contains(ball_posc)) {
            return false;
        }
        let closest_domain_point = this.domain.getNearestPoint(ball_posc);
        let dist_to_domain = Math.sqrt((ball_posc.x - closest_domain_point.x) ** 2 + (ball_posc.y - closest_domain_point.y) ** 2); 
        if (dist_to_domain < (this.balls[ballIndex].diameter-collision_domain_margin)) {
            return false;
        }
        //Chequea que no colisione con otras bolas
        for (let i = 0; i < this.numOfBalls; i++) {
            if (i === ballIndex) continue;
            
            let dx = x - this.balls[i].x;
            let dy = y - this.balls[i].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            const minDist = Math.max(this.balls[ballIndex].diameter, this.balls[i].diameter);
            
            if (dist < (minDist-collision_balls_margin)) {
                return false;
            }
        }

        return true;
    }



    avoidOtherBalls() {
        for (let i = 0; i < this.numOfBalls; i++) {
            for (let j = i + 1; j < this.numOfBalls; j++) {
                let dx = this.balls[j].x - this.balls[i].x;
                let dy = this.balls[j].y - this.balls[i].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                const minDist = Math.max(this.balls[i].diameter,this.balls[j].diameter) + 3;  // Distancia mínima deseada entre las pelotas
                // Si la distancia entre las pelotas es menor que la mínima
                if (dist < minDist) {
                    // Calcular el vector de corrección (normalizado)
                    let overlap = minDist - dist;  // Qué tan lejos están de la distancia mínima
                    let scale = overlap / dist;  // Proporción del movimiento necesario
    
                    // Mover las pelotas para evitar el cruce
                    let moveX = dx * scale;
                    let moveY = dy * scale;
    
                    //let collisionMarker = new paper.Path.Circle({
                    //    center: new paper.Point((this.balls[j].x + this.balls[i].x)*0.5, (this.balls[j].y + this.balls[i].y)*0.5),
                    //    radius: 2,
                    //    fillColor: 'red',
                    //    opacity: 0.5
                    //});
                    //
                    //// Opcional: hacer que el círculo desaparezca después de un tiempo
                    //setTimeout(() => {
                    //    collisionMarker.remove();
                    //}, 200);


                    console.log(dist);
                    // Ajustar las posiciones de las pelotas
                    let new_i_x=this.balls[i].x - moveX / 2;
                    let new_i_y=this.balls[i].y - moveY / 2;
                    let new_j_x=this.balls[j].x + moveX / 2;
                    let new_j_y=this.balls[j].y + moveY / 2;
                    if(dist>this.balls[i].diameter)
                    {
                        this.updateBallTheoricPosition(i,new_i_x,new_i_y);
                        this.updateBallTheoricPosition(j,new_j_x,new_j_y);
                    }
                    else
                    {
                        this.balls[i].x = new_i_x;
                        this.balls[i].y = new_i_y;
                        this.balls[j].x = new_j_x;
                        this.balls[j].y = new_j_y;
                    }
                }
            }
        }
    }

    avoidMouse() {
        for (let i = 0; i < this.numOfBalls; i++) {
            let dx = this.mousePos.x - this.balls[i].x;
            let dy = this.mousePos.y - this.balls[i].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.mouseAuraRadius + this.balls[i].diameter*0.5 + 1;  // Distancia mínima deseada entre el ratón y las pelotas    
            // Si la distancia entre la pelota y el ratón es menor que la mínima
            if (dist < minDist) {
                // Calcular el vector de corrección (normalizado)
                let overlap = minDist - dist;  // Qué tan lejos están de la distancia mínima
                let scale = overlap / dist;  // Proporción del movimiento necesario
                
                // Mover la pelota para evitar el ratón
                let moveX = dx * scale;
                let moveY = dy * scale;
    
                // Ajustar la posición de la pelota
                let new_x=this.balls[i].x - (moveX*1.2) / 2;
                let new_y=this.balls[i].y - (moveY*1.2) / 2;

                this.updateBallTheoricPosition(i,new_x,new_y);

            }
        }
    }

    
    updateBallTheoricPosition(index, new_x, new_y) {
        //Si ya estaba mal se aplica el cambio
        //if(!this.checkValidBallPosition(index, this.balls[index].x, this.balls[index].y, this.domain)) {
        //    this.balls[index].x = new_x;
        //    this.balls[index].y = new_y;
        //    return true;
        //}
        //Si el cambio es bueno se aplica
        if (this.checkValidBallPosition(index, new_x, new_y, this.domain)) {
            this.balls[index].x = new_x;
            this.balls[index].y = new_y;
            return true;
        }
        //Si el cambio es bueno en y se aplica
        if (new_y!=this.balls[index].y && this.checkValidBallPosition(index, this.balls[index].x, new_y, this.domain)) {
            this.balls[index].y = new_y;
            return true;
        }
        //Si el cambio es bueno en x se aplica
        if (new_x!=this.balls[index].x && this.checkValidBallPosition(index, new_x, this.balls[index].y, this.domain)) {
            this.balls[index].x = new_x;
            return true;
        }
        return false;
    }

    updateBallPosition(index, paperBall) {
        // Calculamos la diferencia de posición
        const dx = (this.balls[index].x - this.balls[index].prev_x)*0.5;
        const dy = (this.balls[index].y - this.balls[index].prev_y)*0.5;

        // Calculamos la magnitud del desplazamiento
        const MIN_MOVEMENT = 0.5;//De momento desactivado
        let min_valid_movement=(Math.abs(dx)>MIN_MOVEMENT||Math.abs(dy)>MIN_MOVEMENT);
        let new_x=Math.round(this.balls[index].x+this.balls[index].prev_x)*0.5;
        let new_y=Math.round(this.balls[index].y+this.balls[index].prev_y)*0.5;
        
        if (!min_valid_movement){
            new_x = this.balls[index].prev_x;
            new_y = this.balls[index].prev_y;
        }

        //Clausla de reset al centro si una bola se sale del dominio
        if(!this.domain.contains(new paper.Point(new_x , new_y))) {
            new_x = this.domainCenterX;
            new_y = this.domainCenterY;
        }

        this.balls[index].x = new_x;
        this.balls[index].y = new_y;
        paperBall.position.x = this.balls[index].x;
        paperBall.position.y = this.balls[index].y;
    }

    revertPosition(index, paperBall) {
        paperBall.position.x = this.balls[index].prev_x;
        paperBall.position.y = this.balls[index].prev_y;
        this.balls[index].x = this.balls[index].prev_x;
        this.balls[index].y = this.balls[index].prev_y;
    }

    checkAndResolveCollision(index, paperBall) {
        let collisionPoint = this.domain.getNearestPoint(paperBall.position);
        let dist = paperBall.position.getDistance(collisionPoint);
        
        if (dist < this.balls[index].diameter) {
            //let collisionMarker = new paper.Path.Circle({
            //    center: collisionPoint,
            //    radius: 5,
            //    fillColor: 'green',
            //    opacity: 0.7
            //});
            //
            //// Opcional: hacer que el círculo desaparezca después de un tiempo
            //setTimeout(() => {
            //    collisionMarker.remove();
            //}, 1000);
            this.resolveCollision(index, collisionPoint);
        }
    }

    resolveCollision(ballIndex, obstacle) {
        console.log("colision "+ballIndex);
        let dx = obstacle.x - this.balls[ballIndex].x;
        let dy = obstacle.y - this.balls[ballIndex].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (this.balls[ballIndex].diameter)+1;  // Distancia mínima deseada entre la pelota y el punto de intersección

        // Calcular el vector de corrección (normalizado)
        let overlap = minDist - dist;  // Qué tan lejos están de la distancia mínima
        let scale = overlap / dist;  // Proporción del movimiento necesario

        // Mover la pelota para evitar el cruce
        let moveX = dx * scale*2;//Potenciado para evitar clipping en esquina
        let moveY = dy * scale*2;//Potenciado para evitar clipping en esquina

        let new_x=this.balls[ballIndex].x - moveX / 2;     
        let new_y=this.balls[ballIndex].y - moveY / 2;
        //Aquí no se comprueba
        this.balls[ballIndex].x=new_x;
        this.balls[ballIndex].y=new_y;
        //this.updateBallTheoricPosition(ballIndex, new_x, new_y);
    }

    getBalls() {
        return this.balls;
    }
}
