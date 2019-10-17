// eslint-disable-next-line import/prefer-default-export
export function testScreenType(size) {
  const windowWidth = window.innerWidth;

  switch (size) {
    case 'xs':
      return windowWidth < 576;
    case 'sm':
      return windowWidth >= 576;
    case 'md':
      return windowWidth >= 768;
    case 'lg':
      return windowWidth >= 992;
    case 'xl':
      return windowWidth >= 1200;
    case 'xxl':
      return windowWidth >= 1600;
    default:
      return false;
  }
}

export function getWindowHeight() {
  const { body } = document;
  const html = document.documentElement;
  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight,
  );
}

export const HEADER_HEIGHT = 64;
export const DRAWER_WIDTH = 400;
