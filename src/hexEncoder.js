const hexEncode = (text) => {
    return text.split('').map(letter => {
        return letter.charCodeAt(0).toString(16)
    }).join('')
}

const hexDecode = (code) => {
    return code.match(/(..?)/g).map(char => {
        return String.fromCharCode(parseInt(char, 16))
    }).join('')
}

module.exports = {
    hexEncode: hexEncode,
    hexDecode: hexDecode
}
