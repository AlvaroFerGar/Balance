function setupDomain(domain, domainRadius) {
    const rect_size = 400;
    const rect = new paper.Path.Rectangle({
    center: paper.view.center,
    
    size: [rect_size, rect_size],
  });
  domain.addChild(rect);
  domain.strokeWidth = 10;
  domain.strokeColor = "blue";
  console.log("domainradius: "+domainRadius*2);
  // Crear cuadrados concéntricos
  const rings = 2; // Número de anillos
  const min_ring_size=100;
  for (let i = 0; i <= rings; i++) {
    const size = (min_ring_size*i/rings+rect_size *(rings - i) / rings); // Tamaño del cuadrado actual
    console.log("size: "+size);
    // Crear los cuatro lados del cuadrado con gaps
    const segments = 4; // Un segmento por lado

    for (let seg = 0; seg < segments; seg++) {

          // Calcular puntos de inicio y fin según el lado
          let start, end;
          console.log("preswitch  seg"+seg+" ring:"+i);
          switch (seg) {
            case 0: // Superior
              start = new paper.Point(
                paper.view.center.x - size / 2,
                paper.view.center.y - size / 2
              );
              end = new paper.Point(
                paper.view.center.x - size / 2 + size,
                paper.view.center.y - size / 2
              );
              break; // Añadido break
              
            case 1: // Derecho
              start = new paper.Point(
                paper.view.center.x + size / 2,
                paper.view.center.y - size / 2
              );
              end = new paper.Point(
                paper.view.center.x + size / 2,
                paper.view.center.y - size / 2 + size
              );
              break; // Añadido break
              
            case 2: // Inferior
              start = new paper.Point(
                paper.view.center.x + size / 2,
                paper.view.center.y + size / 2
              );
              end = new paper.Point(
                paper.view.center.x + size / 2 - size,
                paper.view.center.y + size / 2
              );
              break; // Añadido break
              
            case 3: // Izquierdo
              start = new paper.Point(
                paper.view.center.x - size / 2,
                paper.view.center.y + size / 2
              );
              end = new paper.Point(
                paper.view.center.x - size / 2,
                paper.view.center.y + size / 2 - size
              );
              break; // Añadido break
          }

          console.log("postswitch");
        // Probabilidad 1/5 de crear un gap en el segmento
        if (Math.random() >3) { // 1/5 de probabilidad
            console.log("gap");
            // Posición aleatoria para el gap
            const gapSize = 0.1; // Tamaño del gap (10% del tamaño del cuadrado)
            const gapPosition = Math.random()*gapSize; // Entre 0 y 1

            // Calcular puntos del gap
            const gapStart = new paper.Point(
            start.x + (end.x - start.x) * gapPosition,
            start.y + (end.y - start.y) * gapPosition
            );

            let gapPositionEnd=gapPosition+gapSize;
            const gapEnd = new paper.Point(
            start.x + (end.x - start.x) * (gapPosition+gapSize),
            start.y + (end.y - start.y) * (gapPosition+gapSize)
            );
            console.log(gapPosition+" "+gapPositionEnd);
            // Crear dos segmentos separados por el gap
            const path1 = new paper.Path();
            path1.moveTo(start);
            path1.lineTo(gapStart);
            path1.strokeColor = "black";
            path1.strokeWidth = 3;
            domain.addChild(path1);
            const path2 = new paper.Path();
            path2.moveTo(gapEnd);
            path2.lineTo(end);
            path2.strokeColor = "black";
            path2.strokeWidth = 3;
            domain.addChild(path2);

        } else {
            console.log("no-gap");
            // Si no hay gap, crear el segmento completo
            const path = new paper.Path();
            path.moveTo(start);
            path.lineTo(end);
            path.strokeColor = "black";
            path.strokeWidth = 3;
            domain.addChild(path);
        }

        }
      }
    }

function loadLevelName() {  return "level1"; }
