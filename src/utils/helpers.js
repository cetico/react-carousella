export function getPosition(el) {
  let xPos = 0;
  let yPos = 0;
  let element = el;

  while (element) {
    if (element.tagName === 'BODY') {
      // deal with browser quirks with body/window/document and page scroll
      const xScroll =
          element.scrollLeft || document.documentElement.scrollLeft;
      const yScroll = element.scrollTop || document.documentElement.scrollTop;

      xPos += element.offsetLeft - (xScroll + element.clientLeft);
      yPos += element.offsetTop - (yScroll + element.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += element.offsetLeft - (element.scrollLeft + element.clientLeft);
      yPos += element.offsetTop - (element.scrollTop + element.clientTop);
    }

    element = element.offsetParent;
  }
  return {
    x: xPos,
    y: yPos,
  };
}

export function extractMatrix(element, property) {
  let value;
  const array = window.getComputedStyle(element).transform.split(',');

  if (property === 'x') {
    value = array[array.length - 2];
  }

  if (property === 'y') {
    value = array[array.length - 1];
  }
  return (+value);
}
