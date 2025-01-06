class RotationKnob {
    constructor(container, onChange) {
        this.container = container;
        this.innerCircle = container.querySelector('.inner-circle');
        this.valueDisplay = container.querySelector('.value');
        this.scrollMsg = container.querySelector('.scroll_msg');
        this.rotation = 0;
        this.onChange = onChange;
        this.freeze=false;

        this.setupEventListeners();
        this.updateKnob();
    }

    updateKnob() {
        const rect = this.container.getBoundingClientRect();
        const angle = (this.rotation - 90) * (Math.PI / 180);
        const radius = rect.width / 2 - 10;

        const x = Math.cos(angle) * radius + rect.width / 2;
        const y = Math.sin(angle) * radius + rect.height / 2;

        this.innerCircle.style.left = x + 'px';
        this.innerCircle.style.top = y + 'px';
        
        const value = this.rotation < 0 ? 360 + this.rotation : this.rotation;
        this.valueDisplay.textContent = value;
        this.onChange?.(this.rotation);
    }

    setupEventListeners() {
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            if(this.freeze) return;
            this.rotation += e.deltaY > 0 ? 1 : -1;
            this.updateKnob();
        });

        this.container.addEventListener('mouseenter', () => {
            if(this.freeze) return;
            this.scrollMsg.style.visibility = 'visible';
            this.scrollMsg.style.opacity = '1';
        });
        
        this.container.addEventListener('mouseleave', () => {
            if(this.freeze) return;
            this.scrollMsg.style.visibility = 'hidden';
            this.scrollMsg.style.opacity = '0';
        });
    }
}