const fontSizeSelect = document.getElementById('fontSizeSelect');
const colorModeSelect = document.getElementById('colorModeSelect');
const ttsToggle = document.getElementById('ttsToggle');
const adjustBtn = document.querySelector('.btn-adjust');
const screenContainer = document.querySelector('.screen-container');

function applySettings() {
    const savedFontSize = localStorage.getItem('parent-fontSize') || 'Medium';
    const savedColorMode = localStorage.getItem('parent-colorMode') || 'Normal';
    const savedTTS = localStorage.getItem('parent-tts') === 'true';

    if (fontSizeSelect) fontSizeSelect.value = savedFontSize;
    if (colorModeSelect) colorModeSelect.value = savedColorMode;
    if (ttsToggle) ttsToggle.checked = savedTTS;

    applyLocalStyles(savedFontSize, savedColorMode);
}

function applyLocalStyles(fontSize, colorMode) {
    const textElements = document.querySelectorAll('.welcome-text, .user-name, .info-row, .divider, .pref-label, .pref-select, .learner-text, .btn-adjust');

    if (fontSize === 'Large') {
        textElements.forEach(el => el.style.fontSize = '1.25rem');
    } else if (fontSize === 'Small') {
        textElements.forEach(el => el.style.fontSize = '0.75rem');
    } else {
        textElements.forEach(el => el.style.fontSize = '');
    }

    if (colorMode === 'Dark Mode') {
        screenContainer.style.background = '#121212';
        document.querySelectorAll('.profile-card, .learner-profile-card').forEach(card => {
            card.style.backgroundColor = '#1e1e1e';
            card.style.border = '1px solid #333';
            card.style.color = '#ffffff';
        });
        document.querySelectorAll('.info-label, .info-value, .pref-label, .learner-text, .divider').forEach(el => {
            el.style.color = '#ffffff';
        });
    } else if (colorMode === 'High Contrast') {
        screenContainer.style.background = '#000000';
        document.querySelectorAll('.profile-card, .learner-profile-card').forEach(card => {
            card.style.backgroundColor = '#000000';
            card.style.border = '3px solid #ffff00';
            card.style.color = '#ffff00';
        });
        document.querySelectorAll('.info-label, .info-value, .pref-label, .learner-text, .divider').forEach(el => {
            el.style.color = '#ffff00';
        });
    } else {
        screenContainer.style.background = 'linear-gradient(to bottom, #aae3f0, #e0f7fa 40%, #a3e6a3 75%, #62c370)';
        document.querySelectorAll('.profile-card, .learner-profile-card').forEach(card => {
            card.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
            card.style.border = '1px solid rgba(255, 255, 255, 0.6)';
            card.style.color = '';
        });
        document.querySelectorAll('.info-label').forEach(el => el.style.color = '#4a777a');
        document.querySelectorAll('.info-value, .pref-label').forEach(el => el.style.color = '#2a4d50');
        document.querySelectorAll('.learner-text').forEach(el => el.style.color = '#3e6164');
        document.querySelectorAll('.divider').forEach(el => el.style.color = '#639da1');
    }
}

if (adjustBtn) {
    adjustBtn.addEventListener('click', async () => {
        const fontSize = fontSizeSelect.value;
        const colorMode = colorModeSelect.value;
        const ttsEnabled = ttsToggle.checked;

        applyLocalStyles(fontSize, colorMode);

        localStorage.setItem('parent-fontSize', fontSize);
        localStorage.setItem('parent-colorMode', colorMode);
        localStorage.setItem('parent-tts', ttsEnabled);

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
            alert("Error saving parent adjustments to cloud: " + error.message);
        } else {
            alert("Parent configurations successfully stored in the Supabase database!");
        }
    });
}

applySettings();
