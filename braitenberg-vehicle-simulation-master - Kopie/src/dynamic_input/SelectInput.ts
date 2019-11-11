import BaseInput from './BaseInput';

export default class SelectInput<T> extends BaseInput<T> {
  protected create(): Element {
    const input = document.createElement('select');

    if (!this.config.options) {
      throw new Error('Die Konfiguration "options" muss für die Klasse "SelectInput" definiert sein.');
    }

    const type = this.config.options;

    Object.keys(type).forEach(key => {
      const option = document.createElement('option');
      const isNum = Number.isInteger(type[key]);
      // Das `+` ist hier dazu da, um Integer-Werte später wiedererkennen
      // zu können, da sonst alles in Strings umgewandelt wird.
      option.value = isNum ? `+${type[key]}` : type[key];
      option.innerHTML = key;
      input.appendChild(option);
    });

    const isNum = Number.isInteger(this.value as any);
    input.value = ((isNum ? `+${this.value}` : this.value) as unknown) as string;
    input.addEventListener('change', () => {
      if (input.value.charAt(0) === '+') {
        this.value = (Number(input.value.substr(1)) as unknown) as T;
      } else {
        this.value = (input.value as unknown) as T;
      }
    });

    return input;
  }

  // eslint-disable-next-line
  protected onUpdate(): void {}
}
