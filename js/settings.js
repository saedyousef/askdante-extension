// Settings page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    console.log('Settings page loaded');
    
    // Get DOM elements
    const toggleTotalTime = document.getElementById('toggleTotalTime');
    const toggleTimeRules = document.getElementById('toggleTimeRules');
    const breakRegulationSection = document.getElementById('breakRegulationSection');
    const breakRegulationMode = document.getElementById('breakRegulationMode');
    const saveBreakSettingsBtn = document.getElementById('saveBreakSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const previewContent = document.getElementById('previewContent');

    // Load saved settings
    loadSettings();

    // Event listeners
    toggleTotalTime.addEventListener('change', saveBasicSettings);
    toggleTimeRules.addEventListener('change', function() {
        saveBasicSettings();
        toggleBreakRegulationSection();
    });
    
    breakRegulationMode.addEventListener('change', function() {
        showRuleSettings(breakRegulationMode.value);
        updatePreview();
    });
    
    saveBreakSettingsBtn.addEventListener('click', saveBreakRegulationSettings);
    resetSettingsBtn.addEventListener('click', resetToDefaults);
    
    // Add threshold button
    document.getElementById('addThresholdBtn').addEventListener('click', function() {
        addThresholdItem('', '');
    });

    // Load settings from storage
    function loadSettings() {
        chrome.storage.sync.get(['showTotalTime', 'applyTimeRules', 'breakRegulationConfig'], function(result) {
            toggleTotalTime.checked = result.showTotalTime || false;
            toggleTimeRules.checked = result.applyTimeRules || false;
            
            const breakConfig = result.breakRegulationConfig || { type: 'none', config: {} };
            loadBreakRegulationSettings(breakConfig);
            
            toggleBreakRegulationSection();
            updatePreview();
        });
    }

    // Save basic settings
    function saveBasicSettings() {
        chrome.storage.sync.set({
            showTotalTime: toggleTotalTime.checked,
            applyTimeRules: toggleTimeRules.checked
        }, function() {
            console.log('Basic settings saved');
            showNotification('Settings saved successfully!', 'success');
        });
    }

    // Toggle break regulation section visibility
    function toggleBreakRegulationSection() {
        if (toggleTimeRules.checked) {
            breakRegulationSection.style.display = 'block';
        } else {
            breakRegulationSection.style.display = 'none';
        }
    }

    // Load break regulation settings
    function loadBreakRegulationSettings(config) {
        breakRegulationMode.value = config.type || 'none';
        showRuleSettings(config.type || 'none');
        
        if (config.type === 'fixed') {
            document.getElementById('fixedAfterHours').value = config.config.afterHours || 6;
            document.getElementById('fixedRequiredMinutes').value = config.config.requiredBreakMinutes || 30;
        } else if (config.type === 'dynamic') {
            document.getElementById('minValidBreakMinutes').value = config.config.minValidBreakMinutes || 15;
            loadThresholds(config.config.thresholds || []);
        } else if (config.type === 'german') {
            document.getElementById('germanMinValidBreakMinutes').value = config.config.minValidBreakMinutes || 15;
        }
    }

    // Show appropriate rule settings
    function showRuleSettings(mode) {
        const fixedRuleSettings = document.getElementById('fixedRuleSettings');
        const dynamicRuleSettings = document.getElementById('dynamicRuleSettings');
        const germanRuleSettings = document.getElementById('germanRuleSettings');
        
        [fixedRuleSettings, dynamicRuleSettings, germanRuleSettings].forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        if (mode === 'fixed' && fixedRuleSettings) {
            fixedRuleSettings.style.display = 'block';
        } else if (mode === 'dynamic' && dynamicRuleSettings) {
            dynamicRuleSettings.style.display = 'block';
        } else if (mode === 'german' && germanRuleSettings) {
            germanRuleSettings.style.display = 'block';
        }
    }

    // Load thresholds for dynamic mode
    function loadThresholds(thresholds) {
        const thresholdsList = document.getElementById('thresholdsList');
        if (!thresholdsList) return;
        
        thresholdsList.innerHTML = '';
        thresholds.forEach(threshold => {
            // Ensure we pass proper string values
            const afterHours = threshold.afterHours ? String(threshold.afterHours) : '';
            const requiredMinutes = threshold.requiredBreakMinutes ? String(threshold.requiredBreakMinutes) : '';
            addThresholdItem(afterHours, requiredMinutes);
        });
    }

    // Add threshold item
    function addThresholdItem(afterHours = '', requiredMinutes = '') {
        const thresholdsList = document.getElementById('thresholdsList');
        if (!thresholdsList) return;
        
        const thresholdItem = document.createElement('div');
        thresholdItem.className = 'threshold-item';
        
        // Ensure values are strings and not objects
        const afterHoursValue = typeof afterHours === 'string' ? afterHours : String(afterHours || '');
        const requiredMinutesValue = typeof requiredMinutes === 'string' ? requiredMinutes : String(requiredMinutes || '');
        
        thresholdItem.innerHTML = `
            <label>After:</label>
            <input type="number" class="number-input threshold-after-hours" min="1" max="12" value="${afterHoursValue}" placeholder="Hours">
            <label>Required:</label>
            <input type="number" class="number-input threshold-required-minutes" min="5" max="120" value="${requiredMinutesValue}" placeholder="Minutes">
            <button type="button" class="remove-threshold">×</button>
        `;
        
        const removeBtn = thresholdItem.querySelector('.remove-threshold');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                thresholdItem.remove();
                updatePreview();
            });
        }
        
        // Add change listeners to update preview
        const inputs = thresholdItem.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', updatePreview);
        });
        
        thresholdsList.appendChild(thresholdItem);
    }

    // Save break regulation settings
    function saveBreakRegulationSettings() {
        const mode = breakRegulationMode.value;
        let config = {};
        
        if (mode === 'fixed') {
            const fixedAfterHours = document.getElementById('fixedAfterHours');
            const fixedRequiredMinutes = document.getElementById('fixedRequiredMinutes');
            
            config = {
                afterHours: fixedAfterHours ? parseInt(fixedAfterHours.value) : 6,
                requiredBreakMinutes: fixedRequiredMinutes ? parseInt(fixedRequiredMinutes.value) : 30,
                minValidBreakMinutes: 15
            };
        } else if (mode === 'dynamic') {
            const thresholds = [];
            const thresholdItems = document.querySelectorAll('.threshold-item');
            thresholdItems.forEach(item => {
                const afterHoursInput = item.querySelector('.threshold-after-hours');
                const requiredMinutesInput = item.querySelector('.threshold-required-minutes');
                if (afterHoursInput && requiredMinutesInput) {
                    const afterHours = parseInt(afterHoursInput.value);
                    const requiredMinutes = parseInt(requiredMinutesInput.value);
                    if (afterHours && requiredMinutes) {
                        thresholds.push({ afterHours, requiredBreakMinutes: requiredMinutes });
                    }
                }
            });
            
            const minValidBreakMinutes = document.getElementById('minValidBreakMinutes');
            config = {
                minValidBreakMinutes: minValidBreakMinutes ? parseInt(minValidBreakMinutes.value) : 15,
                thresholds: thresholds
            };
        } else if (mode === 'german') {
            const germanMinValidBreakMinutes = document.getElementById('germanMinValidBreakMinutes');
            config = {
                minValidBreakMinutes: germanMinValidBreakMinutes ? parseInt(germanMinValidBreakMinutes.value) : 15
            };
        }
        
        const breakRegulationConfig = {
            type: mode,
            config: config
        };
        
        chrome.storage.sync.set({ breakRegulationConfig: breakRegulationConfig }, function() {
            console.log('Break regulation settings saved');
            showNotification('Break regulation settings saved successfully!', 'success');
            updatePreview();
        });
    }

    // Reset to defaults
    function resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            chrome.storage.sync.clear(function() {
                location.reload();
            });
        }
    }

    // Update preview
    function updatePreview() {
        const mode = breakRegulationMode.value;
        let previewText = '';
        
        switch (mode) {
            case 'none':
                previewText = 'No break regulations will be applied. Work time will be calculated continuously without any break requirements.';
                break;
            case 'fixed':
                const afterHours = document.getElementById('fixedAfterHours')?.value || 6;
                const requiredMinutes = document.getElementById('fixedRequiredMinutes')?.value || 30;
                previewText = `After working ${afterHours} hours, you will need to take a ${requiredMinutes}-minute break. Work time will be capped at ${afterHours} hours until this break requirement is met.`;
                break;
            case 'dynamic':
                const thresholds = [];
                document.querySelectorAll('.threshold-item').forEach(item => {
                    const afterHours = item.querySelector('.threshold-after-hours')?.value;
                    const requiredMinutes = item.querySelector('.threshold-required-minutes')?.value;
                    if (afterHours && requiredMinutes) {
                        thresholds.push(`After ${afterHours}h: ${requiredMinutes}m break required`);
                    }
                });
                previewText = thresholds.length > 0 
                    ? `Multiple break thresholds will be applied:\n• ${thresholds.join('\n• ')}`
                    : 'Add thresholds to see how the dynamic regulation will work.';
                break;
            case 'german':
                previewText = 'German Arbeitszeitgesetz §4 will be applied:\n• After 6-9 hours: 30 minutes required break (segments ≥15m)\n• After >9 hours: 45 minutes required break (segments ≥15m)';
                break;
        }
        
        previewContent.innerHTML = previewText.replace(/\n/g, '<br>');
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px'
        });
        
        if (type === 'success') {
            notification.style.background = '#28a745';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
        } else {
            notification.style.background = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
