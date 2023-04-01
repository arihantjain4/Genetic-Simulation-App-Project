import { useState } from 'react';
import './App.css';
import { MathComponent } from "mathjax-react";
import { precisionRound, calcPValue, calcQValue, generateOffspring, applyNaturalSelection } from "./Simulation";

function App() {
    const [pValue, setPValue] = useState(null);
    const [qValue, setQValue] = useState(null);
    const [initialPopulationSize, setInitialPopulationSize] = useState(null);
    const [generationCount, setGenerationCount] = useState(null);
    const [replacement, setReplacement] = useState(true);
    const [generationData, setGenerationData] = useState([]);
    const [generationDeathData, setGenerationDeathData] = useState([]);
    const [killRates, setKillRates] = useState({ AA: 0, Aa: 0, aa: 0 });
    const [generationIndex, setGenerationIndex] = useState(0);
    const [generationDeathIndex, setGenerationDeathIndex] = useState(0);

    function handleSubmit(event) {
        event.preventDefault();
        const pValue = Number(document.getElementById('pValue').value);
        const qValue = Number(document.getElementById('qValue').value);
        const initialPopulationSize = Number(document.getElementById('initialPopulationSize').value);
        const generationCount = Number(document.getElementById('generationCount').value);
        const replacement = document.getElementById('replacement').checked;
        let currentP = pValue;
        let currentQ = qValue;
        let generations = [];

        const { newP, newQ, offspringPopulation } = generateOffspring(currentP, currentQ, initialPopulationSize, replacement);
        generations.push(offspringPopulation);
        console.log("generations: " + JSON.stringify(generations));
        setPValue(pValue);
        setQValue(qValue);
        setInitialPopulationSize(initialPopulationSize);
        setGenerationCount(generationCount);
        setReplacement(replacement);
        setGenerationData(generations);
        console.log("Generation # " + generationIndex + ": " + pValue + " " + qValue);
    }
    function handleNaturalSelectionSubmit(event) {
        event.preventDefault();
        const AA_kill = Number(document.getElementById('AA_kill').value) / 100;
        const Aa_kill = Number(document.getElementById('Aa_kill').value) / 100;
        const aa_kill = Number(document.getElementById('aa_kill').value) / 100;

        const killRates = {AA: AA_kill, Aa: Aa_kill, aa: aa_kill};
        setKillRates(killRates);

        const currentGeneration = generationDeathData[generationDeathIndex-1] != null ? generationDeathData[generationDeathIndex-1] : generationData[generationIndex]; // after people died
        const {newP, newQ, offspringPopulation} = applyNaturalSelection(currentGeneration, killRates);
        console.log("currentGeneration: " + JSON.stringify(currentGeneration));
        console.log("applyNatural selection return: " + JSON.stringify({newP, newQ, offspringPopulation})); // after killing first gen
        if (generationIndex + 1 < generationCount) {
            const {
                newP: nextP,
                newQ: nextQ,
                offspringPopulation: nextOffspringPopulation
            } = generateOffspring(newP, newQ, initialPopulationSize, replacement);
            setGenerationDeathData([...generationDeathData, offspringPopulation]);
            setGenerationData([...generationData, nextOffspringPopulation]);
            console.log("Generation Death Data: " + JSON.stringify(generationDeathData));
            console.log("Generation Death Index: " + generationDeathIndex);
        }

        setPValue(newP);
        setQValue(newQ);
        setGenerationIndex(generationIndex + 1);
        setGenerationDeathIndex(generationDeathIndex + 1);
    }

    return (
        <div className="App">
            <h1>
                hardy-weinberg visualization
            </h1>
            <div className="main">
                <div className="forms">
                    <form onSubmit={handleSubmit}>
                        <div className="alleleFrequency">
                            <p>p:</p>
                            <input className="roundInputSmall" type="number" id="pValue" step="any" onChange={
                                (event) => {
                                    if (event.target.value >= 0 && event.target.value <= 1) {
                                        document.getElementById('qValue').value = precisionRound(1 - event.target.value, 3);
                                    }
                                    else {
                                        console.log("Invalid");
                                    }
                                }
                            } />
                            <p>q:</p>
                            <input className="roundInputSmall" type="number" id="qValue" step="any" onChange={
                                (event) => {
                                    if (event.target.value >= 0 && event.target.value <= 1) {
                                        document.getElementById('pValue').value = precisionRound(1 - event.target.value, 3);
                                    }
                                    else {
                                        console.log("Invalid");
                                    }
                                }
                            }/>
                        </div>
                        <p>initial population size</p>
                        <input className="roundInput" type="number" id="initialPopulationSize" step="any" />
                        <p>number of generations</p>
                        <input className="roundInput" type="number" id="generationCount" step="1" />
                        <p>
                            <label>
                                <input type="checkbox" id="replacement" defaultChecked />
                                Sample with replacement
                            </label>
                        </p>
                        <input type="submit" value="Submit" />
                    </form>
                    <form onSubmit={handleNaturalSelectionSubmit}>
                        <p>Enter kill rate (%) for AA:</p>
                        <input type="number" id="AA_kill" step="any" />
                        <p>Enter kill rate (%) for Aa:</p>
                        <input type="number" id="Aa_kill" step="any" />
                        <p>Enter kill rate (%) for aa:</p>
                        <input type="number" id="aa_kill" step="any" />
                        <button id="previousGeneration" onClick={
                            (event) => {
                                event.preventDefault();
                                if (generationIndex > 0) {
                                    setGenerationIndex(generationIndex - 1);
                                }
                            }
                        }>
                            Back
                        </button>
                        <input type="submit" value="Next Generation" />

                    </form>
                </div>
                <div className="stats">
                    <h2>Generation {generationIndex + 1}</h2>

                    <h3>Before Death:</h3>
                    <p>
                        p: {calcPValue(generationData[generationIndex])}
                    </p>
                    <p>
                        q: {calcQValue(generationData[generationIndex])}
                    </p>
                    <p>
                        Homozygous dominant (AA): {generationData[generationIndex]?.AA}
                    </p>
                    <p>
                        Heterozygous (Aa): {generationData[generationIndex]?.Aa}
                    </p>
                    <p>
                        Homozygous recessive (aa): {generationData[generationIndex]?.aa}
                    </p>
                    <h3>After Death:</h3>
                    <p>
                        p: {calcPValue(generationDeathData[generationDeathIndex-1])}
                    </p>
                    <p>
                        q: {calcQValue(generationDeathData[generationDeathIndex-1])}
                    </p>
                    <p>
                        Homozygous dominant (AA): {generationDeathData[generationDeathIndex-1]?.AA}
                    </p>
                    <p>
                        Heterozygous (Aa): {generationDeathData[generationDeathIndex-1]?.Aa}
                    </p>
                    <p>
                        Homozygous recessive (aa): {generationDeathData[generationDeathIndex-1]?.aa}
                    </p>
                </div>
            </div>



        </div>
    );
}

export default App;


