const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/users');
const restaurantRoutes = require('./routes/restaurants');
const reservationRoutes = require('./routes/reservations');

app.use('/api', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);
app.get('/api/ping',(req, res)=>{
  res.json({message:'pong'});
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
