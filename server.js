const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Erfolgreich mit MongoDB verbunden');
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB Verbindungsfehler:', err);
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },     
  phone: { type: String, required: true },     
  email: { type: String, required: true }      
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

// API-Endpunkte definieren

app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Neuen Kontakt erstellen
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const contact = new Contact({ name, phone, email });
    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Kontakt aktualisieren
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, phone, email },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ error: 'Kontakt nicht gefunden' });
    }
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Kontakt löschen
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ error: 'Kontakt nicht gefunden' });
    }
    res.json({ message: 'Kontakt gelöscht' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
  console.log(`Auch verfügbar auf: http://192.168.66.212:${PORT}`);
});