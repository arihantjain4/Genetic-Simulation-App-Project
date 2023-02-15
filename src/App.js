import './App.css';

function App() {
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
            <p id="equation"></p>
            <p id="homozygousDominant"></p>
            <p id="heterozygous"></p>
            <p id="homozygousRecessive"></p>
        </div>
    );
}
function handleSubmit(event) {
    event.preventDefault();
    const pValue = Number(document.getElementById('pValue').value);
    const qValue = Number(document.getElementById('qValue').value);
    const initialPopulationSize = Number(document.getElementById('initialPopulationSize').value);
    document.getElementById('equation').innerHTML = `\(${pValue}^2+2*${pValue}*${qValue}+${qValue}^2=1\)`
    let homozygousDominant = pValue * pValue;
    let heterozygous = 2 * pValue * qValue;
    let homozygousRecessive = qValue * qValue;
    document.getElementById('homozygousDominant').innerHTML = `Gen 1 population that is homozygous dominant: \(${Math.round(homozygousDominant*initialPopulationSize)}\)`;
    document.getElementById('heterozygous').innerHTML = `Gen 1 population that is heterozygous: \(${Math.round(heterozygous*initialPopulationSize)}\)`;
    document.getElementById('homozygousRecessive').innerHTML = `Gen 1 population that is homozygous recessive: \(${Math.round(homozygousRecessive*initialPopulationSize)}\)`;




}

export default App;
