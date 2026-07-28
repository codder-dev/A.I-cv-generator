// ==========================================
// STANDALONE APPLICATION LETTER GENERATOR
// ==========================================



// ==========================================
// API URL DETECTION
// ==========================================
var API_URL = '';

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_URL = '/api/generate-cv';
} else if (window.location.hostname.includes('github.io')) {
    API_URL = 'https://a-i-cv-generator.vercel.app/api/generate-cv';
} else {
    API_URL = '/api/generate-cv';
}

console.log('🌐 Standalone API URL:', API_URL);

(function() {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStandaloneLetter);
    } else {
        initStandaloneLetter();
    }

    function initStandaloneLetter() {
        console.log('📝 Initializing Standalone Letter Generator...');

        // ===== DOM Elements =====
        const form = document.getElementById('letterForm');
        if (!form) {
            console.warn('⚠️ Letter form not found!');
            return;
        }

        const sections = document.querySelectorAll('.letter-section');
        const progressSteps = document.querySelectorAll('.letter-progress .progress-step');
        const prevBtns = document.querySelectorAll('.letter-prev-step');
        const nextBtns = document.querySelectorAll('.letter-next-step');
        const generateBtn = document.getElementById('generateLetterBtn');

        let currentStep = 1;
        const totalSteps = sections.length;

        console.log('📊 Found ' + totalSteps + ' letter sections');

        // ===== Navigation Functions =====
        function goToStep(step) {
            if (step < 1 || step > totalSteps) return;

            sections.forEach(function(section, index) {
                section.classList.toggle('active', (index + 1) === step);
            });

            progressSteps.forEach(function(stepEl, index) {
                const stepNum = index + 1;
                stepEl.classList.remove('active', 'completed');
                if (stepNum === step) {
                    stepEl.classList.add('active');
                } else if (stepNum < step) {
                    stepEl.classList.add('completed');
                }
            });

            currentStep = step;

            if (step === totalSteps) {
                updateLetterSummary();
            }

            // Scroll to form container
            const letterContainer = document.querySelector('.letter-form-container');
            if (letterContainer) {
                letterContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        function nextStep() {
            if (validateLetterStep(currentStep)) {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                }
            }
        }

        function prevStep() {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        }

        // ===== Validate Current Step - SAME AS CV FORM =====
        function validateLetterStep(step) {
            const section = sections[step - 1];
            if (!section) return true;

            const inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            inputs.forEach(function(input) {
                const error = input.closest('.form-group').querySelector('.field-error');
                if (!input.value.trim()) {
                    input.classList.add('error');
                    if (error) {
                        error.textContent = 'This field is required';
                        error.classList.add('show');
                    }
                    isValid = false;
                } else {
                    input.classList.remove('error');
                    if (error) {
                        error.classList.remove('show');
                    }
                }
            });

            // Validate email - SAME AS CV FORM
            const emailInput = section.querySelector('#letterEmail');
            if (emailInput && emailInput.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value.trim())) {
                    emailInput.classList.add('error');
                    const error = emailInput.closest('.form-group').querySelector('.field-error');
                    if (error) {
                        error.textContent = 'Please enter a valid email address';
                        error.classList.add('show');
                    }
                    isValid = false;
                }
            }

            // Validate phone - SAME AS CV FORM
            const phoneInput = section.querySelector('#letterPhone');
            if (phoneInput && phoneInput.value.trim()) {
                const phoneRegex = /^[0-9\s\-+()]{7,15}$/;
                if (!phoneRegex.test(phoneInput.value.trim())) {
                    phoneInput.classList.add('error');
                    const error = phoneInput.closest('.form-group').querySelector('.field-error');
                    if (error) {
                        error.textContent = 'Please enter a valid phone number';
                        error.classList.add('show');
                    }
                    isValid = false;
                }
            }

            if (!isValid) {
                const firstError = section.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            return isValid;
        }

        // ===== Update Letter Summary =====
        function updateLetterSummary() {
            const container = document.getElementById('letterSummaryContent');
            if (!container) return;

            const fullName = document.getElementById('letterFullName')?.value?.trim() || 'Not provided';
            const address = document.getElementById('letterAddress')?.value?.trim() || 'Not provided';
            const phone = document.getElementById('letterPhone')?.value?.trim() || 'Not provided';
            const email = document.getElementById('letterEmail')?.value?.trim() || 'Not provided';
            const companyName = document.getElementById('letterCompanyName')?.value?.trim() || 'Not provided';
            const companyAddress = document.getElementById('letterCompanyAddress')?.value?.trim() || 'Not provided';
            const position = document.getElementById('letterPosition')?.value?.trim() || 'Not provided';
            const currentJob = document.getElementById('letterCurrentJob')?.value?.trim() || 'Not specified';
            const currentCompany = document.getElementById('letterCurrentCompany')?.value?.trim() || 'Not specified';

            let html = '';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-user"></i> Full Name:</span><span class="summary-value">' + fullName + '</span></div>';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-home"></i> Address:</span><span class="summary-value">' + address + '</span></div>';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-phone"></i> Phone:</span><span class="summary-value">' + phone + '</span></div>';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-envelope"></i> Email:</span><span class="summary-value">' + email + '</span></div>';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-briefcase"></i> Current Job:</span><span class="summary-value">' + currentJob + '</span></div>';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-building"></i> Current Company:</span><span class="summary-value">' + currentCompany + '</span></div>';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-building"></i> Company Name:</span><span class="summary-value">' + companyName + '</span></div>';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-location-dot"></i> Company Address:</span><span class="summary-value">' + companyAddress + '</span></div>';
            html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-briefcase"></i> Position:</span><span class="summary-value">' + position + '</span></div>';

            container.innerHTML = html;
        }

        // ==========================================
        // BUILD LETTER PROMPT FOR AI
        // ==========================================
        function buildStandaloneLetterPrompt(data) {
            var prompt = 'Write a professional application letter for:\n\n';
            prompt += 'Name: ' + data.fullName + '\n';
            prompt += 'Address: ' + data.address + '\n';
            prompt += 'Phone: ' + data.phone + '\n';
            prompt += 'Email: ' + data.email + '\n\n';
            
            if (data.currentJob && data.currentCompany) {
                prompt += 'Currently working as: ' + data.currentJob + ' at ' + data.currentCompany + '\n\n';
            } else if (data.currentJob) {
                prompt += 'Currently working as: ' + data.currentJob + '\n\n';
            } else if (data.currentCompany) {
                prompt += 'Currently working at: ' + data.currentCompany + '\n\n';
            }
            
            prompt += 'Applying for: ' + data.position + ' at ' + data.companyName + '\n\n';
            prompt += 'Company Address: ' + data.companyAddress + '\n\n';
            
            prompt += 'Write 3 professional paragraphs for the letter body. Start directly with the first paragraph. Do not include any introductory text like "Here is the letter" or "I\'m happy to assist". Just write the letter content. Make it specific to the candidate and the position.';

            return prompt;
        }

        // ==========================================
        // FORMAT LETTER
        // ==========================================
        function formatLetter(content, data) {
            var date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            var companyName = data.companyName || '[Company Name]';
            var companyAddress = data.companyAddress || '[Company Address]';
            var position = data.position || '[Position]';
            var senderAddress = data.address || '[Your Address]';
            
            var cleanContent = content
                .replace(/I'm happy to assist you with[^.]*\./gi, '')
                .replace(/I must inform you that[^.]*\./gi, '')
                .replace(/However, I will do my best to[^.]*\./gi, '')
                .replace(/Here is a well-structured application letter[:.]*/gi, '')
                .replace(/Here is a professional application letter[:.]*/gi, '')
                .replace(/Here is an application letter[:.]*/gi, '')
                .replace(/as advertised on\s*\[[^\]]*\]/gi, '')
                .replace(/as advertised\s*on\s*[^\n,.]*/gi, '')
                .replace(/as advertised/gi, '')
                .replace(/Dear Hiring Manager,?/gi, '')
                .replace(/Dear Sir\/Madam,?/gi, '')
                .replace(/Dear Sir,?/gi, '')
                .replace(/Dear Madam,?/gi, '')
                .replace(/Yours sincerely,?/gi, '')
                .replace(/Yours faithfully,?/gi, '')
                .replace(/\[Date\]/gi, '')
                .replace(/\[Recipient's Name\]/gi, '')
                .replace(/\[Recipient's Title\]/gi, '')
                .replace(/\[Company Name\]/gi, '')
                .replace(/\[Company Address\]/gi, '')
                .replace(/\[Your Name\]/gi, '')
                .replace(/\[Your Address\]/gi, '')
                .replace(/\[Your Email\]/gi, '')
                .replace(/\[Your Phone\]/gi, '')
                .replace(/\[Position\]/gi, '')
                .replace(/\*\*/g, '')
                .replace(/##/g, '')
                .trim();
            
            var namePattern = new RegExp('^' + data.fullName + '[,\\s]*', 'i');
            cleanContent = cleanContent.replace(namePattern, '');
            
            var html = '';
            
            html += '<div style="font-family: \'Times New Roman\', Times, serif; max-width: 800px; margin: 0 auto; padding: 60px 50px; background: white; border: 1px solid #e0dbd3; border-radius: 8px;">';
            
            html += '<div style="text-align: right; margin-bottom: 20px;">';
            html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.8;">' + (data.fullName || 'Your Name') + '</p>';
            
            var addressLines = senderAddress.split('\n').filter(function(line) { return line.trim(); });
            if (addressLines.length === 0) {
                addressLines = [senderAddress];
            }
            addressLines.forEach(function(line) {
                html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + line.trim() + '</p>';
            });
            
            html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + (data.phone || '') + '</p>';
            html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + (data.email || '') + '</p>';
            html += '</div>';
            
            html += '<div style="text-align: right; margin-bottom: 30px;">';
            html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + date + '</p>';
            html += '</div>';
            
            html += '<div style="margin-bottom: 30px;">';
            html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">The Human Resource Manager</p>';
            html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + companyName + '</p>';
            
            var companyLines = companyAddress.split('\n').filter(function(line) { return line.trim(); });
            if (companyLines.length === 0) {
                companyLines = [companyAddress];
            }
            companyLines.forEach(function(line) {
                html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + line.trim() + '</p>';
            });
            
            html += '</div>';
            
            html += '<div style="margin-bottom: 12px;">';
            html += '<p style="font-size: 18px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif;">Dear Sir/Madam,</p>';
            html += '</div>';
            
            html += '<div style="margin-bottom: 20px;">';
            html += '<p style="font-size: 14px; color: #070707; text-align: center; font-weight: 800; text-decoration: underline; font-family: \'Times New Roman\', Times, serif; margin: 0; text-transform: uppercase;"><strong>RE:</strong> APPLICATION FOR THE POSITION OF ' + position.toUpperCase() + '</p>';
            html += '</div>';
            
            html += '<div style="font-size: 15px; color: #000000; line-height: 1.8; font-family: \'Times New Roman\', Times, serif; margin-bottom: 30px;">';
            
            var paragraphs = cleanContent.split('\n').filter(function(p) { return p.trim(); });
            
            if (paragraphs.length === 0) {
                html += '<p style="margin: 0 0 16px 0; text-indent: 0;">I am writing to express my strong interest in the ' + position + ' position at ' + companyName + '. With my qualifications and experience, I am confident that I would be an excellent addition to your team.</p>';
                html += '<p style="margin: 0 0 16px 0; text-indent: 0;">I look forward to the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.</p>';
            } else {
                paragraphs.forEach(function(p) {
                    html += '<p style="margin: 0 0 16px 0; text-indent: 0;">' + p.trim() + '</p>';
                });
            }
            
            html += '</div>';
            
            html += '<div style="margin-top: 30px;">';
            html += '<p style="font-size: 15px; color: #000000; margin: 0 0 4px 0; font-family: \'Times New Roman\', Times, serif;">Yours faithfully,</p>';
            html += '<div style="height: 30px;"></div>';
            html += '<p style="font-size: 18px; font-weight: 700; color: #000000; margin: 8px 0 0 0; font-family: \'Times New Roman\', Times, serif;">' + data.fullName + '</p>';
            html += '</div>';
            
            html += '</div>';
            
            return html;
        }

        // ==========================================
        // GENERATE LETTER - CALLS BACKEND API
        // ==========================================
        async function generateLetter() {
            // Validate all steps first
            for (let i = 1; i <= totalSteps; i++) {
                if (!validateLetterStep(i)) {
                    goToStep(i);
                    return;
                }
            }

            // Collect data
            const data = {
                fullName: document.getElementById('letterFullName')?.value?.trim() || '',
                address: document.getElementById('letterAddress')?.value?.trim() || '',
                phone: document.getElementById('letterPhone')?.value?.trim() || '',
                email: document.getElementById('letterEmail')?.value?.trim() || '',
                currentJob: document.getElementById('letterCurrentJob')?.value?.trim() || '',
                currentCompany: document.getElementById('letterCurrentCompany')?.value?.trim() || '',
                companyName: document.getElementById('letterCompanyName')?.value?.trim() || '',
                companyAddress: document.getElementById('letterCompanyAddress')?.value?.trim() || '',
                position: document.getElementById('letterPosition')?.value?.trim() || ''
            };

            // Validate required fields
            if (!data.fullName || !data.address || !data.phone || !data.email || 
                !data.companyName || !data.companyAddress || !data.position) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }

            // Show loading state
            const generateBtn = document.getElementById('generateLetterBtn');
            const originalText = generateBtn.innerHTML;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            generateBtn.disabled = true;

            try {
                var prompt = buildStandaloneLetterPrompt(data);

                // Build messages for the API
                var messages = [
                    {
                        role: 'system',
                        content: 'Write a Professional cover letter. Write ONLY the body paragraphs of the application letter. Do not include any salutation, sender details, date, closing, or placeholder text. Just write 2-3 professional paragraphs explaining why the candidate is suitable for the position. Be specific and precise, do not add unnecessary information.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ];

                // Call our backend API using the API_URL variable
                var response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messages: messages,
                        model: 'meta-llama/llama-3.1-8b-instruct',
                        temperature: 0.7,
                        max_tokens: 2000
                    })
                });

                if (!response.ok) {
                    var errorData = await response.json();
                    throw new Error(errorData.error || 'API request failed');
                }

                var result = await response.json();
                var letterContent = result.choices[0].message.content;

                var formattedLetter = formatLetter(letterContent, data);

                const previewSection = document.getElementById('letterPreviewSection');
                if (previewSection) {
                    previewSection.style.display = 'block';
                    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                const previewContainer = document.getElementById('letterPreviewContainer');
                if (previewContainer) {
                    previewContainer.innerHTML = formattedLetter;

                    var downloadButtons = `
                        <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0dbd3;">
                            <button onclick="downloadStandaloneLetter('pdf')" style="padding: 10px 24px; font-size: 14px; background: #c9a84c; color: #0b2a35; border: none; border-radius: 999px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; font-family: 'Times New Roman', Times, serif; margin: 0 8px;">
                                <i class="fas fa-file-pdf"></i> Download PDF
                            </button>
                            <button onclick="downloadStandaloneLetter('word')" style="padding: 10px 24px; font-size: 14px; background: transparent; color: #0b2a35; border: 2px solid #0b2a35; border-radius: 999px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; font-family: 'Times New Roman', Times, serif; margin: 0 8px;">
                                <i class="fas fa-file-word"></i> Download Word
                            </button>
                        </div>
                    `;
                    previewContainer.innerHTML += downloadButtons;
                }

                showNotification('✅ Application Letter Generated successfully!', 'success');

                window._standaloneLetterData = data;
                window._standaloneLetterContent = letterContent;

            } catch (error) {
                console.error('❌ Error generating letter:', error);
                showNotification('Error: ' + error.message, 'error');
            }

            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }

        // ==========================================
        // DOWNLOAD STANDALONE LETTER
        // ==========================================
        window.downloadStandaloneLetter = function(format) {
            var previewContainer = document.getElementById('letterPreviewContainer');
            if (!previewContainer) return;

            var letterDiv = previewContainer.querySelector('div[style*="font-family: \'Times New Roman\'"]');
            if (!letterDiv) {
                showNotification('Please generate a letter first.', 'error');
                return;
            }

            var content = letterDiv.outerHTML;
            var data = window._standaloneLetterData || {};
            var title = data.fullName || 'Application_Letter';

            if (format === 'pdf') {
                var win = window.open('', '_blank');
                if (!win) {
                    showNotification('Please allow popups to download PDF.', 'error');
                    return;
                }

                win.document.write('<!DOCTYPE html><html><head><title>' + title + ' - Application Letter</title><meta charset="utf-8"><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { background: white; font-family: \'Times New Roman\', Times, serif; line-height: 1.5; color: #000000; padding: 40px; } @page { margin: 1.5cm; size: A4; } @media print { body { padding: 0; } }</style></head><body>' + content + '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\/script></body></html>');
                win.document.close();
                showNotification('PDF downloaded successfully!', 'success');

            } else if (format === 'word') {
                var doc = '<!DOCTYPE html><html xmlns:o=\'urn:schemas-microsoft-com:office:office\' xmlns:w=\'urn:schemas-microsoft-com:office:word\' xmlns=\'http://www.w3.org/TR/REC-html40\'><head><meta charset="utf-8"><title>' + title + ' - Application Letter</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]--><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { background: white; font-family: \'Times New Roman\', Times, serif; line-height: 1.5; color: #000000; padding: 40px; } @page { margin: 1.5cm; } </style></head><body>' + content + '</body></html>';

                var blob = new Blob([doc], { type: 'application/msword;charset=utf-8' });
                var link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = title + '_Application_Letter.doc';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(function() { URL.revokeObjectURL(link.href); }, 100);

                showNotification('Word document downloaded successfully!', 'success');
            }
        };

        // ===== Event Listeners =====
        nextBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                nextStep();
            });
        });

        prevBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                prevStep();
            });
        });

        if (generateBtn) {
            generateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                generateLetter();
            });
        }

        // Enter key support
        form.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
                    return;
                }
                
                const activeSection = form.querySelector('.letter-section.active');
                if (activeSection) {
                    const step = parseInt(activeSection.dataset.step);
                    if (step === totalSteps) {
                        generateLetter();
                    } else {
                        nextStep();
                    }
                }
            }
        });

        // ===== Initialize =====
        // Hide all sections first, then show first
        sections.forEach(function(section, index) {
            if (index === 0) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Set first progress step as active
        progressSteps.forEach(function(step, index) {
            if (index === 0) {
                step.classList.add('active');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        console.log('✅ Standalone Letter Generator initialized!');
        console.log('📊 Current step: ' + currentStep);
    }

    // ===== Make functions globally accessible =====
    window.initStandaloneLetter = initStandaloneLetter;
    window.downloadStandaloneLetter = downloadStandaloneLetter;

})();
