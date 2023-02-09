// ==UserScript==
// @name         ChessHelper
// @namespace    https://lyzev.github.io/
// @version      ${version}
// @description  A utility script for chess.com that highlights the fields that are attacked or defended by pieces.
// @author       Lyzev
// @match        https://www.chess.com/*
// @icon         https://github.com/Lyzev/chess-helper/raw/master/tampermonkey/img/icon-128x128.png
// @require      https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

const css = ".highlight { z-index: -2; }",
    head = document.head,
    style = document.createElement("style")
style.innerHTML = css
head.appendChild(style)

GM_config.init(
    {
        "id": "ChessHelper",
        "fields":
            {
                "DefendendAllies":
                    {
                        "label": "DefendendAllies",
                        "type": "checkbox",
                        "default": false
                    },
                "AttackedAllies":
                    {
                        "label": "AttackedAllies",
                        "type": "checkbox",
                        "default": true
                    },
                "DefendendEnemies":
                    {
                        "label": "DefendendEnemies",
                        "type": "checkbox",
                        "default": true
                    },
                "AttackedEnemies":
                    {
                        "label": "AttackedEnemies",
                        "type": "checkbox",
                        "default": true
                    },
                "FieldsDefendedByAllies":
                    {
                        "label": "FieldsDefendedByAllies",
                        "type": "checkbox",
                        "default": false
                    },
                "FieldsDefendedByEnemies":
                    {
                        "label": "FieldsDefendedByEnemies",
                        "type": "checkbox",
                        "default": true
                    }
            },
        "css": `
 #ChessHelper {
     background-color: #282828;
     color: white;
 }
 #ChessHelper_header {
     text-shadow: 0 0 15px rgba(255,255,255,.5), 0 0 10px rgba(255,255,255,.5);
 }
 #ChessHelper_saveBtn {
     background-color: white;
     color: black;
     border: 2px solid #4CAF50;
     border-radius: 5px;
 }
 #ChessHelper_saveBtn:hover {
     background-color: #4CAF50;
     color: white;
     transition-duration: 0.4s;
     cursor: pointer;
 }
 #ChessHelper_closeBtn {
     background-color: white;
     color: black;
     border: 2px solid #f44336;
     border-radius: 5px;
 }
 #ChessHelper_closeBtn:hover {
     background-color: #f44336;
     color: white;
     transition-duration: 0.4s;
     cursor: pointer;
 }
 #ChessHelper .reset {
     color: white;
 }
        `
    })

const config = document.createElement("button")
config.innerHTML = "ChessHelper - Config"
config.style.position = "fixed"
config.style.top = "5px"
config.style.right = "5px"
config.classList.add("ui_v5-button-component")
config.classList.add("ui_v5-button-basic")
config.classList.add("primary-controls-button")
config.addEventListener("click", () => {
    GM_config.open()
})
document.body.appendChild(config)

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
    const emptyColor = invertColor === 1 ? (GM_config.get("FieldsDefendedByAllies") ? "#90FC03" : "transparent") : (GM_config.get("FieldsDefendedByEnemies") ? "#FF843D" : "transparent")
    const allyColor = invertColor === 1 ? (GM_config.get("DefendendAllies") ? "#FFE045" : "transparent") : (GM_config.get("DefendendEnemies") ? "#962727" : "transparent")
    const enemyColor = invertColor === 1 ? (GM_config.get("AttackedEnemies") ? "#4D9100" : "transparent") : (GM_config.get("AttackedAllies") ? "#A67100" : "transparent")

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
    if (lastPieces.length === 0 || !shouldNotRender(board)) {
        lastPieces = []
        getFields(board).forEach(field => field.remove())
        renderColor(board, "w", board.classList.contains("flipped") ? -1 : 1, 1)
        renderColor(board, "b", board.classList.contains("flipped") ? 1 : -1, -1)
    }
}

setInterval(() => {
    const boards = Array.from(document.getElementsByTagName("chess-board"))
    if (boards.length > 0) {
        boards.forEach(board => {
            render(board)
        })
    }
}, 500)