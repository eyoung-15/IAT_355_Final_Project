import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import _ from "https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm";

async function drawEightiesChart() {
    // d3.select("#eighties-chart").html("");
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        actual: +d["Actual Gross Income (USD)"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 1980 && d.endYear <= 1989);


    // Sort descending
    df.sort((a, b) => b.actual - a.actual);

    const svg = d3.select("#eighties-chart").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.actual)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = 20000000;
    const maxY = Math.ceil(d3.max(df, d => d.actual) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.actual))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.actual))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Actual Income:</strong> $${d.actual.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("actual gross income (usd)");

}

window.addEventListener("DOMContentLoaded", () => {
    drawEightiesChart();
});

document.getElementById("show80sactual").addEventListener("click", () => {
    document.getElementById("eighties-chart").style.display = "block";
    document.getElementById("eighties-chart-adjusted").style.display = "none";
    document.getElementById("eighties-chart-tickets").style.display = "none";
    drawEightiesChart();
});



async function drawEightiesadjustedChart() {
    // d3.select("#eighties-chart-adjusted").html("");
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        adjusted: +d["Adjusted Gross Income (2024 USD)"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 1980 && d.endYear <= 1989);


    // Sort descending
    df.sort((a, b) => b.adjusted - a.adjusted);

    const svg = d3.select("#eighties-chart-adjusted").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.adjusted)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = 20000000;
    const maxY = Math.ceil(d3.max(df, d => d.adjusted) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.adjusted))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.adjusted))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Inflation Adjusted Income:</strong> $${d.adjusted.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("inflation adjusted gross income (2024 usd)");

}

document.getElementById("show80sadjusted").addEventListener("click", () => {
    document.getElementById("eighties-chart").style.display = "none";
    document.getElementById("eighties-chart-adjusted").style.display = "block";
    document.getElementById("eighties-chart-tickets").style.display = "none";
    drawEightiesadjustedChart();
});

async function drawEightiesticketsChart() {
    // d3.select("#eighties-chart").html("");
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        tickets: +d["Tickets Sold"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 1980 && d.endYear <= 1989);


    // Sort descending
    df.sort((a, b) => b.tickets - a.tickets);

    const svg = d3.select("#eighties-chart-tickets").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yMax = d3.max(df, d => d.tickets);
    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = Math.ceil(yMax / 5);
    const yTicks = d3.range(0, yMax + tickInterval, tickInterval);

    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.tickets))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.tickets))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Tickets Sold:</strong> ${d.tickets.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format(".2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("tickets sold");

}

document.getElementById("show80stickets").addEventListener("click", () => {
    document.getElementById("eighties-chart").style.display = "none";
    document.getElementById("eighties-chart-adjusted").style.display = "none";
    document.getElementById("eighties-chart-tickets").style.display = "block";
    drawEightiesticketsChart();
});




async function drawNinetiesChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        actual: +d["Actual Gross Income (USD)"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 1990 && d.endYear <= 1999);


    // Sort descending
    df.sort((a, b) => b.actual - a.actual);

    const svg = d3.select("#nineties-chart").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.actual)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = 40000000;
    const maxY = Math.ceil(d3.max(df, d => d.actual) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);

    const color = d3.scaleOrdinal()
        .domain(df.map(d => d.Tour))
        .range(d3.schemeTableau10);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.actual))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.actual))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Actual Income:</strong> $${d.actual.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("actual gross income (usd)");

}

window.addEventListener("DOMContentLoaded", () => {
    drawNinetiesChart();
});

document.getElementById("show90sactual").addEventListener("click", () => {
    document.getElementById("nineties-chart").style.display = "block";
    document.getElementById("nineties-chart-adjusted").style.display = "none";
    document.getElementById("nineties-chart-tickets").style.display = "none";
    drawNinetiesChart();
});

async function drawNinetiesadjustedChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        adjusted: +d["Adjusted Gross Income (2024 USD)"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 1990 && d.endYear <= 1999);


    // Sort descending
    df.sort((a, b) => b.adjusted - a.adjusted);

    const svg = d3.select("#nineties-chart-adjusted").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.adjusted)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = 20000000;
    const maxY = Math.ceil(d3.max(df, d => d.adjusted) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.adjusted))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.adjusted))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Inflation Adjusted Income:</strong> $${d.adjusted.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("inflation adjusted gross income (2024 usd)");

}

