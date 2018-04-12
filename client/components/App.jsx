import React from 'react'
import ThreeD from './ThreeD/ThreeD'

class App extends React.Component {
  render () {
    return (
      <div className = 'page'>
        <ThreeD />
        <canvas id = 'myCanvas'>
        </canvas>
      </div>
    )
  }
}

export default App
