const courses = [
    // First Year Fall
    { code: "ENGR 1100", name: "Introduction to Engineering Analysis" },
    { code: "ENGR 1200", name: "Engineering Graphics and CAD" },
    { code: "MATH 1010", name: "Calculus I" },
    { code: "PHYS 1100", name: "Physics I" },
    // First Year Spring
    { code: "CHEM 1100", name: "Chemistry I" },
    { code: "MANE 1060", name: "Fundamentals of Flight" },
    { code: "MATH 1020", name: "Calculus II" },
    { code: "PHYS 1200", name: "Physics II" },
    // Second Year Fall
    { code: "ENGR 1300", name: "Engineering Processes" },
    { code: "ENGR 2530", name: "Strength of Materials" },
    { code: "MANE 2710", name: "Thermodynamics" },
    { code: "MATH 2400", name: "Introduction to Differential Equations" },
    // Second Year Spring
    { code: "ADMN 1030", name: "ARCH Exploration & Planning" },
    { code: "ENGR 2050", name: "Intro Engineering Design" },
    { code: "ENGR 2600", name: "Modeling and Analysis of Uncertainty" },
    { code: "MANE 2110", name: "Numerical Methods and Programming for Engineers" },
    { code: "MANE 2720", name: "Fluid Mechanics" },
    { code: "MATH 2010", name: "Multivariable Calculus and Matrix Algebra" },
    // Third Year - ARCH Semester
    { code: "ENGR 2090", name: "Engineering Dynamics" },
    { code: "MANE 4060", name: "Aerospace Structures and Materials" },
    { code: "MANE 4070", name: "Aerodynamics" },
    // Third Year Spring
    { code: "MANE 4100", name: "Spaceflight Mechanics" },
    { code: "MANE 4500", name: "Modeling and Control of Dynamic Systems" },
    { code: "MANE 4900", name: "Aeroelasticity and Structural Vibrations" },
    { code: "MANE 4910", name: "Fluid Dynamics Laboratory" },
    { code: "MANE 4920", name: "Aerospace Structures Laboratory" },
    { code: "STSO 4100", name: "Professional Development - Technical Issues and Solutions" },
    // Third Year - Fall or Spring
    { code: "ILEA 4400", name: "Independent Learning Experience" },
    // Fourth Year Fall
    { code: "MANE 4080", name: "Propulsion Systems" },
    { code: "MANE 4250", name: "Space Vehicle Design" },
    { code: "MANE 4510", name: "Control Systems Laboratory" },
    // Fourth Year Spring
    { code: "ENGR 4010", name: "Professional Development: Leadership Competencies" }
];

function createCourseElement(course) {
    const div = document.createElement('div');
    div.className = 'course-item';
    div.draggable = true;
    div.dataset.code = course.code;
    div.innerHTML = `
        <div class="course-code">${course.code}</div>
        <div class="course-name">${course.name}</div>
    `;

    // Desktop drag events
    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    // Mobile touch events
    div.addEventListener('touchstart', handleTouchStart, { passive: false });
    div.addEventListener('touchmove', handleTouchMove, { passive: false });
    div.addEventListener('touchend', handleTouchEnd);

    return div;
}

// Touch handling for mobile
let touchDragElement = null;
let touchStartX = 0;
let touchStartY = 0;
let originalParent = null;

function handleTouchStart(e) {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchDragElement = e.currentTarget;
    originalParent = touchDragElement.parentElement;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    // Create placeholder
    touchDragElement.classList.add('touch-placeholder');

    // Clone for dragging
    const rect = touchDragElement.getBoundingClientRect();
    touchDragElement.style.width = rect.width + 'px';

    setTimeout(() => {
        if (touchDragElement) {
            touchDragElement.classList.remove('touch-placeholder');
            touchDragElement.classList.add('touch-dragging');
            touchDragElement.style.left = rect.left + 'px';
            touchDragElement.style.top = rect.top + 'px';
        }
    }, 100);
}

