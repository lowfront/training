import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import Masonry from './masonry/Masonry'
import MasonryBox from './masonry/MasonryBox'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Masonry>
        {Array.from({length: 4}, (_, i) => <MasonryBox key={`div-${i}`}>{i}</MasonryBox>)}
      </Masonry>
    </div>
  )
}

export default App
