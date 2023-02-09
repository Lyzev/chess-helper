const settings = [["DefendAllies", false], ["AttackedAllies", true], ["DefendEnemies", true], ["AttackedEnemies", true], ["FieldsDefendedByAllies", false], ["FieldsDefendedByEnemies", true]]

settings.forEach(setting => {
    const toggle = document.querySelector(`#${setting[0]}`)

    chrome.storage.local.get([setting[0]], result => {
        if (result[setting[0]] !== undefined) {
            toggle.checked = result[setting[0]]
        } else {
            toggle.checked = setting[1]
        }
    })

    toggle.addEventListener("change", event => {
        const isChecked = event.target.checked
        chrome.storage.local.set({[setting[0]]: isChecked})

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.scripting.executeScript({
                target: {
                    tabId: tabs[0].id
                },
                function: sendData,
            });
        });

        const sendData = async () => {
            const boards = Array.from(document.getElementsByTagName("chess-board"))
            if (boards.length > 0) {
                boards.forEach(board => {
                    render(board)
                })
            }
        }
    })
})