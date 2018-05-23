
export function extractMatrix(element, property) {


  const array = window.getComputedStyle(element).transform.split(',');
  
  if(property === 'x') {
    const x = array[ array.length - 2 ]
    return (+x);
  }

  if(property === 'y') {
    const y = array[ array.length - 1 ]
    return (+y);
  }
}