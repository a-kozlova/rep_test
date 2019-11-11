import BaseInput from './BaseInput';

export default class TextInput extends BaseInput<string | number> {
  private inputElement: HTMLInputElement | null = null;

  protected create(): Element {
    const input = document.createElement('input');

    input.value = (this.value as unknown) as string;
    input.addEventListener('change', () => {
      this.value = (input.value as unknown) as string;
    });

    this.inputElement = input;

    return input;
  }

  protected onUpdate(): void {
    if (this.inputElement) {
      this.inputElement.value = this.value.toString();
    }
  }
}
