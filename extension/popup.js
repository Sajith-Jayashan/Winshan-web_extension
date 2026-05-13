document.getElementById('shortenBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  const result = document.getElementById('result');

  if (!url) { result.textContent = 'Please enter a URL'; return; }

  try {
    const res = await fetch('https://winshan-webextension-production.up.railway.app', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    result.textContent = data.shortUrl;
  } catch (e) {
    result.textContent = 'Error — is the server running?';
  }
});