// متغيرات عامة
let courses = [];
let courseId = 1;
let currentLanguage = 'ar';
let currentTheme = 'light';
let editingCourseId = null;

// Edit course: load into form and switch add button to save mode
function startEditCourse(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    editingCourseId = id;

    const nameInput = document.getElementById('courseName');
    const hoursSelect = document.getElementById('courseHours');
    const gradeSelect = document.getElementById('courseGrade');

    if (nameInput) nameInput.value = course.name || '';
    if (hoursSelect) hoursSelect.value = String(course.hours);
    if (typeof updateGradeOptions === 'function') { updateGradeOptions(); }
    if (gradeSelect) gradeSelect.value = String(course.grade);

    const btn = document.querySelector('.add-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        const labelSpan = btn.querySelector('span');
        if (icon) icon.className = 'fas fa-save';
        const ar = 'حفظ التعديلات';
        const en = 'Save Changes';
        if (labelSpan) {
            labelSpan.setAttribute('data-ar', ar);
            labelSpan.setAttribute('data-en', en);
            labelSpan.textContent = getTranslation(ar, en);
        } else {
            btn.textContent = getTranslation(ar, en);
        }
        btn.setAttribute('onclick', 'saveEditedCourse()');
    }
}

// Save edited values back to array and recalc
function saveEditedCourse() {
    if (editingCourseId == null) return;

    const nameInput = document.getElementById('courseName');
    const hoursSelect = document.getElementById('courseHours');
    const gradeSelect = document.getElementById('courseGrade');

    let courseName = nameInput && typeof nameInput.value === 'string' ? nameInput.value.trim() : '';
    const courseHours = parseInt(hoursSelect && hoursSelect.value ? hoursSelect.value : '0');
    const courseGrade = gradeSelect && gradeSelect.value ? gradeSelect.value : '0';

    if (!courseName) {
        courseName = getTranslation('بدون اسم', 'Unnamed Course');
    }

    const idx = courses.findIndex(c => c.id === editingCourseId);
    if (idx === -1) return;

    courses[idx].name = courseName;
    courses[idx].hours = courseHours;
    courses[idx].grade = courseGrade;
    courses[idx].points = calculatePoints(courseGrade, courseHours);

    updateCoursesList();
    updateResults();
    saveToLocalStorage();

    // reset form and button
    clearInputs();
    const btn = document.querySelector('.add-btn');
    if (btn) {
        const icon = btn.querySelector('i');
        const labelSpan = btn.querySelector('span');
        if (icon) icon.className = 'fas fa-plus';
        const arAdd = 'إضافة مقرر';
        const enAdd = 'Add Course';
        if (labelSpan) {
            labelSpan.setAttribute('data-ar', arAdd);
            labelSpan.setAttribute('data-en', enAdd);
            labelSpan.textContent = getTranslation(arAdd, enAdd);
        } else {
            btn.textContent = getTranslation(arAdd, enAdd);
        }
        btn.setAttribute('onclick', 'addCourse()');
    }
    editingCourseId = null;
    showNotification(getTranslation('تم تحديث المقرر بنجاح', 'Course updated successfully'), 'success');
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    loadTheme();
    loadLanguage();
    updateResults();
    updateCoursesList();
    
    // إضافة مستمع لحقل المعدل التراكمي
    const currentGPAInput = document.getElementById('currentGPA');
    if (currentGPAInput) {
        // تحسين تجربة الإدخال
        currentGPAInput.addEventListener('blur', function(e) {
            const value = parseFloat(e.target.value);
            if (!isNaN(value) && value >= 0 && value <= 4) {
                // تنسيق القيمة إلى رقمين عشريين
                e.target.value = value.toFixed(2);
            } else if (e.target.value.trim() !== '') {
                // إذا كان هناك قيمة غير صحيحة، مسحها
                e.target.value = '';
                showNotification(getTranslation('يرجى إدخال قيمة صحيحة للمعدل التراكمي (0-4)', 'Please enter a valid GPA value (0-4)'), 'warning');
            }
        });
    }
    
    // إضافة مستمع لحقل الساعات المكتسبة
    const currentHoursInput = document.getElementById('currentHours');
    if (currentHoursInput) {
        // منع إدخال النصوص والرموز
        currentHoursInput.addEventListener('input', function(e) {
            // إزالة أي حروف أو رموز غير رقمية
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        
        // التحقق من صحة القيمة عند فقدان التركيز
        currentHoursInput.addEventListener('blur', function(e) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 0) {
                // تنسيق القيمة كرقم صحيح
                e.target.value = value.toString();
            } else if (e.target.value.trim() !== '') {
                // إذا كان هناك قيمة غير صحيحة، مسحها
                e.target.value = '';
                showNotification(getTranslation('يرجى إدخال رقم صحيح للساعات المكتسبة', 'Please enter a valid number for earned hours'), 'warning');
            }
        });
        
        // منع لصق النصوص غير الرقمية
        currentHoursInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const numericValue = paste.replace(/[^0-9]/g, '');
            if (numericValue) {
                e.target.value = numericValue;
            }
        });
    }
});

// دوال الوضع المظلم
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Toggle dark class for Tailwind CSS
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', currentTheme);
    
    // تحديث أيقونة الوضع المظلم
    const themeIcon = document.querySelector('.theme-toggle .material-icons-round');
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    
    showNotification(
        getTranslation('تم تغيير الوضع بنجاح', 'Theme changed successfully'),
        'success'
    );
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Toggle dark class for Tailwind CSS
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // تحديث أيقونة الوضع المظلم
    const themeIcon = document.querySelector('.theme-toggle .material-icons-round');
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }
}

// دوال تغيير اللغة
function toggleLanguage() {
    currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('language', currentLanguage);
    
    updateLanguageContent();
    showNotification(
        getTranslation('تم تغيير اللغة بنجاح', 'Language changed successfully'),
        'success'
    );
}

function loadLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'ar';
    currentLanguage = savedLanguage;
    document.documentElement.setAttribute('lang', currentLanguage);
    document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
    
    updateLanguageContent();
}

