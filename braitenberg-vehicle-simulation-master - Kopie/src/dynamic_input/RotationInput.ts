import BaseInput from './BaseInput';

export default class RotationInput extends BaseInput<number> {
  private inputElement: HTMLInputElement | null = null;

  private canvasElement: HTMLCanvasElement | null = null;

  private size: number = 50;

  private radius: number = this.size / 2;

  private showInDegree: boolean = true;

  protected create(): Element {
    const root = document.createElement('div');
    const canvas = this.createCanvas();
    this.canvasElement = canvas;

    this.addEvents(canvas);

    const input = document.createElement('input');
    input.value = (this.value as unknown) as string;
    input.addEventListener('change', () => {
      const radians = (((Number(input.value) + 180) % 360) * Math.PI) / 180;
      this.value = radians;
      input.blur();
    });

    this.inputElement = input;

    this.onUpdate();

    root.append(canvas, input);

    return root;
  }

  private draw(): void {
    const ctx = this.canvasElement!.getContext('2d') as CanvasRenderingContext2D;
    const { radius } = this;
    const { lineWidth } = ctx;

    // Das ist notwendig, damit die Anzeige auch mit der Ausrichtung des Vehikels
    // übereinstimmt. Da bei 0 Radians das Vehikel "nach unten" zeigt.
    const radians = this.value + Math.PI / 2;

    const x = radius + radius * Math.cos(radians);
    const y = radius + radius * Math.sin(radians);

    // clear
    ctx.clearRect(0, 0, this.size, this.size);
    ctx.beginPath();

    // draw circle
    ctx.arc(radius, radius, radius - lineWidth / 2, 0, 2 * Math.PI);

    // draw radian
    ctx.moveTo(radius, radius);
    ctx.lineTo(x, y);

    ctx.fill();
    ctx.stroke();
  }

  protected onUpdate(): void {
    if (document.activeElement !== this.inputElement) {
      // "+ 180", da 0 Grad nach oben zeigen sollten. In der Welt zeigt 0 Grad aber nach unten.
      const degree = (Math.round((this.value * 180) / Math.PI) + 180) % 360;
      this.inputElement!.value = degree.toFixed(2);
    }
    this.draw();
  }

  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.size;
    canvas.height = this.size;
    canvas.style.cursor = 'pointer';

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'transparent';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
    }

    return canvas;
  }

  private addEvents(canvas: HTMLCanvasElement): void {
    let mousedown = false;
    let mouseenter = false;

    canvas.addEventListener('mousedown', event => {
      if (event.button) return;

      mouseenter = true;
      mousedown = true;
      this.setByEvent(event);
    });
    canvas.addEventListener('mousemove', event => {
      if (mousedown && mouseenter) {
        this.setByEvent(event);
      }
    });
    canvas.addEventListener('mouseup', () => {
      mousedown = false;
    });
    canvas.addEventListener('mouseleave', () => {
      mouseenter = false;
    });
    canvas.addEventListener('mouseenter', () => {
      mouseenter = true;
    });
  }

  private setByEvent(event: MouseEvent): void {
    const x = event.offsetX - this.radius;
    const y = event.offsetY - this.radius;
    const radian = Math.atan2(y, x);

    this.value = radian - Math.PI / 2;

    this.draw();
  }
}
