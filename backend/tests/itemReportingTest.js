const http = require('http');
const fs = require('fs');
const path = require('path');

function makeRequest(options, data = null, isMultipart = false) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      if (isMultipart) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

function buildMultipartFormData(fields, fileField = null) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
  const parts = [];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
      )
    );
  }

  if (fileField) {
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.contentType}\r\n\r\n`;
    parts.push(Buffer.from(fileHeader));
    parts.push(fileField.buffer);
    parts.push(Buffer.from('\r\n'));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  const fullBody = Buffer.concat(parts);

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: fullBody,
  };
}

async function runItemTests() {
  console.log('========================================================');
  console.log('   CAMPUS LOST & FOUND - ITEM REPORTING TEST SUITE      ');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${name} - ${details}`);
    }
  }

  const timestamp = Date.now();
  const user1Email = `reporter1_${timestamp}@campus.edu`;
  const user2Email = `reporter2_${timestamp}@campus.edu`;
  const password = 'Password123!';

  // 1. Register User 1
  const u1Res = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Primary Reporter', email: user1Email, password, role: 'student' }
  );
  assert(u1Res.status === 201 && !!u1Res.data.token, 'Register User 1');
  const token1 = u1Res.data.token;

  // 2. Register User 2
  const u2Res = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Secondary User', email: user2Email, password, role: 'student' }
  );
  assert(u2Res.status === 201 && !!u2Res.data.token, 'Register User 2');
  const token2 = u2Res.data.token;

  // 3. Create Lost Item with Image Upload (User 1)
  const dummyImage = Buffer.from('fake-jpeg-image-data-header-12345');
  const multipartLost = buildMultipartFormData(
    {
      type: 'lost',
      itemName: 'Dell XPS 15 Laptop',
      category: 'Electronics',
      description: 'Silver aluminum body, blue sticker on back, left near charger outlet.',
      location: 'Science Library 2nd Floor Study Cubicle',
      date: '2026-10-05',
      color: 'Silver',
    },
    {
      name: 'image',
      filename: 'sample_laptop.jpg',
      contentType: 'image/jpeg',
      buffer: dummyImage,
    }
  );

  const createLostRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/items',
      method: 'POST',
      headers: {
        'Content-Type': multipartLost.contentType,
        'Content-Length': multipartLost.body.length,
        Authorization: `Bearer ${token1}`,
      },
    },
    multipartLost.body,
    true
  );

  assert(
    createLostRes.status === 201 &&
      createLostRes.data.item.type === 'lost' &&
      createLostRes.data.item.status === 'Lost' &&
      createLostRes.data.item.image.startsWith('/uploads/'),
    'Report Lost Item with Image Upload (Status = Lost, Image stored on disk)',
    JSON.stringify(createLostRes.data)
  );
  const lostItemId = createLostRes.data.item._id;

  // Verify file actually saved in backend/uploads
  const savedFilename = path.basename(createLostRes.data.item.image);
  const uploadedFilePath = path.join(__dirname, '../uploads', savedFilename);
  assert(
    fs.existsSync(uploadedFilePath),
    'Uploaded Image Stored on Server Disk (Not Stored Raw in DB)',
    `Path checked: ${uploadedFilePath}`
  );

  // 4. Create Found Item (User 1)
  const multipartFound = buildMultipartFormData({
    type: 'found',
    itemName: 'Dorm Keys with Red Carabiner',
    category: 'Keys',
    description: 'Found two brass keys and a gym fob on a red metal carabiner.',
    location: 'West Campus Dining Hall Entrance',
    date: '2026-10-06',
    color: 'Red / Brass',
  });

  const createFoundRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/items',
      method: 'POST',
      headers: {
        'Content-Type': multipartFound.contentType,
        'Content-Length': multipartFound.body.length,
        Authorization: `Bearer ${token1}`,
      },
    },
    multipartFound.body,
    true
  );

  assert(
    createFoundRes.status === 201 &&
      createFoundRes.data.item.type === 'found' &&
      createFoundRes.data.item.status === 'Found',
    'Report Found Item (Status = Found)',
    JSON.stringify(createFoundRes.data)
  );
  const foundItemId = createFoundRes.data.item._id;

  // 5. Test "My Reports" for User 1
  const myReports1Res = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/items/my-reports',
    method: 'GET',
    headers: { Authorization: `Bearer ${token1}` },
  });

  assert(
    myReports1Res.status === 200 &&
      myReports1Res.data.items.length === 2 &&
      myReports1Res.data.items.some((i) => i.type === 'lost') &&
      myReports1Res.data.items.some((i) => i.type === 'found'),
    'My Reports (User 1 retrieves their reported items with types, dates, statuses)',
    `Count: ${myReports1Res.data.items?.length}`
  );

  // 6. Test "My Reports" for User 2 (Should be 0)
  const myReports2Res = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/items/my-reports',
    method: 'GET',
    headers: { Authorization: `Bearer ${token2}` },
  });

  assert(
    myReports2Res.status === 200 && myReports2Res.data.items.length === 0,
    'My Reports Isolation (User 2 sees 0 reports for their account)',
    `Count: ${myReports2Res.data.items?.length}`
  );

  // 7. Test Item Details
  const detailsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/items/${lostItemId}`,
    method: 'GET',
  });

  assert(
    detailsRes.status === 200 &&
      detailsRes.data.item.itemName === 'Dell XPS 15 Laptop' &&
      detailsRes.data.item.color === 'Silver' &&
      detailsRes.data.item.user.name === 'Primary Reporter',
    'Item Details View (Contains full description, color, location, and reporter info)',
    JSON.stringify(detailsRes.data)
  );

  // 8. Test Browse Lost Items Listing
  const browseLostRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/items/lost',
    method: 'GET',
  });

  assert(
    browseLostRes.status === 200 &&
      browseLostRes.data.items.some((i) => i._id === lostItemId) &&
      !browseLostRes.data.items.some((i) => i._id === foundItemId),
    'Browse Lost Items Directory (Contains Lost item, excludes Found item)',
    `Count: ${browseLostRes.data.items?.length}`
  );

  // 9. Test Browse Found Items Listing
  const browseFoundRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/items/found',
    method: 'GET',
  });

  assert(
    browseFoundRes.status === 200 &&
      browseFoundRes.data.items.some((i) => i._id === foundItemId) &&
      !browseFoundRes.data.items.some((i) => i._id === lostItemId),
    'Browse Found Items Directory (Contains Found item, excludes Lost item)',
    `Count: ${browseFoundRes.data.items?.length}`
  );

  // 10. Security: User 2 attempts to edit User 1's report (MUST BE FORBIDDEN 403)
  const unauthorizedEditRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/items/${lostItemId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`,
      },
    },
    { itemName: 'Hacked Laptop Name' }
  );

  assert(
    unauthorizedEditRes.status === 403 && !unauthorizedEditRes.data.success,
    'Security Guard: User 2 Blocked from Modifying User 1 Report (403 Forbidden)',
    `Status: ${unauthorizedEditRes.status}`
  );

  // 11. Security: User 2 attempts to delete User 1's report (MUST BE FORBIDDEN 403)
  const unauthorizedDeleteRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/items/${lostItemId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token2}` },
  });

  assert(
    unauthorizedDeleteRes.status === 403 && !unauthorizedDeleteRes.data.success,
    'Security Guard: User 2 Blocked from Deleting User 1 Report (403 Forbidden)',
    `Status: ${unauthorizedDeleteRes.status}`
  );

  // 12. Author Updates their own report (MUST SUCCEED)
  const authorizedEditRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/items/${lostItemId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
    },
    {
      status: 'Matched',
      location: 'Science Library - Claim Desk',
    }
  );

  assert(
    authorizedEditRes.status === 200 &&
      authorizedEditRes.data.item.status === 'Matched' &&
      authorizedEditRes.data.item.location === 'Science Library - Claim Desk',
    'Author Updates Report (Status and location updated successfully)',
    JSON.stringify(authorizedEditRes.data)
  );

  // 13. Author Deletes their own report (MUST SUCCEED)
  const authorizedDeleteRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/items/${foundItemId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token1}` },
  });

  assert(
    authorizedDeleteRes.status === 200 && authorizedDeleteRes.data.success,
    'Author Deletes Report (Item deleted successfully)',
    JSON.stringify(authorizedDeleteRes.data)
  );

  // Verify it is actually gone
  const checkDeletedRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/items/${foundItemId}`,
    method: 'GET',
  });

  assert(
    checkDeletedRes.status === 404,
    'Deleted Report Returns 404 Not Found',
    `Status: ${checkDeletedRes.status}`
  );

  console.log('\n========================================================');
  console.log(`   TEST RESULTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runItemTests();
