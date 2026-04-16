import fs from 'fs';
import path from 'path';

async function testUpload() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'TIKESH@GMAIL.COM', password: 'Student@123' })
  });
  
  if (!loginRes.ok) {
     console.error('Login failed', await loginRes.text());
     return;
  }
  const loginData = await loginRes.json();
  const actualToken = loginData.token;
  console.log('Logged in successfully');

  // Node 18+ has built in fetch and FormData
  const formData = new FormData();
  formData.append('title', 'Test Complaint from Script');
  formData.append('description', 'This is a test');
  formData.append('category', 'General');
  
  // Create a dummy text file to simulate an image upload
  const dummyFile = new Blob(['dummy content'], { type: 'text/plain' });
  formData.append('image', dummyFile, 'dummy.txt');

  try {
    const response = await fetch('http://localhost:5000/api/complaints', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${actualToken}`
      },
      body: formData
    });

    console.log('Response Status:', response.status);
    const data = await response.text();
    console.log('Response Body:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testUpload();
