const setUp = {
    "width": 15,
    "height": 15,
    "mines": 40
}
document.documentElement.style.setProperty('--width', setUp.width);
document.documentElement.style.setProperty('--height', setUp.height);

const grid = document.getElementById('grid')
const info = document.querySelector("#info p")

let flagged = setUp.mines
info.textContent = "x" + flagged
let flaggedSquares = []

const colors = {
    "green": ["AAD751", "A2D149", "9AC940"],
    "brown": ["E5C29F", "D7B899"],
    "mine": ["DB3236", "F4C20E", "ED44B5", "F4840E", "008744", "4885ED", "48E6F1"]
}
const nums = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight'
}

let clusterLocations;
let borderLocations;

let mineLocations = [];

let playing = true;

document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

function getCluster(startSquareId) {
    const visited = new Set();
    const cluster = [];
    const queue = [startSquareId];

    while (queue.length > 0) {
        const currentId = queue.shift();

        if (visited.has(currentId)) continue;

        const currentSquare = document.getElementById(currentId);
        if (!currentSquare) continue;

        if (currentSquare.classList.contains('mine')) continue;

        const textContent = currentSquare.querySelector('.text').textContent;
        if (textContent !== '') continue;

        visited.add(currentId);
        cluster.push(currentId);

        const [x, y] = currentId.split("|").map(Number);
        const surroundingSquares = [
            [x - 1, y - 1].join("|"),
            [x, y - 1].join("|"),
            [x + 1, y - 1].join("|"),
            [x - 1, y].join("|"),
            [x + 1, y].join("|"),
            [x - 1, y + 1].join("|"),
            [x, y + 1].join("|"),
            [x + 1, y + 1].join("|")
        ];

        for (const surroundingId of surroundingSquares) {
            if (!visited.has(surroundingId)) {
                queue.push(surroundingId);
            }
        }
    }

    return cluster;
}

function findAllClusters() {
    const allClusters = [];
    const processedSquares = new Set();

    const squares = document.querySelectorAll('.square');

    for (const square of squares) {
        const squareId = square.id;

        if (processedSquares.has(squareId) ||
            square.classList.contains('mine') ||
            square.querySelector('.text').textContent !== '') {
            continue;
        }

        const cluster = getCluster(squareId);

        if (cluster.length > 0) {
            allClusters.push(cluster);
            cluster.forEach(id => processedSquares.add(id));
        }
    }

    return allClusters;
}

function createBoard() {
    for (let y = 0; y < setUp.height; y++) {
        for (let x = 0; x < setUp.width; x++) {
            const square = document.createElement('div')
            square.classList.add('square')
            square.id = (x + 1).toString() + "|" + (y + 1).toString()

            square.style.backgroundColor = '#' + colors.green[Math.floor(Math.random() * colors.green.length)]
            square.style.opacity = 0.8 - (Math.random() * 0.2) + 0.2

            let text = document.createElement('p')
            text.classList.add('text')

            square.addEventListener("click", function () {
                if (!playing) {
                    return
                }
                if (square.classList.contains('mine')) {
                    playing = false
                    square.style.backgroundColor = square.getAttribute("mine-color")
                    for (let i = 0; i < mineLocations.length; i++) {
                        setTimeout(() => {

                            grid.style.animation = "none";
                            grid.offsetWidth;
                            grid.style.animation = "shake 0.2s 1 ease";

                            document.getElementById(mineLocations[i]).style.backgroundColor = document.getElementById(mineLocations[i]).getAttribute("mine-color")

                            setTimeout(() => {
                                grid.style.animation = ""
                            }, 200)

                        }, i * 210)
                    }

                } else {

                    if (square.classList.contains('revealed')) return

                    if (clusterLocations.includes(square.id)) {
                        let all = []
                        borderLocations[findAllClusters().findIndex(cluster => cluster.includes(square.id))].forEach(id => all.push(document.getElementById(id)))
                        getCluster(square.id).forEach(id => all.push(document.getElementById(id)))

                        grid.style.animation = "shake 0.2s 1 ease"

                        for (let i = 0; i < all.length; i++) {
                            setTimeout(() => {
                                all[i].classList.add('revealed')
                                all[i].querySelector('.text').style.display = 'block'
                                all[i].style.backgroundColor = '#' + colors.brown[Math.floor(Math.random() * colors.brown.length)]
                            }, i * 10)
                        }

                        setTimeout(() => {
                            grid.style.animation = ""
                        }, 200)
                    } else {
                        square.classList.add('revealed')
                        square.querySelector('.text').style.display = 'block'
                        square.style.backgroundColor = '#' + colors.brown[Math.floor(Math.random() * colors.brown.length)]
                    }

                }
            })

            square.addEventListener("contextmenu", function (e) {
                e.preventDefault();

                if (!square.classList.contains('revealed')) {
                    if (playing) {
                        if (square.classList.contains('flagged')) {
                            square.classList.remove('flagged')

                            flagged++;
                            info.textContent = "x" + flagged
                            flaggedSquares.splice(flaggedSquares.indexOf(square.id), 1)
                        } else {
                            square.classList.add('flagged')

                            flagged--;
                            info.textContent = "x" + flagged
                            flaggedSquares.push(square.id)

                            if (flagged === 0) {
                                let sortedA = [...flaggedSquares].sort();
                                let sortedB = [...mineLocations].sort();

                                if (sortedA.every((val, index) => val === sortedB[index]) === true) {
                                    playing = false
                                    grid.style.animation = "1s linear 0s infinite running swing"
                                }
                            }
                        }
                    }
                }
            });

            square.appendChild(text)
            grid.appendChild(square)
        }
    }
}

