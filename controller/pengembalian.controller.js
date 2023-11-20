const PengembalianModel = require('../model/pengembalian.model');
const firebase = require('firebase/app');
const storage = require('firebase/storage');
const firebaseConfig = {
    apiKey: "AIzaSyCApOuAwpMaGSiWzVM3drvbNQP2ewtBmQ4",
    authDomain: "sima-restapi.firebaseapp.com",
    projectId: "sima-restapi",
    storageBucket: "sima-restapi.appspot.com",
    messagingSenderId: "818181470773",
    appId: "1:818181470773:web:dbd3f20aef5d2094a2cf7c"
};
firebase.initializeApp(firebaseConfig);

async function createPengembalian(pengembalianData, photoFile) {
    try {
      const newPengembalian = new PengembalianModel(pengembalianData);
      const savedPengembalian = await newPengembalian.save();

      const photoFileName = `pengembalian_${savedPengembalian._id}_${Date.now()}.jpg`;
      const photoRef = storage.ref().child(photoFileName);
      
      const photoSnapshot = await photoRef.put(photoFile);
      const photoURL = await photoSnapshot.ref.getDownloadURL();

      savedPengembalian.foto = photoURL;
      await savedPengembalian.save();
  
      return savedPengembalian;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  

module.exports = { createPengembalian };