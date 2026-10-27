document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("researchForm");
  const topicInput = document.getElementById("topicInput");
  const notesInput = document.getElementById("notesInput");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const fileInput = document.getElementById("fileInput");
  const fileLabel = document.getElementById("fileLabel");
  const startBtn = document.getElementById("startBtn");
  const agentStatusBadge = document.getElementById("agentStatusBadge");
  const logsContainer = document.getElementById("logsContainer");
  const reportContent = document.getElementById("reportContent");
  const reportMeta = document.getElementById("reportMeta");
  const copyBtn = document.getElementById("copyBtn");
  const printBtn = document.getElementById("printBtn");

  let rawMarkdown = "";

  // Show selected filename
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      fileLabel.textContent = `Attached: ${e.target.files[0].name}`;
      fileLabel.classList.add("text-indigo-400", "font-medium");
    } else {
      fileLabel.textContent = "Drop PDF here or click to browse";
      fileLabel.classList.remove("text-indigo-400", "font-medium");
    }
  });

  // Copy markdown to clipboard
  copyBtn.addEventListener("click", () => {
    if (rawMarkdown) {
      navigator.clipboard.writeText(rawMarkdown).then(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Markdown';
        }, 2000);
      });
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const topic = topicInput.value.trim();
    if (!topic) return;

    // Reset UI state
    logsContainer.innerHTML = "";
    reportContent.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
        <div class="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p class="text-sm font-medium text-slate-300">Agent actively searching and synthesizing...</p>
        <p class="text-xs text-slate-500 mt-1">Check the Execution Trace on the left for live updates.</p>
      </div>
    `;
    copyBtn.classList.add("hidden");
    printBtn.classList.add("hidden");
    startBtn.disabled = true;
    startBtn.classList.add("opacity-60", "cursor-not-allowed");

    agentStatusBadge.textContent = "Executing";
    agentStatusBadge.className = "text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 animate-pulse";
    reportMeta.textContent = `Researching: "${topic}"`;

    const formData = new FormData();
    formData.append("topic", topic);
    if (notesInput.value.trim()) formData.append("notes", notesInput.value.trim());
    if (apiKeyInput.value.trim()) formData.append("api_key", apiKeyInput.value.trim());
    if (fileInput.files.length > 0) formData.append("file", fileInput.files[0]);

    try {
      const response = await fetch("/api/research/stream", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop(); // Keep incomplete chunk in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.replace("data: ", ""));
              handleAgentEvent(event);
            } catch (err) {
              console.error("Failed to parse event:", err, line);
            }
          }
        }
      }
    } catch (err) {
      appendLog("ERROR", `Execution halted: ${err.message}`, "failed");
      agentStatusBadge.textContent = "Failed";
      agentStatusBadge.className = "text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800";
    } finally {
      startBtn.disabled = false;
      startBtn.classList.remove("opacity-60", "cursor-not-allowed");
    }
  });

  function handleAgentEvent(event) {
    if (event.step === "FINISHED") {
      rawMarkdown = event.report_markdown;
      reportContent.innerHTML = marked.parse(rawMarkdown);
      copyBtn.classList.remove("hidden");
      printBtn.classList.remove("hidden");
      copyBtn.classList.add("inline-flex");
      printBtn.classList.add("inline-flex");
      
      agentStatusBadge.textContent = "Completed";
      agentStatusBadge.className = "text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800";
      reportMeta.textContent = `Completed at ${new Date().toLocaleTimeString()}`;
      appendLog("SUCCESS", "Executive briefing generated successfully.", "completed");
      return;
    }

    if (event.step === "ERROR") {
      appendLog("ERROR", event.message, "failed");
      agentStatusBadge.textContent = "Error";
      agentStatusBadge.className = "text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800";
      return;
    }

    appendLog(event.step, event.message, event.status);
  }

  function appendLog(step, message, status) {
    const logItem = document.createElement("div");
    let badgeColor = "bg-slate-800 text-slate-300 border-slate-700";
    let icon = "fa-circle-dot";

    if (status === "completed" || step === "SUCCESS") {
      badgeColor = "bg-emerald-950 text-emerald-400 border-emerald-800/60";
      icon = "fa-check";
    } else if (status === "failed" || step === "ERROR") {
      badgeColor = "bg-rose-950 text-rose-400 border-rose-800/60";
      icon = "fa-triangle-exclamation";
    } else if (status === "warning") {
      badgeColor = "bg-amber-950 text-amber-400 border-amber-800/60";
      icon = "fa-circle-exclamation";
    } else {
      badgeColor = "bg-indigo-950 text-indigo-400 border-indigo-800/60 animate-pulse";
      icon = "fa-spinner fa-spin";
    }

    logItem.className = "p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5";
    logItem.innerHTML = `
      <span class="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded text-[10px] ${badgeColor}">
        <i class="fa-solid ${icon}"></i>
      </span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between text-[11px] mb-0.5">
          <span class="font-semibold text-slate-400">${step}</span>
          <span class="text-[10px] text-slate-600">${new Date().toLocaleTimeString()}</span>
        </div>
        <p class="text-slate-300 break-words leading-relaxed">${escapeHtml(message)}</p>
      </div>
    `;

    logsContainer.appendChild(logItem);
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});
