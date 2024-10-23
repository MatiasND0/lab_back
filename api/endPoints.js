const express = require('express');
const router = express.Router();

const {login, logout, register, deleteUser, checkAuth} = require('../controllers/loginController');

const {inventory, addItem, removeItem} = require('../controllers/inventoryController');

const {avaliableProy, bookProy, bookedProy ,deleteBooking} = require('../controllers/bookingController');

//Auth

router.post('/login',login);

router.post('/logout',logout);

router.post('/register',register);

router.delete('/delete-user/:id', deleteUser);

router.post('/check-auth',checkAuth);


//Inventario

router.post('/inventory',inventory);

router.post('/add-item',addItem);

router.delete('/remove-item',removeItem);

//Reservas

router.post('/avaliable-proy',avaliableProy);

router.post('/book-proy',bookProy);

router.post('/booked-proy',bookedProy);

router.delete('/delete-booking/:id', deleteBooking);

module.exports = router;