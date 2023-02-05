const css = ".highlight { z-index: -2; }", head = document.head, style = document.createElement("style")
style.innerHTML = css
head.appendChild(style)

const pieces_name = ["p", "r", "n", "b", "q", "k"] // pawn, rook, knight, bishop, queen, king

function setField(board, square, color, emptyColor, allyColor, enemyColor) {
    const pieces = Array.from(board.getElementsByClassName("square-" + square))

    let containsPiece = false
    let isAlly = false
    let stop = false

    pieces.forEach(piece => {
        Array.from(piece.classList).forEach(class_name => {
            if (class_name.includes("chess-helper-" + color)) {
                stop = true
            }
            if (class_name.includes(color)) {
                isAlly = true
            }
            if (class_name.includes("piece")) {
                containsPiece = true
            }
        })
    })

    if (stop) {
        return containsPiece
    }

    const field = document.createElement("div")
    field.classList.add("chess-helper")
    field.classList.add("chess-helper-" + color)
    field.classList.add("highlight")
    field.classList.add("square-" + square)
    field.style.zIndex = "-1"
    field.style.opacity = "0.5"
    field.style.backgroundColor = isAlly ? allyColor : (containsPiece ? enemyColor : emptyColor)
    board.appendChild(field)

    return containsPiece
}

function getFields(board) {
    return Array.from(board.getElementsByClassName("chess-helper"))
}

function isValid(x, y) {
    return x >= 1 && x <= 8 && y >= 1 && y <= 8
}

let lastPieces = []

