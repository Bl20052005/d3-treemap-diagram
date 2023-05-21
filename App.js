fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json")
.then(response => response.json())
.then(videoGameData => {
    fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json")
    .then(response => response.json())
    .then(kickstartData => {
        fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json")
        .then(response => response.json())
        .then(movieSalesData => {

            let colorObject = {};

            let colorInterpolator = d3.interpolateCubehelixLong("#bd0868", "#486321");

            let sumOfAll = 0;
            videoGameData["children"].forEach((elem, index) => {
                elem["children"].forEach(e => {
                    sumOfAll += parseFloat(e["value"]);
                });
                colorObject[elem["name"]] = colorInterpolator(index / videoGameData["children"].length);
            });

            videoGameData["children"].sort((a, b) => {
                let bSum = 0;
                let aSum = 0;
                b["children"].forEach(elem => {
                    bSum += parseFloat(elem["value"]);
                });

                a["children"].forEach(elem => {
                    aSum += parseFloat(elem["value"]);
                });

                return bSum - aSum;
            });

            let resizer = 480000 / sumOfAll;

            let videoGameDataChildren = videoGameData["children"].map(elem => {
                let sum = 0;
                elem["children"].forEach(e => {
                    sum += parseFloat(e["value"]) * resizer;
                });
                return [sum, [elem["name"]]];
            })

            let trueW = 800;
            let trueH = 600;
            let w = trueW;
            let h = trueH;
            let dimensions = [[], [], [], []]; //height, width, x, y

            let svg = d3.select("body").append("svg")
            .attr("id", "svg")
            .attr("width", w + 60)
            .attr("height", h + 60)
            .attr("class", "container")

            let legendSvg = d3.select("body").append("svg")
            .attr("class", "container")
            .attr("id", "legend")
            .attr("width", 400)
            .attr("height", 200)

            legendSvg.selectAll("rect")
            .data(Object.values(colorObject))
            .enter()
            .append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("class", "legend-item")
            .attr("y", (d, i) => i % 6 * 30 + 10)
            .attr("x", (d, i) => Math.floor(i / 6) * 133.3 + 20)
            .attr("fill", (d) => d)

            legendSvg.selectAll("text")
            .data(Object.keys(colorObject))
            .enter()
            .append("text")
            .attr("class", "legend-text")
            .attr("y", (d, i) => i % 6 * 30 + 23)
            .attr("x", (d, i) => Math.floor(i / 6) * 133.3 + 40)
            .text((d) => d)

            const onMouseOver = (e, d) => {
                document.getElementById("tooltip").style.opacity = "0.9";
                document.getElementById("tooltip").style.visibility = "visible";
            }

            const onMouseMove = (e, d) => {
                const [x, y] = d3.pointer(e);
                const left = document.getElementById("svg").getBoundingClientRect().left;
                const top = document.getElementById("svg").getBoundingClientRect().top;
                const toolTip = document.getElementById("tooltip");
                toolTip.style.top = top + y - 110 + "px";
                toolTip.style.left = left + x - 50 + "px";
                toolTip.innerText = `Name: ${d[0]}\nCategory: ${d[1]}\nValue: ${Math.round(d[2] * 100) / 100}`;
                d3.select("#tooltip")
                .attr("data-value", d[2]);
            }
        
            const onMouseLeave = () => {
                document.getElementById("tooltip").style.opacity = "0";
                document.getElementById("tooltip").style.visibility = "hidden";
            }

            let createBoxv2 = (row, width, rowIds, additional) => {

                let sum = 0;
                row.forEach(element => {
                    sum += element;
                });

                if(width == h) {
                    let cur = 0;
                    for(let i = 0; i < row.length; i++) {
                        svg.append("rect")
                        .data([[rowIds[i][0], rowIds[i][1], row[i] / resizer]])
                        .attr("class", "tile " + rowIds[i][1])
                        .attr("id", "id-" + rowIds[i][0].replace(/ /g, "-"))
                        .attr("width", sum / width - 1)
                        .attr("height", row[i] / (sum / width) - 1)
                        .attr("x", additional[0] + trueW - w + 30)
                        .attr("y", additional[1] + cur + 30)
                        .attr("data-name", rowIds[i][0])
                        .attr("data-category", rowIds[i][1])
                        .attr("data-value", row[i] / resizer)
                        .attr("opacity", "0.9")
                        .attr("fill", colorObject[rowIds[i][1]])
                        .on("mouseover", onMouseOver)
                        .on("mousemove", onMouseMove)
                        .on("mouseleave", onMouseLeave)

                        svg.append("text")
                        .attr("x", additional[0] + trueW - w + (sum / width - 1) / 2 + 30)
                        .attr("y", additional[1] + cur + (row[i] / (sum / width) - 1) / 2 + 30)
                        .attr("font-size", (sum / width - 1) / 7)
                        .attr("class", "tile-text")
                        .attr("visibility", sum / width - 1 > 55 ? "visibile" : "hidden")
                        .attr("fill", "#dbdbdb")
                        .attr("text-anchor", "middle")
                        .text(rowIds[i][0].length > 12 ? rowIds[i][0].substring(0, 12) + "..." : rowIds[i][0]);

                        cur += row[i] / (sum / width);
                    }
                } else {
                    let cur = 0;
                    for(let i = 0; i < row.length; i++) {
                        svg.append("rect")
                        .data([[rowIds[i][0], rowIds[i][1], row[i] / resizer]])
                        .attr("class", "tile " + rowIds[i][1])
                        .attr("id", "id-" + rowIds[i][0].replace(/ /g, "-"))
                        .attr("height", sum / width - 1)
                        .attr("width", row[i] / (sum / width) - 1)
                        .attr("x", additional[0] + trueW - w + cur + 30)
                        .attr("y", additional[1] + h - (sum / width) + 30)
                        .attr("data-name", rowIds[i][0])
                        .attr("data-category", rowIds[i][1])
                        .attr("data-value", row[i] / resizer)
                        .attr("opacity", "0.9")
                        .attr("fill", colorObject[rowIds[i][1]])
                        .on("mouseover", onMouseOver)
                        .on("mousemove", onMouseMove)
                        .on("mouseleave", onMouseLeave)

                        svg.append("text")
                        .attr("x", additional[0] + trueW - w + cur + (row[i] / (sum / width) - 1) / 2 + 30)
                        .attr("y", additional[1] + h - (sum / width) + (sum / width - 1) / 2 + 30)
                        .attr("font-size", (row[i] / (sum / width) - 1) / 7)
                        .attr("class", "tile-text")
                        .attr("visibility", row[i] / (sum / width) - 1 > 55 ? "visibile" : "hidden")
                        .attr("fill", "#dbdbdb")
                        .attr("text-anchor", "middle")
                        .text(rowIds[i][0].length > 12 ? rowIds[i][0].substring(0, 12) + "..." : rowIds[i][0]);

                        cur += row[i] / (sum / width);
                    }
                }
            }

            let createBox = (row, width) => {

                let sum = 0;
                row.forEach(element => {
                    sum += element;
                });

                if(width == h) {
                    let cur = 0;
                    for(let i = 0; i < row.length; i++) {
                        dimensions[0].push(row[i] / (sum / width));
                        dimensions[1].push(sum / width);
                        dimensions[2].push(trueW - w);
                        dimensions[3].push(cur);
                        cur += row[i] / (sum / width);
                    }
                } else {
                    let cur = 0;
                    for(let i = 0; i < row.length; i++) {
                        dimensions[0].push(sum / width);
                        dimensions[1].push(row[i] / (sum / width));
                        dimensions[2].push(trueW - w + cur);
                        dimensions[3].push(h - (sum / width));
                        cur += row[i] / (sum / width);
                    }
                }
            }

            let compareRatios = (row, width) => {
                let sum = 0;
                row.forEach(element => {
                    sum += element;
                });

                return Math.max(width * width * Math.max(...row) / (sum * sum), (sum * sum) / (Math.min(...row) * width * width));
            }

            let produceWidth = (row, width) => {
                let sum = 0;
                row.forEach(element => {
                    sum += element;
                });

                if(w >= h) {
                    w -= sum / width;
                } else {
                    h -= sum / width;
                }

                if(w <= h) {
                    return w;
                } else {
                    return h;
                }
            }
        
            function squarify(children, row, rowIds, width, additional) {
                if(children.length == 1) {
                    if(additional == null) {
                        createBox(row, width);
                        createBox([children[0][0]], produceWidth(row, width));
                    } else {
                        createBoxv2(row, width, rowIds, additional);
                        createBoxv2([children[0][0]], produceWidth(row, width), [children[0][1]], additional);
                    }
                    return;
                }

                let rowWChild = [...row, children[0][0]];

                let rowIdsWChild = [...rowIds, children[0][1]];

                if(row.length == 0 || compareRatios(row, width) >= compareRatios(rowWChild, width)) {
                    children.shift();
                    squarify(children, rowWChild, rowIdsWChild, width, additional);
                } else {
                    if(additional == null) {
                        createBox(row, width);
                    } else {
                        createBoxv2(row, width, rowIds, additional);
                    }

                    squarify(children, [], [], produceWidth(row, width), additional);
                }

            }

            

            squarify(videoGameDataChildren, [], [], h, null);

            // videoGameData["children"].forEach(elem => console.log(document.getElementById("id" + elem["name"]) + elem["name"]))

            videoGameData["children"].forEach((elem, index) => {
                let total = [];
                elem["children"].forEach(e => {
                    total.push([parseFloat(e["value"]) * resizer, [e["name"], elem["name"]]]);
                })

                trueW = dimensions[1][index];
                trueH = dimensions[0][index];
                w = dimensions[1][index];
                h = dimensions[0][index];

                squarify(total, [], [], Math.min(w, h), [dimensions[2][index], dimensions[3][index]]);
            })

            console.log(dimensions);
            
        })
    
        
    });
});