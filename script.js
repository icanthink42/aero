const courses = [
    // First Year Fall
    { code: "ENGR 1100", name: "Introduction to Engineering Analysis" },
    { code: "ENGR 1200", name: "Engineering Graphics and CAD" },
    { code: "MATH 1010", name: "Calculus I" },
    { code: "PHYS 1100", name: "Physics I" },
    // First Year Spring
    { code: "CHEM 1100", name: "Principles of Chemistry I" },
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

    div.addEventListener('dragstart', handleDragStart);
    div.addEventListener('dragend', handleDragEnd);

    return div;
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