document.getElementById("show90sadjusted").addEventListener("click", () => {
    document.getElementById("nineties-chart").style.display = "none";
    document.getElementById("nineties-chart-adjusted").style.display = "block";
    document.getElementById("nineties-chart-tickets").style.display = "none";
    drawNinetiesadjustedChart();
});

async function drawNinetiesticketsChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        tickets: +d["Tickets Sold"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 1990 && d.endYear <= 1999);


    // Sort descending
    df.sort((a, b) => b.tickets - a.tickets);

    const svg = d3.select("#nineties-chart-tickets").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yMax = d3.max(df, d => d.tickets);
    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = Math.ceil(yMax / 5);
    const yTicks = d3.range(0, yMax + tickInterval, tickInterval);

    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.tickets))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.tickets))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Tickets Sold:</strong> ${d.tickets.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format(".2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("tickets sold");

}

document.getElementById("show90stickets").addEventListener("click", () => {
    document.getElementById("nineties-chart").style.display = "none";
    document.getElementById("nineties-chart-adjusted").style.display = "none";
    document.getElementById("nineties-chart-tickets").style.display = "block";
    drawNinetiesticketsChart();
});

async function drawY2kChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        actual: +d["Actual Gross Income (USD)"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 2000 && d.endYear <= 2009);


    // Sort descending
    df.sort((a, b) => b.actual - a.actual);

    const svg = d3.select("#two-thousands-chart").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.actual)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = 50000000;
    const maxY = Math.ceil(d3.max(df, d => d.actual) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);

    const color = d3.scaleOrdinal()
        .domain(df.map(d => d.Tour))
        .range(d3.schemeTableau10);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.actual))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.actual))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Actual Income:</strong> $${d.actual.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("actual gross income (usd)");

}

window.addEventListener("DOMContentLoaded", () => {
    drawY2kChart();
});

document.getElementById("show2000sactual").addEventListener("click", () => {
    document.getElementById("two-thousands-chart").style.display = "block";
    document.getElementById("two-thousands-chart-adjusted").style.display = "none";
    document.getElementById("two-thousands-chart-tickets").style.display = "none";
    drawY2kChart();
});

async function drawY2kadjustedChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        adjusted: +d["Adjusted Gross Income (2024 USD)"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 2000 && d.endYear <= 2009);


    // Sort descending
    df.sort((a, b) => b.adjusted - a.adjusted);

    const svg = d3.select("#two-thousands-chart-adjusted").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.adjusted)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = 20000000;
    const maxY = Math.ceil(d3.max(df, d => d.adjusted) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.adjusted))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.adjusted))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Inflation Adjusted Income:</strong> $${d.adjusted.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("inflation adjusted gross income (2024 usd)");

}

document.getElementById("show2000sadjusted").addEventListener("click", () => {
    document.getElementById("two-thousands-chart").style.display = "none";
    document.getElementById("two-thousands-chart-adjusted").style.display = "block";
    document.getElementById("two-thousands-chart-tickets").style.display = "none";
    drawY2kadjustedChart();
});

async function drawY2kticketsChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        tickets: +d["Tickets Sold"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 2000 && d.endYear <= 2009);


    // Sort descending
    df.sort((a, b) => b.tickets - a.tickets);

    const svg = d3.select("#two-thousands-chart-tickets").html("")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yMax = d3.max(df, d => d.tickets);
    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = Math.ceil(yMax / 5);
    const yTicks = d3.range(0, yMax + tickInterval, tickInterval);

    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.tickets))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.tickets))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Tickets Sold:</strong> ${d.tickets.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format(".2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("tickets sold");

}

document.getElementById("show2000stickets").addEventListener("click", () => {
    document.getElementById("two-thousands-chart").style.display = "none";
    document.getElementById("two-thousands-chart-adjusted").style.display = "none";
    document.getElementById("two-thousands-chart-tickets").style.display = "block";
    drawY2kticketsChart();
});

async function draw2010sChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        actual: +d["Actual Gross Income (USD)"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 2010 && d.endYear <= 2019);


    // Sort descending
    df.sort((a, b) => b.actual - a.actual);

    const svg = d3.select("#twenty-tens-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.actual)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = 100000000;
    const maxY = Math.ceil(d3.max(df, d => d.actual) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);

    const color = d3.scaleOrdinal()
        .domain(df.map(d => d.Tour))
        .range(d3.schemeTableau10);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.actual))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.actual))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Actual Income:</strong> $${d.actual.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            // Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("actual gross income (usd)");

}