function renderColor(board, color, invertColor, invert) {
    chrome.storage.local.get(["FieldsDefendedByAllies", "FieldsDefendedByEnemies", "DefendAllies", "DefendEnemies", "AttackedEnemies", "AttackedAllies"], result => {
        const fieldsDefendedByAllies = result["FieldsDefendedByAllies"]
        const fieldsDefendedByEnemies = result["FieldsDefendedByEnemies"]
        const defendAllies = result["DefendAllies"]
        const defendEnemies = result["DefendEnemies"]
        const attackedEnemies = result["AttackedEnemies"]
        const attackedAllies = result["AttackedAllies"]

        const emptyColor = invertColor === 1 ? (fieldsDefendedByAllies ? "#90FC03" : "transparent") : (fieldsDefendedByEnemies ? "#FF843D" : "transparent")
        const allyColor = invertColor === 1 ? (defendAllies ? "#FFE045" : "transparent") : (defendEnemies ? "#962727" : "transparent")
        const enemyColor = invertColor === 1 ? (attackedEnemies ? "#4D9100" : "transparent") : (attackedAllies ? "#A67100" : "transparent")

        pieces_name.forEach(piece_name => {
            const pieces = Array.from(board.getElementsByClassName(color + piece_name))
            pieces.forEach(piece => {
                const pos = []
                piece.classList.forEach(class_name => {
                    if (class_name.startsWith("square")) {
                        lastPieces.push(class_name)
                        const tmpPos = class_name.substring(7).split("")
                        pos.push(parseInt(tmpPos[0]))
                        pos.push(parseInt(tmpPos[1]))
                        let x
                        let y
                        let i = 1
                        switch (piece_name) {
                            case "p": // -------- PAWN --------
                                x = pos[0] - 1
                                y = pos[1] + 1 * invert
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }
                                x = pos[0] + 1
                                y = pos[1] + 1 * invert
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }
                                break
                            case "r": // -------- ROOK --------
                                while (isValid(pos[0] - i, pos[1]) && !setField(board, (pos[0] - i) + "" + pos[1], color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }
                                i = 1
                                while (isValid(pos[0] + i, pos[1]) && !setField(board, (pos[0] + i) + "" + pos[1], color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0], pos[1] - i) && !setField(board, pos[0] + "" + (pos[1] - i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }
                                i = 1
                                while (isValid(pos[0], pos[1] + i) && !setField(board, pos[0] + "" + (pos[1] + i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }
                                break
                            case "n": // -------- KNIGHT --------
                                x = pos[0] - 1
                                y = pos[1] + 2
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }
                                x = pos[0] + 1
                                y = pos[1] + 2
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }

                                x = pos[0] - 1
                                y = pos[1] - 2
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }
                                x = pos[0] + 1
                                y = pos[1] - 2
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }

                                x = pos[0] + 2
                                y = pos[1] - 1
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }
                                x = pos[0] + 2
                                y = pos[1] + 1
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }

                                x = pos[0] - 2
                                y = pos[1] - 1
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }
                                x = pos[0] - 2
                                y = pos[1] + 1
                                if (isValid(x, y)) {
                                    setField(board, x + "" + y, color, emptyColor, allyColor, enemyColor)
                                }
                                break
                            case "b": // -------- BISHOP --------
                                while (isValid(pos[0] - i, pos[1] - i) && !setField(board, (pos[0] - i) + "" + (pos[1] - i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0] + i, pos[1] - i) && !setField(board, (pos[0] + i) + "" + (pos[1] - i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0] + i, pos[1] + i) && !setField(board, (pos[0] + i) + "" + (pos[1] + i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0] - i, pos[1] + i) && !setField(board, (pos[0] - i) + "" + (pos[1] + i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }
                                break
                            case "q": // -------- QUEEN --------
                                while (isValid(pos[0] - i, pos[1] - i) && !setField(board, (pos[0] - i) + "" + (pos[1] - i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0] + i, pos[1] - i) && !setField(board, (pos[0] + i) + "" + (pos[1] - i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0] + i, pos[1] + i) && !setField(board, (pos[0] + i) + "" + (pos[1] + i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0] - i, pos[1] + i) && !setField(board, (pos[0] - i) + "" + (pos[1] + i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0] - i, pos[1]) && !setField(board, (pos[0] - i) + "" + pos[1], color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }
                                i = 1
                                while (isValid(pos[0] + i, pos[1]) && !setField(board, (pos[0] + i) + "" + pos[1], color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }

                                i = 1
                                while (isValid(pos[0], pos[1] - i) && !setField(board, pos[0] + "" + (pos[1] - i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }
                                i = 1
                                while (isValid(pos[0], pos[1] + i) && !setField(board, pos[0] + "" + (pos[1] + i), color, emptyColor, allyColor, enemyColor)) {
                                    i++
                                }
                                break
                            case "k": // -------- KING --------
                                for (x = -1; x <= 1; x += 2) {
                                    for (y = -1; y <= 1; y += 2) {
                                        if (isValid(pos[0] + x, pos[1] + y)) {
                                            setField(board, (pos[0] + x) + "" + (pos[1] + y), color, emptyColor, allyColor, enemyColor)
                                        }
                                    }
                                }
                                for (let i = -1; i <= 1; i += 2) {
                                    if (isValid(pos[0] + i, pos[1])) {
                                        setField(board, (pos[0] + i) + "" + pos[1], color, emptyColor, allyColor, enemyColor)
                                    }
                                    if (isValid(pos[0], pos[1] + i)) {
                                        setField(board, pos[0] + "" + (pos[1] + i), color, emptyColor, allyColor, enemyColor)
                                    }
                                }
                                break
                        }
                    }
                })
            })
        })
    })
}

function shouldNotRender(board) {
    let shouldNotRender = true
    lastPieces.forEach(piece => {
        const squares = Array.from(board.getElementsByClassName(piece))
        let isPiece = false
        squares.forEach(square => {
            square.classList.forEach(class_name => {
                if (class_name === "piece") {
                    isPiece = true
                }
            })
        })
        if (!isPiece) {
            shouldNotRender = false
        }
    })
    return shouldNotRender
}

function render(board) {
    lastPieces = []
    getFields(board).forEach(field => field.remove())
    renderColor(board, "w", board.classList.contains("flipped") ? -1 : 1, 1)
    renderColor(board, "b", board.classList.contains("flipped") ? 1 : -1, -1)
}

setInterval(() => {
    const boards = Array.from(document.getElementsByTagName("chess-board"))
    if (boards.length > 0) {
        boards.forEach(board => {
            if (lastPieces.length === 0 || !shouldNotRender(board)) {
                render(board)
            }
        })
    }
}, 500)