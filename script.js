// متغيرات عامة
let courses = [];
let courseId = 1;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    updateResults();
    updateCoursesList();
});

// إضافة مادة جديدة
function addCourse() {
    const courseName = document.getElementById('courseName').value.trim();
    const courseHours = parseInt(document.getElementById('courseHours').value);
    const courseGrade = document.getElementById('courseGrade').value;

    // التحقق من صحة البيانات
    if (!courseName) {
        showNotification('يرجى إدخال اسم المادة', 'error');
        return;
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
    showNotification('تم إضافة المادة بنجاح', 'success');
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
    showNotification('تم حذف المادة بنجاح', 'success');
}

// تحديث قائمة المواد
function updateCoursesList() {
    const coursesList = document.getElementById('coursesList');
    
    if (courses.length === 0) {
        coursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <p>لم يتم إضافة أي مواد بعد</p>
            </div>
        `;
        return;
    }

    coursesList.innerHTML = courses.map(course => `
        <div class="course-item">
            <div class="course-info">
                <div class="course-name">${course.name}</div>
                <div class="course-details">
                    ${course.hours} ساعة - ${getGradeText(course.grade)} ${course.grade === 'NP' || course.grade === 'NF' ? '(لا تدخل في المعدل)' : `(${course.points.toFixed(1)} نقطة)`}
                </div>
            </div>
            <button class="delete-btn" onclick="deleteCourse(${course.id})">
                <i class="fas fa-trash"></i> حذف
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

// حساب GPA التراكمي
function calculateCumulative() {
    const currentGPA = parseFloat(document.getElementById('currentGPA').value);
    const currentHours = parseInt(document.getElementById('currentHours').value);
    
    // التحقق من صحة البيانات
    if (isNaN(currentGPA) || isNaN(currentHours)) {
        showNotification('يرجى إدخال المعدل التراكمي الحالي والساعات المكتسبة', 'error');
        return;
    }
    
    if (currentHours < 0) {
        showNotification('الساعات المكتسبة يجب أن تكون رقم موجب', 'error');
        return;
    }

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
        showNotification('يرجى إضافة مواد للفصل الحالي أولاً', 'warning');
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
        changeDescriptionElement.textContent = 'ارتفاع في المعدل التراكمي';
    } else if (gpaChange < 0) {
        gpaChangeElement.className = 'gpa-change negative';
        changeDescriptionElement.textContent = 'انخفاض في المعدل التراكمي';
    } else {
        gpaChangeElement.className = 'gpa-change neutral';
        changeDescriptionElement.textContent = 'لا يوجد تغيير في المعدل';
    }
    
    // إظهار النتائج
    document.getElementById('cumulativeResults').style.display = 'block';
    
    // حفظ البيانات
    saveCumulativeData(currentGPA, currentHours, newCumulativeGPA, gpaChange);
    
    showNotification('تم حساب المعدل التراكمي الجديد بنجاح', 'success');
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
        showNotification('لا توجد مواد لحذفها', 'info');
        return;
    }

    if (confirm('هل أنت متأكد من حذف جميع المواد؟')) {
        courses = [];
        courseId = 1;
        updateCoursesList();
        updateResults();
        saveToLocalStorage();
        
        // إخفاء نتائج GPA التراكمي
        document.getElementById('cumulativeResults').style.display = 'none';
        
        showNotification('تم حذف جميع المواد بنجاح', 'success');
    }
}

// حفظ النتائج
function saveResults() {
    if (courses.length === 0) {
        showNotification('لا توجد مواد لحفظها', 'info');
        return;
    }

    const results = {
        courses: courses,
        gpa: parseFloat(document.getElementById('semesterGPA').textContent),
        totalHours: parseInt(document.getElementById('totalHours').textContent),
        totalPoints: parseFloat(document.getElementById('totalPoints').textContent),
        date: new Date().toLocaleString('ar-SA')
    };

    // حفظ في localStorage
    localStorage.setItem('seuGpaResults', JSON.stringify(results));

    // إنشاء ملف للتحميل
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `GPA_Results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);

    showNotification('تم حفظ النتائج بنجاح', 'success');
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
        return 'NP (ناجح)';
    } else if (grade === 'NF') {
        return 'NF (راسب)';
    } else {
        const gradeMap = {
            '12': 'A+',
            '11.3': 'A',
            '10.5': 'B+',
            '9': 'B',
            '7.5': 'C+',
            '6': 'C',
            '4.5': 'D+',
            '3': 'D',
            '0': 'F',
            '8': 'A+',
            '7.5': 'A',
            '7': 'B+',
            '6': 'B',
            '5': 'C+',
            '4': 'C',
            '3': 'D+',
            '2': 'D'
        };
        return gradeMap[grade] || grade;
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
            courseGrade.appendChild(option);
        });
    }
} 