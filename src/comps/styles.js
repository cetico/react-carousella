 



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
    transition: 'transform 0.4s ease'
  },
  tile: {
    width: props.tileWidth,
    listStyle: "none",
    display: 'inline-block',
    boxSizing: 'border-box',
    userSelect: 'none',
    padding: '10px'
  },
})