function handleTouchMove(e) {
    if (!touchDragElement) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    const rect = touchDragElement.getBoundingClientRect();
    touchDragElement.style.left = (touch.clientX - rect.width / 2) + 'px';
    touchDragElement.style.top = (touch.clientY - rect.height / 2) + 'px';

    // Highlight drop zone
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    const dropZone = getDropZoneAtPoint(touch.clientX, touch.clientY);
    if (dropZone) {
        dropZone.classList.add('drag-over');
    }
}

function handleTouchEnd(e) {
    if (!touchDragElement) return;

    const touch = e.changedTouches[0];
    const dropZone = getDropZoneAtPoint(touch.clientX, touch.clientY);

    // Reset styles
    touchDragElement.classList.remove('touch-dragging', 'touch-placeholder');
    touchDragElement.style.position = '';
    touchDragElement.style.left = '';
    touchDragElement.style.top = '';
    touchDragElement.style.width = '';

    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

    if (dropZone && dropZone !== originalParent) {
        dropZone.appendChild(touchDragElement);
        saveTierList();
    }

    touchDragElement = null;
    originalParent = null;
}

function getDropZoneAtPoint(x, y) {
    const elements = document.elementsFromPoint(x, y);
    for (const el of elements) {
        if (el.classList.contains('tier-items') || el.classList.contains('unranked-items')) {
            return el;
        }
    }
    return null;
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.code);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const code = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`[data-code="${code}"]`);

    if (draggedElement && e.currentTarget !== draggedElement.parentElement) {
        e.currentTarget.appendChild(draggedElement);
        saveTierList();
    }
}

function setupDropZones() {
    const dropZones = document.querySelectorAll('.tier-items, .unranked-items');
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

function saveTierList() {
    const tierData = {};
    document.querySelectorAll('[data-tier]').forEach(zone => {
        const tier = zone.dataset.tier;
        const codes = Array.from(zone.querySelectorAll('.course-item')).map(el => el.dataset.code);
        tierData[tier] = codes;
    });

    // Save to cookie (expires in 365 days)
    const expires = new Date();
    expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `tierList=${encodeURIComponent(JSON.stringify(tierData))};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function loadTierList() {
    const cookieMatch = document.cookie.match(/tierList=([^;]+)/);
    if (cookieMatch) {
        try {
            return JSON.parse(decodeURIComponent(cookieMatch[1]));
        } catch (e) {
            return null;
        }
    }
    return null;
}

function initializeTierList() {
    const savedData = loadTierList();
    const unrankedZone = document.querySelector('[data-tier="unranked"]');

    if (savedData) {
        // Place courses according to saved data
        const placedCodes = new Set();

        Object.entries(savedData).forEach(([tier, codes]) => {
            const zone = document.querySelector(`[data-tier="${tier}"]`);
            if (zone) {
                codes.forEach(code => {
                    const course = courses.find(c => c.code === code);
                    if (course) {
                        zone.appendChild(createCourseElement(course));
                        placedCodes.add(code);
                    }
                });
            }
        });

        // Place any new courses that weren't in saved data
        courses.forEach(course => {
            if (!placedCodes.has(course.code)) {
                unrankedZone.appendChild(createCourseElement(course));
            }
        });
    } else {
        // All courses start in unranked
        courses.forEach(course => {
            unrankedZone.appendChild(createCourseElement(course));
        });
    }
}

function resetTierList() {
    if (confirm('Are you sure you want to reset the tier list?')) {
        // Clear cookie
        document.cookie = 'tierList=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';

        // Clear all zones
        document.querySelectorAll('[data-tier]').forEach(zone => {
            zone.innerHTML = '';
        });

        // Re-initialize
        const unrankedZone = document.querySelector('[data-tier="unranked"]');
        courses.forEach(course => {
            unrankedZone.appendChild(createCourseElement(course));
        });
    }
}

// Initialize
setupDropZones();
initializeTierList();
