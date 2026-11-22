(async () => {
  const pre = document.getElementById('prompt');
  const md = await (await fetch('EDITION_FORGE_PROMPT.md')).text();
  const prompt = md.split(/\n---\n/).slice(1).join('\n---\n').trim() || md;
  pre.textContent = prompt;
  const btn = document.getElementById('copy');
  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(prompt);
    btn.textContent = 'Copied ✓';
    setTimeout(() => (btn.textContent = 'Copy prompt'), 1800);
  });
})();
