// متغيرات عامة
let courses = [];
let courseId = 1;
let currentLanguage = 'ar';
let currentTheme = 'light';

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
});

// دوال الوضع المظلم
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // تحديث أيقونة الوضع المظلم
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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
    
    // تحديث أيقونة الوضع المظلم
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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
                <i class="fas fa-book-open"></i>
                <p>${getTranslation('لم يتم إضافة أي مواد بعد', 'No courses added yet')}</p>
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