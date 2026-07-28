// ==========================================
// WAIT FOR DOM
// ==========================================
window.onload = function() {
    console.log('All resources (images, styles, etc.) are loaded!');
};

// ==========================================
// AOS REFRESH FUNCTION
// ==========================================
function refreshAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
        console.log('🔄 AOS refreshed');
    }
}



// ============================================
// HAMBURGER MENU TOGGLE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburgerBtn');
    const nav = document.getElementById('mainNav');
    const body = document.body;

    // Create overlay
    let overlay = document.querySelector('.navbar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'navbar-overlay';
        document.body.appendChild(overlay);
    }

    function toggleMenu() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('open');
        overlay.classList.toggle('active');
        body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        nav.classList.remove('open');
        overlay.classList.remove('active');
        body.style.overflow = '';
    }

    // Toggle on hamburger click
    hamburger.addEventListener('click', toggleMenu);

    // Close on overlay click
    overlay.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            closeMenu();
        }
    });

    // Close when a nav link is clicked
    nav.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', closeMenu);
    });

    // Close on resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && nav.classList.contains('open')) {
            closeMenu();
        }
    });
});

// ==========================================
// CAROUSEL FUNCTIONALITY
// ==========================================
var slideIndex = 0;
var slides = document.querySelectorAll('.carousel-slide');
var indicators = document.querySelectorAll('.indicator');
var autoPlayInterval;

function showSlide(index) {
    slides.forEach(function(slide) {
        slide.classList.remove('active');
    });
    indicators.forEach(function(ind) {
        ind.classList.remove('active');
    });
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    var container = document.getElementById('carouselContainer');
    if (container) {
        container.style.transform = 'translateX(-' + (index * 100) + '%)';
    }
    slideIndex = index;
}

function changeSlide(direction) {
    var newIndex = slideIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    if (newIndex >= slides.length) newIndex = 0;
    showSlide(newIndex);
    resetAutoPlay();
}

var prevBtn = document.querySelector('.prev');
if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        changeSlide(-1);
    });
}

var nextBtn = document.querySelector('.next');
if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        changeSlide(1);
    });
}

function currentSlide(index) {
    showSlide(index);
    resetAutoPlay();
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(function() {
        changeSlide(1);
    }, 3000);
}

function initCarousel() {
    if (slides.length > 0) {
        showSlide(0);
        resetAutoPlay();
        indicators.forEach(function(indicator, index) {
            indicator.addEventListener('click', function() {
                currentSlide(index);
            });
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft') {
                changeSlide(-1);
            } else if (e.key === 'ArrowRight') {
                changeSlide(1);
            }
        });
    }
}

// ==========================================
// STATS COUNTER ANIMATION
// ==========================================
function animateCounters() {
    var statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(function(stat) {
        var target = parseFloat(stat.getAttribute('data-count'));
        var duration = 2000;
        var increment = target / (duration / 16);
        var current = 0;

        var updateCounter = function() {
            current += increment;
            if (current < target) {
                if (target % 1 === 0) {
                    stat.textContent = Math.floor(current);
                } else {
                    stat.textContent = current.toFixed(1);
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (target % 1 === 0) {
                    stat.textContent = Math.floor(target) + '+';
                } else {
                    stat.textContent = target + '\u2605';
                }
            }
        };
        updateCounter();
    });
}

// ==========================================
// OPENROUTER API CONFIGURATION
// ==========================================
var OR_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
var OR_MODEL = 'meta-llama/llama-3.1-8b-instruct';

// ==========================================
// API URL DETECTION
// ==========================================
var API_URL = '';

// Detect environment
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development - use local API
    API_URL = '/api/generate-cv';
} else if (window.location.hostname.includes('github.io')) {
    // GitHub Pages - use Vercel API
    API_URL = 'https://a-i-cv-generator.vercel.app/api/generate-cv';
} else {
    // Production on Vercel - use relative path
    API_URL = '/api/generate-cv';
}

console.log('🌐 API URL:', API_URL);

// ==========================================
// STATE VARIABLES
// ==========================================
var selectedCVType = 'generic';
var currentStep = 1;
var totalSteps = 5;
var generatedCVData = null;
var lastGeneratedData = null;
var currentLetterContent = '';

// ==========================================
// HARDCODED SKILLS FOR EACH CV TYPE
// ==========================================
var SKILLS = {
    generic: [
        'Communication Skills',
        'Team Collaboration',
        'Problem Solving',
        'Time Management',
        'Adaptability',
        'Attention to Detail'
    ],
    professional: [
        'Leadership',
        'Project Management',
        'Strategic Planning',
        'Team Management',
        'Effective Communication',
        'Problem Solving',
        'Decision Making',
        'Time Management'
    ]
};

// ==========================================
// DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }

    initCarousel();

    var statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });
        observer.observe(statsSection);
    }

    initGenerator();
     
    setTimeout(refreshAOS, 200);

    console.log('Quixote A.I CV Generator loaded successfully!');
});

window.addEventListener('load', function() {
    setTimeout(refreshAOS, 500);
});

// ==========================================
// INITIALIZE GENERATOR
// ==========================================
function initGenerator() {
    document.querySelectorAll('.cv-type-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var type = this.dataset.type;
            selectCVType(type);
        });
    });

    var photoUploadArea = document.getElementById('photoUploadArea');
    var photoInput = document.getElementById('photoInput');
    if (photoUploadArea && photoInput) {
        photoUploadArea.addEventListener('click', function() {
            photoInput.click();
        });
        photoInput.addEventListener('change', function(e) {
            handlePhotoUpload(e);
        });
    }

    var addEducationBtn = document.getElementById('addEducationBtn');
    if (addEducationBtn) {
        addEducationBtn.addEventListener('click', addEducation);
    }

    var addExperienceBtn = document.getElementById('addExperienceBtn');
    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', addExperience);
    }

    var addReferenceBtn = document.getElementById('addReferenceBtn');
    if (addReferenceBtn) {
        addReferenceBtn.addEventListener('click', addReference);
    }

    var generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            generateCVWithAI();
        });
    }

    var downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
            downloadCV('pdf');
        });
    }

    var downloadWordBtn = document.getElementById('downloadWordBtn');
    if (downloadWordBtn) {
        downloadWordBtn.addEventListener('click', function() {
            downloadCV('word');
        });
    }

    initFormNavigation();
    updateRequiredFields();
    
    // Real-time duplicate school validation on input
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('edu-school')) {
            document.querySelectorAll('.edu-school').forEach(function(input) {
                var error = input.closest('.form-group').querySelector('.field-error');
                if (error) {
                    error.classList.remove('show');
                    error.textContent = '';
                }
            });
            validateDuplicateSchools();
        }
    });
}

// ==========================================
// MAKE FUNCTIONS GLOBALLY ACCESSIBLE
// ==========================================
window.generateCVWithAI = generateCVWithAI;
window.selectCVType = selectCVType;
window.addEducation = addEducation;
window.addExperience = addExperience;
window.addReference = addReference;
window.removeEntry = removeEntry;
window.handlePhotoUpload = handlePhotoUpload;
window.downloadCV = downloadCV;
window.generateApplicationLetter = generateApplicationLetter;
window.closeLetterModal = closeLetterModal;
window.downloadLetter = downloadLetter;
window.closeLetterDetailsModal = closeLetterDetailsModal;
window.submitLetterDetails = submitLetterDetails;
window.printCV = printCV;
window.showNotification = showNotification;
window.goToStep = goToStep;

// ==========================================
// CV TYPE SELECTOR
// ==========================================
function selectCVType(type) {
    selectedCVType = type;

    document.querySelectorAll('.cv-type-card').forEach(function(card) {
        card.classList.toggle('active', card.dataset.type === type);
    });

    var photoGroup = document.getElementById('photoGroup');
    if (photoGroup) {
        if (type === 'professional') {
            photoGroup.style.display = 'block';
            var requiredLabel = photoGroup.querySelector('.required');
            if (requiredLabel) requiredLabel.style.display = 'none';
        } else {
            photoGroup.style.display = 'none';
        }
    }

    var subtitle = document.getElementById('experienceSubtitle');
    if (subtitle) {
        if (type === 'generic') {
            subtitle.textContent = 'Add your work experience (optional for Generic CV)';
        } else {
            subtitle.textContent = 'Add your work experience (required for Professional CV)';
        }
    }

    updateRequiredFields();
}

// ==========================================
// UPDATE REQUIRED FIELDS
// ==========================================
function updateRequiredFields() {
    var isProfessional = selectedCVType === 'professional';

    document.querySelectorAll('.exp-title, .exp-company, .exp-start, .exp-end, .exp-description').forEach(function(el) {
        var label = el.closest('.form-group').querySelector('label');
        if (isProfessional) {
            el.setAttribute('required', 'required');
            if (label && !label.innerHTML.includes('*')) {
                label.innerHTML += ' <span class="required">*</span>';
            }
        } else {
            el.removeAttribute('required');
            if (label) {
                label.innerHTML = label.innerHTML.replace(' <span class="required">*</span>', '');
            }
        }
    });
}

