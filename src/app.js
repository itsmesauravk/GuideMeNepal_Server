import express from 'express';

import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('HAKUNA MATATA - SAURAV KARKI');
    })
app.get('/api/v1', (req, res) => {
    res.send('SERVER IS WORKING GOOD.');
    })

export default app;