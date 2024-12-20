

function generateSessionToken(length = 16) {

    const template = "1234567890@#$%&qwertyuiopasdfghjklzxcvbnm";
    let token = "";
    for (let i = 0; i < length; i++) {
        let rand = Math.floor(template.length * Math.random());
        token += template[rand]

    }

    return token;

}


module.exports = { generateSessionToken }