function updateLanguageContent() {
    // تحديث جميع العناصر التي تحتوي على data attributes
    const elements = document.querySelectorAll('[data-ar], [data-en]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // تحديث placeholder
    const inputs = document.querySelectorAll('[data-ar-placeholder], [data-en-placeholder]');
    inputs.forEach(input => {
        const placeholder = input.getAttribute(`data-${currentLanguage}-placeholder`);
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
    
    // تحديث خيارات الدرجات
    const gradeOptions = document.querySelectorAll('#courseGrade option[data-ar], #courseGrade option[data-en]');
    gradeOptions.forEach(option => {
        const text = option.getAttribute(`data-${currentLanguage}`);
        if (text) {
            option.textContent = text;
        }
    });
    
    // تحديث title attributes
    const buttons = document.querySelectorAll('.theme-toggle, .language-toggle');
    buttons.forEach(button => {
        if (button.classList.contains('theme-toggle')) {
            button.title = getTranslation('تبديل الوضع المظلم', 'Toggle Dark Mode');
        } else if (button.classList.contains('language-toggle')) {
            button.title = getTranslation('تغيير اللغة', 'Change Language');
        }
    });
}

function getTranslation(arabic, english) {
    return currentLanguage === 'ar' ? arabic : english;
}

// إضافة مادة جديدة
function addCourse() {
    let courseName = document.getElementById('courseName').value.trim();
    const courseHours = parseInt(document.getElementById('courseHours').value);
    const courseGrade = document.getElementById('courseGrade').value;

    // التحقق من صحة البيانات - اسم المادة أصبح اختياري
    if (!courseName) {
        // إذا لم يتم إدخال اسم، نستخدم اسم افتراضي
        courseName = getTranslation('مادة بدون اسم', 'Unnamed Course');
    }

    // إنشاء كائن المادة
    const course = {
        id: courseId++,
        name: courseName,
        hours: courseHours,
        grade: courseGrade,
        points: calculatePoints(courseGrade, courseHours)
    };

    // إضافة المادة للمصفوفة
    courses.push(course);

    // تحديث الواجهة
    updateCoursesList();
    updateResults();
    saveToLocalStorage();

    // مسح الحقول
    clearInputs();

    // إظهار رسالة نجاح
    showNotification(getTranslation('تم إضافة المادة بنجاح', 'Course added successfully'), 'success');
}

// حساب النقاط حسب الدرجة وعدد الساعات
function calculatePoints(grade, hours) {
    // إذا كانت الدرجة NP أو NF، لا تدخل في الحساب
    if (grade === 'NP' || grade === 'NF') {
        return 0;
    }
    
    // تحويل الدرجة إلى رقم
    const numericGrade = parseFloat(grade);
    
    // النقاط هي الدرجة نفسها
    return numericGrade;
}

// حذف مادة
function deleteCourse(id) {
    courses = courses.filter(course => course.id !== id);
    updateCoursesList();
    updateResults();
    saveToLocalStorage();
    showNotification(getTranslation('تم حذف المادة بنجاح', 'Course deleted successfully'), 'success');
}

// تحديث قائمة المواد
function updateCoursesList() {
    const coursesList = document.getElementById('coursesList');
    
    if (courses.length === 0) {
        coursesList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons-round text-slate-300 dark:text-slate-600" style="font-size: 4rem;">auto_stories</span>
                <h4 class="text-xl font-semibold text-slate-500 dark:text-slate-400 mt-4">${getTranslation('لا توجد مواد مضافة بعد', 'No courses added yet')}</h4>
                <p class="text-slate-400 mt-2">${getTranslation('ابدأ بإضافة المواد الدراسية أعلاه لحساب المعدل', 'Start adding courses above to calculate GPA')}</p>
            </div>
        `;
        return;
    }

    coursesList.innerHTML = courses.map(course => `
        <div class="course-item">
            <div class="course-info">
                <div class="course-name">${course.name}</div>
                <div class="course-details">
                    ${course.hours} ${getTranslation('ساعة', 'hours')} - ${getGradeText(course.grade)} ${course.grade === 'NP' || course.grade === 'NF' ? `(${getTranslation('لا تدخل في المعدل', 'not counted in GPA')})` : `(${course.points.toFixed(1)} ${getTranslation('نقطة', 'points')})`}
                </div>
            </div>
            <button class="delete-btn" onclick="deleteCourse(${course.id})">
                <i class="fas fa-trash"></i> ${getTranslation('حذف', 'Delete')}
            </button>
        </div>
    `).join('');

    // Inject edit buttons next to delete buttons
    const items = Array.from(coursesList.querySelectorAll('.course-item'));
    items.forEach((item, idx) => {
        const delBtn = item.querySelector('.delete-btn');
        if (!delBtn) return;
        // Avoid duplicating if actions already exist
        if (item.querySelector('.course-actions')) return;
        const actions = document.createElement('div');
        actions.className = 'course-actions';
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = `<i class="fas fa-pen"></i> ${getTranslation('تعديل', 'Edit')}`;
        editBtn.addEventListener('click', () => startEditCourse(courses[idx].id));
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        item.appendChild(actions);
    });
}

// تحديث النتائج
function updateResults() {
    let totalPoints = 0;
    let totalHours = 0;

    // حساب النقاط والساعات للمواد التي تدخل في المعدل
    courses.forEach(course => {
        // جميع المواد تدخل في المعدل ما عدا NP/NF
        if (course.grade !== 'NP' && course.grade !== 'NF') {
            totalPoints += course.points;
            totalHours += course.hours;
        }
    });

    // حساب GPA
    const gpa = totalHours > 0 ? (totalPoints / totalHours) : 0;

    // تحديث العناصر في الواجهة
    document.getElementById('semesterGPA').textContent = gpa.toFixed(2);
    document.getElementById('totalHours').textContent = totalHours;
    document.getElementById('totalPoints').textContent = totalPoints.toFixed(1);
}

// الحساب التلقائي لـ GPA
function autoCalculateGPA() {
    const currentGPAInput = document.getElementById('currentGPA').value;
    const currentGPA = parseFloat(currentGPAInput);
    const currentHours = parseInt(document.getElementById('currentHours').value);
    
    // التحقق من صحة البيانات
    if (currentGPAInput.trim() === '' || isNaN(currentGPA) || isNaN(currentHours)) {
        showNotification(getTranslation('يرجى إدخال المعدل التراكمي الحالي والساعات المكتسبة', 'Please enter current GPA and earned hours'), 'error');
        return;
    }
    
    if (currentGPA < 0 || currentGPA > 4) {
        showNotification(getTranslation('المعدل التراكمي يجب أن يكون بين 0 و 4', 'GPA must be between 0 and 4'), 'error');
        return;
    }
    
    if (currentHours < 0) {
        showNotification(getTranslation('الساعات المكتسبة يجب أن تكون رقم موجب', 'Earned hours must be a positive number'), 'error');
        return;
    }

    // إظهار تنبيه ساعات اللغة الإنجليزية
    document.getElementById('englishNotice').style.display = 'flex';
    
    // طرح 16 ساعة من مقررات اللغة الإنجليزية
    const adjustedHours = Math.max(0, currentHours - 16);
    
    // حساب نقاط الفصل الحالي
    let semesterPoints = 0;
    let semesterHours = 0;

    courses.forEach(course => {
        // جميع المواد تدخل في المعدل ما عدا NP/NF
        if (course.grade !== 'NP' && course.grade !== 'NF') {
            semesterPoints += course.points;
            semesterHours += course.hours;
        }
    });

    if (semesterHours === 0) {
        showNotification(getTranslation('يرجى إضافة مواد للفصل الحالي أولاً', 'Please add courses for current semester first'), 'warning');
        return;
    }

    // حساب النقاط السابقة (تحويل GPA من النظام الأصلي إلى نقاط)
    const previousPoints = currentGPA * adjustedHours;
    
    // حساب المعدل التراكمي الجديد
    const totalNewPoints = previousPoints + semesterPoints;
    const totalNewHours = adjustedHours + semesterHours;
    const newCumulativeGPA = totalNewPoints / totalNewHours;
    
    // حساب التغيير
    const gpaChange = newCumulativeGPA - currentGPA;
    
    // عرض النتائج
    document.getElementById('newCumulativeGPA').textContent = newCumulativeGPA.toFixed(2);
    document.getElementById('totalCumulativeHours').textContent = totalNewHours;
    
    // تحديث عرض التغيير
    const gpaChangeElement = document.getElementById('gpaChange');
    const changeDescriptionElement = document.getElementById('changeDescription');
    
    gpaChangeElement.textContent = (gpaChange >= 0 ? '+' : '') + gpaChange.toFixed(2);
    
    if (gpaChange > 0) {
        gpaChangeElement.className = 'gpa-change positive';
        changeDescriptionElement.textContent = getTranslation('ارتفاع في المعدل التراكمي', 'GPA increase');
    } else if (gpaChange < 0) {
        gpaChangeElement.className = 'gpa-change negative';
        changeDescriptionElement.textContent = getTranslation('انخفاض في المعدل التراكمي', 'GPA decrease');
    } else {
        gpaChangeElement.className = 'gpa-change neutral';
        changeDescriptionElement.textContent = getTranslation('لا يوجد تغيير في المعدل', 'No change in GPA');
    }
    
    // إظهار النتائج
    document.getElementById('cumulativeResults').style.display = 'block';
    
    // حفظ البيانات
    saveCumulativeData(currentGPA, adjustedHours, newCumulativeGPA, gpaChange);
    
    showNotification(getTranslation('تم الحساب التلقائي بنجاح - تم طرح 16 ساعة من مقررات اللغة الإنجليزية', 'Auto calculation completed successfully - 16 hours of English courses deducted'), 'success');
}

// الحساب اليدوي لـ GPA
function manualCalculateGPA() {
    const currentGPAInput = document.getElementById('currentGPA').value;
    const currentGPA = parseFloat(currentGPAInput);
    const currentHours = parseInt(document.getElementById('currentHours').value);
    
    // التحقق من صحة البيانات
    if (currentGPAInput.trim() === '' || isNaN(currentGPA) || isNaN(currentHours)) {
        showNotification(getTranslation('يرجى إدخال المعدل التراكمي الحالي والساعات المكتسبة', 'Please enter current GPA and earned hours'), 'error');
        return;
    }
    
    if (currentGPA < 0 || currentGPA > 4) {
        showNotification(getTranslation('المعدل التراكمي يجب أن يكون بين 0 و 4', 'GPA must be between 0 and 4'), 'error');
        return;
    }
    
    if (currentHours < 0) {
        showNotification(getTranslation('الساعات المكتسبة يجب أن تكون رقم موجب', 'Earned hours must be a positive number'), 'error');
        return;
    }

    // إخفاء تنبيه ساعات اللغة الإنجليزية
    document.getElementById('englishNotice').style.display = 'none';
    
    // حساب نقاط الفصل الحالي
    let semesterPoints = 0;
    let semesterHours = 0;

    courses.forEach(course => {
        // جميع المواد تدخل في المعدل ما عدا NP/NF
        if (course.grade !== 'NP' && course.grade !== 'NF') {
            semesterPoints += course.points;
            semesterHours += course.hours;
        }
    });

    if (semesterHours === 0) {
        showNotification(getTranslation('يرجى إضافة مواد للفصل الحالي أولاً', 'Please add courses for current semester first'), 'warning');
        return;
    }

    // حساب النقاط السابقة (تحويل GPA من النظام الأصلي إلى نقاط)
    const previousPoints = currentGPA * currentHours;
    
    // حساب المعدل التراكمي الجديد
    const totalNewPoints = previousPoints + semesterPoints;
    const totalNewHours = currentHours + semesterHours;
    const newCumulativeGPA = totalNewPoints / totalNewHours;
    
    // حساب التغيير
    const gpaChange = newCumulativeGPA - currentGPA;
    
    // عرض النتائج
    document.getElementById('newCumulativeGPA').textContent = newCumulativeGPA.toFixed(2);
    document.getElementById('totalCumulativeHours').textContent = totalNewHours;
    
    // تحديث عرض التغيير
    const gpaChangeElement = document.getElementById('gpaChange');
    const changeDescriptionElement = document.getElementById('changeDescription');
    
    gpaChangeElement.textContent = (gpaChange >= 0 ? '+' : '') + gpaChange.toFixed(2);
    
    if (gpaChange > 0) {
        gpaChangeElement.className = 'gpa-change positive';
        changeDescriptionElement.textContent = getTranslation('ارتفاع في المعدل التراكمي', 'GPA increase');
    } else if (gpaChange < 0) {
        gpaChangeElement.className = 'gpa-change negative';
        changeDescriptionElement.textContent = getTranslation('انخفاض في المعدل التراكمي', 'GPA decrease');
    } else {
        gpaChangeElement.className = 'gpa-change neutral';
        changeDescriptionElement.textContent = getTranslation('لا يوجد تغيير في المعدل', 'No change in GPA');
    }
    
    // إظهار النتائج
    document.getElementById('cumulativeResults').style.display = 'block';
    
    // حفظ البيانات
    saveCumulativeData(currentGPA, currentHours, newCumulativeGPA, gpaChange);
    
    showNotification(getTranslation('تم الحساب اليدوي بنجاح - لم يتم طرح أي ساعات', 'Manual calculation completed successfully - no hours deducted'), 'success');
}

// حساب GPA التراكمي (الوظيفة الأصلية - محفوظة للتوافق)
function calculateCumulative() {
    manualCalculateGPA(); // استدعاء الحساب اليدوي كوظيفة افتراضية
}

// حفظ بيانات GPA التراكمي
function saveCumulativeData(currentGPA, currentHours, newGPA, change) {
    const cumulativeData = {
        currentGPA: currentGPA,
        currentHours: currentHours,
        newGPA: newGPA,
        change: change,
        date: new Date().toLocaleString('ar-SA')
    };
    
    localStorage.setItem('seuGpaCumulative', JSON.stringify(cumulativeData));
}

// مسح جميع الحقول
function clearInputs() {
    document.getElementById('courseName').value = '';
    document.getElementById('courseHours').value = '3';
    updateGradeOptions(); // تحديث الدرجات بعد تغيير عدد الساعات
}

// مسح الكل
function clearAll() {
    if (courses.length === 0) {
        showNotification(getTranslation('لا توجد مواد لحذفها', 'No courses to delete'), 'info');
        return;
    }

    if (confirm(getTranslation('هل أنت متأكد من حذف جميع المواد؟', 'Are you sure you want to delete all courses?'))) {
        courses = [];
        courseId = 1;
        updateCoursesList();
        updateResults();
        saveToLocalStorage();
        
        // إخفاء نتائج GPA التراكمي
        document.getElementById('cumulativeResults').style.display = 'none';
        
        showNotification(getTranslation('تم حذف جميع المواد بنجاح', 'All courses deleted successfully'), 'success');
    }
}

// حفظ النتائج
function saveResults() {
    if (courses.length === 0) {
        showNotification(getTranslation('لا توجد مواد لحفظها', 'No courses to save'), 'info');
        return;
    }

    const results = {
        version: "1.0",
        university: "الجامعة السعودية الإلكترونية",
        college: "كلية الحوسبة والمعلوماتية",
        developer: "طلاب كلية الحوسبة",
        exportDate: new Date().toISOString(),
        exportDateArabic: new Date().toLocaleString('ar-SA'),
        semesterData: {
            courses: courses,
            gpa: parseFloat(document.getElementById('semesterGPA').textContent),
            totalHours: parseInt(document.getElementById('totalHours').textContent),
            totalPoints: parseFloat(document.getElementById('totalPoints').textContent)
        },
        cumulativeData: {
            currentGPA: parseFloat(document.getElementById('currentGPA').value) || 0,
            currentHours: parseInt(document.getElementById('currentHours').value) || 0,
            newGPA: parseFloat(document.getElementById('newCumulativeGPA').textContent) || 0,
            totalCumulativeHours: parseInt(document.getElementById('totalCumulativeHours').textContent) || 0
        },
        metadata: {
            totalCourses: courses.length,
            coursesWithGrades: courses.filter(c => c.grade !== 'NP' && c.grade !== 'NF').length,
            coursesWithNP: courses.filter(c => c.grade === 'NP').length,
            coursesWithNF: courses.filter(c => c.grade === 'NF').length
        }
    };

    // حفظ في localStorage
    localStorage.setItem('seuGpaResults', JSON.stringify(results));

    // إنشاء ملف للتحميل
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEU_GPA_Results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);

    showNotification(getTranslation('تم حفظ النتائج بنجاح', 'Results saved successfully'), 'success');
}

// استيراد البيانات
function importData(input) {
    const file = input.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // التحقق من صحة البيانات
            if (!importedData.semesterData?.courses) {
                showNotification(getTranslation('ملف غير صالح - يرجى التأكد من أن الملف يحتوي على بيانات صحيحة', 'Invalid file - please ensure the file contains valid data'), 'error');
                return;
            }

            // استيراد المواد
            courses.length = 0; // مسح المواد الحالية
            importedData.semesterData.courses.forEach(course => {
                courses.push({
                    id: courseId++,
                    name: course.name,
                    hours: course.hours,
                    grade: course.grade,
                    points: course.points
                });
            });

            // استيراد بيانات GPA التراكمي إذا كانت موجودة
            if (importedData.cumulativeData) {
                document.getElementById('currentGPA').value = importedData.cumulativeData.currentGPA || '';
                document.getElementById('currentHours').value = importedData.cumulativeData.currentHours || '';
            }

            // تحديث الواجهة
            updateCoursesList();
            updateResults();
            saveToLocalStorage();

            // إظهار رسالة نجاح مع تفاصيل
            const courseCount = importedData.semesterData.courses.length;
            const gpa = importedData.semesterData.gpa;
            showNotification(getTranslation(`تم استيراد ${courseCount} مادة بنجاح - GPA: ${gpa}`, `${courseCount} courses imported successfully - GPA: ${gpa}`), 'success');

            // إعادة حساب GPA التراكمي إذا كانت البيانات متوفرة
            if (importedData.cumulativeData?.currentGPA > 0) {
                calculateCumulative();
            }

        } catch (error) {
            console.error('خطأ في قراءة الملف:', error);
            showNotification(getTranslation('خطأ في قراءة الملف - يرجى التأكد من صحة الملف', 'Error reading file - please check file validity'), 'error');
        }
    };

    reader.readAsText(file);
    
    // مسح قيمة input للسماح بقراءة نفس الملف مرة أخرى
    input.value = '';
}

// الحفظ في localStorage
function saveToLocalStorage() {
    localStorage.setItem('seuGpaCourses', JSON.stringify(courses));
    localStorage.setItem('seuGpaCourseId', courseId.toString());
}

// التحميل من localStorage
function loadFromLocalStorage() {
    const savedCourses = localStorage.getItem('seuGpaCourses');
    const savedCourseId = localStorage.getItem('seuGpaCourseId');
    
    if (savedCourses) {
        courses = JSON.parse(savedCourses);
    }
    
    if (savedCourseId) {
        courseId = parseInt(savedCourseId);
    }
}

// الحصول على نص الدرجة
function getGradeText(grade) {
    if (grade === 'NP') {
        return `NP (${getTranslation('ناجح', 'Pass')})`;
    } else if (grade === 'NF') {
        return `NF (${getTranslation('راسب', 'Fail')})`;
    } else {
        // درجات المواد ذات 3 ساعات
        const gradeMap3Hours = {
            '12': 'A+',
            '11.3': 'A',
            '10.5': 'B+',
            '9': 'B',
            '7.5': 'C+',
            '6': 'C',
            '4.5': 'D+',
            '3': 'D',
            '0': 'F'
        };
        
        // درجات المواد ذات ساعتين
        const gradeMap2Hours = {
            '8': 'A+',
            '7.5': 'A',
            '7': 'B+',
            '6': 'B',
            '5': 'C+',
            '4': 'C',
            '3': 'D+',
            '2': 'D',
            '0': 'F'
        };
        
        return gradeMap3Hours[grade] || gradeMap2Hours[grade] || grade;
    }
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
    // إزالة الإشعارات السابقة
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // إنشاء الإشعار الجديد
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);

    // إزالة الإشعار تلقائياً بعد 5 ثوان
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// الحصول على أيقونة الإشعار
function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// إضافة أنماط CSS للإشعارات
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        max-width: 400px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;
        animation: slideIn 0.3s ease;
    }

    .notification-success {
        border-left: 4px solid #2ed573;
    }

    .notification-error {
        border-left: 4px solid #ff4757;
    }

    .notification-warning {
        border-left: 4px solid #ffa502;
    }

    .notification-info {
        border-left: 4px solid #667eea;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    }

    .notification-content i {
        font-size: 1.2rem;
    }

    .notification-success .notification-content i {
        color: #2ed573;
    }

    .notification-error .notification-content i {
        color: #ff4757;
    }

    .notification-warning .notification-content i {
        color: #ffa502;
    }

    .notification-info .notification-content i {
        color: #667eea;
    }

    .notification-close {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: all 0.3s ease;
    }

    .notification-close:hover {
        background: #f1f1f1;
        color: #666;
    }

    @keyframes slideIn {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        .notification {
            left: 10px;
            right: 10px;
            max-width: none;
        }
    }
`;

// إضافة الأنماط للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// تحديث قائمة الدرجات حسب عدد الساعات
document.getElementById('courseHours').addEventListener('change', updateGradeOptions);

// تهيئة الدرجات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateGradeOptions();
});

// تحديث خيارات الدرجات حسب عدد الساعات
function updateGradeOptions() {
    const courseHours = document.getElementById('courseHours').value;
    const courseGrade = document.getElementById('courseGrade');
    
    // مسح الخيارات الحالية
    courseGrade.innerHTML = '';
    
    if (courseHours === '3') {
        // درجات المواد ذات 3 ساعات
        const grades3Hours = [
            { value: '12', text: 'A+ (12)' },
            { value: '11.3', text: 'A (11.3)' },
            { value: '10.5', text: 'B+ (10.5)' },
            { value: '9', text: 'B (9)' },
            { value: '7.5', text: 'C+ (7.5)' },
            { value: '6', text: 'C (6)' },
            { value: '4.5', text: 'D+ (4.5)' },
            { value: '3', text: 'D (3)' },
            { value: '0', text: 'F (0)' },
            { value: 'NP', text: 'NP (ناجح)' },
            { value: 'NF', text: 'NF (راسب)' }
        ];
        
        grades3Hours.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade.value;
            option.textContent = grade.text;
            option.setAttribute('data-ar', grade.text);
            option.setAttribute('data-en', grade.text.replace('(ناجح)', '(Pass)').replace('(راسب)', '(Fail)'));
            courseGrade.appendChild(option);
        });
    } else if (courseHours === '2') {
        // درجات المواد ذات ساعتين
        const grades2Hours = [
            { value: '8', text: 'A+ (8)' },
            { value: '7.5', text: 'A (7.5)' },
            { value: '7', text: 'B+ (7)' },
            { value: '6', text: 'B (6)' },
            { value: '5', text: 'C+ (5)' },
            { value: '4', text: 'C (4)' },
            { value: '3', text: 'D+ (3)' },
            { value: '2', text: 'D (2)' },
            { value: '0', text: 'F (0)' },
            { value: 'NP', text: 'NP (ناجح)' },
            { value: 'NF', text: 'NF (راسب)' }
        ];
        
        grades2Hours.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade.value;
            option.textContent = grade.text;
            option.setAttribute('data-ar', grade.text);
            option.setAttribute('data-en', grade.text.replace('(ناجح)', '(Pass)').replace('(راسب)', '(Fail)'));
            courseGrade.appendChild(option);
        });
    }
}

