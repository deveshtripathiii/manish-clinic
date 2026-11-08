// --- Dr. Manish Dental Clinic - OPD Booking & Manish AI ---

document.addEventListener('DOMContentLoaded', () => {
    initDatePicker();
    initPhoneAndPatientCode();
    initSlotSelection();
    initBookingForm();
    initMobileNav();
    initAadharFormatter();
});

// State
let selectedSlot = null;
const CLINIC_WHATSAPP = '919956533534';
const DISPLAY_PHONE = '9956533534';

// 1. Initialize Date Picker (Min date = Today)
function initDatePicker() {
    const dateInput = document.getElementById('bookingDate');
    if (!dateInput) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDateStr = `${yyyy}-${mm}-${dd}`;

    dateInput.min = minDateStr;
    dateInput.value = minDateStr;

    dateInput.addEventListener('change', () => {
        const dateError = document.getElementById('dateError');
        if (dateError) dateError.classList.remove('visible');
        updateSlotBanner();
    });
}

// 2. Patient Code: First 4 digits of Phone Number
function initPhoneAndPatientCode() {
    const phoneInput = document.getElementById('phoneNumber');
    const codeInput = document.getElementById('patientCode');
    const codeBadge = document.getElementById('codeBadge');
    const phoneError = document.getElementById('phoneError');

    if (!phoneInput || !codeInput) return;

    const updatePatientCode = () => {
        // Strip non-digits
        let clean = phoneInput.value.replace(/\D/g, '');
        if (clean.length > 10) clean = clean.substring(0, 10);
        phoneInput.value = clean;

        if (clean.length >= 4) {
            const firstFour = clean.substring(0, 4);
            codeInput.value = firstFour;
            if (codeBadge) codeBadge.textContent = `Code: ${firstFour}`;
        } else if (clean.length > 0) {
            codeInput.value = clean.padEnd(4, '-');
            if (codeBadge) codeBadge.textContent = `Code: ${clean.padEnd(4, '-')}`;
        } else {
            codeInput.value = '';
            if (codeBadge) codeBadge.textContent = 'Code: ----';
        }

        if (clean.length === 10 && phoneError) {
            phoneError.classList.remove('visible');
            phoneInput.classList.remove('input-error');
        }
    };

    phoneInput.addEventListener('input', updatePatientCode);
    phoneInput.addEventListener('blur', () => {
        const clean = phoneInput.value.replace(/\D/g, '');
        if (clean.length !== 10 && phoneError) {
            phoneError.classList.add('visible');
            phoneInput.classList.add('input-error');
        }
    });
}

// 3. Aadhar formatter (Optional, adds spaces/hyphens nicely)
function initAadharFormatter() {
    const aadharInput = document.getElementById('aadharNumber');
    if (!aadharInput) return;

    aadharInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 12);
        // format XXXX-XXXX-XXXX
        let formatted = '';
        for (let i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += '-';
            formatted += val[i];
        }
        e.target.value = formatted;
    });
}

// 4. 30-Minute Slot Selection: Only one slot booked at once
function initSlotSelection() {
    const allSlotBtns = document.querySelectorAll('.slot-btn');
    const slotError = document.getElementById('slotError');

    allSlotBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const slotValue = btn.getAttribute('data-slot');

            if (btn.classList.contains('selected')) {
                // Deselect
                btn.classList.remove('selected');
                selectedSlot = null;
            } else {
                // Deselect all others (Enforce: only one time slot for once)
                allSlotBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedSlot = slotValue;

                if (slotError) slotError.classList.remove('visible');
            }

            updateSlotBanner();
        });
    });
}

function updateSlotBanner() {
    const banner = document.getElementById('previewSlotText');
    const dateInput = document.getElementById('bookingDate');
    if (!banner) return;

    const dateVal = dateInput && dateInput.value ? formatDateDisplay(dateInput.value) : 'आज';

    if (selectedSlot) {
        banner.innerHTML = `<span style="color:#0284c7;">${dateVal}</span> • <span style="color:#15803d; font-weight:800;">${selectedSlot}</span> (30 Min)`;
    } else {
        banner.textContent = 'कृपया नीचे से 30-मिनट का एक स्लॉट चुनें';
    }
}

