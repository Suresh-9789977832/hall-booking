

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const rooms = [];
const bookings = [];
const customers = [];

app.post('/rooms', (req, res) => {
  const { seatsAvailable, amenities, pricePerHour } = req.body;
  const room = {
    id: rooms.length + 1,
    seatsAvailable,
    amenities,
    pricePerHour,
  };
  rooms.push(room);
  res.status(201).json(room);
});

app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  const room = rooms.find((r) => r.id === roomId);

  if (!room) {
    return res.status(400).json({ message: 'Room not found' });
  }

  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

app.get('/rooms', (req, res) => {
  const roomList = rooms.map((room) => {
    const bookedStatus = bookings.some((booking) => {
      return (
        booking.roomId === room.id &&
        booking.date === req.query.date &&
        ((req.query.startTime >= booking.startTime &&
          req.query.startTime < booking.endTime) ||
          (req.query.endTime > booking.startTime &&
            req.query.endTime <= booking.endTime))
      );
    });

    return {
      roomName: `Room ${room.id}`,
      bookedStatus: bookedStatus ? 'Booked' : 'Available',
      customerName: bookedStatus ? bookings.find((booking) => booking.roomId === room.id).customerName : null,
      date: req.query.date,
      startTime: req.query.startTime,
      endTime: req.query.endTime,
    };
  });

  res.json(roomList);
});

app.get('/customers', (req, res) => {
  const customerList = customers.map((customer) => {
    const bookingsForCustomer = bookings.filter((booking) => booking.customerName === customer.name);

    return bookingsForCustomer.map((booking) => ({
      customerName: customer.name,
      roomName: `Room ${booking.roomId}`,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    }));
  });

  res.json(customerList.flat());
});

app.get('/customer/bookings/:customerName', (req, res) => {
  const { customerName } = req.params;

  const customerBookings = bookings.filter((booking) => booking.customerName === customerName);

  res.json(customerBookings);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
