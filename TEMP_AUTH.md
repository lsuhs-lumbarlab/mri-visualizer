localStorage.setItem('authToken', 'test-token-123');
localStorage.setItem('authUser', JSON.stringify({ username: 'testuser', userType: 'clinician' }));
location.reload();


localStorage.clear();
location.reload();