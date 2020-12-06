import React from 'react';
import * as fcl from '@onflow/fcl'
import DappExample from './DappExample'
import SwapBox from './components/SwapBox'
import SideBar from './components/SideBar'
import './App.css'

window.fcl = fcl
fcl.config().put(
  "challenge.handshake", "http://localhost:8701/flow/authenticate"
)

function App() {
  return (
    <div className="App" style = {{margin: 0, padding: 0,
      backgroundImage: 'conic-gradient(from 116.8deg at 50.06% 50%, #C6DAE7 -19.22deg, #CCF3F2 21.54deg, #DFF3EA 64.81deg, #D9E5DC 133.06deg, #B1CDDD 195.48deg, #BEBCDA 287.76deg, #C6DAE7 340.78deg, #CCF3F2 381.54deg)',
      }}>
      {/* <DappExample/> */}

      
      <SwapBox/>
    </div>
  );
}

export default App;
 