// ==========================================
// FORM NAVIGATION
// ==========================================
function initFormNavigation() {
    document.querySelectorAll('.next-step').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var currentStepNum = parseInt(this.closest('.form-section').dataset.step);
            if (validateStep(currentStepNum)) {
                goToStep(currentStepNum + 1);
            }
        });
    });

    document.querySelectorAll('.prev-step').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var currentStepNum = parseInt(this.closest('.form-section').dataset.step);
            goToStep(currentStepNum - 1);
        });
    });

    document.querySelectorAll('.progress-step').forEach(function(step) {
        step.addEventListener('click', function() {
            var stepNum = parseInt(this.dataset.step);
            if (stepNum < currentStep) {
                goToStep(stepNum);
            }
        });
    });
}

function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    document.querySelectorAll('.form-section').forEach(function(section) {
        section.classList.remove('active');
    });

    var targetSection = document.querySelector('.form-section[data-step="' + step + '"]');
    if (targetSection) {
        targetSection.classList.add('active');

        targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    document.querySelectorAll('.progress-step').forEach(function(stepEl) {
        var stepNum = parseInt(stepEl.dataset.step);
        stepEl.classList.remove('active', 'completed');
        if (stepNum === step) {
            stepEl.classList.add('active');
        } else if (stepNum < step) {
            stepEl.classList.add('completed');
        }
    });

    currentStep = step;

    if (!targetSection){
        var formContainer = document.querySelector('.form-container') || document.querySelector('#cvForm');
        if(formContainer){
            formContainer.scrollIntoView({
                behavior: "smooth",
                block: 'start'
            });
        }
    }

    if (step === 5) {
        updateSummary();
    }
}

// ==========================================
// VALIDATE STEP
// ==========================================
function validateStep(step) {
    var section = document.querySelector('.form-section[data-step="' + step + '"]');
    if (!section) return true;

    var inputs = section.querySelectorAll('input[required], select[required], textarea[required]');
    var isValid = true;

    inputs.forEach(function(input) {
        var error = input.closest('.form-group').querySelector('.field-error');
        if (!input.value.trim()) {
            input.classList.add('error');
            if (error) error.classList.add('show');
            isValid = false;
        } else {
            input.classList.remove('error');
            if (error) error.classList.remove('show');
        }
    });

    // STEP 1: Personal Details Validation
    if (step === 1) {
        var fullName = document.getElementById('fullName');
        if (fullName && fullName.value.trim()) {
            var nameParts = fullName.value.trim().split(' ');
            nameParts = nameParts.filter(function(part) { return part.length > 0; });
            if (nameParts.length < 2) {
                fullName.classList.add('error');
                var error2 = fullName.closest('.form-group').querySelector('.field-error');
                if (error2) {
                    error2.textContent = 'Please enter at least 2 names (First and Last name)';
                    error2.classList.add('show');
                }
                isValid = false;
            }
        }
        
        var jobTitle = document.getElementById('jobTitle');
        if (jobTitle && !jobTitle.value.trim()) {
            jobTitle.classList.add('error');
            var error3 = jobTitle.closest('.form-group').querySelector('.field-error');
            if (error3) {
                error3.textContent = 'Please enter your job title';
                error3.classList.add('show');
            }
            isValid = false;
        }
        
        var address = document.getElementById('address');
        if (address && !address.value.trim()) {
            address.classList.add('error');
            var error4 = address.closest('.form-group').querySelector('.field-error');
            if (error4) {
                error4.textContent = 'Please enter your physical address';
                error4.classList.add('show');
            }
            isValid = false;
        }

        var email = document.getElementById('email');
        if (email && email.value.trim()) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                email.classList.add('error');
                var error5 = email.closest('.form-group').querySelector('.field-error');
                if (error5) {
                    error5.textContent = 'Please enter a valid email address';
                    error5.classList.add('show');
                }
                isValid = false;
            }
        }

        var phone = document.getElementById('phone');
        if (phone && !phone.value.trim()) {
            phone.classList.add('error');
            var error6 = phone.closest('.form-group').querySelector('.field-error');
            if (error6) {
                error6.textContent = 'Please enter your phone number';
                error6.classList.add('show');
            }
            isValid = false;
        }
    }

    // STEP 2: Education Validation with Duplicate School Check
    if (step === 2) {
        var eduSchools = document.querySelectorAll('.edu-school');
        var eduQuals = document.querySelectorAll('.edu-qualification');
        var eduYears = document.querySelectorAll('.edu-year');
        
        var schoolNames = [];
        var hasDuplicate = false;
        
        eduSchools.forEach(function(school, index) {
            var schoolValue = school.value.trim();
            if (schoolValue) {
                if (schoolNames.indexOf(schoolValue) !== -1) {
                    school.classList.add('error');
                    hasDuplicate = true;
                    var error = school.closest('.form-group').querySelector('.field-error');
                    if (error) {
                        error.textContent = 'This school has already been added. Please enter a different school.';
                        error.classList.add('show');
                    }
                } else {
                    schoolNames.push(schoolValue);
                }
            }
            
            if (!schoolValue) {
                school.classList.add('error');
                isValid = false;
            }
            if (eduQuals[index] && !eduQuals[index].value) {
                eduQuals[index].classList.add('error');
                isValid = false;
            }
            if (eduYears[index] && !eduYears[index].value.trim()) {
                eduYears[index].classList.add('error');
                isValid = false;
            }
        });
        
        if (hasDuplicate) {
            isValid = false;
            showNotification('Please remove duplicate school entries.', 'error');
        }
    }

    // STEP 3: Experience Validation
    if (step === 3 && selectedCVType === 'professional') {
        var expTitles = document.querySelectorAll('.exp-title');
        var expCompanies = document.querySelectorAll('.exp-company');
        var hasValidExp = false;

        expTitles.forEach(function(title, index) {
            if (title.value.trim() && expCompanies[index] && expCompanies[index].value.trim()) {
                hasValidExp = true;
            }
        });

        if (!hasValidExp) {
            showNotification('Please add at least one work experience entry with job title and company.', 'error');
            isValid = false;
        }
    }

    if (!isValid) {
        var firstError = section.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return isValid;
}

// ==========================================
// VALIDATE DUPLICATE SCHOOLS
// ==========================================
function validateDuplicateSchools() {
    var eduSchools = document.querySelectorAll('.edu-school');
    var schoolNames = [];
    var hasDuplicate = false;
    
    eduSchools.forEach(function(school) {
        var schoolValue = school.value.trim();
        if (schoolValue) {
            if (schoolNames.indexOf(schoolValue) !== -1) {
                school.classList.add('error');
                var error = school.closest('.form-group').querySelector('.field-error');
                if (error) {
                    error.textContent = 'Duplicate school name detected. Please enter a different school.';
                    error.classList.add('show');
                }
                hasDuplicate = true;
            } else {
                schoolNames.push(schoolValue);
            }
        }
    });
    
    return !hasDuplicate;
}
// VALIDATE DUPLICATE QUALIFICATIONS
function validateDuplicateQualifications() {
    // Get ALL qualification select dropdowns on the page
    // These are all the <select class="edu-qualification"> elements
    var qualificationSelects = document.querySelectorAll('.edu-qualification');
    
    // Array to store qualification values we've already seen
    var qualificationValues = [];
    
    // Flag to track if we found any duplicates
    var hasDuplicate = false;

    // Loop through each qualification select dropdown
    qualificationSelects.forEach(function(selectElement) {
        // Get the selected value and remove extra spaces
        var selectedValue = selectElement.value.trim();
        
        // Only check if a value is selected (not empty)
        if (selectedValue) {
            // Check if this qualification was already selected in another entry
            if (qualificationValues.indexOf(selectedValue) !== -1) {
                // DUPLICATE FOUND!
                
                // 1. Add error class to highlight the select in red
                selectElement.classList.add('error');
                
                // 2. Find the error message element for this specific select
                //    It's inside the same .form-group container
                var errorElement = selectElement.closest('.form-group').querySelector('.field-error');
                
                // 3. Show the error message
                if (errorElement) {
                    errorElement.textContent = 'Duplicate qualification! You have already selected "' + selectedValue + '"';
                    errorElement.classList.add('show');
                }
                
                // 4. Mark that we found a duplicate
                hasDuplicate = true;
            } else {
                // NOT a duplicate - add this qualification to our tracking list
                qualificationValues.push(selectedValue);
            }
        }
    });
    
    // Return true if duplicates were found, false if not
    return hasDuplicate;
}
// ==========================================
// EDUCATION ENTRIES
// ==========================================
function addEducation() {
    var container = document.getElementById('educationContainer');
    if (!container) return;

    var template = container.querySelector('.entry-item').cloneNode(true);

    template.querySelectorAll('input, select, textarea').forEach(function(input) {
        input.value = '';
        input.classList.remove('error');
    });

    var removeBtn = template.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.style.display = 'flex';
        removeBtn.addEventListener('click', function() {
            removeEntry(this);
            setTimeout(refreshAOS, 100);
        });
    }

    container.appendChild(template);
    
    var errors = template.querySelectorAll('.field-error');
    errors.forEach(function(error) {
        error.classList.remove('show');
        error.textContent = '';
    });
    
    setTimeout(refreshAOS, 100);
}

// ==========================================
// EXPERIENCE ENTRIES
// ==========================================
function addExperience() {
    var container = document.getElementById('experienceContainer');
    if (!container) return;

    var template = container.querySelector('.entry-item').cloneNode(true);

    template.querySelectorAll('input, select, textarea').forEach(function(input) {
        input.value = '';
        input.classList.remove('error');
    });

    var removeBtn = template.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.style.display = 'flex';
        removeBtn.addEventListener('click', function() {
            removeEntry(this);
            setTimeout(refreshAOS, 100);
        });
    }

    container.appendChild(template);
    setTimeout(refreshAOS, 100);
}

