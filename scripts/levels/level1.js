// Clase MazeConstructor para manejar la configuración detallada
class MazeConstructor {

  static TOP_SEGMENT = 0;
  static RIGHT_SEGMENT = 1;
  static BOTTOM_SEGMENT = 2;
  static LEFT_SEGMENT = 3;

  constructor({
    centerX,
    centerY,
    rectSize = 400,
    minRingSize = 100,
    numRings = 2,
    strokeWidth = 3,
    domainStrokeWidth = 10
  }) {
    this.center = new paper.Point(centerX, centerY);
    this.rectSize = rectSize;
    this.minRingSize = minRingSize;
    this.numRings = numRings;
    this.strokeWidth = strokeWidth;
    this.domainStrokeWidth = domainStrokeWidth;
    this.gaps = [];
    this.excludedSegments = [];
  }

  // Añadir un gap específico
  addGap(ring, segment, position, size) {
    this.gaps.push({ ring, segment, position, size });
  }

  // Excluir un segmento completo
  excludeSegment(ring, segment) {
    this.excludedSegments.push({ ring, segment });
  }

  // Calcular el tamaño del anillo basado en su índice
  calculateRingSize(ringIndex) {
    return (
      (this.minRingSize * ringIndex) / this.numRings +
      (this.rectSize * (this.numRings - ringIndex)) / this.numRings
    );
  }

  // Calcular puntos de inicio y fin de un segmento
  calculateSegmentPoints(size, segment) {
    let start, end;
    
    switch (segment) {
      case MazeConstructor.TOP_SEGMENT:
        start = new paper.Point(
          this.center.x - size / 2,
          this.center.y - size / 2
        );
        end = new paper.Point(
          this.center.x + size / 2,
          this.center.y - size / 2
        );
        break;
        
      case MazeConstructor.RIGHT_SEGMENT: 
        start = new paper.Point(
          this.center.x + size / 2,
          this.center.y - size / 2
        );
        end = new paper.Point(
          this.center.x + size / 2,
          this.center.y + size / 2
        );
        break;
        
      case MazeConstructor.BOTTOM_SEGMENT: 
        start = new paper.Point(
          this.center.x + size / 2,
          this.center.y + size / 2
        );
        end = new paper.Point(
          this.center.x - size / 2,
          this.center.y + size / 2
        );
        break;
        
      case MazeConstructor.LEFT_SEGMENT:
        start = new paper.Point(
          this.center.x - size / 2,
          this.center.y + size / 2
        );
        end = new paper.Point(
          this.center.x - size / 2,
          this.center.y - size / 2
        );
        break;
    }
    
    return { start, end };
  }

  // Crear un segmento con gap
  createSegmentWithGap(domain, start, end, gap) {
    const gapStart = new paper.Point(
      start.x + (end.x - start.x) * gap.position,
      start.y + (end.y - start.y) * gap.position
    );

    const gapEnd = new paper.Point(
      start.x + (end.x - start.x) * (gap.position + gap.size),
      start.y + (end.y - start.y) * (gap.position + gap.size)
    );

    // Crear primer segmento
    const path1 = new paper.Path();
    path1.moveTo(start);
    path1.lineTo(gapStart);
    path1.strokeColor = "black";
    path1.strokeWidth = this.strokeWidth;
    domain.addChild(path1);

    // Crear segundo segmento
    const path2 = new paper.Path();
    path2.moveTo(gapEnd);
    path2.lineTo(end);
    path2.strokeColor = "black";
    path2.strokeWidth = this.strokeWidth;
    domain.addChild(path2);
  }

  // Crear un segmento completo
  createFullSegment(domain, start, end) {
    const path = new paper.Path();
    path.moveTo(start);
    path.lineTo(end);
    path.strokeColor = "black";
    path.strokeWidth = this.strokeWidth;
    domain.addChild(path);
  }

  // Método principal para configurar el dominio
  setupDomain(domain) {
    // Crear rectángulo base
    const rect = new paper.Path.Rectangle({
      center: this.center,
      size: [this.rectSize, this.rectSize],
    });
    domain.addChild(rect);
    domain.strokeWidth = this.domainStrokeWidth;
    domain.strokeColor = "black";

    // Crear anillos
    for (let ring = 1; ring <= this.numRings; ring++) {
      const size = this.calculateRingSize(ring);

      // Crear los cuatro lados del cuadrado
      for (let segment = 0; segment < 4; segment++) {
        // Verificar si el segmento está excluido
        if (this.excludedSegments.some(s => s.ring === ring && s.segment === segment)) {
          continue;
        }

        const { start, end } = this.calculateSegmentPoints(size, segment);
        
        // Buscar si hay un gap definido para este segmento y anillo
        const gap = this.gaps.find(g => g.ring === ring && g.segment === segment);

        if (gap) {
          this.createSegmentWithGap(domain, start, end, gap);
        } else {
          this.createFullSegment(domain, start, end);
        }
      }
    }
  }
}

// Función wrapper que mantiene la interfaz original
function setupDomain(domain, domainRadius) {
  console.log("domainradius: " + domainRadius * 2);
  
  const maze = new MazeConstructor({
    centerX: paper.view.center.x,
    centerY: paper.view.center.y,
    rectSize: 400,
    minRingSize: 100,
    numRings: 2
  });

  // Aquí puedes configurar gaps específicos si lo deseas
  // Por ejemplo:
  maze.addGap(1, MazeConstructor.RIGHT_SEGMENT, 0.5, 1/3);  // Añade un gap en el primer anillo, segmento superior
  maze.addGap(1, MazeConstructor.LEFT_SEGMENT, 0.5, 1/3);  // Añade un gap en el primer anillo, segmento superior
  maze.addGap(2, MazeConstructor.TOP_SEGMENT, 0.5, 1/2);  // Añade un gap en el primer anillo, segmento superior
  maze.addGap(2, MazeConstructor.BOTTOM_SEGMENT, 0.5, 1/2);  // Añade un gap en el primer anillo, segmento superior

  //maze.excludeSegment(1, MazeConstructor.BOTTOM_SEGMENT);     // Excluye el segmento derecho del segundo anillo
  //maze.excludeSegment(2, MazeConstructor.TOP_SEGMENT);

  maze.setupDomain(domain);
}

function loadLevelName(){return "level1";};
