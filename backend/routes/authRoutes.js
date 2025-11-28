const express = require('express');
const {registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();
const Test = require('../models/User');
//const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/history', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Test.findOne({ email });
      if (!user) return res.status(404).send('User not found');
      
      user.history.push(req.body.history);
      await user.save();
      res.json(user.history);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });
  
  // Get user history
  
router.get('/history', async (req, res) => {
    try {
      const { email } = req.query;
      const user = await Test.findOne({ email }).select('history');
      if (!user) return res.status(404).send('User not found');
      
      res.json(user.history);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });
  
  // Delete single history item
  router.delete('/history/:id', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Test.findOne({ email });
      if (!user) return res.status(404).send('User not found');
      
      user.history = user.history.filter(item => item._id.toString() !== req.params.id);
      await user.save();
      res.json(user.history);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });
  
  // Clear all history
  router.delete('/history', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Test.findOne({ email });
      if (!user) return res.status(404).send('User not found');
      
      user.history = [];
      await user.save();
      res.json(user.history);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

module.exports = router;
