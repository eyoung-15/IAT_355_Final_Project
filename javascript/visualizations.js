import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import _ from "https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm";

async function drawVis() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv", d3.autoType);
    const width = 1400;
    const height = 600;
    const margin = { top: 30, right: 30, bottom: 200, left: 250 };

    const svg = d3.select("#alltime-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        actual: +d["Actual Gross Income (USD)"].replace(/,/g, ""),
        adjusted: +d["Adjusted Gross Income (2024 USD)"].replace(/,/g, "")
    }));


    df.sort((a, b) => b.adjusted - a.adjusted);

    const Tours = df.map(d => d.Tour);


    const xScale = d3.scaleBand()
        .domain(Tours)
        .range([margin.left, width - margin.right])
        .padding(0.5);


    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => Math.max(d.actual, d.adjusted))])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain(["actual", "adjusted"])
        .range(["#00C2A8", "#4C8DFF"]);

    svg.selectAll("g.dot-group")
        .data(df)
        .join("g")
        .attr("class", "dot-group")
        .attr("transform", d => `translate(${xScale(d.Tour)},0)`)
        .selectAll("circle")
        .data(d => [
            { key: "actual", value: d.actual },
            { key: "adjusted", value: d.adjusted }
        ])
        .join("circle")
        .attr("cx", (_, i) => i === 0 ? -10 : 10)
        .attr("cy", d => yScale(d.value))
        .attr("r", 6)
        .attr("fill", d => color(d.key));

    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("fill", "white")
        .style("font-size", "7px")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("dy", "-0.5em")
        .attr("dx", "-0.5em");



    const yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("fill", "white")
        .style("font-size", "12px");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 40)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("Concert Tours");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("Gross Income (USD)");

    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${margin.top})`);

    const legendItems = ["Actual", "Adjusted"];

    legend.selectAll("circle")
        .data(legendItems)
        .join("circle")
        .attr("cx", 0)
        .attr("cy", (_, i) => i * 25)
        .attr("r", 7)
        .attr("fill", d => color(d.toLowerCase()));

    legend.selectAll("text")
        .data(legendItems)
        .join("text")
        .attr("x", 15)
        .attr("y", (_, i) => i * 25 + 5)
        .text(d => d)
        .style("fill", "white")
        .style("font-size", "14px");
}

drawVis();






//80s chart
async function render(){
    const concertData = await d3.csv("datasets/Concert_Dataset_2.csv");

    const vlSpec = vl
        .markBar()
        .data(concertData)

         .transform([{filter: "(datum.Year_End >= 1980) && (datum.Year_End <= 1989)"}])
   
        .encode(
            vl.x().fieldN("Tour_Name").title("Tour").sort("-y"),
            vl.y().fieldQ("Actual_Gross_Income_USD").title("Actual Gross Income"),
            vl.color().field("Tour_Name")
        )
        .width("800")
        .height("300")
        .toSpec();

    await vegaEmbed("#eighties-chart", vlSpec)

    //90s chart
    const vlSpec3 = vl
        .markBar()
        .data(concertData)

         .transform([{filter: "(datum.Year_End >= 1990) && (datum.Year_End <= 1999)"}])
   
        .encode(
            vl.x().fieldN("Tour_Name").title("Tour").sort("-y"),
            vl.y().fieldQ("Actual_Gross_Income_USD").title("Actual Gross Income"),
            vl.color().field("Tour_Name")
        )
        .width("800")
        .height("300")
        .toSpec();

    await vegaEmbed("#nineties-chart", vlSpec3)

    //2000s chart
    const vlSpec4 = vl
        .markBar()
        .data(concertData)

         .transform([{filter: "(datum.Year_End >= 2000) && (datum.Year_End <= 2009)"}])
   
        .encode(
            vl.x().fieldN("Tour_Name").title("Tour").sort("-y"),
            vl.y().fieldQ("Actual_Gross_Income_USD").title("Actual Gross Income"),
            vl.color().field("Tour_Name")
        )
        .width("800")
        .height("300")
        .toSpec();

    await vegaEmbed("#two-thousands-chart", vlSpec4)

    //2010s chart
    const vlSpec5 = vl
        .markBar()
        .data(concertData)

         .transform([{filter: "(datum.Year_End >= 2000) && (datum.Year_End <= 2009)"}])
   
        .encode(
            vl.x().fieldN("Tour_Name").title("Tour").sort("-y"),
            vl.y().fieldQ("Actual_Gross_Income_USD").title("Actual Gross Income"),
            vl.color().field("Tour_Name")
        )
        .width("800")
        .height("300")
        .toSpec();

    await vegaEmbed("#twenty-tens-chart", vlSpec5)

    //2020s chart
    const vlSpec6 = vl
        .markBar()
        .data(concertData)

         .transform([{filter: "(datum.Year_End >= 2000) && (datum.Year_End <= 2009)"}])
   
        .encode(
            vl.x().fieldN("Tour_Name").title("Tour").sort("-y"),
            vl.y().fieldQ("Actual_Gross_Income_USD").title("Actual Gross Income"),
            vl.color().field("Tour_Name")
        )
        .width("800")
        .height("300")
        .toSpec();

    await vegaEmbed("#twenty-twenties-chart", vlSpec6)


    //greedy artist chart
    const vlSpec2 = vl
        .markBar()
        .data(concertData)

         .transform([{filter: "(datum.Average_Ticket_Price >= 148.5) && (datum.Average_Ticket_Price <= 300)"}])
   
        .encode(
            vl.x().fieldN("Artist_Name ").title("Artist").sort("-y"),
            vl.y().fieldQ("Average_Ticket_Price").title("Average Cost Per Ticket (USD)"),
            vl.color().field("Artist_Name ")
        )
        .width("800")
        .height("300")
        .toSpec();

    await vegaEmbed("#greedy_artist_chart", vlSpec2)
}

render();










// async function drawVis2() {
 
//     const dataset = await d3.csv("../datasets/Concert_Dataset_2.csv", d3.autoType);
//     const width = 1400;
//     const height = 600;
//     const marginTop = 30;
//     const marginRight = 30;
//     const marginBottom = 200;
//     const marginLeft = 250;

    

//     const x = d3.scaleBand()
//     .domain(d3.groupSort(dataset, ([d]) => -d.Actual_Gross_Income_USD, (d) => d.Tour_Name))
//     .range([marginLeft, width - marginRight])
//     .padding(0.1);

//     const y = d3.scaleLinear()
//     .domain([0, d3.max(dataset, (d) => d.Actual_Gross_Income_USD)])
//     .range([height - marginBottom, marginTop]);

//     const svg = d3.select("#eighties_chart")
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);

//     svg.append("g")
//         .attr("fill", "steelBlue")
//         .selectAll()
//         .data(dataset)
//         .join("rect")
//             .attr("x", (d) => x(d.Tour_Name))
//             .attr("y", (d) => y(d.Actual_Gross_Income_USD))
//             .attr("height", (d) => y(0) - y(d.Actual_Gross_Income_USD))
//             .attr("width", x.bandWidth());

//     svg.append("g")
//         .attr("transform", `translate(0,${height - marginBottom})`)
//         .call(d3.axisBottom(x).tickSizeOuter(0));

//     svg.append("g")
//         .attr("transform", `translate(${marginLeft},0)`)
//         .call(d3.axisLeft(y).tickFormat((y) => (y*100).toFixed()))
//         .call(g => g.select(".domain").remove())
//         .call(g => g.append("text")
//     .attr("x", -marginLeft)
//     .attr("y", 10)
//     .attr("fill", "currentColor")
//     .attr("text-anchor", "start")
//     .text("Actual Gross Revenue")
//     );

//     return svg.node();
// }



// drawVis2();