// ==========================================
// REFERENCE ENTRIES
// ==========================================
function addReference() {
    var container = document.getElementById('referenceContainer');
    if (!container) return;

    var template = container.querySelector('.entry-item').cloneNode(true);

    template.querySelectorAll('input, select, textarea').forEach(function(input) {
        input.value = '';
        input.classList.remove('error');
    });

    var removeBtn = template.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.style.display = 'flex';
        removeBtn.addEventListener('click', function() {
            removeEntry(this);
            setTimeout(refreshAOS, 100);
        });
    }

    container.appendChild(template);
    setTimeout(refreshAOS, 100);
}

// ==========================================
// REMOVE ENTRY
// ==========================================
function removeEntry(btn) {
    var container = btn.closest('.entry-container');
    var items = container.querySelectorAll('.entry-item');

    if (items.length <= 1) {
        items[0].querySelectorAll('input, select, textarea').forEach(function(input) {
            input.value = '';
            input.classList.remove('error');
        });
        return;
    }

    var item = btn.closest('.entry-item');
    if (item) {
        item.remove();
        setTimeout(refreshAOS, 100);
    }
}

// ==========================================
// PHOTO UPLOAD
// ==========================================
function handlePhotoUpload(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showNotification('Photo size must be less than 5MB', 'error');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var preview = document.getElementById('photoPreview');
        var placeholder = document.getElementById('photoPlaceholder');
        var error = document.querySelector('#photoGroup .field-error');

        if (preview) {
            preview.src = e.target.result;
            preview.classList.add('visible');
        }
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        if (error) {
            error.classList.remove('show');
        }
    };
    reader.readAsDataURL(file);
}

// ==========================================
// UPDATE SUMMARY
// ==========================================
function updateSummary() {
    var container = document.getElementById('summaryContent');
    if (!container) return;

    var fullName = document.getElementById('fullName')?.value?.trim() || 'Not provided';
    var jobTitle = document.getElementById('jobTitle')?.value?.trim() || 'Not provided';
    var email = document.getElementById('email')?.value?.trim() || 'Not provided';
    var phone = document.getElementById('phone')?.value?.trim() || 'Not provided';
    var address = document.getElementById('address')?.value?.trim() || 'Not provided';

    var eduEntries = document.querySelectorAll('#educationContainer .entry-item').length;
    var expEntries = document.querySelectorAll('#experienceContainer .entry-item').length;
    var refEntries = document.querySelectorAll('#referenceContainer .entry-item').length;

    var html = '';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-user"></i> Name:</span><span class="summary-value">' + fullName + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-briefcase"></i> Job Title:</span><span class="summary-value">' + jobTitle + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-envelope"></i> Email:</span><span class="summary-value">' + email + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-phone"></i> Phone:</span><span class="summary-value">' + phone + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-home"></i> Address:</span><span class="summary-value">' + address + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-graduation-cap"></i> Education:</span><span class="summary-value">' + eduEntries + ' entries</span></div>';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-briefcase"></i> Experience:</span><span class="summary-value">' + expEntries + ' entries</span></div>';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-users"></i> References:</span><span class="summary-value">' + (refEntries > 0 ? refEntries + ' provided' : 'Available upon request') + '</span></div>';
    html += '<div class="summary-item"><span class="summary-label"><i class="fas fa-file-alt"></i> CV Type:</span><span class="summary-value" style="text-transform:capitalize;">' + selectedCVType + '</span></div>';

    container.innerHTML = html;
}

// ==========================================
// COLLECT FORM DATA
// ==========================================
function collectFormData() {
    var fullName = document.getElementById('fullName')?.value?.trim() || '';
    var jobTitle = document.getElementById('jobTitle')?.value?.trim() || '';
    var email = document.getElementById('email')?.value?.trim() || '';
    var phone = document.getElementById('phone')?.value?.trim() || '';
    var phone2 = document.getElementById('phone2')?.value?.trim() || '';
    var address = document.getElementById('address')?.value?.trim() || '';

    var photoPreview = document.getElementById('photoPreview');
    var photo = photoPreview && photoPreview.classList && photoPreview.classList.contains('visible') ? photoPreview.src : '';

    var education = [];
    var eduContainer = document.getElementById('educationContainer');
    if (eduContainer) {
        var eduItems = eduContainer.querySelectorAll('.entry-item');
        eduItems.forEach(function(item) {
            var qual = item.querySelector('.edu-qualification')?.value || '';
            var field = item.querySelector('.edu-field')?.value || '';
            var school = item.querySelector('.edu-school')?.value || '';
            var year = item.querySelector('.edu-year')?.value || '';
            if (qual && school && year) {
                education.push({ qualification: qual, field: field, school: school, year: year });
            }
        });
    }

    var experience = [];
    var expContainer = document.getElementById('experienceContainer');
    if (expContainer) {
        var expItems = expContainer.querySelectorAll('.entry-item');
        expItems.forEach(function(item) {
            var title = item.querySelector('.exp-title')?.value || '';
            var company = item.querySelector('.exp-company')?.value || '';
            var start = item.querySelector('.exp-start')?.value || '';
            var end = item.querySelector('.exp-end')?.value || '';
            var description = item.querySelector('.exp-description')?.value || '';
            if (title || company) {
                experience.push({ title: title, company: company, start: start, end: end, description: description });
            }
        });
    }

    var references = [];
    var refContainer = document.getElementById('referenceContainer');
    if (refContainer) {
        var refItems = refContainer.querySelectorAll('.entry-item');
        refItems.forEach(function(item) {
            var name = item.querySelector('.ref-name')?.value || '';
            var refTitle = item.querySelector('.ref-title')?.value || '';
            var company = item.querySelector('.ref-company')?.value || '';
            var email = item.querySelector('.ref-email')?.value || '';
            var phone = item.querySelector('.ref-phone')?.value || '';
            if (name) {
                references.push({ name: name, title: refTitle, company: company, email: email, phone: phone });
            }
        });
    }

    var languages = document.getElementById('languages')?.value?.trim() || '';

    return {
        cvType: selectedCVType,
        personal: { fullName: fullName, jobTitle: jobTitle, email: email, phone: phone, phone2: phone2, address: address },
        photo: photo,
        education: education,
        experience: experience,
        references: references,
        languages: languages
    };
}

// ==========================================
// SORT EDUCATION FROM HIGHEST TO LOWEST
// ==========================================
function sortEducation(education) {
    var priority = {
        'PhD': 1,
        'Masters': 2,
        'Degree': 3,
        'Diploma': 4,
        'Certificate': 5,
        'KCSE': 6,
        'KCPE': 7,
        'Artisan': 8
    };

    if (!education || education.length === 0) return education;

    return education.sort(function(a, b) {
        var priorityA = priority[a.qualification] || 99;
        var priorityB = priority[b.qualification] || 99;
        return priorityA - priorityB;
    });
}

// ==========================================
// GENERATE CV WITH BACKEND API
// ==========================================
async function generateCVWithAI() {
    console.log('Generate button clicked!');

    for (var i = 1; i <= totalSteps; i++) {
        if (!validateStep(i)) {
            goToStep(i);
            return;
        }
    }

    var data = collectFormData();
    if (!data) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    if (!data.personal.fullName || !data.personal.email || !data.personal.phone || !data.personal.address) {
        showNotification('Please fill in all required personal details.', 'error');
        goToStep(1);
        return;
    }

    if (data.education.length === 0) {
        showNotification('Please add at least one education entry with school, qualification and year.', 'error');
        goToStep(2);
        return;
    }

    var generateBtn = document.getElementById('generateBtn');
    if (!generateBtn) {
        console.error('Generate button not found!');
        showNotification('Error: Generate button not found.', 'error');
        return;
    }

    var originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;

    try {
        var prompt = buildCVPrompt(data);
        console.log('Prompt built successfully');

        // Build messages for the API
        var messages = [
            {
                role: 'system',
                content: 'You are a professional CV writer with 20+ years of experience. Write a complete, well-structured CV. The PROFESSIONAL SUMMARY is the most important section - it must be a complete, compelling paragraph of 4-6 sentences that sells the candidate. DO NOT leave any section incomplete or cut off. Write the complete summary without truncation. Do NOT put any text in the SKILLS section - leave it empty.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        // Call our backend API (not OpenRouter directly)
        var response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: OR_MODEL,
                temperature: 0.7,
                max_tokens: 8000
            })
        });

        if (!response.ok) {
            var errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }

        var result = await response.json();
        var generatedCV = result.choices[0].message.content;

        console.log('Generated CV length:', generatedCV.length);

        if (!generatedCV || generatedCV.length < 100) {
            showNotification('Generated CV is too short. Please try again.', 'error');
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
            return;
        }

        generatedCVData = generatedCV;
        lastGeneratedData = data;
        displayGeneratedCV(generatedCV, data);
        showNotification('CV Generated successfully!', 'success');

    } catch (error) {
        console.error('Error generating CV:', error);
        showNotification('Error: ' + error.message, 'error');
    }

    generateBtn.innerHTML = originalText;
    generateBtn.disabled = false;
}

