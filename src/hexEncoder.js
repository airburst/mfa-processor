module.exports = {

    hexEncode: function(text) {
        return text.split('').map(function(letter) {
            return letter.charCodeAt(0).toString(16)
        }).join('')
    },

    hexDecode: function(code) {
        return code.match(/(..?)/g).map(function(char) {
            return String.fromCharCode(parseInt(char, 16))
        }).join('')
    }

}
