fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json")
.then(response => response.json())
.then(videoGameData => {
    fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json")
    .then(response => response.json())
    .then(kickstartData => {
        fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json")
        .then(response => response.json())
        .then(movieSalesData => {

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

            let videoGameDataChildren = videoGameData["children"].map(elem => {
                let sum = 0;
                elem["children"].forEach(e => {
                    sum += parseFloat(e["value"]) * 300;
                });
                return [sum, [elem["name"]]];
            })

            let sumOfAll = 0;
            videoGameDataChildren.forEach(elem => {
                sumOfAll += elem[0];
            })

            let trueW = 1.4 * Math.sqrt(sumOfAll / 1.4);
            let trueH = Math.sqrt(sumOfAll / 1.4);
            let w = trueW;
            let h = trueH;
            let dimensions = [[], [], [], []]; //height, width, x, y

            let svg = d3.select("body").append("svg")
            .attr("id", "svg")
            .attr("width", w)
            .attr("height", h)

            let createBoxv2 = (row, width, rowIds, additional) => {

                let sum = 0;
                row.forEach(element => {
                    sum += element;
                });

                if(width == h) {
                    let cur = 0;
                    for(let i = 0; i < row.length; i++) {
                        svg.append("rect")
                        .attr("class", "tile")
                        .attr("id", "id" + rowIds[i][0])
                        .attr("width", sum / width - 1)
                        .attr("height", row[i] / (sum / width) - 1)
                        .attr("x", additional[0] + trueW - w)
                        .attr("y", additional[1] + cur)
                        cur += row[i] / (sum / width);
                    }
                } else {
                    let cur = 0;
                    for(let i = 0; i < row.length; i++) {
                        svg.append("rect")
                        .attr("class", "tile")
                        .attr("id", "id" + rowIds[i][0])
                        .attr("height", sum / width - 1)
                        .attr("width", row[i] / (sum / width) - 1)
                        .attr("x", additional[0] + trueW - w + cur)
                        .attr("y", additional[1] + h - (sum / width))
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
                    total.push([parseFloat(e["value"]) * 300, [e["name"]]]);
                })
                total.sort((a, b) => b[0] - a[0]);

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