function createMines() {
    while (mineLocations.length < setUp.mines) {
        let minePos = (Math.floor(Math.random() * setUp.width) + 1).toString() + "|" + (Math.floor(Math.random() * setUp.height) + 1).toString()

        if (!mineLocations.includes(minePos)) {
            mineLocations.push(minePos)
        }
    }
}

function placeMines() {
    for (let i = 0; i < mineLocations.length; i++) {
        document.getElementById(mineLocations[i]).classList.add('mine')
        document.getElementById(mineLocations[i]).setAttribute("mine-color", '#' + colors.mine[Math.floor(Math.random() * colors.mine.length)])
    }
}

function analyse() {
    let squares = document.querySelectorAll('.square')
    for (let i = 0; i < squares.length; i++) {
        if (!squares[i].classList.contains('mine')) {

            let square = squares[i]

            let localMines = 0

            let [x, y] = square.id.split("|").map(Number)

            let surroundingSquares = [
                [x - 1, y - 1].join("|"),
                [x, y - 1].join("|"),
                [x + 1, y - 1].join("|"),
                [x - 1, y].join("|"),
                [x + 1, y].join("|"),
                [x - 1, y + 1].join("|"),
                [x, y + 1].join("|"),
                [x + 1, y + 1].join("|")
            ]

            for (let i = 0; i < surroundingSquares.length; i++) {
                if (document.getElementById(surroundingSquares[i])) {
                    if (document.getElementById(surroundingSquares[i]).classList.contains('mine')) {
                        localMines++
                    }
                }
            }

            square.querySelector('.text').textContent = localMines === 0 ? '' : localMines
            square.querySelector('.text').classList.add(nums[localMines])
            square.querySelector('.text').style.display = 'none'

            if (square.querySelector('.text').textContent === '') {
                square.classList.add("cluster")
            }

        }
    }
}

borderLocations = {};
function clusterBorder() {

    let clusters = findAllClusters().length;

    for (let i = 0; i < clusters; i++) {

        borderLocations[i] = [];

        let locations = findAllClusters()[i]

        locations.forEach(square => {

            let [x, y] = square.split("|").map(Number)

            let surroundingSquares = [
                [x - 1, y - 1].join("|"),
                [x, y - 1].join("|"),
                [x + 1, y - 1].join("|"),
                [x - 1, y].join("|"),
                [x + 1, y].join("|"),
                [x - 1, y + 1].join("|"),
                [x, y + 1].join("|"),
                [x + 1, y + 1].join("|")
            ]

            for (let j = 0; j < surroundingSquares.length; j++) {
                if (document.getElementById(surroundingSquares[j])) {

                    if (!clusterLocations.includes(document.getElementById(surroundingSquares[j]).id)) {
                        if (!borderLocations[i].includes(document.getElementById(surroundingSquares[j]).id)) {
                            borderLocations[i].push(document.getElementById(surroundingSquares[j]).id)
                        }
                    }

                }
            }
        })

    }
}


createBoard()
createMines()
placeMines()
analyse()

clusterLocations = []
findAllClusters().forEach(cluster => cluster.forEach(square => clusterLocations.push(square)));

clusterBorder()