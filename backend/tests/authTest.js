const http = require('http');

/**
 * Helper to make HTTP JSON requests
 */
function makeRequest(options, postData = null) {
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

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   CAMPUS LOST & FOUND - AUTHENTICATION TEST SUITE  ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName} - ${details}`);
    }
  }

  const timestamp = Date.now();
  const studentEmail = `student_${timestamp}@campus.edu`;
  const adminEmail = `admin_${timestamp}@campus.edu`;
  const plainPassword = 'SecurePassword123!';

  // 1. Health check to ensure server & DB are up
  try {
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    });
    assert(
      health.status === 200 && health.data.database.connected,
      'Backend Server & MongoDB Connectivity',
      `Health status: ${health.status}, DB: ${JSON.stringify(health.data.database)}`
    );
  } catch (err) {
    console.error('Cannot connect to backend server on port 5000:', err.message);
    process.exit(1);
  }

  // 2. Test Registration (Student User)
  let studentToken = null;
  let studentUser = null;
  const regStudentRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Alex Johnson',
      email: studentEmail,
      password: plainPassword,
      role: 'student',
      campusId: 'STU-9921',
      department: 'Computer Science',
      phone: '+1-555-0199',
    }
  );

  assert(
    regStudentRes.status === 201 && regStudentRes.data.success && !!regStudentRes.data.token,
    'Student Registration (Returns JWT Token & Sanitized User Profile)',
    JSON.stringify(regStudentRes.data)
  );

  studentToken = regStudentRes.data.token;
  studentUser = regStudentRes.data.user;

  // Verify password is NOT exposed in response
  assert(
    !regStudentRes.data.user.password,
    'Password is NOT Exposed in Registration Response',
    'Password field was present in return payload'
  );

  // 3. Test Registration Validation (Duplicate Email)
  const dupEmailRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Duplicate Alex',
      email: studentEmail,
      password: plainPassword,
    }
  );

  assert(
    dupEmailRes.status === 400 && !dupEmailRes.data.success,
    'Duplicate Email Registration Blocked with 400 Error',
    `Status: ${dupEmailRes.status}`
  );

  // 4. Test Registration (Admin User)
  let adminToken = null;
  const regAdminRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Officer Davis',
      email: adminEmail,
      password: plainPassword,
      role: 'admin',
      campusId: 'ADM-0042',
      department: 'Campus Security & Lost Property Office',
    }
  );

  assert(
    regAdminRes.status === 201 &&
      regAdminRes.data.user.role === 'admin' &&
      !!regAdminRes.data.token,
    'Admin Registration (Role set to "admin")',
    JSON.stringify(regAdminRes.data)
  );
  adminToken = regAdminRes.data.token;

  // 5. Test Login with Correct Password
  const loginSuccessRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: studentEmail,
      password: plainPassword,
    }
  );

  assert(
    loginSuccessRes.status === 200 &&
      loginSuccessRes.data.success &&
      !!loginSuccessRes.data.token,
    'User Login with Valid Credentials (JWT issued)',
    JSON.stringify(loginSuccessRes.data)
  );

  // 6. Test Login with Incorrect Password
  const loginFailRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: studentEmail,
      password: 'WrongPassword999!',
    }
  );

  assert(
    loginFailRes.status === 401 && !loginFailRes.data.success,
    'User Login Rejected with Invalid Password (401 Unauthorized)',
    `Status: ${loginFailRes.status}`
  );

  // 7. Test Protected Route WITHOUT Token
  const noTokenRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
  });

  assert(
    noTokenRes.status === 401 && !noTokenRes.data.success,
    'Protected Route (/api/auth/me) Blocks Request Without Bearer Token',
    `Status: ${noTokenRes.status}`
  );

  // 8. Test Protected Route WITH Valid Student Token
  const withTokenRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${studentToken}`,
    },
  });

  assert(
    withTokenRes.status === 200 &&
      withTokenRes.data.success &&
      withTokenRes.data.user.email === studentEmail,
    'Protected Route (/api/auth/me) Returns Authenticated User Profile',
    JSON.stringify(withTokenRes.data)
  );

  // 9. Test Update Profile via Protected Route
  const updateProfileRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    {
      name: 'Alex Johnson Updated',
      phone: '+1-555-9988',
      department: 'Software Engineering',
    }
  );

  assert(
    updateProfileRes.status === 200 &&
      updateProfileRes.data.user.name === 'Alex Johnson Updated' &&
      updateProfileRes.data.user.department === 'Software Engineering',
    'Update Profile (/api/auth/profile) Persists and Returns Modified Fields',
    JSON.stringify(updateProfileRes.data)
  );

  // 10. Test Role Authorization: Student Accessing Admin Route (MUST BE FORBIDDEN)
  const studentAccessAdminRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${studentToken}`,
    },
  });

  assert(
    studentAccessAdminRes.status === 403 && !studentAccessAdminRes.data.success,
    'Admin Route (/api/admin/stats) Forbids Access to Student Role (403 Forbidden)',
    `Status: ${studentAccessAdminRes.status}`
  );

  // 11. Test Role Authorization: Admin Accessing Admin Route (MUST SUCCEED)
  const adminAccessAdminRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });

  assert(
    adminAccessAdminRes.status === 200 && adminAccessAdminRes.data.success,
    'Admin Route (/api/admin/stats) Successfully Grants Access to Admin Role',
    `Status: ${adminAccessAdminRes.status}`
  );

  console.log('\n====================================================');
  console.log(`   TEST RESULTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
