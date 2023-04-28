import React from "react";
import { precisionRound, calcPValue, calcQValue, generateOffspring, applyNaturalSelection } from "./Simulation";



export default ({data, size, index}) => {
    return data  && (
        <>
        <div style = {{width: 400, display: "-ms-flexbox", overflow: "hidden", margin: "auto", justifyContent: "center", alignItems:"center"}}>
        <div style = {{width: (calcPValue(data) || 0) * 400, height: 50, background: "orange", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
          {calcPValue(data) > 0.2  ? "p=" +  ("" + calcPValue(data).toFixed(2)).substring(1) : "p"}
        </div>
        <div style = {{width: (calcQValue(data)  || 0) * 400, height: 50, background: "purple", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
             {calcQValue(data) > 0.2 ? "q=" + ("" + calcQValue(data).toFixed(2)).substring(1) : "q"}
            </div>
        </div>
        <br />
        <div style = {{width: 400, display: "-ms-flexbox", overflow: "hidden", margin: "auto", justifyContent: "center", alignItems:"center"}}>
        <div style={{width: (data.AA || 0)/size * 400, height: 50, background:"#3E6A39", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
                AA:{data.AA}
            </div>
            <div style={{width: (data.Aa || 0)/size * 400, height: 50, background:"#887B55", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
             Aa:{data.Aa}
            </div>
            <div style={{width: (data.aa || 0)/size * 400, height: 50, background:"#DC4850", display: "inline-flex", margin: 0, color: "white", justifyContent: "center", alignItems: "center"}}>
            aa: {data.aa}
            </div>
            </div>
        </>
    );
}