import { useState } from 'react';
import './App.css';


function App() {
    const [homozygousDominant, setHomozygousDominant ] = useState(0);
     const [heterozygous, setHeterozygous ] = useState(0);
      const [homozygousRecessive, setHomozygousRecessive ] = useState(0);
    function handleSubmit(event) {

        event.preventDefault();
        const pValue = Number(document.getElementById('pValue').value);
        const qValue = Number(document.getElementById('qValue').value);
        const initialPopulationSize = Number(document.getElementById('initialPopulationSize').value);
        document.getElementById('equation').innerHTML = `\(${pValue}^2+2*${pValue}*${qValue}+${qValue}^2=1\)`
        let newHomozygousDominant = pValue * pValue;
        let newHeterozygous = 2 * pValue * qValue;
        let newHomozygousRecessive = qValue * qValue;
        setHomozygousDominant(newHomozygousDominant);
        setHeterozygous(newHeterozygous);
        setHomozygousRecessive(newHomozygousRecessive);
        // document.getElementById('homozygousDominant').innerHTML = `Gen 1 population that is homozygous dominant: \(${Math.round(homozygousDominant*initialPopulationSize)}\)`;
        // document.getElementById('heterozygous').innerHTML = `Gen 1 population that is heterozygous: \(${Math.round(heterozygous*initialPopulationSize)}\)`;
        // document.getElementById('homozygousRecessive').innerHTML = `Gen 1 population that is homozygous recessive: \(${Math.round(homozygousRecessive*initialPopulationSize)}\)`;
    
    
    
    
    }
    return (
        <div className="App">
            <form onSubmit={handleSubmit}>
                <p>Enter p:</p>
                <input type="number" id="pValue" step="any"/>
                <p>Enter q:</p>
                <input type="number" id="qValue" step="any"/>
                <p>Enter initial population size:</p>
                <input type="number" id="initialPopulationSize" step="any"/>
                <input type="submit" value="Submit" />
            </form>
            <p id="equation"> </p>
            
            <p id="homozygousDominant">
                Gen 1 population that is homozygous dominant: {homozygousDominant}
            </p>
            <p id="heterozygous">
                Gen 1 population that is heterozygous: {homozygousRecessive}
            </p>
            <p id="homozygousRecessive">
                Gen 1 population that is homozygous recessive: {homozygousRecessive}
            </p>
        </div>
    );
}

export default App;
