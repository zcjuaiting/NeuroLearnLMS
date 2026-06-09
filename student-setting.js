const fontSizeSelect = document.getElementById('fontSizeSelect');
const colorModeSelect = document.getElementById('colorModeSelect');
const ttsToggle = document.querySelector('.switch input');
const adjustBtn = document.querySelector('.btn-adjust');
const screenContainer = document.querySelector('.screen-container');

function applySettings() {
    const savedFontSize = localStorage.getItem('student-fontSize') || 'Medium';
    const savedColorMode = localStorage.getItem('student-colorMode') || 'Normal';
    const savedTTS = localStorage.getItem('student-tts') === 'true';

    if (fontSizeSelect) fontSizeSelect.value = savedFontSize;
    if (colorModeSelect) colorModeSelect.value = savedColorMode;
    if (ttsToggle) ttsToggle.checked = savedTTS;

    applyLocalStyles(savedFontSize, savedColorMode);
}

function applyLocalStyles(fontSize, colorMode) {
    const textElements = document.querySelectorAll('.welcome-text, .user-name, .info-row, .divider, .pref-label, .pref-select, .parent-text, .btn-adjust');

    if (fontSize === 'Large') {
        textElements.forEach(el => el.style.fontSize = '1.25rem');
    } else if (fontSize === 'Small') {
        textElements.forEach(el => el.style.fontSize = '0.75rem');
    } else {
        textElements.forEach(el => el.style.fontSize = '');
    }

    if (colorMode === 'Dark Mode') {
        screenContainer.style.background = '#121212';
        document.querySelectorAll('.profile-card, .parent-profile-card').forEach(card => {
            card.style.backgroundColor = '#1e1e1e';
            card.style.border = '1px solid #333';
            card.style.color = '#ffffff';
        });
    } else if (colorMode === 'High Contrast') {
        screenContainer.style.background = '#000000';
        document.querySelectorAll('.profile-card, .parent-profile-card').forEach(card => {
            card.style.backgroundColor = '#000000';
            card.style.border = '3px solid #ffff00';
            card.style.color = '#ffff00';
        });
    } else {
        screenContainer.style.background = 'linear-gradient(to bottom, #aae3f0, #e0f7fa 40%, #a3e6a3 75%, #62c370)';
        document.querySelectorAll('.profile-card, .parent-profile-card').forEach(card => {
            card.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
            card.style.border = '1px solid rgba(255, 255, 255, 0.6)';
            card.style.color = '';
        });
    }
}

if (adjustBtn) {
    adjustBtn.addEventListener('click', async () => {
        const fontSize = fontSizeSelect.value;
        const colorMode = colorModeSelect.value;
        const ttsEnabled = ttsToggle.checked;

        applyLocalStyles(fontSize, colorMode);

        localStorage.setItem('student-fontSize', fontSize);
        localStorage.setItem('student-colorMode', colorMode);
        localStorage.setItem('student-tts', ttsEnabled);

        const { data, error } = await supabase
            .from('adaptive_settings')
            .insert([
                { 
                    learner_profile_id: 1, 
                    font_type: fontSize, 
                    color_contrast: colorMode,
                    text_to_speech: ttsEnabled
                }
            ]);

        if (error) {
            alert("Error saving settings to cloud: " + error.message);
        } else {
            alert("Preferences successfully updated on screen and saved in Supabase!");
        }
    });
}

applySettings();