// ==========================================
// BUILD CV PROMPT FOR AI
// ==========================================
function buildCVPrompt(data) {
    var p = data.personal;
    var edu = sortEducation(data.education);
    var exp = data.experience;
    var refs = data.references;
    var cvType = data.cvType;
    var languages = data.languages || '';

    var isProfessional = cvType === 'professional';

    var prompt = 'Create a ' + cvType.toUpperCase() + ' CV for:\n\n';

    prompt += 'Name: ' + p.fullName + '\n';
    prompt += 'Job Title: ' + (p.jobTitle || 'Not specified') + '\n';
    prompt += 'Email: ' + p.email + '\n';
    prompt += 'Phone: ' + p.phone + '\n';
    if (p.phone2) prompt += 'Additional Phone: ' + p.phone2 + '\n';
    prompt += 'Address: ' + p.address + '\n\n';

    prompt += 'EDUCATION:\n';
    if (edu.length > 0) {
        edu.forEach(function(e) {
            prompt += e.school + ' | ' + e.qualification;
            if (e.field) prompt += ' in ' + e.field;
            if (e.year) prompt += ' | ' + e.year;
            prompt += '\n';
        });
    } else {
        prompt += 'No education provided.\n';
    }

    prompt += '\nWORK EXPERIENCE:\n';
    if (exp.length > 0 && exp[0].title) {
        exp.forEach(function(e) {
            prompt += e.company + ' | ' + e.title;
            if (e.start || e.end) prompt += ' | ' + (e.start || '') + ' - ' + (e.end || 'Present');
            prompt += '\n';
            if (e.description) {
                var descLines = e.description.split('\n');
                descLines.forEach(function(line) {
                    if (line.trim()) {
                        prompt += '  - ' + line.trim() + '\n';
                    }
                });
            }
        });
    } else if (cvType === 'generic') {
        prompt += 'Create entry-level experience for ' + p.jobTitle + '\n';
    } else if (isProfessional) {
        prompt += 'Create professional experience for ' + p.jobTitle + '\n';
    } 

    prompt += '\nREFERENCES: ';
    if (refs.length > 0) {
        refs.forEach(function(r) {
            prompt += r.name;
            if (r.title) prompt += ' - ' + r.title;
            if (r.company) prompt += ' at ' + r.company;
            prompt += '; ';
        });
    } else {
        prompt += 'Available upon request.';
    }

    if (languages) {
        prompt += '\n\nLANGUAGES: ' + languages;
    }

    prompt += '\n\n========================================\n';
    prompt += 'OUTPUT FORMAT:\n';
    prompt += '========================================\n\n';
    
    prompt += 'PROFESSIONAL SUMMARY\n';
    prompt += 'Write one paragraph of about 4-6 lines here. Must be complete and well-written.\n\n';
    
    prompt += 'WORK EXPERIENCE\n';
    prompt += 'Company | Job Title | Year Range\n';
    prompt += '- Responsibility 1\n';
    prompt += '- Responsibility 2\n';
    prompt += '- Responsibility 3\n\n';
    
    prompt += 'EDUCATION\n';
    prompt += 'School | Qualification | Year\n\n';
    
    prompt += 'SKILLS\n';
    prompt += '(Leave empty)\n\n';
    
    prompt += 'LANGUAGES\n';
    prompt += 'English (Fluent)\n';
    prompt += 'Kiswahili (Native)\n\n';
    
    prompt += 'REFERENCES\n';
    prompt += 'Available upon request.\n';
    prompt += '========================================\n';
    
    prompt += '\nIMPORTANT: The PROFESSIONAL SUMMARY must be a complete paragraph with 4-6 lines. Do not cut it off.';

    return prompt;
}

// ==========================================
// PARSE AI GENERATED CV
// ==========================================
function parseAICV(text) {
    var sections = {
        summary: '',
        experience: [],
        education: [],
        skills: [],
        languages: [],
        references: []
    };

    var cleanText = text.replace(/\*\*/g, '').replace(/##/g, '');
    
    var summaryMatch = cleanText.match(/PROFESSIONAL SUMMARY\s*\n\s*([\s\S]*?)(?=WORK EXPERIENCE|$)/i);
    if (summaryMatch) {
        sections.summary = summaryMatch[1].trim();
        console.log(' Summary length:', sections.summary.length);
    }

    var expMatch = cleanText.match(/WORK EXPERIENCE\s*\n\s*([\s\S]*?)(?=EDUCATION|$)/i);
    if (expMatch) {
        var expText = expMatch[1].trim();
        var expLines = expText.split('\n').filter(function(l) { return l.trim(); });
        sections.experience = [];
        var currentExp = null;
        
        expLines.forEach(function(line) {
            var trimmed = line.trim();
            if (trimmed.includes('|') && !trimmed.startsWith('-')) {
                if (currentExp) sections.experience.push(currentExp);
                var parts = trimmed.split('|');
                currentExp = {
                    company: parts[0] ? parts[0].trim() : '',
                    title: parts[1] ? parts[1].trim() : '',
                    date: parts[2] ? parts[2].trim() : '',
                    description: ''
                };
            } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
                if (currentExp) {
                    currentExp.description += trimmed.replace(/^[•\-\*]\s*/, '') + '\n';
                }
            }
        });
        if (currentExp) sections.experience.push(currentExp);
    }

    var eduMatch = cleanText.match(/EDUCATION\s*\n\s*([\s\S]*?)(?=SKILLS|$)/i);
    if (eduMatch) {
        var eduText = eduMatch[1].trim();
        var eduLines = eduText.split('\n').filter(function(l) { return l.trim() && l.includes('|') });
        sections.education = eduLines.map(function(line) {
            var parts = line.split('|');
            return {
                school: parts[0] ? parts[0].trim() : '',
                qualification: parts[1] ? parts[1].trim() : '',
                year: parts[2] ? parts[2].trim() : ''
            };
        });
    }

    var langMatch = cleanText.match(/LANGUAGES\s*\n\s*([\s\S]*?)(?=REFERENCES|$)/i);
    if (langMatch) {
        var langText = langMatch[1].trim();
        var langLines = langText.split('\n').filter(function(l) { return l.trim() && !l.includes('Leave') && !l.includes('empty'); });
        sections.languages = langLines.map(function(line) {
            return line.replace(/^[•\-\*]\s*/, '').trim();
        }).filter(function(l) { return l; });
    }

    var refMatch = cleanText.match(/REFERENCES\s*\n\s*([\s\S]*?)(?=$)/i);
    if (refMatch) {
        var refText = refMatch[1].trim();
        if (!refText.toLowerCase().includes('available upon request')) {
            var refItems = refText.split('\n').filter(function(l) { return l.trim() && !l.includes('Available'); });
            sections.references = refItems.map(function(line) {
                return { name: line.trim(), details: '' };
            });
        }
    }

    console.log(' Summary length:', sections.summary.length);
    return sections;
}

