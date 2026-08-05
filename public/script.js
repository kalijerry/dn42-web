const copyButtons = document.querySelectorAll("[data-copy-target]");

const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

const renderConnections = async () => {
  const nodeList = document.getElementById("node-list");
  const connectionList = document.getElementById("connection-list");
  if (!nodeList || !connectionList) return;

  try {
    const response = await fetch("./peers/connections.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    let infraPeers = [];
    try {
      const peerResponse = await fetch("./peers/infra-peers.json", { cache: "no-store" });
      if (peerResponse.ok) infraPeers = (await peerResponse.json()).peers || [];
    } catch {}
    nodeList.innerHTML = (data.nodes || []).map((node) => `
      <tr><td><code>${escapeHtml(node.name)}</code></td><td><code>${escapeHtml(node.asn)}</code></td>
      <td>${escapeHtml(node.location)}</td><td><code>${escapeHtml(node.dn42_ipv4)}</code><br><code>${escapeHtml(node.dn42_ipv6)}</code></td>
      <td>${node.transit ? "Transit" : "Peer"}</td><td>${escapeHtml(node.status)}</td></tr>`).join("") || '<tr><td colspan="6">No nodes published.</td></tr>';
    const peers = [...(data.connections || []), ...infraPeers];
    connectionList.innerHTML = peers.map((peer) => `
      <tr><td>${peer.website ? `<a href="${escapeHtml(peer.website)}" rel="noopener noreferrer">${escapeHtml(peer.peer)}</a>` : escapeHtml(peer.peer)}</td>
      <td><code>${escapeHtml(peer.asn)}</code></td><td>${escapeHtml(peer.location)}</td><td>${escapeHtml(peer.transport)} / ${escapeHtml(peer.bgp)}</td>
      <td>${peer.status === "Established" ? '<strong class="ok">Established</strong>' : escapeHtml(peer.status)}</td></tr>`).join("") || '<tr><td colspan="5">No peer connections published.</td></tr>';
  } catch {
    nodeList.innerHTML = '<tr><td colspan="6">Node data unavailable.</td></tr>';
    connectionList.innerHTML = '<tr><td colspan="5">Peer data unavailable.</td></tr>';
  }
};

renderConnections();

fetch("./peers/infra-status.json", { cache: "no-store" })
  .then((response) => response.json())
  .then((status) => {
    const target = document.getElementById("infra-status");
    if (!target || !status.updated_at) return;
    target.textContent = `Infrastructure deploy: ${status.status} (${new Date(status.updated_at).toLocaleString()})`;
  })
  .catch(() => {});

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
