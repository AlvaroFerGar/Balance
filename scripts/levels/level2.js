function setupDomain(domain,domainRadius) {
    const circle = new paper.Path.Circle({
        center: paper.view.center,
        radius: domainRadius
    });
    domain.addChild(circle);
    domain.strokeWidth = 10;
    domain.strokeColor = 'red';
}
function loadLevelName(){return "level2";};