// ==========================================
// DISPLAY GENERATED CV
// ==========================================
function displayGeneratedCV(generatedText, data) {
    var container = document.getElementById('cvPreviewContainer');
    if (!container) return;

    var sections = parseAICV(generatedText);
    
    var summary = sections.summary || '';
    
    if (summary) {
        summary = summary.replace(/\s+/g, ' ').trim();
        console.log(' DISPLAYING SUMMARY (length: ' + summary.length + '):');
        console.log(summary);
    }
    
    var skills = SKILLS[data.cvType] || SKILLS.generic;
    var userEducation = data.education || [];
    var sortedEducation = sortEducation(userEducation);
    
    var languages = [];
    if (data.languages) {
        var userLangs = data.languages.split(',').map(function(l) { return l.trim(); }).filter(function(l) { return l; });
        languages = userLangs;
    }
    
    var experience = sections.experience || [];
    var references = sections.references || [];
    if (references.length === 0 && data.references && data.references.length > 0) {
        references = data.references.map(function(r) {
            return { name: r.name, details: r.title + ' at ' + r.company };
        });
    }

    var cvHtml = '';
    if (data.cvType === 'professional') {
        cvHtml = renderProfessionalCV(summary, experience, sortedEducation, skills, languages, references, data);
    } else {
        cvHtml = renderGenericCV(summary, experience, sortedEducation, skills, languages, references, data);
    }

    var fullHtml = `
        <div id="cvContent">
            ${cvHtml}
        </div>
        <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 2px solid #c9a84c;">
            <button onclick="generateApplicationLetter()" style="
                padding: 14px 36px;
                font-size: 16px;
                background: #c9a84c;
                color: #0b2a35;
                border: none;
                border-radius: 999px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 8px 24px rgba(201,168,76,0.3);
                font-family: 'Times New Roman', Times, serif;
            ">
                <i class="fas fa-envelope"></i> Generate Application Letter from CV
            </button>
            <p style="font-size: 13px; color: #6b645a; margin-top: 8px; font-family: 'Times New Roman', Times, serif;">
                <i class="fas fa-info-circle"></i> Create a professional application letter based on this CV
            </p>
        </div>
        <div id="letterContainer" style="display:none; margin-top: 30px;"></div>
    `;

    container.innerHTML = fullHtml;

    var previewSection = document.getElementById('previewSection');
    if (previewSection) {
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(refreshAOS, 100);
}

// ==========================================
// RENDER GENERIC CV
// ==========================================
function renderGenericCV(summary, experience, education, skills, languages, references, data) {
    var p = data.personal;
    var photo = data.photo || '';

    var html = '';
    html += '<div style="font-family: \'Times New Roman\', Times, serif; max-width: 900px; margin: 0 auto; background: white; padding: 40px; border: 1px solid #e0dbd3; border-radius: 8px;">';
    
    html += '<div style="text-align: center; border-bottom: 2px solid #0b2a35; padding-bottom: 20px; margin-bottom: 20px;">';
    if (photo) {
        html += '<div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; margin: 0 auto 15px; border: 3px solid #c9a84c;">';
        html += '<img src="' + photo + '" alt="' + p.fullName + '" style="width: 100%; height: 100%; object-fit: cover;">';
        html += '</div>';
    }
    html += '<h1 style="font-size: 28px; font-weight: 700; color: #0b2a35; margin: 0 0 4px 0; font-family: \'Times New Roman\', Times, serif; letter-spacing: 1px;">' + (p.fullName || 'Your Name') + '</h1>';
    html += '<p style="font-size: 18px; color: #c9a84c; font-weight: 600; margin: 0; font-family: \'Times New Roman\', Times, serif;">' + (p.jobTitle || 'Professional') + '</p>';
    html += '<div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 13px; color: #64748b; margin-top: 8px; font-family: \'Times New Roman\', Times, serif;">';
    if (p.email) html += '<span><i class="fas fa-envelope"></i> ' + p.email + '</span>';
    if (p.phone) html += '<span><i class="fas fa-phone"></i> ' + p.phone + '</span>';
    if (p.address) html += '<span><i class="fas fa-map-marker-alt"></i> ' + p.address + '</span>';
    html += '</div></div>';

    html += '<div style="line-height: 1.5; font-family: \'Times New Roman\', Times, serif; color: #2a2520;">';

    if (summary) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="font-size: 14px; font-weight: 700; color: #0b2a35; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">PROFESSIONAL SUMMARY</h3>';
        html += '<p style="font-size: 14px; color: #2a2520; line-height: 1.8; font-family: \'Times New Roman\', Times, serif; text-align: justify;">' + summary + '</p>';
        html += '</div>';
    }

    if (experience && experience.length > 0 && experience[0].title) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="font-size: 14px; font-weight: 700; color: #0b2a35; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">WORK EXPERIENCE</h3>';
        experience.forEach(function(e) {
            html += '<div style="margin-bottom: 12px;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">';
            html += '<strong style="font-size: 14px; color: #0b2a35; font-family: \'Times New Roman\', Times, serif;">' + (e.company || 'Company') + ' | ' + (e.title || 'Position') + '</strong>';
            if (e.date) html += '<span style="font-size: 12px; color: #6b645a; font-family: \'Times New Roman\', Times, serif;">' + e.date + '</span>';
            html += '</div>';
            if (e.description) {
                var descLines = e.description.split('\n');
                html += '<ul style="padding-left: 20px; margin-top: 4px; font-size: 13px; color: #2a2520; line-height: 1.6; font-family: \'Times New Roman\', Times, serif;">';
                descLines.forEach(function(line) {
                    if (line.trim()) {
                        html += '<li style="margin-bottom: 4px;">' + line.trim() + '</li>';
                    }
                });
                html += '</ul>';
            }
            html += '</div>';
        });
        html += '</div>';
    }

    if (education && education.length > 0) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="font-size: 14px; font-weight: 700; color: #0b2a35; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">EDUCATION</h3>';
        education.forEach(function(e) {
            html += '<div style="margin-bottom: 6px; font-size: 14px; color: #2a2520; font-family: \'Times New Roman\', Times, serif;">';
            html += '<strong>' + (e.school || 'Institution') + '</strong> | ' + (e.qualification || 'Qualification');
            if (e.field && e.field.trim()) html += ' in ' + e.field;
            if (e.year) html += ' | ' + e.year;
            html += '</div>';
        });
        html += '</div>';
    }

    if (skills && skills.length > 0) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="font-size: 14px; font-weight: 700; color: #0b2a35; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">SKILLS</h3>';
        html += '<ul style="padding-left: 20px; margin-top: 6px; font-size: 13px; color: #2a2520; line-height: 1.6; font-family: \'Times New Roman\', Times, serif; column-count: 2; column-gap: 30px;">';
        skills.forEach(function(s) {
            html += '<li style="margin-bottom: 4px;">' + s + '</li>';
        });
        html += '</ul></div>';
    }

    html += '<div style="margin-bottom: 20px;">';
    html += '<h3 style="font-size: 14px; font-weight: 700; color: #0b2a35; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">LANGUAGES</h3>';
    html += '<ul style="padding-left: 20px; margin-top: 6px; font-size: 14px; color: #2a2520; font-family: \'Times New Roman\', Times, serif;">';
    if (languages && languages.length > 0) {
        languages.forEach(function(l) {
            html += '<li style="margin-bottom: 4px;">' + l + '</li>';
        });
    } else {
        html += '<li style="margin-bottom: 4px;">English (Fluent)</li>';
        html += '<li style="margin-bottom: 4px;">Kiswahili (Native)</li>';
    }
    html += '</ul></div>';

    html += '<div>';
    html += '<h3 style="font-size: 14px; font-weight: 700; color: #0b2a35; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">REFERENCES</h3>';
    if (references && references.length > 0 && references[0].name) {
        html += '<ul style="padding-left: 20px; font-size: 14px; color: #2a2520; font-family: \'Times New Roman\', Times, serif;">';
        references.forEach(function(r) {
            html += '<li style="margin-bottom: 4px;">' + r.name + (r.details ? ' - ' + r.details : '') + '</li>';
        });
        html += '</ul>';
    } else {
        html += '<p style="font-size: 14px; color: #6b645a; font-style: italic; font-family: \'Times New Roman\', Times, serif;">Available upon request.</p>';
    }
    html += '</div></div></div>';

    return html;
}

// ==========================================
// RENDER PROFESSIONAL CV
// ==========================================
function renderProfessionalCV(summary, experience, education, skills, languages, references, data) {
    var p = data.personal;
    var photo = data.photo || '';

    var html = '';
    html += '<div style="font-family: \'Times New Roman\', Times, serif; max-width: 1000px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e0dbd3;">';
    html += '<div style="display: grid; grid-template-columns: 1fr 2.5fr; gap: 0; min-height: 500px;">';
    
    html += '<div style="background: #0b2a35; color: white; padding: 30px 24px; font-family: \'Times New Roman\', Times, serif;">';

    if (photo) {
        html += '<div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; margin: 0 auto 20px; border: 3px solid #c9a84c;">';
        html += '<img src="' + photo + '" alt="' + p.fullName + '" style="width: 100%; height: 100%; object-fit: cover;">';
        html += '</div>';
    }
    html += '<h2 style="font-size: 20px; font-weight: 700; text-align: center; color: white; margin-bottom: 2px; font-family: \'Times New Roman\', Times, serif;">' + (p.fullName || 'Your Name') + '</h2>';
    html += '<p style="text-align: center; color: #c9a84c; font-weight: 600; font-size: 14px; margin-bottom: 20px; font-family: \'Times New Roman\', Times, serif;">' + (p.jobTitle || 'Professional') + '</p>';

    html += '<div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-bottom: 16px;">';
    html += '<h4 style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">CONTACT</h4>';
    if (p.email) html += '<div style="font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 4px; font-family: \'Times New Roman\', Times, serif; word-break: break-all;"><i class="fas fa-envelope" style="width: 18px;"></i> ' + p.email + '</div>';
    if (p.phone) html += '<div style="font-size: 13px; color: rgba(255,255,255,0.8); margin-bottom: 4px; font-family: \'Times New Roman\', Times, serif;"><i class="fas fa-phone" style="width: 18px;"></i> ' + p.phone + '</div>';
    if (p.address) html += '<div style="font-size: 13px; color: rgba(255,255,255,0.8); font-family: \'Times New Roman\', Times, serif;"><i class="fas fa-map-marker-alt" style="width: 18px;"></i> ' + p.address + '</div>';
    html += '</div>';

    if (skills && skills.length > 0) {
        html += '<div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-bottom: 16px;">';
        html += '<h4 style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">SKILLS</h4>';
        html += '<ul style="padding-left: 20px; margin: 0; font-size: 13px; color: rgba(255,255,255,0.8); font-family: \'Times New Roman\', Times, serif;">';
        skills.forEach(function(s) {
            html += '<li style="margin-bottom: 4px;">' + s + '</li>';
        });
        html += '</ul></div>';
    }

    if (languages && languages.length > 0) {
        html += '<div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">';
        html += '<h4 style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">LANGUAGES</h4>';
        html += '<ul style="padding-left: 20px; margin: 0; font-size: 13px; color: rgba(255,255,255,0.8); font-family: \'Times New Roman\', Times, serif;">';
        languages.forEach(function(l) {
            html += '<li style="margin-bottom: 4px;">' + l + '</li>';
        });
        html += '</ul></div>';
    }
    html += '</div>';

    html += '<div style="padding: 30px 28px; line-height: 1.5; font-family: \'Times New Roman\', Times, serif; color: #2a2520;">';

    if (summary) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<h4 style="color: #0b2a35; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">PROFESSIONAL SUMMARY</h4>';
        html += '<p style="font-size: 14px; color: #2a2520; line-height: 1.8; font-family: \'Times New Roman\', Times, serif; text-align: justify;">' + summary + '</p>';
        html += '</div>';
    }

    if (experience && experience.length > 0 && experience[0].title) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<h4 style="color: #0b2a35; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 12px; font-family: \'Times New Roman\', Times, serif;">WORK EXPERIENCE</h4>';
        experience.forEach(function(e) {
            html += '<div style="margin-bottom: 14px;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">';
            html += '<strong style="font-size: 15px; color: #0b2a35; font-family: \'Times New Roman\', Times, serif;">' + (e.company || 'Company') + ' | ' + (e.title || 'Position') + '</strong>';
            if (e.date) html += '<span style="font-size: 13px; color: #6b645a; font-family: \'Times New Roman\', Times, serif;">' + e.date + '</span>';
            html += '</div>';
            if (e.description) {
                var descLines = e.description.split('\n');
                html += '<ul style="padding-left: 20px; margin-top: 4px; font-size: 13px; color: #2a2520; line-height: 1.5; font-family: \'Times New Roman\', Times, serif;">';
                descLines.forEach(function(line) {
                    if (line.trim()) {
                        html += '<li style="margin-bottom: 4px;">' + line.trim() + '</li>';
                    }
                });
                html += '</ul>';
            }
            html += '</div>';
        });
        html += '</div>';
    }

    if (education && education.length > 0) {
        html += '<div style="margin-bottom: 16px;">';
        html += '<h4 style="color: #0b2a35; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">EDUCATION</h4>';
        education.forEach(function(e) {
            html += '<div style="margin-bottom: 8px; font-size: 14px; color: #2a2520; font-family: \'Times New Roman\', Times, serif;">';
            html += '<strong>' + (e.school || 'Institution') + '</strong> | ' + (e.qualification || 'Qualification');
            if (e.field && e.field.trim()) html += ' in ' + e.field;
            if (e.year) html += ' | ' + e.year;
            html += '</div>';
        });
        html += '</div>';
    }

    html += '<div>';
    html += '<h4 style="color: #0b2a35; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin-bottom: 10px; font-family: \'Times New Roman\', Times, serif;">REFERENCES</h4>';
    if (references && references.length > 0 && references[0].name) {
        html += '<ul style="padding-left: 20px; font-size: 14px; color: #2a2520; font-family: \'Times New Roman\', Times, serif;">';
        references.forEach(function(r) {
            html += '<li style="margin-bottom: 4px;">' + r.name + (r.details ? ' - ' + r.details : '') + '</li>';
        });
        html += '</ul>';
    } else {
        html += '<p style="font-size: 14px; color: #6b645a; font-style: italic; font-family: \'Times New Roman\', Times, serif;">Available upon request.</p>';
    }
    html += '</div></div></div></div>';

    return html;
}

