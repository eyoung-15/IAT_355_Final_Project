import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import _ from "https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm";

async function drawVis() {
    const dataset = await d3.csv("../datasets/Concert_Dataset.csv", d3.autoType);
    const width = 1400;
    const height = 600;
    const margin = { top: 30, right: 30, bottom: 200, left: 250 };

    const svg = d3.select("#alltime-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        actual: +d["Actual Gross Income (USD)"].replace(/[^0-9.-]/g, ""),
        adjusted: +d["Adjusted Gross Income (2024 USD)"].replace(/[^0-9.-]/g, "")
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