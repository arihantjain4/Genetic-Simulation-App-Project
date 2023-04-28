import { useEffect, useState } from 'react';
import './App.css';
import { MathComponent } from "mathjax-react";
import { precisionRound, calcPValue, calcQValue, generateOffspring, applyNaturalSelection } from "./Simulation";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import {Chart, scales} from "chart.js";
import Data from "./Data";
// Chart.defaults.global.defaultFontFamily = 'Plus Jakarta Sans';



const App = () => {


    const [pValue, setPValue] = useState(null);
    const [qValue, setQValue] = useState(null);
    const [pValueEntry, setPValueEntry] = useState(0.5);
    const [qValueEntry, setQValueEntry] = useState(0.5);
    const [initialPopulationSize, setInitialPopulationSize] = useState(null);
    const [generationCount, setGenerationCount] = useState(null);
    const [replacement, setReplacement] = useState(true);
    const [generationData, setGenerationData] = useState([]);
    const [generationDeathData, setGenerationDeathData] = useState([]);
    const [killRates, setKillRates] = useState({ AA: 0, Aa: 0, aa: 0 });
    const [generationIndex, setGenerationIndex] = useState(0);
    const [generationDeathIndex, setGenerationDeathIndex] = useState(0);
    const [started, setStarted] = useState(false);
    const [generationViewing, setGenerationViewing] = useState(0);
    const [generationDeathViewing, setGenerationDeathViewing] = useState(0);
    const [size, setSize] = useState(0);


    useEffect(() => {
        setGenerationViewing(generationIndex);
        
    }, [generationIndex])

    useEffect(() => {
        setGenerationDeathViewing(generationDeathIndex);
    }, [generationDeathIndex])


    const [dataValues, setDataValues] = useState({
        labels: [],
        datasets: [
            {
                label: "p",
                data: [],
                fill: false,
                backgroundColor: "#B97D37"
            },
            {
                label: "q",
                data: [],
                fill: false,
                backgroundColor: "#455DB0"
            }
        ]
    });
    const  handleSubmit = (event) => {
        event.preventDefault();
      
        const initialPopulationSize = Number(document.getElementById('initialPopulationSize').value);
        const generationCount = Number(document.getElementById('generationCount').value);

        let currentP = pValueEntry;
        let currentQ = qValueEntry;
        let generations = [];

        const { offspringPopulation } = generateOffspring(currentP, currentQ, initialPopulationSize, replacement);
        generations.push(offspringPopulation);
        setSize(offspringPopulation.AA + offspringPopulation.aa + offspringPopulation.Aa)
        setPValue(pValueEntry);
        setQValue(qValueEntry);
        setInitialPopulationSize(initialPopulationSize);
        setGenerationCount(generationCount);
        setReplacement(replacement);
        setGenerationData(generations);
    }
    const  handleNaturalSelectionSubmit = () => {
      
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
        console.log("Generation (before incrementing) # " + generationIndex + ": " + newP + " " + newQ);
        console.log("Generation data (before incrementing): " + JSON.stringify(generationData));
        setGenerationIndex(generationIndex + 1);
        setDataValues({
            labels: [...dataValues.labels, generationIndex],
            datasets: [
                {
                    label: "p",
                    data: [...dataValues.datasets[0].data, calcPValue(generationData[generationIndex])],
                    fill: false,
                },
                {
                    label: "q",
                    data: [...dataValues.datasets[1].data, calcQValue(generationData[generationIndex])],
                    fill: false,
                }
            ]
        });
        setGenerationDeathIndex(generationDeathIndex + 1);
    }
    return (
        <div className="App">
           
            <div id = "begin"  className = {(started? "start":"notstart")}>

                <h1>
                    Hardy Weinberg Visualization
                </h1>
                <button id = "start" onClick={() => setStarted(prev => !prev)}> 
                Begin
                </button>
            </div>
            {started && 
            <div className="main">
                <div className="forms">
                    <form onSubmit={handleSubmit}>
                        <div className="alleleFrequency" >
                            <p style={{
                                marginRight: "10px",
                                color: "#B97D37"
                            }}>p: <input type = "number" value = {pValueEntry.toFixed(2)} step = "0.01" style = {{width: 50, outline: "none", border: "none", borderBottom: "2px solid blue"}} onChange = {e => {
                                setPValueEntry(+e.target.value);
                                setQValueEntry(1 - +e.target.value);
                            }} /> </p>
                        <input type = {"range"} min = "0" max = "1" step = "0.01" value = {pValueEntry} onChange = {e => {
                            setPValueEntry(+e.target.value);
                            setQValueEntry(1 - +e.target.value);
                        }} required = {true} />
                        </div>
                        <div className='alleleFrequency'>

                            <p style={{
                                marginRight: "10px",
                                color: "#455DB0"
                            }}>q: <input type = "number" value = {qValueEntry.toFixed(2)} step = "0.01" style = {{width: 50, outline: "none", border: "none", borderBottom: "2px solid blue"}} onChange = {e => {
                                setQValueEntry(+e.target.value);
                                setPValueEntry(1 - +e.target.value);
                            }} /> </p>
                           <input type = {"range"} min = "0" max = "1" step = "0.01" value = {qValueEntry} onChange = {e => {
                            setQValueEntry(+e.target.value);
                            setPValueEntry(1 - +e.target.value);
                            }} required = {true} />
                        </div>
                        <p>initial population size</p>
                        <input className="roundInput" type="number" id="initialPopulationSize" step="any" required={true} />
                        <p>number of generations</p>
                        <input className="roundInput" type="number" id="generationCount" step="1" required={true} />
                        <p>
                            sample with replacement
                        </p>
                        <div className="replacementYesNo" style={{marginBottom: "15px"}}>
                            Replacement: <input type = "checkbox" value={{replacement}} onChange = {e => setReplacement(e.target.value)} />
                          
                        </div>
                        <input type="submit" value="submit" className="initialSubmit" />
                    </form>
                  
                        <p> Kill rate % for <span style={{color: "#3E6A39"}}>homozygous dominant</span> (AA) </p>
                        <input 
                            type="number" 
                            value = {killRates.AA} 
                            onChange = {e => {setKillRates(prev => ({...prev, AA: e.target.value}))}} 
                            id="AA_kill" 
                            step="any" 
                            className="roundInput"/>
                        <p> Kill rate % for <span style={{color: "#887B55"}}>heterozygous</span> (Aa) </p>
                        <input 
                            type="number" 
                            value = {killRates.Aa} 
                            onChange = {e => {setKillRates(prev => ({...prev, Aa: e.target.value}))}} 
                            id="AA_kill" 
                            step="any" 
                            className="roundInput"/>
                        <p> Kill rate % for <span style={{color: "#DC4850"}}>homozygous recessive</span> (Aa) </p>
                        <input 
                            type="number" 
                            value = {killRates.aa} 
                            onChange = {e => {setKillRates(prev => ({...prev, AA: e.target.value}))}} 
                            id="AA_kill" 
                            step="any" 
                            className="roundInput"/>
                </div>
                <div className="stats">
                    <h2> 
                        <button className='change' disabled = {generationViewing == 0} onClick={() => {
                            setGenerationViewing(prev => Math.max(0, prev - 1));
                            setGenerationDeathViewing(prev => Math.max(1, prev - 1));
                        }}> {"<"} Prev </button>  
                        Generation <span className="purpleText">{generationViewing + 1}</span>
                        <button disabled = {generationCount > 1 && generationViewing == generationCount - 1} className = 'change' onClick={() => {
                            if (generationIndex == generationViewing && generationViewing < generationCount) {
                            handleNaturalSelectionSubmit();
                            }
                            else {
                                setGenerationViewing(prev => prev + 1);
                                setGenerationDeathViewing(prev => prev + 1);
                            }
                        
                        }}>  Next {">"}</button> 
                        </h2>
                    <div style = {{display: "grid", gridTemplateColumns: "repeat(1, auto)", columnGap: 50}}>
                    <div className="beforeDeathStats" style={{marginBottom: "25px"}}>
                        <h3>Before Death:</h3>
                        <Data index = {generationViewing} data = {generationData[generationViewing]} size = {size} />
                    </div>
                    {/* <div className="afterDeathStats">
                        <h3>After Death:</h3>
                        <Data index = {generationDeathViewing} data = {generationDeathData[generationDeathViewing-1]} size = {size} />
                        /* <p>
                             className="purpleText">{generationDeathData[generationDeathIndex-1]?.AA}</span>
                        </p> 
                     
                    </div> */}
                    </div>
                </div>
                <div className="visuals">
                    <Line height="300px" data={dataValues} options={
                        {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: {
                                    display: true,
                                    labels: {
                                        usePointStyle: true,
                                        generateLabels(chart) {
                                            return chart.data.datasets.map(
                                                (dataset, i) => ({
                                                    text: dataset.label,
                                                    fillStyle: dataset.backgroundColor,
                                                    strokeStyle: dataset.backgroundColor,
                                                    pointStyle: 'circle',
                                                })
                                            )
                                        }

                                    }
                                },

                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Generation',
                                        font: {
                                            size: 12,
                                            weight: 'bold',
                                            family: 'Plus Jakarta Sans',
                                        },
                                        color: '#000'
                                    },
                                    ticks: {
                                        display: true,
                                        font: {
                                            size: 12,
                                            weight: 'bold',
                                            family: 'Plus Jakarta Sans',
                                        },
                                        color: '#000'
                                    },
                                    grid: {
                                        display: false
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Frequency',
                                        font: {
                                            size: 12,
                                            weight: 'bold',
                                            family: 'Plus Jakarta Sans',
                                        },
                                        color: '#000'
                                    },
                                    ticks: {
                                        display: true,
                                        font: {
                                            size: 12,
                                            weight: 'bold',
                                            family: 'Plus Jakarta Sans',
                                        },
                                        color: '#000',
                                        stepSize: 0.1
                                    },
                                    grid: {
                                        display: false
                                    }
                                }
                            }
                        }
                    } style={{marginBottom: "30px"}}/>
                    <div className="population">
                        {generationData.length > 0 && generationData[generationIndex].AA >= 1 ? [...Array(generationData[generationIndex].AA)].map((e, i) => 
                             <img width="30" height="30" src={require("./assets/greenman.svg").default} alt="AA" className="AA"/>
                        ) : null}
                        {generationData.length > 0 && generationData[generationIndex].Aa >= 1 ? [...Array(generationData[generationIndex].Aa)].map((e, i) => 
                             <img width="30" height="30" src={require("./assets/brownman.svg").default} alt="Aa" className="Aa"/>
                        ) : null}
                        {generationData.length > 0 && generationData[generationIndex].aa >= 1 ? [...Array(generationData[generationIndex].aa)].map((e, i) => 
                             <img width="30" height="30" src={require("./assets/redman.svg").default} alt="aa" className="aa"/>
                        ) : null}
                    </div>
                </div>
            </div>}
           
        </div>
    );
}

export default App;