// ==========================================
// FORMAT LETTER - CLEAN VERSION
// ==========================================
function formatLetter(content, data) {
    var p = data.personal;
    var date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    var companyName = data.companyName || '[Company Name]';
    var companyAddress = data.companyAddress || '[Company Address]';
    var position = data.position || '[Position]';
    var signature = data.signature || '';
    var senderAddress = data.senderAddress || p.address || '[Your Address]';
    
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
    
    var namePattern = new RegExp('^' + p.fullName + '[,\\s]*', 'i');
    cleanContent = cleanContent.replace(namePattern, '');
    
    var html = '';
    
    html += '<div style="font-family: \'Times New Roman\', Times, serif; max-width: 800px; margin: 0 auto; padding: 60px 50px; background: white;">';
    
    html += '<div style="text-align: right; margin-bottom: 20px;">';
    html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.8;">' + (p.fullName || 'Your Name') + '</p>';
    
    var addressLines = senderAddress.split('\n').filter(function(line) { return line.trim(); });
    addressLines.forEach(function(line) {
        html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + line.trim() + '</p>';
    });
    
    html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + (p.phone || '') + '</p>';
    html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + (p.email || '') + '</p>';
    html += '</div>';
    
    html += '<div style="text-align: right; margin-bottom: 30px;">';
    html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + date + '</p>';
    html += '</div>';
    
    html += '<div style="margin-bottom: 30px;">';
    html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">The Human Resource Manager</p>';
    html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + companyName + '</p>';
    
    var companyLines = companyAddress.split('\n').filter(function(line) { return line.trim(); });
    companyLines.forEach(function(line) {
        html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif; line-height: 1.6;">' + line.trim() + '</p>';
    });
    
    html += '</div>';
    
    html += '<div style="margin-bottom: 12px;">';
    html += '<p style="font-size: 16px; font-weight: 600; color: #000000; margin: 0; font-family: \'Times New Roman\', Times, serif;">Dear Sir/Madam,</p>';
    html += '</div>';
    
    html += '<div style="margin-bottom: 20px;">';
    html += '<p style="font-size: 18px; color: #000000; text-align: center; font-weight: 800; text-decoration: underline; font-family: \'Times New Roman\', Times, serif; margin: 0; text-transform: uppercase;"><strong>RE:</strong> APPLICATION FOR THE POSITION OF ' + position.toUpperCase() + '</p>';
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
    
    if (signature) {
        html += '<div style="margin: 12px 0 4px 0;">';
        html += '<img src="' + signature + '" alt="Signature" style="max-width: 200px; max-height: 80px; display: block;">';
        html += '</div>';
    } else {
        html += '<div style="height: 30px;"></div>';
    }
    
    html += '<p style="font-size: 18px; font-weight: 700; color: #000000; margin: 8px 0 0 0; font-family: \'Times New Roman\', Times, serif;">' + p.fullName + '</p>';
    html += '</div>';
    
    html += '</div>';
    
    return html;
}

