import { useEffect, useState } from 'react';
import './App.css';
import { MathComponent } from "mathjax-react";
import { precisionRound, calcPValue, calcQValue, generateOffspring, applyNaturalSelection } from "./Simulation";
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import {Chart, scales} from "chart.js";
// Chart.defaults.global.defaultFontFamily = 'Plus Jakarta Sans';


function App() {


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


    useEffect(() => {
        setGenerationViewing(generationIndex);
        setGenerationDeathViewing(generationDeathIndex);
    }, [generationIndex, generationDeathIndex])
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
    function handleSubmit(event) {
        event.preventDefault();
       const pValue = pValueEntry
        const qValue = qValueEntry;
        const initialPopulationSize = Number(document.getElementById('initialPopulationSize').value);
        const generationCount = Number(document.getElementById('generationCount').value);

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
                            {/* <button type="button" className="replacementYes" style={{
                                marginRight: "25px"
                            }} onClick={() => {
                                setReplacement(true);
                                document.getElementsByClassName('replacementYes')[0].style.backgroundColor = "#cecece";
                                document.getElementsByClassName('replacementNo')[0].style.backgroundColor = "#fff";
                            }}>
                                yes
                            </button>
                            <button type="button" className="replacementNo" onClick={() => {
                                setReplacement(false);
                                document.getElementsByClassName('replacementNo')[0].style.backgroundColor = "#cecece";
                                document.getElementsByClassName('replacementYes')[0].style.backgroundColor = "#fff";
                            }}>
                                no
                            </button> */}
                        </div>
                        <input type="submit" value="submit" className="initialSubmit" />
                    </form>
                    <form onSubmit={handleNaturalSelectionSubmit} className="naturalSelectionForm">
                        <p>kill rate % for <span style={{color: "#3E6A39"}}>homozygous dominant</span> (AA) </p>
                        <input type="number" id="AA_kill" step="any" className="roundInput"/>
                        <p>kill rate % for <span style={{color: "#887B55"}}>heterozygous</span> (Aa) </p>
                        <input type="number" id="Aa_kill" step="any" className="roundInput"/>
                        <p>kill rate % for <span style={{color: "#DC4850"}}>homozygous recessive</span> (Aa) </p>
                        <input type="number" id="aa_kill" step="any" className="roundInput" />
                        <div style={{
                            marginTop: "15px"
                        }}>
                            <button className="backButton" type="button" id="previousGeneration" onClick={
                                (event) => {
                                    event.preventDefault();
                                    if (generationIndex > 0) {
                                        setGenerationIndex(generationIndex - 1);
                                    }
                                }
                            } style={{
                                marginRight: "10px"
                            }}>
                                back
                            </button>
                            <input type="submit" value="next generation" className="initialSubmit" onClick={(event) => {
                                if (generationIndex >= generationCount-1) {
                                    event.preventDefault();
                                }
                            }
                            }/>
                        </div>
                    </form>
                </div>
                <div className="stats">
                    <h2> 
                        <button className='change' disabled = {generationViewing == 0} onClick={() => {
                            setGenerationViewing(prev => Math.max(0, prev - 1));
                            setGenerationDeathViewing(prev => Math.max(1, prev - 1));
                        }}> {"<"} Prev </button>  
                        Generation <span className="purpleText">{generationViewing + 1}</span>
                        <button disabled = {generationViewing == generationIndex} className = 'change' onClick={() => {
                            setGenerationViewing(prev => prev + 1);
                            setGenerationDeathViewing(prev => prev + 1);
                        }}>  Next {">"}</button> 
                        </h2>
                    <div style = {{display: "grid", gridTemplateColumns: "repeat(2, auto)", columnGap: 50}}>
                    <div className="beforeDeathStats" style={{marginBottom: "25px"}}>
                        <h3>Before Death:</h3>
                        <div style = {{width: 200, display: "-ms-flexbox", overflow: "hidden", margin: "auto", justifyContent: "center", alignItems:"center"}}>
                        <div style = {{width: (calcPValue(generationData[generationViewing]) || 0) * 200, height: 50, background: "orange", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
                          {calcPValue(generationData[generationViewing]) > 0.2  ? "p=" +  ("" + calcPValue(generationData[generationViewing]).toFixed(2)).substring(1) : "p"}
                        </div>
                        <div style = {{width: (calcQValue(generationData[generationViewing])  || 0) * 200, height: 50, background: "purple", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
                             {calcQValue(generationData[generationViewing]) > 0.2 ? "q=" + ("" + calcQValue(generationData[generationViewing]).toFixed(2)).substring(1) : "q"}
                            </div>
                        </div>
                        {/* <p>
                            p: <span className="purpleText">{calcPValue(generationData[generationIndex])}</span>
                        </p>
                        <p>
                            q: <span className="purpleText">{calcQValue(generationData[generationIndex])}</span>
                        </p> */}
                        <p>
                            homozygous dominant (AA): <span className="purpleText"> {generationData[generationIndex]?.AA}</span>
                        </p>
                        <p>
                            heterozygous (Aa): <span className="purpleText"> {generationData[generationIndex]?.Aa}</span>
                        </p>
                        <p>
                            homozygous recessive (aa): <span className="purpleText"> {generationData[generationIndex]?.aa}</span>
                        </p>
                    </div>
                    <div className="afterDeathStats">
                        <h3>After Death:</h3>
                        <div style = {{width: 200, display: "-ms-flexbox", overflow: "hidden", margin: "auto", justifyContent: "center", alignItems:"center"}}>
                        <div style = {{width: (calcPValue(generationDeathData[generationDeathViewing - 1]) || 0) * 200, height: 50, background: "orange", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
                          {calcPValue(generationDeathData[generationDeathViewing - 1]) > 0.2  ? "p=" +  ("" + calcPValue(generationDeathData[generationDeathViewing - 1]).toFixed(2)).substring(1) : "p"}
                        </div>
                        <div style = {{width: (calcQValue(generationDeathData[generationDeathViewing - 1])  || 0) * 200, height: 50, background: "purple", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
                             {calcQValue(generationDeathData[generationDeathViewing - 1]) > 0.2 ? "q=" + ("" + calcQValue(generationDeathData[generationDeathViewing - 1]).toFixed(2)).substring(1) : "q"}
                            </div>
                        </div>
                        <p>
                            homozygous dominant (AA): <span className="purpleText">{generationDeathData[generationDeathIndex-1]?.AA}</span>
                        </p>
                        <p>
                            heterozygous (Aa): <span className="purpleText">{generationDeathData[generationDeathIndex-1]?.Aa}</span>
                        </p>
                        <p>
                            homozygous recessive (aa): <span className="purpleText">{generationDeathData[generationDeathIndex-1]?.aa}</span>
                        </p>
                    </div>
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
                        {generationData.length > 0 && generationData[generationIndex].AA >= 1 ? [...Array(generationData[generationIndex].AA)].map((e, i) => {
                            return <img width="30" height="30" src={require("./assets/greenman.svg").default} alt="AA" className="AA"/>
                        }) : null}
                        {generationData.length > 0 && generationData[generationIndex].Aa >= 1 ? [...Array(generationData[generationIndex].Aa)].map((e, i) => {
                            return <img width="30" height="30" src={require("./assets/brownman.svg").default} alt="Aa" className="Aa"/>
                        }) : null}
                        {generationData.length > 0 && generationData[generationIndex].aa >= 1 ? [...Array(generationData[generationIndex].aa)].map((e, i) => {
                            return <img width="30" height="30" src={require("./assets/redman.svg").default} alt="aa" className="aa"/>
                        }) : null}
                    </div>
                </div>
            </div>}
        </div>
    );
}

export default App;


