const axios = require('axios');

async function test() {
  try {
    const phone = '0999888777' + Math.floor(Math.random()*1000);
    // 1. Register
    const resReg = await axios.post('https://bakery-backend-six.vercel.app/api/shop/auth/register', {
      name: 'Test',
      phone,
      password: '123'
    });
    const token = resReg.data.data.token;
    console.log("Registered:", resReg.data.data.customer);

    // 2. Update Profile with location
    const resUpdate = await axios.put('https://bakery-backend-six.vercel.app/api/shop/customer/profile', {
      location: { lat: 10.123, lng: 105.123 }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Updated:", resUpdate.data.data);
  } catch (e) {
    console.log("Error:", e.response ? e.response.data : e.message);
  }
}
test();
