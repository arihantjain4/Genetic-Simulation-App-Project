import { useState } from 'react';
import './App.css';
import { MathComponent } from "mathjax-react";

function App() {
    const [pValue, setPValue] = useState(null);
    const [qValue, setQValue] = useState(null);
    const [initialPopulationSize, setInitialPopulationSize] = useState(null);
    const [homozygousDominant, setHomozygousDominant ] = useState(0);
    const [heterozygous, setHeterozygous ] = useState(0);
    const [homozygousRecessive, setHomozygousRecessive ] = useState(0);
    const [equationTex, setEquationTex] = useState(``);
    function handleSubmit(event) {

        event.preventDefault();
        const pValue = Number(document.getElementById('pValue').value);
        const qValue = Number(document.getElementById('qValue').value);
        const initialPopulationSize = Number(document.getElementById('initialPopulationSize').value);
        setPValue(pValue);
        setQValue(qValue);
        setInitialPopulationSize(initialPopulationSize);
        setEquationTex(`${pValue}^2+2*${pValue}*${qValue}+${qValue}^2=1`);
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

            <MathComponent tex={equationTex} />
            
            <p id="homozygousDominant">
                Gen 1 population that is <strong>homozygous dominant</strong>:
                {pValue && initialPopulationSize ? <MathComponent tex={`${pValue}^2\\times${initialPopulationSize}=${(pValue*pValue).toFixed(3)}\\times${initialPopulationSize}=${(pValue*pValue*initialPopulationSize).toFixed(3)}`}/> : ""}
            </p>
            <p id="heterozygous">
                Gen 1 population that is <strong>heterozygous</strong>:
                {pValue && qValue && initialPopulationSize ? <MathComponent tex={`2\\times${pValue}\\times${qValue}\\times${initialPopulationSize}=${(2*pValue*qValue).toFixed(3)}\\times${initialPopulationSize}=${(2*pValue*qValue*initialPopulationSize).toFixed(3)}`}/> : ""}
            </p>
            <p id="homozygousRecessive">
                Gen 1 population that is <strong>homozygous recessive</strong>:
                {qValue && initialPopulationSize ? <MathComponent tex={`${qValue}^2\\times${initialPopulationSize}=${(qValue*qValue).toFixed(3)}\\times${initialPopulationSize}=${(qValue*qValue*initialPopulationSize).toFixed(3)}`}/> : ""}
            </p>
        </div>
    );
}

export default App;
