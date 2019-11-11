import BaseInput from './BaseInput';

export default class HiddenInput extends BaseInput<any> {
  protected showDefaultLabel = false;

  // eslint-disable-next-line
  protected create(): Element {
    const div = document.createElement('div');

    div.style.minHeight = '0px';
    div.style.height = '0px';
    div.style.display = 'none';

    return div;
  }
}
