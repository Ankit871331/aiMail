console.log("✅ Extension Loaded");

/* -------- GET SEND BUTTON -------- */
function getSendButton() {
    return document.querySelector('.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3');
}

/* -------- GET COMPOSE BOX -------- */
function getComposeBox() {
    return document.querySelector('[role="textbox"][g_editable="true"]');
}

/* -------- GET EMAIL CONTENT -------- */
function getEmailContent() {
    // Get all visible email bodies
    const emailBodies = document.querySelectorAll('.a3s.aiL');

    if (!emailBodies.length) {
        console.warn("❌ No email bodies found");
        return '';
    }

    // Get latest visible email
    let latestEmail = null;

    for (let i = emailBodies.length - 1; i >= 0; i--) {
        const el = emailBodies[i];

        // ensure it's visible
        if (el.offsetParent !== null) {
            latestEmail = el;
            break;
        }
    }

    if (!latestEmail) return '';

    // Clone to safely clean
    const clone = latestEmail.cloneNode(true);

    // ❌ Remove quoted replies (very important)
    const quotes = clone.querySelectorAll('.gmail_quote');
    quotes.forEach(q => q.remove());

    const text = clone.innerText.trim();

    console.log("✅ FINAL EMAIL CONTENT:", text);

    return text;
}

/* -------- INSERT TEXT -------- */
function insertText(text) {
    const box = getComposeBox();
    if (!box) return;

    box.focus();
    document.execCommand('insertText', false, text);
}

/* -------- CREATE BUTTON -------- */
function createButton() {
    const btn = document.createElement('div');

    btn.innerText = "AI Reply";
    btn.style.marginRight = "8px";
    btn.style.padding = "6px 12px";
    btn.style.background = "#0b57d0";
    btn.style.color = "#fff";
    btn.style.borderRadius = "18px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "13px";

    btn.classList.add("ai-reply-btn");

    return btn;
}

/* -------- INJECT BUTTON -------- */
function injectButton() {
    const sendBtn = getSendButton();

    if (!sendBtn) return;

    const container = sendBtn.parentElement;

    if (!container) return;

    // prevent duplicate
    if (container.querySelector('.ai-reply-btn')) return;

    console.log("🚀 Injecting button near Send");

    const btn = createButton();

    btn.onclick = async () => {
        try {
            btn.innerText = "Generating...";

            const emailContent = getEmailContent();
            if (!emailContent) {
                alert("No email content found");
                return;
            }

            const res = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    emailContent,
                    tone: "professional"
                })
            });

            const data = await res.text();

            insertText(data);

        } catch (err) {
            console.error(err);
            alert("API error");
        } finally {
            btn.innerText = "AI Reply";
        }
    };

    // 🔥 INSERT LEFT OF SEND BUTTON
    container.insertBefore(btn, sendBtn);
}

/* -------- OBSERVER -------- */
const observer = new MutationObserver(() => {
    injectButton();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

/* -------- FORCE LOOP -------- */
setInterval(injectButton, 1500);