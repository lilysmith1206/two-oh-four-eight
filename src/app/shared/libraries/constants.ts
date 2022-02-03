export const constants = {
  transitions: {
    length: 60 // ms
  },
  tiles: {
    width: 75, // expressed in pixel measurements
    height: 75 // expressed in pixels
  },
  board: {
    border: 10, // in pixels
    margin: 4, // the space between each tile
    width: 4, // in tiles
    height: 4 // in tiles
  }
}

export const boardStylings = {
  light: [
    {backgroundColor: '#DDDDDD', color: 'black'}, // 2^0, or blank cell
    {backgroundColor: '#FFF7DC', color: 'black'}, // 2^1, 2
    {backgroundColor: '#FFEBB5', color: 'black'}, // 2^2, 4
    {backgroundColor: '#FFCE52', color: 'black'}, // 2^3, 8
    {backgroundColor: '#FFA625', color: 'black'}, // 2^4, 16
    {backgroundColor: '#DD8117', color: 'white'}, // 2^5, 32
    {backgroundColor: '#E07020', color: 'white'}, // 2^6, 64
    {backgroundColor: '#EE7D0F', color: 'white'}, // 2^7, 128
    {backgroundColor: '#FFB216', color: 'black'}, // 2^8, 256
    {backgroundColor: '#FED613', color: 'black'}, // 2^9, 512
    {backgroundColor: '#FCEB09', color: 'black'}, // 2^10 1024
    {backgroundColor: '#F1F50A', color: 'black'} // 2^11, 2048
  ],
  dark: [
      {backgroundColor: 'hsl(0, 0%, 17%)', color: 'black'}, // 2^0, or blank cell
      {backgroundColor: 'hsl(46, 100%, 73%)', color: 'black'}, // 2^1, 2
      {backgroundColor: 'hsl(44, 100%, 65%)', color: 'black'}, // 2^2, 4
      {backgroundColor: 'hsl(43, 100%, 46%)', color: 'white'}, // 2^3, 8
      {backgroundColor: 'hsl(36, 100%, 37%)', color: 'white'}, // 2^4, 16
      {backgroundColor: 'hsl(32, 81%, 28%)', color: 'white'}, // 2^5, 32
      {backgroundColor: 'hsl(25, 76%, 30%)', color: 'white'}, // 2^6, 64
      {backgroundColor: 'hsl(30, 88%, 30%)', color: 'white'}, // 2^7, 128
      {backgroundColor: 'hsl(40, 100%, 34%)', color: 'white'}, // 2^8, 256
      {backgroundColor: 'hsl(50, 99%, 34%)', color: 'white'}, // 2^9, 512
      {backgroundColor: 'hsl(56, 98%, 31%)', color: 'white'}, // 2^10 1024
      {backgroundColor: 'hsl(61, 92%, 30%)', color: 'white'} // 2^11, 2048
  ]
};