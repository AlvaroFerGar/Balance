function setupDomain(domain, domainRadius) {
    const rect = new paper.Path.Rectangle({
        center: paper.view.center,
        size: [domainRadius*2, domainRadius*2]
        });
    domain.addChild(rect);
    domain.strokeWidth = 10;
    domain.strokeColor = 'blue';
}
function loadLevelName(){return "level1";};