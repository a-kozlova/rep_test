import BaseInput from './BaseInput';

export default class NumberInput extends BaseInput<number> {
  private inputElement: HTMLInputElement | null = null;

  protected create(): Element {
    const input = document.createElement('input');
    const min = this.config.min !== undefined ? this.config.min : -Infinity;
    const max = this.config.max !== undefined ? this.config.max : Infinity;

    input.type = 'number';
    input.step = this.config.step || 'any';
    input.min = min;
    input.max = max;

    input.value = this.toString(this.value);
    input.addEventListener('change', () => {
      if (Number.isNaN(input.value as any)) {
        input.reportValidity();
        return;
      }

      const value = Number(input.value);

      if (value >= min && value <= max) {
        this.value = Number(input.value);
      }

      input.reportValidity();
    });

    this.inputElement = input;

    return input;
  }

  protected onUpdate(): void {
    if (this.inputElement) {
      this.inputElement.value = this.toString(this.value);
    }
  }

  protected toString(value: number): string {
    if (this.config.toFixed) {
      return value.toFixed(this.config.toFixed);
    }

    return value.toString();
  }
}