draw2010sChart();

async function draw2020sChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }



    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        Label: `${d["Tour Name"]}\n${d["Artist Name "]}`,
        actual: +d["Actual Gross Income (USD)"].replace(/,/g, ""),
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
    }))
        .filter(d => d.endYear >= 2020 && d.endYear <= 2025);


    // Sort descending
    df.sort((a, b) => b.actual - a.actual);

    const svg = d3.select("#twenty-twenties-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Label))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.actual)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const tickInterval = 150000000;
    const maxY = Math.ceil(d3.max(df, d => d.actual) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);

    const color = d3.scaleOrdinal()
        .domain(df.map(d => d.Tour))
        .range(d3.schemeTableau10);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Label))
        .attr("y", d => yScale(d.actual))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.actual))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${d.Tour}<br/>
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Years:</strong> ${d.startYear} - ${d.endYear}<br/>
                <strong>Actual Income:</strong> $${d.actual.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", "#4C46C9");
        });



    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const [tour, artist] = d.split("\n");
            const text = d3.select(this);

            // Tour name lines
            const tourLines = wrapText(tour.toLowerCase(), 18);
            tourLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "white")
                    .style("font-size", "10px")
                    .style("font-weight", "600");
            });

            //Artist name lines
            const artistLines = wrapText(artist.toLowerCase(), 18);
            artistLines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", tourLines.length === 0 && i === 0 ? 0 : 10)
                    .style("fill", "#CA6CDC")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2s"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("concert tour");


    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("actual gross income (usd)");

}

draw2020sChart();