// دالة طباعة PDF محسنة مع قالب جميل
function printResultsPDF() {
    if (!window.jspdf) {
        showNotification(getTranslation('جاري تحميل مكتبة PDF...', 'Loading PDF library...'), 'info');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = printResultsPDF;
        document.head.appendChild(script);
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const isArabic = currentLanguage === 'ar';
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    // ألوان القالب
    const colors = {
        primary: [30, 60, 114],
        secondary: [102, 126, 234],
        text: [51, 51, 51],
        lightGray: [245, 245, 245],
        darkGray: [128, 128, 128]
    };
    
    let y = 20;
    
    // رأس التقرير مع شعار
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 35, 'F');
    
    // شعار الجامعة (دائرة مع أيقونة)
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 17.5, 8, 'F');
    doc.setFontSize(16);
    doc.setTextColor(...colors.primary);
    doc.text('🎓', 21, 21);
    
    // عنوان الجامعة
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(isArabic ? 'الجامعة السعودية الإلكترونية' : 'Saudi Electronic University', isArabic ? 180 : 40, 15, { align: isArabic ? 'right' : 'left' });
    doc.setFontSize(12);
    doc.text(isArabic ? 'كلية الحوسبة والمعلوماتية' : 'College of Computing and Informatics', isArabic ? 180 : 40, 25, { align: isArabic ? 'right' : 'left' });
    
    y = 50;
    
    // عنوان التقرير
    doc.setTextColor(...colors.text);
    doc.setFontSize(20);
    const reportTitle = isArabic ? 'تقرير المعدل التراكمي' : 'GPA Report';
    doc.text(reportTitle, 105, y, { align: 'center' });
    y += 15;
    
    // تاريخ الطباعة
    doc.setFontSize(10);
    doc.setTextColor(...colors.darkGray);
    const dateLabel = isArabic ? 'تاريخ الطباعة: ' : 'Print Date: ';
    const date = new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US');
    doc.text(dateLabel + date, 105, y, { align: 'center' });
    y += 20;
    
    // خط فاصل
    doc.setDrawColor(...colors.secondary);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 10;
    
    // المعدل الفصلي - بطاقة كبيرة
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(20, y, 170, 25, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    const semesterGPALabel = isArabic ? 'المعدل الفصلي (GPA)' : 'Semester GPA';
    doc.text(semesterGPALabel, 105, y + 8, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setTextColor(...colors.secondary);
    const semesterGPA = document.getElementById('semesterGPA').textContent;
    doc.text(semesterGPA, 105, y + 20, { align: 'center' });
    
    y += 35;
    
    // إحصائيات سريعة - 4 أعمدة مع المعدل التراكمي
    const totalHours = document.getElementById('totalHours').textContent;
    const totalPoints = document.getElementById('totalPoints').textContent;
    
    // الحصول على المعدل التراكمي
    const cumulativeResultsEl = document.getElementById('cumulativeResults');
    const currentGPAInputEl = document.getElementById('currentGPA');
    let cumulativeGPADisplay = 'غير محسوب';
    
    if (cumulativeResultsEl && cumulativeResultsEl.style.display !== 'none') {
        cumulativeGPADisplay = document.getElementById('newCumulativeGPA').textContent;
    } else if (currentGPAInputEl && currentGPAInputEl.value) {
        cumulativeGPADisplay = currentGPAInputEl.value;
    }
    
    if (currentLanguage === 'en') {
        cumulativeGPADisplay = cumulativeGPADisplay === 'غير محسوب' ? 'Not Calculated' : cumulativeGPADisplay;
    }
    
    const statsData = [
        { 
            title: isArabic ? 'إجمالي الساعات' : 'Total Hours', 
            value: totalHours,
            icon: '⏰'
        },
        { 
            title: isArabic ? 'إجمالي النقاط' : 'Total Points', 
            value: totalPoints,
            icon: '📊'
        },
        { 
            title: isArabic ? 'عدد المواد' : 'Total Courses', 
            value: courses.length.toString(),
            icon: '📚'
        },
        { 
            title: isArabic ? 'المعدل التراكمي' : 'Cumulative GPA', 
            value: cumulativeGPADisplay,
            icon: '🎯'
        }
    ];
    
    // رسم البطاقات الأربع
    const cardWidth = 40;
    const cardSpacing = 42.5;
    const startX = 20;
    
    for (let i = 0; i < 4; i++) {
        const x = startX + (i * cardSpacing);
        
        // إطار البطاقة
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...colors.secondary);
        doc.roundedRect(x, y, cardWidth, 30, 2, 2, 'FD');
        
        // الأيقونة
        doc.setFontSize(12);
        doc.text(statsData[i].icon, x + cardWidth/2, y + 8, { align: 'center' });
        
        // القيمة
        doc.setFontSize(14);
        doc.setTextColor(...colors.primary);
        const displayValue = statsData[i].value.length > 8 ? statsData[i].value.substring(0, 6) + '...' : statsData[i].value;
        doc.text(displayValue, x + cardWidth/2, y + 16, { align: 'center' });
        
        // العنوان
        doc.setFontSize(7);
        doc.setTextColor(...colors.darkGray);
        doc.text(statsData[i].title, x + cardWidth/2, y + 25, { align: 'center' });
    }
    
    y += 45;
    
    // قسم المواد
    if (courses.length > 0) {
        // عنوان جدول المواد
        doc.setFontSize(14);
        doc.setTextColor(...colors.primary);
        const coursesTitle = isArabic ? 'تفاصيل المواد' : 'Course Details';
        doc.text(coursesTitle, isArabic ? 190 : 20, y, { align: isArabic ? 'right' : 'left' });
        y += 10;
        
        // رأس الجدول
        doc.setFillColor(...colors.primary);
        doc.rect(20, y, 170, 8, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        
        const headers = isArabic ? 
            ['اسم المادة', 'الساعات', 'الدرجة', 'النقاط'] : 
            ['Course Name', 'Hours', 'Grade', 'Points'];
        
        const colWidths = [80, 25, 35, 30];
        let colX = isArabic ? 190 : 20;
        
        headers.forEach((header, i) => {
            if (isArabic) {
                doc.text(header, colX, y + 5, { align: 'right' });
                colX -= colWidths[i];
            } else {
                doc.text(header, colX + 2, y + 5);
                colX += colWidths[i];
            }
        });
        
        y += 8;
        
        // بيانات المواد
        doc.setTextColor(...colors.text);
        doc.setFontSize(8);
        
        courses.forEach((course, index) => {
            // تناوب ألوان الصفوف
            if (index % 2 === 0) {
                doc.setFillColor(...colors.lightGray);
                doc.rect(20, y, 170, 7, 'F');
            }
            
            const rowData = [
                course.name,
                course.hours.toString(),
                getGradeText(course.grade),
                course.grade === 'NP' || course.grade === 'NF' ? '--' : course.points.toFixed(1)
            ];
            
            colX = isArabic ? 190 : 20;
            
            rowData.forEach((data, i) => {
                if (isArabic) {
                    doc.text(data, colX, y + 5, { align: 'right' });
                    colX -= colWidths[i];
                } else {
                    doc.text(data, colX + 2, y + 5);
                    colX += colWidths[i];
                }
            });
            
            y += 7;
            
            // صفحة جديدة إذا امتلأت الصفحة
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
        });
        
        y += 10;
    }
    
    // المعدل التراكمي - قسم محسن
    if (y > 220) {
        doc.addPage();
        y = 20;
    }
    
    // خط فاصل
    doc.setDrawColor(...colors.secondary);
    doc.line(20, y, 190, y);
    y += 15;
    
    // عنوان قسم المعدل التراكمي
    doc.setFontSize(16);
    doc.setTextColor(...colors.primary);
    const cumulativeTitle = isArabic ? 'المعدل التراكمي' : 'Cumulative GPA';
    doc.text(cumulativeTitle, 105, y, { align: 'center' });
    y += 15;
    
    const cumulativeResultsSection = document.getElementById('cumulativeResults');
    const currentGPAField = document.getElementById('currentGPA');
    const currentHoursField = document.getElementById('currentHours');
    
    if (cumulativeResultsSection && cumulativeResultsSection.style.display !== 'none') {
        // المعدل التراكمي محسوب - عرض النتائج المفصلة
        
        // بطاقة المعدل التراكمي الجديد
        doc.setFillColor(...colors.secondary);
        doc.roundedRect(20, y, 170, 20, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        const newCumulativeLabel = isArabic ? 'المعدل التراكمي الجديد' : 'New Cumulative GPA';
        doc.text(newCumulativeLabel, 105, y + 7, { align: 'center' });
        
        doc.setFontSize(18);
        const newCumulativeGPA = document.getElementById('newCumulativeGPA').textContent;
        doc.text(newCumulativeGPA, 105, y + 16, { align: 'center' });
        
        y += 30;
        
        // تفاصيل المعدل التراكمي في جدول منسق
        const cumulativeData = [
            { 
                label: isArabic ? 'المعدل التراكمي السابق:' : 'Previous Cumulative GPA:', 
                value: currentGPAField.value || '0.00'
            },
            { 
                label: isArabic ? 'الساعات السابقة:' : 'Previous Hours:', 
                value: currentHoursField.value || '0'
            },
            { 
                label: isArabic ? 'الساعات الجديدة:' : 'New Hours:', 
                value: totalHours
            },
            { 
                label: isArabic ? 'إجمالي الساعات:' : 'Total Hours:', 
                value: document.getElementById('totalCumulativeHours').textContent
            },
            { 
                label: isArabic ? 'التغيير في المعدل:' : 'GPA Change:', 
                value: document.getElementById('gpaChange').textContent
            }
        ];
        
        // رسم جدول التفاصيل
        doc.setFillColor(...colors.lightGray);
        doc.rect(20, y, 170, 5 * 8, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(...colors.text);
        
        cumulativeData.forEach((item, index) => {
            const rowY = y + 5 + (index * 8);
            
            // تناوب ألوان الصفوف
            if (index % 2 === 1) {
                doc.setFillColor(255, 255, 255);
                doc.rect(20, rowY - 2, 170, 8, 'F');
            }
            
            doc.setTextColor(...colors.text);
            doc.text(item.label, isArabic ? 185 : 25, rowY + 3, { align: isArabic ? 'right' : 'left' });
            
            doc.setTextColor(...colors.secondary);
            doc.setFontSize(11);
            doc.text(item.value, isArabic ? 90 : 125, rowY + 3, { align: isArabic ? 'right' : 'left' });
            doc.setFontSize(10);
        });
        
        y += 50;
        
    } else if (currentGPAField.value || currentHoursField.value) {
        // توجد بيانات المعدل التراكمي لكن لم يتم الحساب
        
        doc.setFillColor(...colors.lightGray);
        doc.roundedRect(20, y, 170, 25, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(...colors.primary);
        const statusText = isArabic ? 'بيانات المعدل التراكمي المتاحة' : 'Available Cumulative GPA Data';
        doc.text(statusText, 105, y + 8, { align: 'center' });
        
        const currentData = [
            `${isArabic ? 'المعدل الحالي:' : 'Current GPA:'} ${currentGPAField.value || 'غير محدد'}`,
            `${isArabic ? 'الساعات الحالية:' : 'Current Hours:'} ${currentHoursField.value || 'غير محدد'}`
        ];
        
        doc.setFontSize(10);
        doc.setTextColor(...colors.darkGray);
        currentData.forEach((text, index) => {
            doc.text(text, 105, y + 16 + (index * 5), { align: 'center' });
        });
        
        y += 35;
        
        // رسالة تحفيزية
        doc.setFontSize(9);
        doc.setTextColor(...colors.secondary);
        const encourageText = isArabic ? 
            'استخدم زر "الحساب التلقائي" لحساب المعدل التراكمي الجديد' :
            'Use "Auto Calculate" button to compute new cumulative GPA';
        doc.text(encourageText, 105, y, { align: 'center' });
        y += 10;
        
    } else {
        // لا توجد بيانات للمعدل التراكمي
        
        doc.setFillColor(...colors.lightGray);
        doc.roundedRect(20, y, 170, 20, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(...colors.darkGray);
        const noDataText = isArabic ? 'لم يتم إدخال بيانات المعدل التراكمي' : 'No Cumulative GPA Data Entered';
        doc.text(noDataText, 105, y + 10, { align: 'center' });
        
        y += 30;
    }
    
    // تذييل الصفحة
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // خط التذييل
        doc.setDrawColor(...colors.lightGray);
        doc.line(20, 280, 190, 280);
        
        // نص التذييل
        doc.setFontSize(8);
        doc.setTextColor(...colors.darkGray);
        const footerText = isArabic ? 
            'تم إنشاء هذا التقرير بواسطة حاسبة GPA - الجامعة السعودية الإلكترونية' :
            'Generated by GPA Calculator - Saudi Electronic University';
        doc.text(footerText, 105, 285, { align: 'center' });
        
        // رقم الصفحة
        const pageText = isArabic ? `صفحة ${i} من ${pageCount}` : `Page ${i} of ${pageCount}`;
        doc.text(pageText, isArabic ? 25 : 185, 290, { align: isArabic ? 'left' : 'right' });
    }
    
    // حفظ الملف
    const fileName = `SEU_GPA_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showNotification(getTranslation('تم إنشاء ملف PDF بنجاح', 'PDF file generated successfully'), 'success');
}

// حساب المعدل المطلوب
function calculateTargetGPA() {
    const currentGPA = parseFloat(document.getElementById('targetCurrentGPA').value);
    const currentHours = parseInt(document.getElementById('targetCurrentHours').value);
    const targetGPA = parseFloat(document.getElementById('targetDesiredGPA').value);
    
    // التحقق من صحة البيانات
    if (isNaN(currentGPA) || isNaN(currentHours) || isNaN(targetGPA)) {
        showNotification(getTranslation('يرجى إدخال جميع البيانات المطلوبة', 'Please enter all required data'), 'error');
        return;
    }
    
    if (currentGPA < 0 || currentGPA > 4 || targetGPA < 0 || targetGPA > 4) {
        showNotification(getTranslation('المعدل يجب أن يكون بين 0 و 4', 'GPA must be between 0 and 4'), 'error');
        return;
    }
    
    if (currentHours < 0) {
        showNotification(getTranslation('الساعات يجب أن تكون رقم موجب', 'Hours must be a positive number'), 'error');
        return;
    }
    
    // خصم 16 ساعة من مقررات اللغة الإنجليزية (مثل حساب المعدل التراكمي)
    const adjustedHours = Math.max(0, currentHours - 16);
    
    // حساب النقاط الحالية بعد خصم ساعات الإنجليزي
    const currentPoints = currentGPA * adjustedHours;
    
    // إظهار تنبيه خصم الساعات
    const targetNotice = document.getElementById('targetEnglishNotice');
    if (targetNotice) {
        targetNotice.style.display = 'flex';
    }
    
    // إظهار قسم النتائج
    document.getElementById('targetGPAResults').style.display = 'block';
    
    const summaryDiv = document.getElementById('targetSummary');
    const summaryText = document.getElementById('targetSummaryText');
    const warningDiv = document.getElementById('targetWarning');
    const warningText = document.getElementById('targetWarningText');
    const scenariosGrid = document.getElementById('scenariosGrid');
    
    // إذا كان المعدل الحالي أعلى من أو يساوي المطلوب
    if (currentGPA >= targetGPA) {
        summaryDiv.className = 'p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white mb-6';
        summaryText.textContent = getTranslation(
            `🎉 تهانينا! معدلك الحالي (${currentGPA.toFixed(2)}) أعلى من أو يساوي المعدل المطلوب (${targetGPA.toFixed(2)}). استمر في التميز!`,
            `🎉 Congratulations! Your current GPA (${currentGPA.toFixed(2)}) is already equal to or higher than your target (${targetGPA.toFixed(2)}). Keep up the great work!`
        );
        scenariosGrid.innerHTML = '';
        warningDiv.style.display = 'none';
        return;
    }
    
    // حساب السيناريوهات المختلفة
    const grades = [
        { name: 'A+', gpa: 4.0, points3: 12, points2: 8, color: 'emerald' },
        { name: 'A', gpa: 3.75, points3: 11.3, points2: 7.5, color: 'green' },
        { name: 'B+', gpa: 3.5, points3: 10.5, points2: 7, color: 'teal' },
        { name: 'B', gpa: 3.0, points3: 9, points2: 6, color: 'cyan' },
        { name: 'C+', gpa: 2.5, points3: 7.5, points2: 5, color: 'sky' },
        { name: 'C', gpa: 2.0, points3: 6, points2: 4, color: 'blue' }
    ];
    
    let scenarios = [];
    let isPossible = false;
    
    // حساب لكل درجة كم ساعة مطلوبة
    for (const grade of grades) {
        // المعادلة الصحيحة:
        // (currentPoints + gradeGPA * newHours) / (adjustedHours + newHours) = targetGPA
        // currentPoints + gradeGPA * newHours = targetGPA * adjustedHours + targetGPA * newHours
        // gradeGPA * newHours - targetGPA * newHours = targetGPA * adjustedHours - currentPoints
        // newHours * (gradeGPA - targetGPA) = targetGPA * adjustedHours - currentPoints
        // newHours = (targetGPA * adjustedHours - currentPoints) / (gradeGPA - targetGPA)
        
        const gpaDiff = grade.gpa - targetGPA;
        
        if (gpaDiff <= 0) {
            // لا يمكن الوصول بهذه الدرجة لأنها أقل من أو تساوي المطلوب
            continue;
        }
        
        // حساب الساعات المطلوبة
        const neededPointsDiff = targetGPA * adjustedHours - currentPoints;
        const requiredHours = Math.ceil(neededPointsDiff / gpaDiff);
        
        if (requiredHours > 0 && requiredHours <= 200) { // حد أقصى معقول
            isPossible = true;
            const requiredCourses3Hours = Math.ceil(requiredHours / 3);
            const requiredCourses2Hours = Math.ceil(requiredHours / 2);
            
            scenarios.push({
                grade: grade.name,
                gpa: grade.gpa,
                hours: requiredHours,
                courses3: requiredCourses3Hours,
                courses2: requiredCourses2Hours,
                color: grade.color
            });
        }
    }
    
    // حساب السيناريو المختلط (نصف A+ ونصف A)
    const mixedScenario = calculateMixedScenario(currentPoints, adjustedHours, targetGPA);
    
    // عرض الملخص
    if (isPossible && scenarios.length > 0) {
        const bestScenario = scenarios[0];
        summaryDiv.className = 'p-6 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white mb-6';
        summaryText.textContent = getTranslation(
            `للوصول من معدل ${currentGPA.toFixed(2)} إلى معدل ${targetGPA.toFixed(2)}:\n• أقصر طريق: ${bestScenario.hours} ساعة بمعدل ${bestScenario.grade}\n• أو ساعات أكثر بدرجات أقل (انظر السيناريوهات أدناه)`,
            `To go from GPA ${currentGPA.toFixed(2)} to ${targetGPA.toFixed(2)}:\n• Shortest path: ${bestScenario.hours} hours with ${bestScenario.grade}\n• Or more hours with lower grades (see scenarios below)`
        );
        
        // عرض السيناريوهات
        let scenariosHTML = '';
        
        for (const scenario of scenarios) {
            // حساب مجموع النقاط المكتسبة
            const totalPoints = (scenario.hours * scenario.gpa).toFixed(1);
            const pointsLabel = getTranslation('نقطة', 'points');
            
            scenariosHTML += `
                <div class="scenario-card scenario-${scenario.color}">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-2xl font-bold grade">${scenario.grade}</span>
                        <span class="text-sm opacity-70">${totalPoints} ${pointsLabel}</span>
                    </div>
                    <div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p><strong>${scenario.hours}</strong> ${getTranslation('ساعة مطلوبة', 'hours required')}</p>
                        <p><strong>${scenario.courses3}</strong> ${getTranslation('مادة (3 ساعات)', 'courses (3 hrs)')}</p>
                        <p><strong>${scenario.courses2}</strong> ${getTranslation('مادة (2 ساعة)', 'courses (2 hrs)')}</p>
                    </div>
                </div>
            `;
        }
        
        // إضافة السيناريو المختلط
        if (mixedScenario) {
            scenariosHTML += `
                <div class="scenario-card scenario-purple">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xl font-bold grade">${getTranslation('مختلط', 'Mixed')}</span>
                        <span class="text-sm opacity-70">A+ & A</span>
                    </div>
                    <div class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <p><strong>${mixedScenario.aPlus}</strong> ${getTranslation('مادة A+', 'A+ courses')}</p>
                        <p><strong>${mixedScenario.a}</strong> ${getTranslation('مادة A', 'A courses')}</p>
                        <p>${getTranslation('إجمالي', 'Total')}: <strong>${mixedScenario.totalHours}</strong> ${getTranslation('ساعة', 'hours')}</p>
                    </div>
                </div>
            `;
        }
        
        scenariosGrid.innerHTML = scenariosHTML;
        warningDiv.style.display = 'none';
        
    } else {
        // غير ممكن
        summaryDiv.className = 'p-6 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 text-white mb-6';
        summaryText.textContent = getTranslation(
            `⚠️ للأسف، الوصول من معدل ${currentGPA.toFixed(2)} إلى معدل ${targetGPA.toFixed(2)} يتطلب جهداً استثنائياً أو قد لا يكون ممكناً بالطرق التقليدية.`,
            `⚠️ Unfortunately, going from GPA ${currentGPA.toFixed(2)} to ${targetGPA.toFixed(2)} requires exceptional effort or may not be achievable through traditional means.`
        );
        scenariosGrid.innerHTML = '';
        
        warningDiv.style.display = 'block';
        warningText.textContent = getTranslation(
            'قد تحتاج لإعادة بعض المواد أو التحدث مع المرشد الأكاديمي للحصول على خيارات إضافية.',
            'You may need to retake some courses or consult with your academic advisor for additional options.'
        );
    }
    
    showNotification(getTranslation('تم حساب المعدل المطلوب - تم خصم 16 ساعة من مقررات الإنجليزي', 'Target GPA calculated - 16 English hours deducted'), 'success');
}

// حساب السيناريو المختلط
function calculateMixedScenario(currentPoints, adjustedHours, targetGPA) {
    // نفترض نصف A+ (4.0) ونصف A (3.75)
    const mixedGPA = (4.0 + 3.75) / 2; // 3.875
    
    if (mixedGPA <= targetGPA) return null;
    
    const requiredPoints = targetGPA * adjustedHours - currentPoints;
    const gpaDiff = mixedGPA - targetGPA;
    const requiredHours = Math.ceil(requiredPoints / gpaDiff);
    
    if (requiredHours <= 0 || requiredHours > 200) return null;
    
    const coursesNeeded = Math.ceil(requiredHours / 3);
    const aPlusCourses = Math.ceil(coursesNeeded / 2);
    const aCourses = coursesNeeded - aPlusCourses;
    
    return {
        aPlus: aPlusCourses,
        a: aCourses,
        totalHours: coursesNeeded * 3
    };
} 
