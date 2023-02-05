const settings = [["DefendAllies", false], ["AttackedAllies", true], ["DefendEnemies", true], ["AttackedEnemies", true], ["FieldsDefendedByAllies", false], ["FieldsDefendedByEnemies", true]]

settings.forEach(setting => {
    const toggle = document.querySelector(`#${setting[0]}`)

    chrome.storage.local.get([setting[0]], result => {
        if (result[setting[0]]) {
            toggle.checked = result[setting[0]]
        } else {
            toggle.checked = setting[1]
        }
    })

    toggle.addEventListener("change", event => {
        const isChecked = event.target.checked
        chrome.storage.local.set({[setting[0]]: isChecked})
    })
})