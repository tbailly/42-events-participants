require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const axios = require('axios')
const dayjs = require('dayjs');

const auth42 = require('./auth42');

const app = express();

app.use(auth42)

app.get('/', async (req, res) => {
    const html = await ejs.renderFile('./templates/index.ejs', {}, {async: true});
    res.send(html);
})

app.get('/events', async (req, res) => {

    if (!req.query['event-name']) {
        res.redirect('/')
    }

    let response = await axios.get(
        'https://api.intra.42.fr/v2/events',
        {
            headers: {'Authorization': `Bearer ${process.env.FT_TOKEN}`},
            params: {
                'filter[name]': req.query['event-name']
            }
        }
    )

    let events = []
    if (!Array.isArray(response.data)) {
        events = [response.data]
    } else {
        events = response.data
    }

    const data = {events}

    data.events = data.events.map((event) => ({
        id: event.id,
        name: event.name,
        date: dayjs(event.begin_at).format('DD MMM YYYY'),
    }));

    const html = await ejs.renderFile('./templates/events.ejs', data, {async: true});
    res.send(html);
})

app.get('/users', async (req, res) => {
    
    if (!req.query['event-id']) {
        res.redirect('/')
    }

    let response = await axios.get(
        `https://api.intra.42.fr/v2/events/${req.query['event-id']}/events_users`,
        {
            headers: {'Authorization': `Bearer ${process.env.FT_TOKEN}`},
            params: {
                'page[size]': 100
            }
        }
    )

    const data = {
        event: {
            id: response.data[0].event.id,
            name: response.data[0].event.name,
            date: dayjs(response.data[0].event.begin_date).format('DD MMM YYYY'),
        },
        users: response.data.map(el => el.user),
    }

    const html = await ejs.renderFile('./templates/users.ejs', data, {async: true});
    res.send(html);
})

app.listen(3000, () => {
    console.log('Website running');
})