// ==========================================
// BUILD LETTER PROMPT FOR AI
// ==========================================
function buildLetterPrompt(data) {
    var p = data.personal;
    var exp = data.experience;
    var edu = data.education;
    var cvType = data.cvType;

    var prompt = 'Write a professional application letter for:\n\n';
    prompt += 'Name: ' + p.fullName + '\n';
    prompt += 'Job Title: ' + (p.jobTitle || 'Professional') + '\n';
    prompt += 'Email: ' + p.email + '\n';
    prompt += 'Phone: ' + p.phone + '\n';
    prompt += 'Address: ' + p.address + '\n\n';
    
    if (exp && exp.length > 0) {
        prompt += 'Experience:\n';
        exp.forEach(function(e) {
            prompt += '- ' + (e.title || 'Position') + ' at ' + (e.company || 'Company');
            if (e.start || e.end) prompt += ' (' + (e.start || '') + ' - ' + (e.end || 'Present') + ')';
            prompt += '\n';
        });
        prompt += '\n';
    }
    
    if (edu && edu.length > 0) {
        prompt += 'Education:\n';
        edu.forEach(function(e) {
            prompt += '- ' + (e.qualification || 'Qualification');
            if (e.school) prompt += ' from ' + e.school;
            if (e.year) prompt += ' (' + e.year + ')';
            prompt += '\n';
        });
        prompt += '\n';
    }
    
    prompt += 'Write 3 professional paragraphs for the letter body. Start directly with the first paragraph. Do not include any introductory text like "Here is the letter" or "I\'m happy to assist". Just write the letter content.';

    return prompt;
}
// ==========================================
// GENERATE APPLICATION LETTER
// ==========================================
async function generateApplicationLetter() {
    if (!lastGeneratedData) {
        showNotification('Please generate a CV first.', 'error');
        return;
    }

    var modal = document.createElement('div');
    modal.id = 'letterDetailsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        backdrop-filter: blur(15px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 24px 80px rgba(0,0,0,0.2);
            position: relative;
        ">
            <button onclick="closeLetterDetailsModal()" style="
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                font-size: 20px;
                color: #6b645a;
                cursor: pointer;
                transition: all 0.3s ease;
                padding: 6px;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
            " 
            onmouseover="this.style.backgroundColor='#f0ede8'; this.style.color='#dc3545'"
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='#6b645a'">
                <i class="fas fa-times"></i>
            </button>
            
            <h2 style="
                font-family: 'Times New Roman', Times, serif;
                font-size: 24px;
                color: #0b2a35;
                margin-bottom: 4px;
                font-weight: 700;
            ">
                <i class="fas fa-envelope" style="color: #c9a84c; margin-right: 10px;"></i>
                Application Letter Details
            </h2>
            <p style="
                font-family: 'Times New Roman', Times, serif;
                color: #6b645a;
                font-size: 14px;
                margin-bottom: 24px;
            ">
                <i class="fas fa-info-circle" style="color: #c9a84c;"></i>
                Please provide the required information for the application letter
            </p>
            
            <form id="letterDetailsForm" onsubmit="event.preventDefault(); submitLetterDetails();">
                
                <div style="margin-bottom: 16px;">
                    <label style="
                        font-family: 'Times New Roman', Times, serif;
                        font-weight: 700;
                        font-size: 14px;
                        color: #0b2a35;
                        display: block;
                        margin-bottom: 4px;
                    ">
                        <i class="fas fa-home" style="color: #c9a84c; margin-right: 6px;"></i>
                        Your Address / P.O Box <span style="color: #dc3545;">*</span>
                    </label>
                    <textarea id="letterSenderAddress" name="senderAddress" rows="3" placeholder="P.O. Box 12345-00100&#10;Nairobi, Kenya" style="
                        width: 100%;
                        padding: 10px 14px;
                        border: 2px solid #e0dbd3;
                        border-radius: 8px;
                        font-size: 14px;
                        font-family: 'Times New Roman', Times, serif;
                        background: #f4f2ec;
                        transition: all 0.3s ease;
                        resize: vertical;
                    " required>${lastGeneratedData.personal.address || ''}</textarea>
                    <p style="font-size: 12px; color: #6b645a; margin-top: 4px; font-family: 'Times New Roman', Times, serif;">
                        <i class="fas fa-info-circle" style="color: #c9a84c;"></i>
                        Format: P.O. Box [Number]-[Postal Code], [City] (One line per detail)
                    </p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="
                        font-family: 'Times New Roman', Times, serif;
                        font-weight: 700;
                        font-size: 14px;
                        color: #0b2a35;
                        display: block;
                        margin-bottom: 4px;
                    ">
                        <i class="fas fa-building" style="color: #c9a84c; margin-right: 6px;"></i>
                        Company Name <span style="color: #dc3545;">*</span>
                    </label>
                    <input type="text" id="letterCompanyName" name="companyName" placeholder="e.g. Tech Solutions Ltd" style="
                        width: 100%;
                        padding: 10px 14px;
                        border: 2px solid #e0dbd3;
                        border-radius: 8px;
                        font-size: 14px;
                        font-family: 'Times New Roman', Times, serif;
                        background: #f4f2ec;
                        transition: all 0.3s ease;
                    " required>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="
                        font-family: 'Times New Roman', Times, serif;
                        font-weight: 700;
                        font-size: 14px;
                        color: #0b2a35;
                        display: block;
                        margin-bottom: 4px;
                    ">
                        <i class="fas fa-location-dot" style="color: #c9a84c; margin-right: 6px;"></i>
                        Company Address / P.O Box <span style="color: #dc3545;">*</span>
                    </label>
                    <textarea id="letterCompanyAddress" name="companyAddress" rows="2" placeholder="P.O. Box 12345-00100&#10;Nairobi, Kenya" style="
                        width: 100%;
                        padding: 10px 14px;
                        border: 2px solid #e0dbd3;
                        border-radius: 8px;
                        font-size: 14px;
                        font-family: 'Times New Roman', Times, serif;
                        background: #f4f2ec;
                        transition: all 0.3s ease;
                        resize: vertical;
                    " required></textarea>
                    <p style="font-size: 12px; color: #6b645a; margin-top: 4px; font-family: 'Times New Roman', Times, serif;">
                        <i class="fas fa-info-circle" style="color: #c9a84c;"></i>
                        Format: P.O. Box [Number]-[Postal Code], [City] (One line per detail)
                    </p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="
                        font-family: 'Times New Roman', Times, serif;
                        font-weight: 700;
                        font-size: 14px;
                        color: #0b2a35;
                        display: block;
                        margin-bottom: 4px;
                    ">
                        <i class="fas fa-briefcase" style="color: #c9a84c; margin-right: 6px;"></i>
                        Position Applying For <span style="color: #dc3545;">*</span>
                    </label>
                    <input type="text" id="letterPosition" name="position" placeholder="e.g. Senior Software Developer" style="
                        width: 100%;
                        padding: 10px 14px;
                        border: 2px solid #e0dbd3;
                        border-radius: 8px;
                        font-size: 14px;
                        font-family: 'Times New Roman', Times, serif;
                        background: #f4f2ec;
                        transition: all 0.3s ease;
                    " required>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="
                        font-family: 'Times New Roman', Times, serif;
                        font-weight: 700;
                        font-size: 14px;
                        color: #0b2a35;
                        display: block;
                        margin-bottom: 4px;
                    ">
                        <i class="fas fa-pen" style="color: #c9a84c; margin-right: 6px;"></i>
                        Upload Signature <span style="color: #6b645a;">(Optional)</span>
                    </label>
                    <div id="signatureUploadArea" style="
                        border: 2px dashed #e0dbd3;
                        border-radius: 8px;
                        padding: 30px;
                        text-align: center;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        background: #faf8f4;
                    ">
                        <input type="file" id="signatureInput" accept="image/*" style="display:none;">
                        <div id="signaturePlaceholder">
                            <i class="fas fa-pen" style="font-size: 32px; color: #c9a84c;"></i>
                            <p style="font-family: 'Times New Roman', Times, serif; color: #6b645a; margin-top: 8px;">Click to upload signature (Optional)</p>
                            <p style="font-family: 'Times New Roman', Times, serif; color: #6b645a; font-size: 12px;">White background recommended</p>
                        </div>
                        <div id="signaturePreview" style="display:none;">
                            <img id="signatureImg" src="" alt="Signature" style="max-width: 200px; max-height: 80px;">
                            <p style="font-family: 'Times New Roman', Times, serif; color: #0b2a35; margin-top: 8px; font-weight: 600;">
                                <i class="fas fa-check-circle" style="color: #22c55e;"></i> Signature uploaded
                            </p>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" onclick="closeLetterDetailsModal()" style="
                        padding: 10px 24px;
                        background: transparent;
                        color: #6b645a;
                        border: 2px solid #e0dbd3;
                        border-radius: 999px;
                        font-weight: 700;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-family: 'Times New Roman', Times, serif;
                    ">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="submit" style="
                        padding: 10px 32px;
                        background: #c9a84c;
                        color: #0b2a35;
                        border: none;
                        border-radius: 999px;
                        font-weight: 700;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-family: 'Times New Roman', Times, serif;
                        box-shadow: 0 8px 24px rgba(201,168,76,0.3);
                    ">
                        <i class="fas fa-wand-magic-sparkles"></i> Generate Letter
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    var uploadArea = document.getElementById('signatureUploadArea');
    var signatureInput = document.getElementById('signatureInput');
    
    if (uploadArea && signatureInput) {
        uploadArea.addEventListener('click', function() {
            signatureInput.click();
        });
        
        signatureInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Signature file must be less than 5MB', 'error');
                return;
            }
            
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = document.getElementById('signatureImg');
                var preview = document.getElementById('signaturePreview');
                var placeholder = document.getElementById('signaturePlaceholder');
                
                if (img) img.src = e.target.result;
                if (preview) preview.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
                
                window._letterSignature = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}
