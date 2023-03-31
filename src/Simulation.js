export function precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

export function calcPValue(generation){
    if (!generation) return "";
    return precisionRound((2 * generation.AA + generation.Aa) / (2 * (generation.AA + generation.Aa + generation.aa)), 3);
}

export function calcQValue(generation){
    if (!generation) return "";
    return precisionRound(1 - calcPValue(generation), 3);
}

export function generateOffspring(p, q, populationSize, replacement) {
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

export function applyNaturalSelection(offspringPopulation, killRates) {
    const { AA: AA_kill, Aa: Aa_kill, aa: aa_kill } = killRates;
    offspringPopulation.AA = Math.floor(offspringPopulation.AA * (1 - AA_kill));
    offspringPopulation.Aa = Math.floor(offspringPopulation.Aa * (1 - Aa_kill));
    offspringPopulation.aa = Math.floor(offspringPopulation.aa * (1 - aa_kill));

    const newPopulationSize = offspringPopulation.AA + offspringPopulation.Aa + offspringPopulation.aa;
    const newP = (2 * offspringPopulation.AA + offspringPopulation.Aa) / (2 * newPopulationSize);
    const newQ = 1 - newP;

    return { newP, newQ, offspringPopulation };
}