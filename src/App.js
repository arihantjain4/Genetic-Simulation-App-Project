import { useState } from 'react';
import './App.css';
import { MathComponent } from "mathjax-react";

function precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function generateOffspring(p, q, populationSize, replacement) {
    let offspringPopulation = { AA: 0, Aa: 0, aa: 0 };
    let allelePool = [];

    for (let i = 0; i < populationSize * 2; i++) {
        allelePool.push(i < 2 * p * populationSize ? "A" : "a");
    }

    function getRandomAllele() {
        let index = Math.floor(Math.random() * allelePool.length);
        let allele = allelePool[index];
        if (!replacement) {
            allelePool.splice(index, 1);
        }
        return allele;
    }

    for (let i = 0; i < populationSize; i++) {
        let allele1 = getRandomAllele();
        let allele2 = getRandomAllele();
        let offspring = allele1 + allele2;

        if (offspring === "Aa" || offspring === "aA") {
            offspringPopulation.Aa++;
        } else if (offspring === "AA") {
            offspringPopulation.AA++;
        } else {
            offspringPopulation.aa++;
        }
    }

    let newP = (2 * offspringPopulation.AA + offspringPopulation.Aa) / (2 * populationSize);
    let newQ = 1 - newP;

    return { newP, newQ, offspringPopulation };
}

function applyNaturalSelection(offspringPopulation, killRates) {
    const { AA: AA_kill, Aa: Aa_kill, aa: aa_kill } = killRates;
    offspringPopulation.AA = Math.floor(offspringPopulation.AA * (1 - AA_kill));
    offspringPopulation.Aa = Math.floor(offspringPopulation.Aa * (1 - Aa_kill));
    offspringPopulation.aa = Math.floor(offspringPopulation.aa * (1 - aa_kill));

    const newPopulationSize = offspringPopulation.AA + offspringPopulation.Aa + offspringPopulation.aa;
    const newP = (2 * offspringPopulation.AA + offspringPopulation.Aa) / (2 * newPopulationSize);
    const newQ = 1 - newP;

    return { newP, newQ, offspringPopulation };
}

function App() {
    const [pValue, setPValue] = useState(null);
    const [qValue, setQValue] = useState(null);
    const [initialPopulationSize, setInitialPopulationSize] = useState(null);
    const [generationCount, setGenerationCount] = useState(null);
    const [replacement, setReplacement] = useState(true);
    const [generationData, setGenerationData] = useState([]);
    const [killRates, setKillRates] = useState({ AA: 0, Aa: 0, aa: 0 });
    const [generationIndex, setGenerationIndex] = useState(0);

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

        for (let i = 0; i < generationCount; i++) {
            const { newP, newQ, offspringPopulation } = generateOffspring(currentP, currentQ, initialPopulationSize, replacement);
            generations.push(offspringPopulation);
            currentP = newP;
            currentQ = newQ;
        }

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

        const currentGeneration = generationData[generationIndex]; // after people died
        const {newP, newQ, offspringPopulation} = applyNaturalSelection(currentGeneration, killRates);
        console.log("currentGeneration: " + JSON.stringify(currentGeneration));
        console.log("applyNatural selection return: " + JSON.stringify({newP, newQ, offspringPopulation}));
        if (generationIndex + 1 < generationCount) {
            const {
                newP: nextP,
                newQ: nextQ,
                offspringPopulation: nextOffspringPopulation
            } = generateOffspring(newP, newQ, initialPopulationSize, replacement);
            console.log("nextOffspringPopulation: " + JSON.stringify(nextOffspringPopulation)); // what is displayed (before killing 2nd gen)
            setGenerationData([
                ...generationData.slice(0, generationIndex + 1),
                    nextOffspringPopulation,
                ...generationData.slice(generationIndex + 2),
            ]);
        }

        setPValue(newP);
        setQValue(newQ);
        setGenerationIndex(generationIndex + 1);
    }

    return (
        <div className="App">
            <form onSubmit={handleSubmit}>
                <p>Enter p:</p>
                <input type="number" id="pValue" step="any" onChange={
                    (event) => {
                        if (event.target.value >= 0 && event.target.value <= 1) {
                            document.getElementById('qValue').value = precisionRound(1 - event.target.value, 3);
                        }
                        else {
                            console.log("Invalid");
                        }
                    }
                } />
                <p>Enter q:</p>
                <input type="number" id="qValue" step="any" onChange={
                    (event) => {
                        if (event.target.value >= 0 && event.target.value <= 1) {
                            document.getElementById('pValue').value = precisionRound(1 - event.target.value, 3);
                        }
                        else {
                            console.log("Invalid");
                        }
                    }
                }/>
                <p>Enter initial population size:</p>
                <input type="number" id="initialPopulationSize" step="any" />
                <p>Enter number of generations:</p>
                <input type="number" id="generationCount" step="1" />
                <p>
                    <label>
                        <input type="checkbox" id="replacement" defaultChecked />
                        Sample with replacement
                    </label>
                </p>
                <input type="submit" value="Submit" />
            </form>
            <div>
                <h2>Generation {generationIndex + 1}</h2>
                {/*<p>*/}
                {/*    p: {generationData[generationIndex] ? generationData[generationIndex][0] : ""}*/}
                {/*</p>*/}
                {/*<p>*/}
                {/*    q: {generationData[generationIndex] ? generationData[generationIndex][1] : ""}*/}
                {/*</p>*/}
                {/*<p style={{fontSize: 10}}>*/}
                {/*    After natural selection. Input zeros for kill rates to skip natural selection.*/}
                {/*</p>*/}
                <h3>Before Death:</h3>
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
                    Homozygous dominant (AA): {generationData[generationIndex + 1]?.AA}
                </p>
                <p>
                    Heterozygous (Aa): {generationData[generationIndex + 1]?.Aa}
                </p>
                <p>
                    Homozygous recessive (aa): {generationData[generationIndex + 1]?.aa}
                </p>
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
            {/*{generationData.map((generation, index) => (*/}
            {/*    <div key={index}>*/}
            {/*        <h3>Generation {index + 1}</h3>*/}
            {/*        <p>*/}
            {/*            Homozygous dominant (AA): {generation.AA}*/}
            {/*        </p>*/}
            {/*        <p>*/}
            {/*            Heterozygous (Aa): {generation.Aa}*/}
            {/*        <p>*/}
            {/*            Homozygous recessive (aa): {generation.aa}*/}
            {/*        </p>*/}
            {/*    </div>*/}
            {/*))}*/}
        </div>
    );
}

export default App;