function formatDateDisplay(yyyyMmDd) {
    if (!yyyyMmDd) return '';
    const parts = yyyyMmDd.split('-');
    if (parts.length !== 3) return yyyyMmDd;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// 5. Booking Form Submission -> WhatsApp (9956533534)
function initBookingForm() {
    const form = document.getElementById('opdBookingForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('patientName');
        const phoneInput = document.getElementById('phoneNumber');
        const codeInput = document.getElementById('patientCode');
        const aadharInput = document.getElementById('aadharNumber');
        const dateInput = document.getElementById('bookingDate');
        const concernSelect = document.getElementById('dentalConcern');
        const notesInput = document.getElementById('additionalNotes');

        const nameError = document.getElementById('nameError');
        const phoneError = document.getElementById('phoneError');
        const dateError = document.getElementById('dateError');
        const slotError = document.getElementById('slotError');

        let isValid = true;

        // Name Validation
        const nameVal = nameInput ? nameInput.value.trim() : '';
        if (!nameVal) {
            nameError.classList.add('visible');
            nameInput.classList.add('input-error');
            isValid = false;
        } else {
            nameError.classList.remove('visible');
            nameInput.classList.remove('input-error');
        }

        // Phone Validation (10 digits)
        const phoneClean = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
        if (phoneClean.length !== 10) {
            phoneError.classList.add('visible');
            phoneInput.classList.add('input-error');
            isValid = false;
        } else {
            phoneError.classList.remove('visible');
            phoneInput.classList.remove('input-error');
        }

        // Patient Code: ensure it is first 4 digits
        const patientCode = phoneClean.length >= 4 ? phoneClean.substring(0, 4) : 'N/A';

        // Date Validation
        const dateVal = dateInput ? dateInput.value : '';
        if (!dateVal) {
            dateError.classList.add('visible');
            isValid = false;
        } else {
            dateError.classList.remove('visible');
        }

        // Slot Validation (Must pick one 30-min slot)
        if (!selectedSlot) {
            slotError.classList.add('visible');
            isValid = false;
            // Scroll to slots smoothly
            const slotContainer = document.querySelector('.slots-container');
            if (slotContainer) {
                slotContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            slotError.classList.remove('visible');
        }

        if (!isValid) return;

        // Build WhatsApp OPD Message
        const aadharVal = aadharInput && aadharInput.value.trim() ? aadharInput.value.trim() : 'नहीं दिया गया (Not provided)';
        const concernVal = concernSelect ? concernSelect.value : 'नियमित परामर्श';
        const notesVal = notesInput && notesInput.value.trim() ? notesInput.value.trim() : 'कोई विशेष टिप्पणी नहीं';
        const formattedDate = formatDateDisplay(dateVal);

        const waMessage = 
`🏥 *DR. MANISH DENTAL CLINIC - OPD BOOKING* 🏥
------------------------------------------
👤 *मरीज का नाम (Name):* ${nameVal}
📱 *मोबाइल नंबर (Phone):* ${phoneClean}
🆔 *पेशेंट कोड (Patient Code):* ${patientCode}
🪪 *आधार कार्ड (Aadhar):* ${aadharVal}
📅 *अपॉइंटमेंट तारीख (Date):* ${formattedDate}
⏰ *30-मिनट समय स्लॉट (Slot):* ${selectedSlot}
🦷 *समस्या/उपचार (Concern):* ${concernVal}
📝 *टिप्पणी (Notes):* ${notesVal}
------------------------------------------
_नमस्ते Dr. Manish जी, कृपया मेरा 30 मिनट का OPD स्लॉट कन्फर्म करें।_`;

        const waUrl = `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(waMessage)}`;

        // Show receipt in page
        showBookingReceipt({
            name: nameVal,
            phone: phoneClean,
            code: patientCode,
            aadhar: aadharVal,
            date: formattedDate,
            slot: selectedSlot,
            concern: concernVal,
            url: waUrl
        });

        // Open WhatsApp in new tab/window
        window.open(waUrl, '_blank');
    });
}

function showBookingReceipt(data) {
    const box = document.getElementById('bookingReceiptBox');
    const summary = document.getElementById('receiptSummary');
    const directLink = document.getElementById('directWhatsAppLink');

    if (!box || !summary) return;

    summary.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>मरीज का नाम:</strong> ${data.name}</div>
            <div><strong>मोबाइल नंबर:</strong> ${data.phone}</div>
            <div><strong>पेशेंट कोड (First 4 digits):</strong> <span style="background:#dbeafe; color:#0369a1; padding:2px 8px; border-radius:4px; font-weight:800; font-family:monospace;">${data.code}</span></div>
            <div><strong>आधार नंबर:</strong> ${data.aadhar}</div>
            <div><strong>तारीख:</strong> ${data.date}</div>
            <div><strong>30-Min Slot:</strong> <span style="color:#15803d; font-weight:800;">${data.slot}</span></div>
            <div style="grid-column: span 2;"><strong>परामर्श का कारण:</strong> ${data.concern}</div>
        </div>
    `;

    if (directLink) {
        directLink.href = data.url;
    }

    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeReceipt() {
    const box = document.getElementById('bookingReceiptBox');
    if (box) box.style.display = 'none';
}

// 6. Mobile Navigation
function initMobileNav() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}

// 7. --- Manish AI Chat Assistant ---

function toggleManishAI() {
    const windowEl = document.getElementById('manishChatWindow');
    if (!windowEl) return;
    windowEl.classList.toggle('active');

    if (windowEl.classList.contains('active')) {
        const input = document.getElementById('chatInput');
        if (input) setTimeout(() => input.focus(), 200);
    }
}

function openManishAI(customMessage = null) {
    const windowEl = document.getElementById('manishChatWindow');
    if (windowEl && !windowEl.classList.contains('active')) {
        windowEl.classList.add('active');
    }

    if (customMessage) {
        setTimeout(() => {
            handleQuickPrompt(customMessage);
        }, 300);
    }
}

function handleQuickPrompt(text) {
    addUserMessage(text);
    generateAiResponse(text);
}

function handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    addUserMessage(text);
    input.value = '';

    generateAiResponse(text);
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const timeStr = getCurrentTimeStr();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user-message';
    msgDiv.innerHTML = `
        <div class="message-bubble">
            <p>${escapeHtml(text)}</p>
        </div>
        <span class="message-time">${timeStr}</span>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollChatToBottom();
}

function addBotMessage(htmlContent, showBookingAction = false) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const timeStr = getCurrentTimeStr();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot-message';

    let actionBtnHtml = '';
    if (showBookingAction) {
        actionBtnHtml = `
            <div style="margin-top: 10px; display:flex; gap:6px; flex-wrap:wrap;">
                <a href="#booking" onclick="toggleManishAI()" style="background:#0284c7; color:white; padding:6px 12px; border-radius:6px; font-size:0.78rem; font-weight:700; text-decoration:none; display:inline-block;">📅 30-Min Slot Book करें</a>
                <a href="https://wa.me/${CLINIC_WHATSAPP}" target="_blank" style="background:#25D366; color:white; padding:6px 12px; border-radius:6px; font-size:0.78rem; font-weight:700; text-decoration:none; display:inline-block;">💬 WhatsApp (9956533534)</a>
            </div>
        `;
    }

    msgDiv.innerHTML = `
        <div class="message-bubble">
            ${htmlContent}
            ${actionBtnHtml}
        </div>
        <span class="message-time">${timeStr}</span>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollChatToBottom();
}

function generateAiResponse(userQuery) {
    const query = userQuery.toLowerCase();

    // Show typing simulation
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'aiTypingIndicator';
    typingDiv.innerHTML = `
        <div class="message-bubble" style="padding: 6px 12px; font-style:italic; color:#64748b;">
            Manish AI सोच रहा है... 💬
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollChatToBottom();

    setTimeout(() => {
        // Remove typing indicator
        const typingEl = document.getElementById('aiTypingIndicator');
        if (typingEl) typingEl.remove();

        let response = '';
        let showBooking = true;

        if (query.includes('opd') || query.includes('slot') || query.includes('book') || query.includes('अपॉइंटमेंट') || query.includes('बुकिंग')) {
            response = `<p><strong>OPD स्लॉट बुक करना बहुत आसान है:</strong></p>
            <p>1. अपना नाम और 10 अंकों का फोन नंबर भरें।</p>
            <p>2. आपका <strong>पेशेंट कोड</strong> आपके फोन के पहले 4 नंबर से खुद बन जाएगा।</p>
            <p>3. अपनी सुविधानुसार तारीख और <strong>30 मिनट का एक समय स्लॉट</strong> चुनें।</p>
            <p>4. 'WhatsApp पर बुक करें' बटन दबाएं, आपका स्लॉट तुरंत Dr. Manish के WhatsApp (<strong>9956533534</strong>) पर चला जाएगा!</p>`;
        } 
        else if (query.includes('दर्द') || query.includes('pain') || query.includes('ache') || query.includes('सूजन') || query.includes('bleed') || query.includes('खून')) {
            response = `<p><strong>दांत के दर्द में तुरंत राहत के उपाय:</strong></p>
            <p>• हल्के गुनगुने पानी में आधा चम्मच नमक डालकर 2-3 बार कुल्ला करें।</p>
            <p>• यदि उपलब्ध हो, तो दर्द वाले हिस्से पर थोड़ा सा <strong>लौंग का तेल (Clove Oil)</strong> लगाएं।</p>
            <p>• उस तरफ से भारी या बहुत ठंडा-गर्म खाने से बचें।</p>
            <p>⚠️ <em>यह केवल तात्कालिक राहत है। संक्रमण से बचने के लिए Dr. Manish से 30-मिनट का OPD चेकअप तुरंत करवाएं।</em></p>`;
        }
        else if (query.includes('rct') || query.includes('रूट कैनाल') || query.includes('root canal')) {
            response = `<p><strong>रूट कैनाल ट्रीटमेंट (RCT):</strong></p>
            <p>Dr. Manish क्लिनिक में आधुनिक और दर्दमुक्त <em>Single-Sitting Root Canal</em> किया जाता है। इससे सड़े हुए दांत को बिना उखाड़े पूरी तरह स्वस्थ बना दिया जाता है। इसके बाद कैप/क्राउन लगाया जाता है।</p>
            <p>विस्तृत जांच के लिए आज ही 30 मिनट का स्लॉट बुक करें।</p>`;
        }
        else if (query.includes('code') || query.includes('पेशेंट कोड') || query.includes('patient code')) {
            response = `<p><strong>पेशेंट कोड (Patient Code) क्या है?</strong></p>
            <p>क्लिनिक में आपकी पहचान के लिए आपके <strong>10 अंकों के मोबाइल नंबर के पहले 4 अंक</strong> ही आपका पेशेंट कोड होते हैं।</p>
            <p>उदा. यदि आपका फोन <strong>9956533534</strong> है, तो आपका पेशेंट कोड <strong>9956</strong> होगा। यह फॉर्म में अपने आप भर जाता है!</p>`;
            showBooking = false;
        }
        else if (query.includes('time') || query.includes('timing') || query.includes('समय') || query.includes('address') || query.includes('पता') || query.includes('location')) {
            response = `<p><strong>🏥 क्लिनिक समय और स्थान:</strong></p>
            <p>• <strong>सोमवार से शनिवार:</strong> सुबह 10:00 AM से रात 08:00 PM</p>
            <p>• <strong>रविवार:</strong> सुबह 10:00 AM से दोपहर 02:00 PM</p>
            <p>• <strong>पता:</strong> Main Market, Dental Care Centre</p>
            <p>• <strong>हेल्पलाइन / WhatsApp:</strong> +91 9956533534</p>`;
            showBooking = true;
        }
        else if (query.includes('cost') || query.includes('fee') || query.includes('चार्ज') || query.includes('फीस') || query.includes('खर्च') || query.includes('price')) {
            response = `<p><strong>उपचार शुल्क (Pricing & Consultation):</strong></p>
            <p>Dr. Manish क्लिनिक में परामर्श शुल्क बहुत ही उचित और पारदर्शी है। अलग-अलग उपचार (सफाई, रूट कैनाल, इम्प्लांट, ब्रेसिज़) का खर्च दांत की स्थिति पर निर्भर करता है।</p>
            <p>क्लिनिक आकर 30-मिनट OPD चेकअप कराएं या WhatsApp पर सीधा एस्टिमेट पूछें।</p>`;
        }
        else if (query.includes('doctor') || query.includes('dr. manish') || query.includes('डॉक्टर')) {
            response = `<p><strong>Dr. Manish (BDS, MDS):</strong></p>
            <p>वे 10 से अधिक वर्षों के अनुभव वाले प्रतिष्ठित डेंटल सर्जन हैं। 5000 से अधिक मरीजों का सफल और दर्दमुक्त इलाज कर चुके हैं। प्रत्येक मरीज को पूरा 30 मिनट का व्यक्तिगत समय देते हैं।</p>`;
        }
        else {
            // Friendly default fallback
            response = `<p>धन्यवाद आपके सवाल के लिए! 😊</p>
            <p>मैं <strong>Manish AI</strong> क्लिनिक की सभी सुविधाओं से पूरी तरह अपडेटेड हूँ। आप ऊपर दिए गए फॉर्म से <strong>30-मिनट का OPD स्लॉट</strong> बुक कर सकते हैं या सीधे Dr. Manish के WhatsApp (<strong>9956533534</strong>) पर बात कर सकते हैं।</p>
            <p>क्या आप OPD अपॉइंटमेंट का स्लॉट अभी बुक करना चाहते हैं?</p>`;
        }

        addBotMessage(response, showBooking);
    }, 600);
}

function getCurrentTimeStr() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
}

function scrollChatToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