// ==========================================
// SUBMIT LETTER DETAILS
// ==========================================
async function submitLetterDetails() {
    console.log('🔍 Submit Letter Details called');
    
    // Get the form element
    var form = document.getElementById('letterDetailsForm');
    if (!form) {
        console.error('❌ Form not found!');
        showNotification('Form not found. Please try again.', 'error');
        return;
    }
    
    // Get values directly from the form using FormData
    var formData = new FormData(form);
    
    // Log all form data
    console.log('📋 FormData entries:');
    for (var pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
    
    // Get values from FormData
    var senderAddress = formData.get('senderAddress') || '';
    var companyName = formData.get('companyName') || '';
    var companyAddress = formData.get('companyAddress') || '';
    var position = formData.get('position') || '';
    var signature = window._letterSignature || '';
    
    console.log('📝 Values from FormData:', { 
        senderAddress: senderAddress, 
        companyName: companyName, 
        companyAddress: companyAddress, 
        position: position 
    });
    
    // ALSO try getting by ID as fallback
    var senderAddressEl = document.getElementById('letterSenderAddress');
    var companyNameEl = document.getElementById('letterCompanyName');
    var companyAddressEl = document.getElementById('letterCompanyAddress');
    var positionEl = document.getElementById('letterPosition');
    
    var senderAddressById = senderAddressEl ? senderAddressEl.value : '';
    var companyNameById = companyNameEl ? companyNameEl.value : '';
    var companyAddressById = companyAddressEl ? companyAddressEl.value : '';
    var positionById = positionEl ? positionEl.value : '';
    
    console.log('📝 Values by ID:', { 
        senderAddressById: senderAddressById, 
        companyNameById: companyNameById, 
        companyAddressById: companyAddressById, 
        positionById: positionById 
    });
    
    // Use the values from FormData (they should have the actual user input)
    var finalSenderAddress = senderAddress || senderAddressById;
    var finalCompanyName = companyName || companyNameById;
    var finalCompanyAddress = companyAddress || companyAddressById;
    var finalPosition = position || positionById;
    
    // Trim values
    finalSenderAddress = finalSenderAddress.trim();
    finalCompanyName = finalCompanyName.trim();
    finalCompanyAddress = finalCompanyAddress.trim();
    finalPosition = finalPosition.trim();
    
    console.log('📝 Final Values:', { 
        finalSenderAddress: finalSenderAddress, 
        finalCompanyName: finalCompanyName, 
        finalCompanyAddress: finalCompanyAddress, 
        finalPosition: finalPosition 
    });
    
    // Validation
    if (!finalSenderAddress || finalSenderAddress === '') {
        showNotification('Please enter your address/P.O Box.', 'error');
        console.warn('❌ Missing: senderAddress');
        return;
    }
    
    if (!finalCompanyName || finalCompanyName === '') {
        showNotification('Please enter the company name.', 'error');
        console.warn('❌ Missing: companyName');
        return;
    }
    
    if (!finalCompanyAddress || finalCompanyAddress === '') {
        showNotification('Please enter the company address/P.O Box.', 'error');
        console.warn('❌ Missing: companyAddress');
        return;
    }
    
    if (!finalPosition || finalPosition === '') {
        showNotification('Please enter the position you are applying for.', 'error');
        console.warn('❌ Missing: position');
        return;
    }
    
    console.log('✅ All fields validated successfully!');
    closeLetterDetailsModal();
    
    var data = lastGeneratedData;
    data.senderAddress = finalSenderAddress;
    data.companyName = finalCompanyName;
    data.companyAddress = finalCompanyAddress;
    data.position = finalPosition;
    data.signature = signature;
    
    var letterContainer = document.getElementById('letterContainer');
    if (!letterContainer) {
        console.error('❌ letterContainer not found!');
        return;
    }
    
    letterContainer.style.display = 'block';
    letterContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 30px; color: #c9a84c;"></i><p style="margin-top: 10px; font-family: \'Times New Roman\', Times, serif;">Generating your application letter...</p></div>';
    
    try {
        var prompt = buildLetterPrompt(data);
        
        var messages = [
            {
                role: 'system',
                content: 'Write a Professional cover letter. Write ONLY the body paragraphs of the application letter. Do not include any salutation, sender details, date, closing, or placeholder text. Just write 2-3 professional paragraphs explaining why the candidate is suitable for the position. Just be specific and precise to the point, dont add unnecessary information.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        console.log('📤 Sending request to API:', API_URL);
        
        var response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: OR_MODEL,
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            var errorData = await response.json();
            console.error('❌ API Error:', errorData);
            throw new Error(errorData.error || 'API request failed');
        }
        
        var result = await response.json();
        console.log('✅ API Response received');
        var letterContent = result.choices[0].message.content;
        
        window._letterData = data;
        window._letterContent = letterContent;
        
        var formattedLetter = formatLetter(letterContent, data);
        letterContainer.innerHTML = formattedLetter;
        
        var downloadButtons = `
            <div style="text-align: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e0dbd3;">
                <button onclick="downloadLetter('pdf')" style="padding: 10px 24px; font-size: 14px; background: #c9a84c; color: #0b2a35; border: none; border-radius: 999px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; font-family: 'Times New Roman', Times, serif; margin: 0 8px;">
                    <i class="fas fa-file-pdf"></i> Download PDF
                </button>
                <button onclick="downloadLetter('word')" style="padding: 10px 24px; font-size: 14px; background: transparent; color: #0b2a35; border: 2px solid #0b2a35; border-radius: 999px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; font-family: 'Times New Roman', Times, serif; margin: 0 8px;">
                    <i class="fas fa-file-word"></i> Download Word
                </button>
            </div>
        `;
        letterContainer.innerHTML += downloadButtons;
        
        showNotification('Application Letter Generated successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Error generating letter:', error);
        letterContainer.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px; font-family: \'Times New Roman\', Times, serif;">Error generating letter. Please try again.</p>';
        showNotification('Error: ' + error.message, 'error');
    }
}

// ==========================================
// CLOSE LETTER DETAILS MODAL
// ==========================================
function closeLetterDetailsModal() {
    var modal = document.getElementById('letterDetailsModal');
    if (modal) {
        modal.remove();
    }
    window._letterSignature = null;
}

// ==========================================
// DOWNLOAD LETTER
// ==========================================
function downloadLetter(format) {
    var letterContainer = document.getElementById('letterContainer');
    if (!letterContainer) return;
    
    var letterDiv = letterContainer.querySelector('div[style*="font-family: \'Times New Roman\'"]');
    var content = '';
    
    if (letterDiv) {
        var clone = letterDiv.cloneNode(true);
        var buttonDivs = clone.querySelectorAll('div[style*="text-align: center"][style*="margin-top"]');
        buttonDivs.forEach(function(btn) {
            btn.remove();
        });
        content = clone.outerHTML;
    } else {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = letterContainer.innerHTML;
        var allButtons = tempDiv.querySelectorAll('div[style*="text-align: center"][style*="margin-top"]');
        allButtons.forEach(function(btn) {
            btn.remove();
        });
        content = tempDiv.innerHTML;
    }
    
    var title = document.getElementById('fullName')?.value || 'Application_Letter';
    
    if (format === 'pdf') {
        var win = window.open('', '_blank');
        if (!win) {
            showNotification('Please allow popups to download PDF.', 'error');
            return;
        }
        
        win.document.write('<!DOCTYPE html><html><head><title>' + title + ' - Application Letter</title><meta charset="utf-8"><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { background: white; font-family: \'Times New Roman\', Times, serif; line-height: 1.5; color: #000000; padding: 40px; } @page { margin: 1.5cm; size: A4; } @media print { body { padding: 0; } }</style></head><body>' + content + '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\/script></body></html>');
        win.document.close();
        
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
        
        showNotification('Letter downloaded successfully!', 'success');
    }
}

// ==========================================
// DOWNLOAD CV
// ==========================================
function downloadCV(format) {
    var container = document.getElementById('cvPreviewContainer');
    if (!container || !container.innerHTML.trim()) {
        showNotification('Please generate your CV first.', 'error');
        return;
    }

    var cvDiv = container.querySelector('div[style*="font-family: \'Times New Roman\'"]');
    var content = '';
    
    if (cvDiv) {
        var clone = cvDiv.cloneNode(true);
        var buttonDivs = clone.querySelectorAll('div[style*="text-align: center"][style*="margin-top"]');
        buttonDivs.forEach(function(btn) {
            btn.remove();
        });
        var letterContainer = clone.querySelector('#letterContainer');
        if (letterContainer) {
            letterContainer.remove();
        }
        content = clone.outerHTML;
    } else {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = container.innerHTML;
        var allButtons = tempDiv.querySelectorAll('div[style*="text-align: center"][style*="margin-top"]');
        allButtons.forEach(function(btn) {
            btn.remove();
        });
        var letterCont = tempDiv.querySelector('#letterContainer');
        if (letterCont) {
            letterCont.remove();
        }
        content = tempDiv.innerHTML;
    }
    
    var title = document.getElementById('fullName').value || 'CV';
    var styles = document.querySelector('style')?.innerHTML || '';

    if (format === 'pdf') {
        var win = window.open('', '_blank');
        if (!win) {
            showNotification('Please allow popups to download PDF.', 'error');
            return;
        }

        win.document.write('<!DOCTYPE html><html><head><title>' + title + ' - CV</title><meta charset="utf-8"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"><style>' + styles + '* { margin: 0; padding: 0; box-sizing: border-box; } body { background: white; font-family: \'Times New Roman\', Times, serif; line-height: 1.5; color: #2a2520; padding: 40px; } @page { margin: 1.5cm; size: A4; } @media print { body { padding: 0; } }</style></head><body>' + content + '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\/script></body></html>');
        win.document.close();
        showNotification('PDF downloaded successfully!', 'success');
        
    } else if (format === 'word') {
        var doc = '<!DOCTYPE html><html xmlns:o=\'urn:schemas-microsoft-com:office:office\' xmlns:w=\'urn:schemas-microsoft-com:office:word\' xmlns=\'http://www.w3.org/TR/REC-html40\'><head><meta charset="utf-8"><title>' + title + ' - CV</title><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]--><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { background: white; font-family: \'Times New Roman\', Times, serif; line-height: 1.5; color: #2a2520; padding: 40px; } @page { margin: 1.5cm; } </style><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"></head><body>' + content + '</body></html>';

        var blob = new Blob([doc], { type: 'application/msword;charset=utf-8' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = title + '_CV.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function() { URL.revokeObjectURL(link.href); }, 100);

        showNotification('Word document downloaded successfully!', 'success');
    }
}

// ==========================================
// PRINT CV
// ==========================================
function printCV() {
    var container = document.getElementById('cvPreviewContainer');
    if (!container || !container.innerHTML.trim()) {
        showNotification('Please generate your CV first.', 'error');
        return;
    }

    var content = container.innerHTML;
    var styles = document.querySelector('style')?.innerHTML || '';
    var title = document.getElementById('fullName').value || 'CV';

    var win = window.open('', '_blank');
    if (!win) {
        showNotification('Please allow popups to print.', 'error');
        return;
    }

    win.document.write('<!DOCTYPE html><html><head><title>' + title + ' - CV</title><meta charset="utf-8"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"><style>' + styles + '* { margin: 0; padding: 0; box-sizing: border-box; } body { padding: 20px; background: white; font-family: \'Times New Roman\', Times, serif; line-height: 1.5; color: #2a2520; max-width: 1100px; margin: 0 auto; } @page { margin: 1.5cm; size: A4; } @media print { body { padding: 0; } }</style></head><body>' + content + '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\/script></body></html>');
    win.document.close();
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================
function showNotification(message, type) {
    type = type || 'success';
    var existing = document.querySelector('.cv-notification');
    if (existing) existing.remove();

    var notification = document.createElement('div');
    notification.className = 'cv-notification' + (type === 'error' ? ' error' : '');

    notification.innerHTML = '<i class="fas ' + (type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle') + '"></i><span>' + message + '</span><button class="close-btn" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>';

    document.body.appendChild(notification);

    setTimeout(function() {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ==========================================
// CLOSE LETTER MODAL (Alias)
// ==========================================
function closeLetterModal() {
    closeLetterDetailsModal();
}