const copyButtons = document.querySelectorAll("[data-copy-target]");

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;

    const text = target.innerText.trim();
    const original = button.textContent;

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
});