async function drawAllTimeChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset.csv");
    const width = 1400;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 200, left: 250 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");

    const df = dataset.map(d => ({
        Tour: d["Tour Name"],
        Artist: d["Artist Name "],
        startYear: +d["Year Start"],
        endYear: +d["Year End"],
        actual: +d["Actual Gross Income (USD)"].replace(/,/g, ""),
        adjusted: +d["Adjusted Gross Income (2024 USD)"].replace(/,/g, "")
    }));

    df.sort((a, b) => b.adjusted - a.adjusted);

    const svg = d3.select("#alltime-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");


    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Tour))
        .range([margin.left, width - margin.right])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => Math.max(d.actual, d.adjusted))])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain(["actual", "adjusted"])
        .range(["#CA6CDC", "#4C46C9"]);


    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("rx", 8);


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
        .attr("fill", d => color(d.key))
        .on("mouseover", function (event, d, i) {
            const parentData = d3.select(this.parentNode).datum();
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);

            tooltip.html(`
                <strong>Tour:</strong> ${parentData.Tour}<br/>
                <strong>Artist:</strong> ${parentData.Artist}<br/>
                <strong>Years:</strong> ${parentData.startYear} - ${parentData.endYear}<br/>
                <strong>${d.key.charAt(0).toUpperCase() + d.key.slice(1)}:</strong> $${d.value.toLocaleString()}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");

            d3.select(this).attr("fill", "#fff");
        })
        .on("mousemove", function (event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);

            d3.select(this).attr("fill", color(d.key));
        });


    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // xAxis.selectAll("text")
    //     .style("fill", "white")
    //     .style("font-size", "10px")
    //     .attr("text-anchor", "end")
    //     .attr("transform", "rotate(-90)")
    //     .attr("dx", "-0.5em")
    //     .attr("dy", "-0.5em");
    // 

    xAxis.selectAll("text")
        .style("display", "none");


    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("fill", "white")
        .style("font-size", "14px")
        .attr("dx", -10);


    // svg.append("text")
    //     .attr("x", width / 2)
    //     .attr("y", height - 60)
    //     .attr("text-anchor", "middle")
    //     .style("fill", "white")
    //     .style("font-size", "14px")
    //     .text("concert tours");

    svg.append("text")
        .attr("x", -height / 3)
        .attr("y", 80)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("gross income (usd)");


    const legend = svg.append("g")
        .attr("transform", `translate(${width - 240}, ${margin.top + 20})`);

    const legendItems = ["actual gross income (usd)", "adjusted gross income (2024 usd)"];

    legend.selectAll("circle")
        .data(legendItems)
        .join("circle")
        .attr("cx", 0)
        .attr("cy", (_, i) => i * 35)
        .attr("r", 7)
        .attr("fill", d => color(d.toLowerCase()));

    legend.selectAll("text")
        .data(legendItems)
        .join("text")
        .attr("x", 15)
        .attr("y", (_, i) => i * 35 + 5)
        .text(d => d)
        .style("fill", "white")
        .style("font-size", "10px");
}

drawAllTimeChart();

async function drawGreedyArtistsChart() {
    const dataset = await d3.csv("datasets/Concert_Dataset_2.csv");
    const width = 1000;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 200, left: 150 };
    const borderPadding = 10;

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "#1f2937")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-family", "Inter, sans-serif");


    function wrapText(text, maxChars) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";
        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + " ";
                } else {
                    lines.push(word);
                    currentLine = "";
                }
            } else {
                currentLine += word + " ";
            }
        });
        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }

    const df = dataset
        .map(d => ({
            Artist: d["Artist_Name "],
            price: +d.Average_Ticket_Price,
        }))
        .filter(d => d.price >= 148.5 && d.price <= 300)
        .sort((a, b) => b.price - a.price);

    const svg = d3.select("#greedy_artist_chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("font-family", "Inter, sans-serif");

    const xScale = d3.scaleBand()
        .domain(df.map(d => d.Artist))
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(df, d => d.price)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("rect")
        .attr("x", margin.left - borderPadding)
        .attr("y", margin.top - borderPadding)
        .attr("width", width - margin.left - margin.right + borderPadding * 2)
        .attr("height", height - margin.top - margin.bottom + borderPadding * 2)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

    const color = d3.scaleOrdinal()
        .domain(df.map(d => d.Artist))
        .range(d3.schemeTableau10);

    svg.selectAll("rect.bar")
        .data(df)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.Artist))
        .attr("y", d => yScale(d.price))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.price))
        .attr("fill", "#4C46C9")
        .on("mouseover", function (event, d) {
            tooltip.transition().duration(100).style("opacity", 1);
            tooltip.html(`
                <strong>Artist:</strong> ${d.Artist}<br/>
                <strong>Average Ticket Price:</strong> $${d.price.toFixed(2)}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(this).attr("fill", "#6366F1");
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (event, d) {
            tooltip.transition().duration(200).style("opacity", 0);
            d3.select(this).attr("fill", "#4C46C9");
        });

    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    xAxis.selectAll("text")
        .text("")
        .each(function (d) {
            const text = d3.select(this);
            const lines = wrapText(d.toLowerCase(), 18);
            lines.forEach((line, i) => {
                text.append("tspan")
                    .text(line)
                    .attr("x", -20)
                    .attr("dy", i === 0 ? -20 : 10)
                    .style("fill", "#FFFF")
                    .style("font-size", "10px");
            });
        })
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "end");

    const tickInterval = 20;
    const maxY = Math.ceil(d3.max(df, d => d.price) / tickInterval) * tickInterval;
    const yTicks = d3.range(0, maxY + 1, tickInterval);

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale)
            .tickValues(yTicks)
            .tickFormat(d3.format("$.2f"))
        )
        .selectAll("text")
        .attr("dx", -10)
        .style("fill", "white")
        .style("font-size", "14px");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 50)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("artist");

    svg.append("text")
        .attr("x", - height / 3)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("average cost per ticket (usd)");
}

drawGreedyArtistsChart();