 



export default (props = {}) => ({
  carousel: {
    position: 'relative',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    userSelect: 'none'
  },
  inner: {
    display: 'inline-block',
    transform: 'matrix(1,0,0,1,0,0)',
  },
  tile: {
    width: props.tileWidth,
    listStyle: "none",
    display: 'inline-block',
    boxSizing: 'border-box',
    userSelect: 'none'
  },
})