const ClientOAuth2 = require('client-oauth2')

const generateFtToken = async () => {

    const forty2auth = new ClientOAuth2({
        clientId: process.env.FT_CLIENT_ID,
        clientSecret: process.env.FT_CLIENT_SECRET,
        accessTokenUri: 'https://api.intra.42.fr/oauth/token'
    })

    const token = await forty2auth.credentials.getToken()

    process.env.FT_TOKEN = token.data.access_token

    const now = new Date()
    process.env.FT_TOKEN_EXPIRES_AT = now.setSeconds(now.getSeconds() + token.data.expires_in - 60)
}

const auth42 = async (req, res, next) => {
    if (!process.env.FT_TOKEN) {
        console.log('No token detected, generating a new one')
        await generateFtToken()
    } else {
        console.log('Token detected')
        if (new Date() > process.env.FT_TOKEN_EXPIRES_AT) {
            console.log('Token expired, generating a new one')
            await generateFtToken()
        }
    }
    next()
}

module.exports = auth42