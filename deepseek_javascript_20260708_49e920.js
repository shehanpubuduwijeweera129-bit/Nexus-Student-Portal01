(function() {
    // =====================================================
    //  CALCULATOR
    // =====================================================
    let calcExpression = '';
    const calcDisplay = document.getElementById('calcDisplay');

    window.calcInput = function(v) {
        if (!'0123456789.+-*/'.includes(v)) return;
        const last = calcExpression.slice(-1);
        if ('+-*/'.includes(last) && '+-*/'.includes(v)) {
            calcExpression = calcExpression.slice(0, -1) + v;
        } else {
            calcExpression += v;
        }
        updateCalc();
    };

    window.calcClear = function() {
        calcExpression = '';
        updateCalc();
    };

    window.calcCalculate = function() {
        if (!calcExpression) return;
        try {
            let expr = calcExpression.replace(/×/g, '*').replace(/÷/g, '/');
            if (!/^[\d+\-*/.() ]+$/.test(expr)) throw new Error();
            const result = Function('"use strict"; return (' + expr + ')')();
            if (!isFinite(result)) throw new Error();
            calcExpression = String(Number.isInteger(result) ? result : parseFloat(result.toFixed(10)));
            updateCalc();
        } catch (e) {
            calcDisplay.innerHTML = '<span class="calc-error">Error</span>';
            setTimeout(() => { calcExpression = ''; updateCalc(); }, 1500);
        }
    };

    function updateCalc() {
        calcDisplay.textContent = calcExpression || '0';
    }

    document.addEventListener('keydown', function(e) {
        const t = e.target;
        if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
        const key = e.key;
        const calcKeys = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','.','Enter','Backspace','c','C'];
        if (calcKeys.includes(key)) e.preventDefault();
        if (key >= '0' && key <= '9') calcInput(key);
        else if (key === '+') calcInput('+');
        else if (key === '-') calcInput('-');
        else if (key === '*') calcInput('*');
        else if (key === '/') calcInput('/');
        else if (key === '.') calcInput('.');
        else if (key === 'Enter') calcCalculate();
        else if (key === 'Backspace') { calcExpression = calcExpression.slice(0, -1); updateCalc(); }
        else if (key === 'c' || key === 'C') calcClear();
    });

    // =====================================================
    //  USER REGISTRATION (with roles & profile photo)
    // =====================================================
    let registeredUsers = [
        { username: 'admin', email: 'admin@gmail.com', password: 'admin', fullName: 'Admin User',
          contact: '1234567890', index: 'A001', role: 'admin', photo: null },
        { username: 'test', email: 'test@gmail.com', password: 'test', fullName: 'Test User',
          contact: '0987654321', index: 'B002', role: 'user', photo: null }
    ];
    let loggedInUser = null;
    let isEditing = false;
    let selectedTopic = null;

    // =====================================================
    //  APP STATE
    // =====================================================
    let subjects = [
        { id: 's1', name: 'Financial Accounting', year: 1, semester: 1, topics: [], docs: [] },
        { id: 's2', name: 'Management Principles', year: 1, semester: 1, topics: [], docs: [] },
        { id: 's3', name: 'Business Mathematics', year: 1, semester: 2, topics: [], docs: [] },
        { id: 's4', name: 'Microeconomics', year: 1, semester: 2, topics: [], docs: [] },
        { id: 's5', name: 'Marketing Management', year: 2, semester: 1, topics: [], docs: [] },
        { id: 's6', name: 'Organizational Behavior', year: 2, semester: 1, topics: [], docs: [] },
        { id: 's7', name: 'Business Statistics', year: 2, semester: 2, topics: [], docs: [] },
        { id: 's8', name: 'Financial Management', year: 2, semester: 2, topics: [], docs: [] },
        { id: 's9', name: 'Strategic Management', year: 3, semester: 1, topics: [], docs: [] },
        { id: 's10', name: 'Research Methods', year: 3, semester: 1, topics: [], docs: [] },
        { id: 's11', name: 'International Business', year: 3, semester: 2, topics: [], docs: [] },
        { id: 's12', name: 'Business Ethics', year: 3, semester: 2, topics: [], docs: [] },
        { id: 's13', name: 'Entrepreneurship', year: 4, semester: 1, topics: [], docs: [] },
        { id: 's14', name: 'Project Management', year: 4, semester: 1, topics: [], docs: [] },
        { id: 's15', name: 'Management Information Systems', year: 4, semester: 2, topics: [], docs: [] },
        { id: 's16', name: 'Business Strategy', year: 4, semester: 2, topics: [], docs: [] }
    ];

    let globalMessages = [
        { user: 'Kavisha P.', text: 'Has anyone started the Financial Accounting assignment?', time: '10:30 AM', files: [] },
        { user: 'Amal S.', text: 'Yes, I\'m working on it. The balance sheet part is tricky!', time: '10:32 AM', files: [] },
        { user: 'Nisha R.', text: '@Kavisha P. I have the notes, I\'ll share them with you!', time: '10:45 AM', files: [] }
    ];
    let chatFileStorage = {};
    const onlineUsers = ['Kavisha P.', 'Amal S.', 'Nisha R.', 'Dinesh K.', 'Priya M.', 'Saman W.', 'Tharindu G.',
                         'Lakshmi J.', 'Nuwan P.', 'Chamara R.', 'Sachini F.', 'Ruwan D.'];
    let privateFiles = [];
    let chatPendingFiles = [];
    let currentSubjectId = 's1';
    let currentYearFilter = 'all';
    let currentSemesterFilter = 'all';

    // =====================================================
    //  NOTIFICATIONS DATA
    // =====================================================
    let notifications = [
        { id: 'n1', icon: 'fa-file-upload', text: 'New document uploaded in Financial Accounting', time: '2 minutes ago', read: false },
        { id: 'n2', icon: 'fa-comment', text: 'New topic added in Marketing Management', time: '15 minutes ago', read: false },
        { id: 'n3', icon: 'fa-check-circle', text: 'Assignment graded - Business Statistics', time: '3 hours ago', read: true },
        { id: 'n4', icon: 'fa-calendar', text: 'Upcoming exam - Strategic Management next week', time: '1 day ago', read: true }
    ];

    // =====================================================
    //  REPLY STATE
    // =====================================================
    let replyTo = null;

    // =====================================================
    //  FILE VIEWER
    // =====================================================
    const fileViewerOverlay = document.getElementById('fileViewerOverlay');
    const fileViewerTitle = document.getElementById('fileViewerTitle');
    const fileViewerBody = document.getElementById('fileViewerBody');
    const fileViewerFooter = document.getElementById('fileViewerFooter');
    const fileViewerSaveBtn = document.getElementById('fileViewerSaveBtn');
    const fileViewerCancelBtn = document.getElementById('fileViewerCancelBtn');
    const fileViewerCloseBtn = document.getElementById('fileViewerCloseBtn');
    const fileViewerDownloadBtn = document.getElementById('fileViewerDownloadBtn');

    let currentFileData = null;
    let currentFileSaveCallback = null;
    let currentFileIsText = false;

    function openFileViewer(fileObj, saveCallback) {
        currentFileSaveCallback = saveCallback || null;
        currentFileData = fileObj;

        const isText = isTextFile(fileObj.name, fileObj.type);
        currentFileIsText = isText;

        fileViewerTitle.textContent = fileObj.name;

        fileViewerBody.innerHTML = '';
        if (isText && fileObj.data) {
            const text = typeof fileObj.data === 'string' ? fileObj.data : new TextDecoder().decode(fileObj.data);
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.width = '100%';
            textarea.style.height = '100%';
            textarea.style.minHeight = '200px';
            textarea.style.background = 'transparent';
            textarea.style.color = '#e6f7ff';
            textarea.style.border = 'none';
            textarea.style.fontFamily = 'Courier New, monospace';
            textarea.style.fontSize = '0.9rem';
            textarea.style.resize = 'vertical';
            textarea.style.outline = 'none';
            fileViewerBody.appendChild(textarea);
            fileViewerFooter.style.display = 'flex';
            fileViewerSaveBtn.style.display = 'inline-block';
        } else if (fileObj.data) {
            const blob = new Blob([fileObj.data], { type: fileObj.type || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            if (fileObj.type && fileObj.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = url;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '50vh';
                img.style.borderRadius = '12px';
                fileViewerBody.appendChild(img);
            } else if (fileObj.type === 'application/pdf') {
                const iframe = document.createElement('iframe');
                iframe.src = url;
                iframe.style.width = '100%';
                iframe.style.height = '50vh';
                iframe.style.border = 'none';
                iframe.style.borderRadius = '12px';
                fileViewerBody.appendChild(iframe);
            } else {
                fileViewerBody.innerHTML = `<p style="color:#8db4cc;text-align:center;padding:40px 0;">Preview not available for this file type. <br> Click Download to view.</p>`;
            }
            fileViewerFooter.style.display = 'flex';
            fileViewerSaveBtn.style.display = 'none';
        } else {
            fileViewerBody.innerHTML = `<p style="color:#8db4cc;text-align:center;padding:40px 0;">File data not available.</p>`;
            fileViewerFooter.style.display = 'flex';
            fileViewerSaveBtn.style.display = 'none';
        }

        fileViewerDownloadBtn.onclick = function() {
            if (!fileObj.data) {
                alert('No file data to download.');
                return;
            }
            const blob = new Blob([fileObj.data], { type: fileObj.type || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileObj.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        fileViewerOverlay.style.display = 'flex';
    }

    function closeFileViewer() {
        fileViewerOverlay.style.display = 'none';
        currentFileData = null;
        currentFileSaveCallback = null;
    }

    fileViewerCloseBtn.addEventListener('click', closeFileViewer);
    fileViewerCancelBtn.addEventListener('click', closeFileViewer);

    fileViewerSaveBtn.addEventListener('click', function() {
        if (!currentFileData || !currentFileSaveCallback) return;
        const textarea = fileViewerBody.querySelector('textarea');
        if (!textarea) return;
        const newContent = textarea.value;
        const encoder = new TextEncoder();
        const data = encoder.encode(newContent);
        currentFileSaveCallback(data);
        closeFileViewer();
        alert('✅ File saved successfully!');
    });

    fileViewerOverlay.addEventListener('click', function(e) {
        if (e.target === fileViewerOverlay) closeFileViewer();
    });

    function isTextFile(name, type) {
        const textExtensions = ['.txt', '.js', '.html', '.css', '.json', '.xml', '.md', '.csv', '.log'];
        const textTypes = ['text/plain', 'application/json', 'text/html', 'text/css', 'application/javascript', 'text/xml'];
        if (type && textTypes.some(t => type.includes(t))) return true;
        if (name) {
            const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
            if (textExtensions.includes(ext)) return true;
        }
        return false;
    }

    // =====================================================
    //  DOM REFS
    // =====================================================
    const loginCard = document.getElementById('loginCard');
    const mainApp = document.getElementById('mainApp');
    const loginError = document.getElementById('loginError');
    const userDisplay = document.getElementById('userDisplay');
    const roleBadge = document.getElementById('roleBadge');
    const adminNavBtn = document.getElementById('adminNavBtn');
    const grid = document.getElementById('subjectGrid');
    const chatSubjectName = document.getElementById('chatSubjectName');
    const chatBox = document.getElementById('chatBox');
    const topicContainer = document.getElementById('topicContainer');
    const docList = document.getElementById('docList');
    const topicInput = document.getElementById('topicInput');
    const topicFileInput = document.getElementById('topicFileInput');
    const topicFileUploadBtn = document.getElementById('topicFileUploadBtn');
    const topicFilesList = document.getElementById('topicFilesList');
    const selectedTopicName = document.getElementById('selectedTopicName');
    const deleteTopicBtn = document.getElementById('deleteTopicBtn');
    const addSubjectBtn = document.getElementById('addSubjectBtn');

    const globalChatBox = document.getElementById('globalChatBox');
    const globalChatInput = document.getElementById('globalChatInput');
    const chatFileInput = document.getElementById('chatFileInput');
    const chatFileList = document.getElementById('chatFileList');
    const globalSendBtn = document.getElementById('globalSendBtn');
    const mentionHint = document.getElementById('mentionHint');
    const notifList = document.getElementById('notificationsList');
    const notifBadge = document.getElementById('notifBadge');
    const clearAllNotifsBtn = document.getElementById('clearAllNotifs');
    const clearAllChatBtn = document.getElementById('clearAllChatBtn');

    const replyIndicator = document.getElementById('replyIndicator');
    const replyInfo = document.getElementById('replyInfo');
    const cancelReplyBtn = document.getElementById('cancelReplyBtn');

    const editProfileBtn = document.getElementById('editProfileBtn');
    const profileDisplay = document.getElementById('profileDisplay');
    const profileEdit = document.getElementById('profileEdit');
    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editContact = document.getElementById('editContact');
    const editIndex = document.getElementById('editIndex');
    const cancelEditProfile = document.getElementById('cancelEditProfile');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    const adminSection = document.getElementById('adminSection');
    const userListContainer = document.getElementById('userListContainer');
    const adminAddSubjectBtn = document.getElementById('adminAddSubjectBtn');
    const adminClearAllNotifs = document.getElementById('adminClearAllNotifs');
    const adminRefreshBtn = document.getElementById('adminRefreshBtn');

    // Profile photo elements
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profilePhotoUploadBtn = document.getElementById('profilePhotoUploadBtn');
    const profilePhotoRemoveBtn = document.getElementById('profilePhotoRemoveBtn');
    const profilePhotoImg = document.getElementById('profilePhotoImg');
    const profileDefaultAvatar = document.getElementById('profileDefaultAvatar');
    const profilePhotoWrapper = document.getElementById('profilePhotoWrapper');

    // Crop modal elements
    const cropOverlay = document.getElementById('cropOverlay');
    const cropImage = document.getElementById('cropImage');
    const cropCloseBtn = document.getElementById('cropCloseBtn');
    const cropCancelBtn = document.getElementById('cropCancelBtn');
    const cropConfirmBtn = document.getElementById('cropConfirmBtn');

    let cropperInstance = null;
    let pendingCropFile = null;

    // =====================================================
    //  SIDEBAR
    // =====================================================
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarPanel = document.getElementById('sidebarPanel');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarNavLinks = document.querySelectorAll('#sidebarNav a[data-section]');
    const sidebarAdminLink = document.getElementById('sidebarAdminLink');
    const sidebarLogout = document.getElementById('sidebarLogout');
    const sidebarNotifBadge = document.getElementById('sidebarNotifBadge');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const sidebarAvatarText = document.getElementById('sidebarAvatarText');
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');

    let sidebarOpen = false;

    function openSidebar() {
        sidebarOpen = true;
        sidebarOverlay.classList.add('open');
        sidebarPanel.classList.add('open');
        document.body.style.overflow = 'hidden';
        updateSidebarUser();
    }

    function closeSidebar() {
        sidebarOpen = false;
        sidebarOverlay.classList.remove('open');
        sidebarPanel.classList.remove('open');
        document.body.style.overflow = '';
    }

    function toggleSidebar() {
        if (sidebarOpen) closeSidebar();
        else openSidebar();
    }

    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', function(e) {
        if (e.target === sidebarOverlay) closeSidebar();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebarOpen) closeSidebar();
    });

    // =====================================================
    //  PROFILE PHOTO FUNCTIONS (with crop)
    // =====================================================
    function updateProfilePhotoDisplay() {
        const user = loggedInUser;
        const img = profilePhotoImg;
        const defaultAvatar = profileDefaultAvatar;
        const removeBtn = profilePhotoRemoveBtn;

        if (user && user.photo) {
            img.src = user.photo;
            img.style.display = 'block';
            defaultAvatar.style.display = 'none';
            removeBtn.style.display = 'inline-block';
        } else {
            img.style.display = 'none';
            defaultAvatar.style.display = 'flex';
            removeBtn.style.display = 'none';
        }
        updateSidebarUser();
    }

    function openCropModal(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, GIF).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB.');
            return;
        }
        pendingCropFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            cropImage.src = e.target.result;
            cropOverlay.style.display = 'flex';
            cropImage.onload = function() {
                if (cropperInstance) cropperInstance.destroy();
                cropperInstance = new Cropper(cropImage, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 0.8,
                    movable: true,
                    zoomable: true,
                    rotatable: false,
                    scalable: false,
                    guides: true,
                    center: true,
                    highlight: true,
                    background: false,
                    responsive: true,
                    restore: false,
                });
            };
            if (cropImage.complete) {
                cropImage.onload();
            }
        };
        reader.readAsDataURL(file);
    }

    function closeCropModal() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        cropOverlay.style.display = 'none';
        pendingCropFile = null;
        cropImage.src = '';
    }

    function applyCrop() {
        if (!cropperInstance) return;
        const canvas = cropperInstance.getCroppedCanvas({
            width: 200,
            height: 200,
            imageSmoothingQuality: 'high',
        });
        if (!canvas) {
            alert('Could not crop image. Please try again.');
            return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        if (loggedInUser) {
            const userIndex = registeredUsers.findIndex(u => u.username === loggedInUser.username);
            if (userIndex !== -1) {
                registeredUsers[userIndex].photo = dataUrl;
                loggedInUser.photo = dataUrl;
                updateProfilePhotoDisplay();
                updateSidebarUser();
                notifications.push({
                    id: 'n' + Date.now(),
                    icon: 'fa-camera',
                    text: 'Profile photo updated',
                    time: 'Just now',
                    read: false
                });
                renderNotifications();
                alert('✅ Profile photo updated successfully!');
            }
        }
        closeCropModal();
    }

    // Crop modal events
    cropCloseBtn.addEventListener('click', closeCropModal);
    cropCancelBtn.addEventListener('click', closeCropModal);
    cropConfirmBtn.addEventListener('click', applyCrop);

    cropOverlay.addEventListener('click', function(e) {
        if (e.target === cropOverlay) closeCropModal();
    });

    // Handle file selection from profile photo upload
    profilePhotoInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
            openCropModal(e.target.files[0]);
        }
        profilePhotoInput.value = '';
    });

    profilePhotoUploadBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profilePhotoInput.click();
    });

    profilePhotoRemoveBtn.addEventListener('click', function() {
        if (!loggedInUser) return;
        if (!confirm('Remove your profile photo?')) return;
        const userIndex = registeredUsers.findIndex(u => u.username === loggedInUser.username);
        if (userIndex !== -1) {
            registeredUsers[userIndex].photo = null;
            loggedInUser.photo = null;
            updateProfilePhotoDisplay();
            updateSidebarUser();
            notifications.push({
                id: 'n' + Date.now(),
                icon: 'fa-camera',
                text: 'Profile photo removed',
                time: 'Just now',
                read: false
            });
            renderNotifications();
            alert('✅ Profile photo removed.');
        }
    });

    // =====================================================
    //  UPDATE SIDEBAR USER (with photo)
    // =====================================================
    function updateSidebarUser() {
        if (loggedInUser) {
            const name = loggedInUser.fullName || loggedInUser.username || 'User';
            sidebarUserName.textContent = name;
            sidebarUserRole.textContent = loggedInUser.role === 'admin' ? 'Admin' : 'User';

            if (loggedInUser.photo) {
                sidebarAvatar.innerHTML = `<img src="${loggedInUser.photo}" alt="Profile" />`;
            } else {
                const initial = name.charAt(0).toUpperCase();
                sidebarAvatar.innerHTML = `<span class="default-avatar">${initial}</span>`;
            }
        } else {
            sidebarUserName.textContent = 'Guest';
            sidebarUserRole.textContent = 'User';
            sidebarAvatar.innerHTML = `<span class="default-avatar">G</span>`;
        }
    }

    // =====================================================
    //  VERIFICATION MODAL
    // =====================================================
    const overlay = document.getElementById('verificationOverlay');
    const icon = document.getElementById('verificationIcon');
    const title = document.getElementById('verificationTitle');
    const desc = document.getElementById('verificationDesc');
    const spinner = document.getElementById('verificationSpinner');
    const successCheck = document.getElementById('verificationSuccess');
    const statusText = document.getElementById('verificationStatus');
    const continueBtn = document.getElementById('verificationContinueBtn');
    let verificationResolve = null;

    function showVerification(provider) {
        return new Promise((resolve) => {
            verificationResolve = resolve;
            spinner.style.display = 'block';
            successCheck.style.display = 'none';
            continueBtn.style.display = 'none';
            statusText.textContent = 'Connecting...';
            statusText.style.color = '#b7ecff';

            if (provider === 'google') {
                icon.innerHTML = '<i class="fab fa-google google-icon"></i>';
                title.textContent = 'Verifying with Google';
                desc.textContent = 'Please wait while we verify your Google account...';
            } else if (provider === 'github') {
                icon.innerHTML = '<i class="fab fa-github github-icon"></i>';
                title.textContent = 'Verifying with GitHub';
                desc.textContent = 'Please wait while we verify your GitHub account...';
            }

            overlay.style.display = 'flex';

            setTimeout(() => { statusText.textContent = '✅ Identity confirmed'; statusText.style.color = '#4ade80'; }, 800);
            setTimeout(() => { statusText.textContent = '🔐 Security check passed'; statusText.style.color = '#4ade80'; }, 1600);
            setTimeout(() => {
                statusText.textContent = '✅ Verification successful!';
                statusText.style.color = '#4ade80';
                spinner.style.display = 'none';
                successCheck.style.display = 'block';
                continueBtn.style.display = 'inline-block';
                continueBtn.textContent = 'Continue to Nexus';
            }, 2400);

            continueBtn.onclick = function() {
                overlay.style.display = 'none';
                if (verificationResolve) verificationResolve();
            };
        });
    }

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay && continueBtn.style.display === 'inline-block') {
            overlay.style.display = 'none';
            if (verificationResolve) verificationResolve();
        }
    });

    // =====================================================
    //  LOGIN / LOGOUT
    // =====================================================
    function loginUser(user) {
        loggedInUser = user;
        userDisplay.textContent = user.username;
        const isAdmin = user.role === 'admin';
        roleBadge.textContent = isAdmin ? 'Admin' : 'User';
        roleBadge.className = 'role-badge' + (isAdmin ? ' admin' : '');

        adminNavBtn.style.display = isAdmin ? 'inline-flex' : 'none';
        sidebarAdminLink.style.display = isAdmin ? 'flex' : 'none';
        addSubjectBtn.style.display = isAdmin ? 'inline-flex' : 'none';

        loginCard.style.display = 'none';
        mainApp.classList.add('show');
        mainApp.style.display = 'block';

        updateProfileDisplay();
        updateProfilePhotoDisplay();
        renderSubjects();
        renderGlobalChat();
        renderNotifications();
        if (subjects.length) openSubjectChat(subjects[0].id);
        loginError.textContent = '';
        updateSidebarUser();

        if (isAdmin) updateAdminStats();

        closeSidebar();
    }

    function logout() {
        if (isEditing) cancelProfileEdit();
        loggedInUser = null;
        userDisplay.textContent = 'Guest';
        roleBadge.textContent = 'User';
        roleBadge.className = 'role-badge';
        adminNavBtn.style.display = 'none';
        sidebarAdminLink.style.display = 'none';
        addSubjectBtn.style.display = 'none';

        mainApp.classList.remove('show');
        mainApp.style.display = 'none';
        loginCard.style.display = 'block';
        document.getElementById('loginUser').value = '';
        document.getElementById('loginPass').value = '';
        loginError.textContent = '';
        updateProfileDisplay();
        updateProfilePhotoDisplay();
        updateSidebarUser();

        document.querySelectorAll('.nav-icon').forEach(i => i.classList.remove('active'));
        document.querySelector('[data-section="subjects"]').classList.add('active');
        document.querySelectorAll('.section-hidden').forEach(el => el.classList.add('section-hidden'));
        document.getElementById('subjectsSection').classList.remove('section-hidden');

        closeSidebar();
    }

    // =====================================================
    //  LOGIN EVENTS
    // =====================================================
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value.trim();
        if (!id || !pass) { loginError.textContent = '⚠️ Please enter username/email and password'; return; }
        const user = registeredUsers.find(u => u.username.toLowerCase() === id.toLowerCase() || u.email.toLowerCase() === id.toLowerCase());
        if (!user) { loginError.textContent = '❌ User not found. Please sign up first.'; return; }
        if (user.password !== pass) { loginError.textContent = '❌ Incorrect password.'; return; }
        loginUser(user);
    });

    document.getElementById('loginUser').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    });
    document.getElementById('loginPass').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    });

    document.getElementById('togglePassword').addEventListener('click', function() {
        const input = document.getElementById('loginPass');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    document.getElementById('toggleSignupPassword').addEventListener('click', function() {
        const input = document.getElementById('signupPassword');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    document.getElementById('showSignupLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('signupForm').classList.toggle('show');
    });

    document.getElementById('cancelSignupBtn').addEventListener('click', function() {
        document.getElementById('signupForm').classList.remove('show');
    });

    document.getElementById('signupBtn').addEventListener('click', function() {
        const full = document.getElementById('signupFullName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const contact = document.getElementById('signupContact').value.trim();
        const idx = document.getElementById('signupIndex').value.trim();
        const pass = document.getElementById('signupPassword').value.trim();
        if (!full || !email || !pass) { loginError.textContent = '⚠️ Please fill all required fields'; return; }
        if (!email.endsWith('@gmail.com')) { loginError.textContent = '❌ Please use a valid Gmail address (@gmail.com)'; return; }
        const username = email.split('@')[0];
        if (registeredUsers.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
            loginError.textContent = '❌ Username or Gmail already registered.';
            return;
        }
        const newUser = { username, email, password: pass, fullName: full, contact: contact || 'Not provided',
                          index: idx || 'Not provided', role: 'user', photo: null };
        registeredUsers.push(newUser);
        document.getElementById('signupForm').classList.remove('show');
        loginError.textContent = '✅ Account created! You are now logged in.';
        loginUser(newUser);
    });

    document.getElementById('forgotPassLink').addEventListener('click', function(e) {
        e.preventDefault();
        alert('📧 Password reset link sent to your email. (Demo)');
    });

    // =====================================================
    //  SOCIAL LOGIN
    // =====================================================
    async function socialLogin(provider) {
        await showVerification(provider);
        let username, email, fullName;
        if (provider === 'google') {
            username = 'google_user';
            email = 'google_user@gmail.com';
            fullName = 'Google User';
        } else if (provider === 'github') {
            username = 'github_user';
            email = 'github_user@gmail.com';
            fullName = 'GitHub User';
        } else { return; }
        let user = registeredUsers.find(u => u.username === username);
        if (!user) {
            user = { username, email, password: provider + 'pass', fullName, contact: 'Not provided',
                     index: 'SOCIAL' + provider.toUpperCase(), role: 'user', photo: null };
            registeredUsers.push(user);
        }
        loginUser(user);
    }

    document.getElementById('googleBtn').addEventListener('click', function() { socialLogin('google'); });
    document.getElementById('githubBtn').addEventListener('click', function() { socialLogin('github'); });
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // =====================================================
    //  SECTION NAV
    // =====================================================
    const navIcons = document.querySelectorAll('.nav-icon');
    const sections = {
        subjects: document.getElementById('subjectsSection'),
        chat: document.getElementById('chatSection'),
        notifications: document.getElementById('notificationsSection'),
        files: document.getElementById('filesSection'),
        profile: document.getElementById('profileSection'),
        admin: document.getElementById('adminSection')
    };

    navIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const section = this.dataset.section;
            if (section === 'admin' && loggedInUser && loggedInUser.role !== 'admin') return;

            navIcons.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            sidebarNavLinks.forEach(l => l.classList.remove('active'));
            const sidebarLink = document.querySelector(`#sidebarNav a[data-section="${section}"]`);
            if (sidebarLink) sidebarLink.classList.add('active');

            Object.keys(sections).forEach(key => {
                sections[key].classList.toggle('section-hidden', key !== section);
            });
            if (section === 'chat') { renderGlobalChat(); setTimeout(() => globalChatInput.focus(), 100); }
            if (section === 'files') renderPrivateFiles();
            if (section === 'profile') { updateProfileDisplay(); updateProfilePhotoDisplay(); }
            if (section === 'notifications') renderNotifications();
            if (section === 'admin' && loggedInUser && loggedInUser.role === 'admin') {
                updateAdminStats();
                renderUserList();
            }
        });
    });

    // =====================================================
    //  RENDER GLOBAL CHAT
    // =====================================================
    function renderGlobalChat() {
        if (!globalChatBox) return;
        globalChatBox.innerHTML = '';
        if (globalMessages.length === 0) {
            globalChatBox.innerHTML = '<div class="empty-chat">No messages yet. Start the conversation!</div>';
            return;
        }
        globalMessages.forEach((msg, msgIndex) => {
            const div = document.createElement('div');
            div.className = 'chat-message';
            let text = msg.text;
            text = text.replace(/@(\w+\.?\s?\w+)/g, (match, username) => {
                const exists = onlineUsers.some(u => u.toLowerCase() === username.toLowerCase());
                return exists ? `<span class="mention">@${username}</span>` : match;
            });

            let filesHtml = '';
            if (msg.files && msg.files.length > 0) {
                filesHtml = `<div class="msg-files">`;
                msg.files.forEach((fileName, fileIdx) => {
                    const fileKey = `msg_${msgIndex}_${fileIdx}`;
                    filesHtml += `
                        <span class="file-item">
                            <i class="fas fa-file"></i> ${fileName}
                            <span class="file-actions">
                                <button class="view-file" onclick="viewChatFile('${fileKey}')" title="View"><i class="fas fa-eye"></i></button>
                                <button class="download-file" onclick="downloadChatFile('${fileKey}')" title="Download"><i class="fas fa-download"></i></button>
                                <button class="reply-file" onclick="replyToMessage(${msgIndex})" title="Reply"><i class="fas fa-reply"></i></button>
                                <button class="share-file" onclick="shareMessage(${msgIndex})" title="Share"><i class="fas fa-share-alt"></i></button>
                            </span>
                        </span>
                    `;
                });
                filesHtml += `</div>`;
            }

            const canDelete = loggedInUser !== null;
            const actionsHtml = `
                <div class="msg-actions">
                    <button class="reply-btn" onclick="replyToMessage(${msgIndex})"><i class="fas fa-reply"></i> Reply</button>
                    <button class="share-btn" onclick="shareMessage(${msgIndex})"><i class="fas fa-share-alt"></i> Share</button>
                    ${canDelete ? `<button class="delete-msg-btn" onclick="deleteMessage(${msgIndex})"><i class="fas fa-trash-alt"></i> Delete</button>` : ''}
                </div>
            `;

            const userBadge = `<span class="msg-user"><i class="fas fa-user-circle"></i> ${msg.user}</span>`;

            div.innerHTML = `
                ${userBadge}
                <span class="msg-text">${text}</span>
                ${filesHtml}
                <span class="msg-time">${msg.time}</span>
                ${actionsHtml}
            `;
            globalChatBox.appendChild(div);
        });
        globalChatBox.scrollTop = globalChatBox.scrollHeight;
    }

    // =====================================================
    //  DELETE MESSAGE
    // =====================================================
    window.deleteMessage = function(msgIndex) {
        const msg = globalMessages[msgIndex];
        if (!msg) return;
        if (!loggedInUser) {
            alert('Please log in to delete messages.');
            return;
        }
        if (confirm(`Delete this message from ${msg.user}?`)) {
            globalMessages.splice(msgIndex, 1);
            renderGlobalChat();
            const isAdmin = loggedInUser && loggedInUser.role === 'admin';
            const isOwner = loggedInUser && loggedInUser.username === msg.user;
            if (isAdmin && !isOwner) {
                notifications.push({
                    id: 'n' + Date.now(),
                    icon: 'fa-trash-alt',
                    text: `Admin deleted a message from ${msg.user}`,
                    time: 'Just now',
                    read: false
                });
                renderNotifications();
            }
            if (isAdmin) updateAdminStats();
            alert('✅ Message deleted.');
        }
    };

    // =====================================================
    //  CLEAR ALL CHAT
    // =====================================================
    clearAllChatBtn.addEventListener('click', function() {
        if (globalMessages.length === 0) {
            alert('Chat is already empty.');
            return;
        }
        const isAdmin = loggedInUser && loggedInUser.role === 'admin';
        if (!isAdmin) {
            alert('Only admins can clear all messages.');
            return;
        }
        if (confirm('Delete ALL messages in the global chat? This cannot be undone.')) {
            const count = globalMessages.length;
            globalMessages = [];
            renderGlobalChat();
            notifications.push({
                id: 'n' + Date.now(),
                icon: 'fa-trash-alt',
                text: `Admin cleared all ${count} chat messages`,
                time: 'Just now',
                read: false
            });
            renderNotifications();
            updateAdminStats();
            alert(`✅ Cleared all ${count} messages.`);
        }
    });

    // =====================================================
    //  CHAT FILE FUNCTIONS
    // =====================================================
    window.viewChatFile = function(fileKey) {
        const fileData = chatFileStorage[fileKey];
        if (!fileData) {
            alert('File data not found.');
            return;
        }
        const fileObj = { name: fileData.name, data: fileData.data, type: fileData.type };
        openFileViewer(fileObj, null);
    };

    window.downloadChatFile = function(fileKey) {
        const fileData = chatFileStorage[fileKey];
        if (!fileData) {
            alert('File data not found.');
            return;
        }
        const blob = new Blob([fileData.data], { type: fileData.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileData.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    window.replyToMessage = function(msgIndex) {
        const msg = globalMessages[msgIndex];
        if (!msg) return;
        replyTo = { index: msgIndex, user: msg.user, text: msg.text };
        replyInfo.innerHTML = `Replying to <strong>${msg.user}</strong>`;
        replyIndicator.style.display = 'flex';
        let quote = `> @${msg.user}: ${msg.text}`;
        if (msg.files && msg.files.length > 0) {
            quote += ` (📎 ${msg.files.join(', ')})`;
        }
        globalChatInput.value = quote + '\n';
        globalChatInput.focus();
        mentionHint.textContent = 'Replying to ' + msg.user;
    };

    window.shareMessage = function(msgIndex) {
        const msg = globalMessages[msgIndex];
        if (!msg) return;
        let shareText = `📨 Message from ${msg.user}:\n${msg.text}`;
        if (msg.files && msg.files.length > 0) {
            shareText += `\n📎 Files: ${msg.files.join(', ')}`;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('✅ Message shared (copied to clipboard)!');
            }).catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = shareText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('✅ Message shared (copied to clipboard)!');
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('✅ Message shared (copied to clipboard)!');
        }
    };

    cancelReplyBtn.addEventListener('click', function() {
        replyTo = null;
        replyIndicator.style.display = 'none';
        globalChatInput.value = '';
        mentionHint.textContent = '💡 Type @ followed by a username to mention (e.g., @Kavisha)';
    });

    // =====================================================
    //  SEND GLOBAL MESSAGE
    // =====================================================
    function sendGlobalMessage() {
        let text = globalChatInput.value.trim();
        const files = chatPendingFiles.slice();

        if (replyTo) {
            if (!text.includes('> @' + replyTo.user)) {
                const quote = `> @${replyTo.user}: ${replyTo.text}`;
                text = quote + '\n' + text;
            }
            replyTo = null;
            replyIndicator.style.display = 'none';
        }

        if (!text && files.length === 0) {
            mentionHint.textContent = '⚠️ Please type a message or attach a file.';
            setTimeout(() => { mentionHint.textContent = '💡 Type @ followed by a username to mention (e.g., @Kavisha)'; }, 2000);
            return;
        }

        const user = loggedInUser ? loggedInUser.username : 'Guest';
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const mentions = text.match(/@(\w+\.?\s?\w+)/g);
        if (mentions) {
            mentions.forEach(m => {
                const uname = m.substring(1);
                if (onlineUsers.some(u => u.toLowerCase() === uname.toLowerCase())) {
                    console.log(`Mentioned: ${uname}`);
                }
            });
        }

        const fileNames = [];
        if (files.length) {
            files.forEach((file, fi) => {
                const reader = new FileReader();
                const key = `msg_${globalMessages.length}_${fi}`;
                reader.onload = function(e) {
                    chatFileStorage[key] = { name: file.name, type: file.type, data: e.target.result };
                };
                reader.readAsArrayBuffer(file);
                fileNames.push(file.name);
            });
        }

        globalMessages.push({ user, text: text || '📎 File attachment', time, files: fileNames });
        chatPendingFiles = [];
        chatFileList.innerHTML = '';
        globalChatInput.value = '';
        renderGlobalChat();

        const count = parseInt(document.getElementById('onlineCount').textContent) || 12;
        document.getElementById('onlineCount').textContent = count + Math.floor(Math.random() * 3) - 1;
        mentionHint.textContent = '✅ Message sent!';
        setTimeout(() => { mentionHint.textContent = '💡 Type @ followed by a username to mention (e.g., @Kavisha)'; }, 3000);
    }

    chatFileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (!files.length) return;
        for (let file of files) {
            chatPendingFiles.push(file);
            const div = document.createElement('div');
            div.className = 'chat-file-item';
            div.dataset.filename = file.name;
            div.innerHTML = `<span><i class="fas fa-file"></i> ${file.name} (${(file.size/1024).toFixed(1)} KB)</span><button onclick="removeChatFile(this)"><i class="fas fa-times-circle"></i></button>`;
            chatFileList.appendChild(div);
        }
        chatFileInput.value = '';
        mentionHint.textContent = `📎 ${chatPendingFiles.length} file(s) ready.`;
        setTimeout(() => { mentionHint.textContent = '💡 Type @ followed by a username to mention (e.g., @Kavisha)'; }, 3000);
    });

    window.removeChatFile = function(btn) {
        const item = btn.parentElement;
        const name = item.dataset.filename;
        chatPendingFiles = chatPendingFiles.filter(f => f.name !== name);
        item.remove();
        if (chatPendingFiles.length === 0) mentionHint.textContent = '💡 Type @ followed by a username to mention (e.g., @Kavisha)';
        else mentionHint.textContent = `📎 ${chatPendingFiles.length} file(s) ready.`;
    };

    globalSendBtn.addEventListener('click', sendGlobalMessage);
    globalChatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); sendGlobalMessage(); }
    });
    globalChatInput.addEventListener('input', function(e) {
        const text = e.target.value;
        if (!replyTo) {
            mentionHint.textContent = text.includes('@') ? '💡 Type the full username after @' : '💡 Type @ followed by a username to mention (e.g., @Kavisha)';
        }
    });

    // =====================================================
    //  RENDER SUBJECTS
    // =====================================================
    function renderSubjects() {
        let filtered = subjects;
        if (currentYearFilter !== 'all') filtered = filtered.filter(s => s.year === parseInt(currentYearFilter));
        if (currentSemesterFilter !== 'all') filtered = filtered.filter(s => s.semester === parseInt(currentSemesterFilter));
        grid.innerHTML = '';
        if (!filtered.length) {
            grid.innerHTML = '<p style="color:#8db4cc;text-align:center;grid-column:1/-1;padding:40px 0;">No subjects found.</p>';
            return;
        }
        const isAdmin = loggedInUser && loggedInUser.role === 'admin';
        filtered.forEach(sub => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.dataset.id = sub.id;
            const semText = sub.semester === 1 ? 'Sem 1' : 'Sem 2';
            card.innerHTML = `
                <h4><span class="subject-name-display" style="cursor:pointer;">${sub.name}</span><span class="semester-badge">Y${sub.year} · ${semText}</span></h4>
                <div style="display:flex;flex-wrap:wrap;gap:2px;margin:4px 0;">${sub.topics.map(t => `<span class="topic-badge">${t}</span>`).join('')}</div>
                <div style="display:flex;justify-content:space-between;margin-top:4px;">
                    <span style="color:#6a9eb0;font-size:0.65rem;">📄 ${sub.docs.length} docs</span>
                    <button class="icon-btn chat-subject-btn" data-id="${sub.id}" style="font-size:0.8rem;background:transparent;border:none;color:#90c8ff;cursor:pointer;"><i class="fas fa-comment"></i> Chat</button>
                </div>
                <div class="card-actions">
                    ${isAdmin ? `
                    <button class="edit-subject-btn" data-id="${sub.id}"><i class="fas fa-pen"></i> Edit</button>
                    <button class="delete-subject-btn" data-id="${sub.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                    <button class="add-topic-btn" data-id="${sub.id}"><i class="fas fa-plus"></i> Topic</button>
                    <button class="upload-doc-btn" data-id="${sub.id}"><i class="fas fa-upload"></i> Doc</button>
                    ` : `
                    <button class="add-topic-btn" data-id="${sub.id}"><i class="fas fa-plus"></i> Topic</button>
                    <button class="upload-doc-btn" data-id="${sub.id}"><i class="fas fa-upload"></i> Doc</button>
                    `}
                </div>
                ${isAdmin ? `
                <div class="edit-name-container" style="display:none;margin-top:4px;">
                    <input class="edit-name-input" data-id="${sub.id}" value="${sub.name}" placeholder="New subject name" style="background:rgba(0,30,50,0.6);border:1px solid #00b7ff55;border-radius:20px;padding:4px 10px;color:#e6f7ff;font-size:0.8rem;width:100%;margin-top:4px;">
                    <button class="save-name-btn" data-id="${sub.id}" style="background:rgba(0,30,50,0.5);border:1px solid #00b7ff33;border-radius:20px;padding:3px 10px;color:#b7ecff;font-size:0.65rem;cursor:pointer;margin-top:4px;">Save</button>
                </div>
                ` : ''}
            `;
            grid.appendChild(card);
        });
    }

    // =====================================================
    //  SUBJECT GRID EVENTS
    // =====================================================
    grid.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const id = target.dataset.id;
        if (!id) return;
        const isAdmin = loggedInUser && loggedInUser.role === 'admin';

        if (target.classList.contains('chat-subject-btn')) { openSubjectChat(id); return; }

        if (isAdmin && target.classList.contains('delete-subject-btn')) {
            const sub = subjects.find(s => s.id === id);
            if (sub && confirm(`Delete subject "${sub.name}"?`)) {
                subjects = subjects.filter(s => s.id !== id);
                if (currentSubjectId === id) currentSubjectId = subjects.length ? subjects[0].id : null;
                renderSubjects();
                if (currentSubjectId) openSubjectChat(currentSubjectId);
                else { chatBox.innerHTML = '<div class="empty-chat">No subject selected</div>'; chatSubjectName.textContent = 'None'; topicContainer.innerHTML = ''; selectedTopic = null; renderTopicFiles(); }
            }
            return;
        }

        if (isAdmin && target.classList.contains('edit-subject-btn')) {
            const card = target.closest('.subject-card');
            const container = card.querySelector('.edit-name-container');
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
            return;
        }

        if (isAdmin && target.classList.contains('save-name-btn')) {
            const card = target.closest('.subject-card');
            const input = card.querySelector('.edit-name-input');
            const sub = subjects.find(s => s.id === id);
            if (sub && input && input.value.trim()) { sub.name = input.value.trim(); renderSubjects(); openSubjectChat(id); }
            return;
        }

        if (target.classList.contains('add-topic-btn')) {
            const sub = subjects.find(s => s.id === id);
            if (!sub) return;
            const topic = prompt(`Add a new topic to "${sub.name}":`);
            if (topic && topic.trim()) {
                sub.topics.push(topic.trim());
                if (!sub.topicFiles) sub.topicFiles = {};
                sub.topicFiles[topic.trim()] = [];
                renderSubjects();
                openSubjectChat(id);
                alert(`✅ Topic "${topic.trim()}" added!`);
            }
            return;
        }

        if (target.classList.contains('upload-doc-btn')) {
            const sub = subjects.find(s => s.id === id);
            if (!sub) return;
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.accept = '*/*';
            fileInput.onchange = function(e) {
                const files = e.target.files;
                if (!files.length) return;
                let loaded = 0;
                for (let f of files) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        sub.docs.push({ name: f.name, data: event.target.result, type: f.type, size: f.size });
                        loaded++;
                        if (loaded === files.length) {
                            renderSubjects();
                            openSubjectChat(id);
                            alert(`✅ Added ${files.length} file(s) to "${sub.name}"`);
                        }
                    };
                    reader.readAsArrayBuffer(f);
                }
            };
            fileInput.click();
            return;
        }
    });

    grid.addEventListener('click', function(e) {
        const nameSpan = e.target.closest('.subject-name-display');
        if (nameSpan) {
            const card = nameSpan.closest('.subject-card');
            if (card) openSubjectChat(card.dataset.id);
        }
    });

    // =====================================================
    //  OPEN SUBJECT CHAT (with topic files management)
    // =====================================================
    function openSubjectChat(subId) {
        const sub = subjects.find(s => s.id === subId);
        if (!sub) return;
        currentSubjectId = subId;
        const semText = sub.semester === 1 ? 'Sem 1' : 'Sem 2';
        chatSubjectName.textContent = `${sub.name} (Y${sub.year} · ${semText})`;
        chatBox.innerHTML = '';
        if (sub.topics.length === 0 && sub.docs.length === 0) {
            chatBox.innerHTML = `<div class="empty-chat">No topics or documents yet. Add topics above.</div>`;
        } else {
            let html = '';
            if (sub.topics.length) {
                html += `<div style="margin-bottom:6px;"><strong style="color:#66d0ff;">Topics:</strong> `;
                sub.topics.forEach(topic => {
                    const hasFiles = sub.topicFiles && sub.topicFiles[topic] && sub.topicFiles[topic].length > 0;
                    html += `<span class="topic-badge" style="background:#154a66;display:inline-flex;align-items:center;gap:4px;">
                        ${topic}
                        ${hasFiles ? `<span style="font-size:0.6rem;color:#66d0ff;">📎${sub.topicFiles[topic].length}</span>` : ''}
                    </span>`;
                });
                html += `</div>`;
            }
            if (sub.docs.length) {
                html += `<div><strong style="color:#66d0ff;">Documents:</strong> ${sub.docs.map(doc => {
                    return `<span style="background:#0a2940;border-radius:30px;padding:2px 14px;margin:2px;display:inline-flex;align-items:center;gap:6px;">
                        📎 ${doc.name}
                        <span class="file-actions">
                            <button onclick="viewSubjectDoc('${subId}','${doc.name}')" title="View/Edit"><i class="fas fa-eye"></i></button>
                            <button onclick="downloadSubjectDoc('${subId}','${doc.name}')" title="Download"><i class="fas fa-download"></i></button>
                        </span>
                    </span>`;
                }).join(' ')}</div>`;
            }
            chatBox.innerHTML = html;
        }

        renderTopics(sub);
        renderTopicFiles();
    }

    // =====================================================
    //  RENDER TOPICS (clickable)
    // =====================================================
    function renderTopics(sub) {
        topicContainer.innerHTML = '';
        if (!sub || sub.topics.length === 0) {
            topicContainer.innerHTML = '<span style="color:#6a8fa0;font-style:italic;font-size:0.8rem;">No topics yet</span>';
            return;
        }
        sub.topics.forEach(topic => {
            const span = document.createElement('span');
            span.className = 'topic-badge';
            if (selectedTopic === topic) {
                span.classList.add('active');
            }
            span.textContent = topic;
            const hasFiles = sub.topicFiles && sub.topicFiles[topic] && sub.topicFiles[topic].length > 0;
            if (hasFiles) {
                const badge = document.createElement('span');
                badge.style.cssText = 'font-size:0.55rem;background:#00a6ff44;border-radius:10px;padding:0 6px;margin-left:4px;color:#b7ecff;';
                badge.textContent = sub.topicFiles[topic].length;
                span.appendChild(badge);
            }
            span.addEventListener('click', function() {
                selectedTopic = topic;
                renderTopics(sub);
                renderTopicFiles();
                deleteTopicBtn.style.display = 'inline-flex';
            });
            topicContainer.appendChild(span);
        });
        if (selectedTopic && sub.topics.includes(selectedTopic)) {
            deleteTopicBtn.style.display = 'inline-flex';
        } else {
            deleteTopicBtn.style.display = 'none';
        }
    }

    // =====================================================
    //  RENDER TOPIC FILES
    // =====================================================
    function renderTopicFiles() {
        const sub = subjects.find(s => s.id === currentSubjectId);
        if (!sub) {
            topicFilesList.innerHTML = '<div class="topic-files-empty">Select a subject first.</div>';
            selectedTopicName.textContent = 'No subject';
            return;
        }
        if (!selectedTopic) {
            topicFilesList.innerHTML = '<div class="topic-files-empty">Select a topic to manage its files.</div>';
            selectedTopicName.textContent = 'None selected';
            return;
        }
        const topicFiles = sub.topicFiles && sub.topicFiles[selectedTopic] ? sub.topicFiles[selectedTopic] : [];
        selectedTopicName.textContent = selectedTopic;

        if (topicFiles.length === 0) {
            topicFilesList.innerHTML = '<div class="topic-files-empty">No files in this topic. Upload files above.</div>';
            return;
        }

        topicFilesList.innerHTML = '';
        topicFiles.forEach((file, index) => {
            const entry = document.createElement('div');
            entry.className = 'topic-file-entry';
            const fileSize = file.size ? (file.size / 1024).toFixed(1) + ' KB' : 'Unknown size';
            const fileKey = `topic_${currentSubjectId}_${selectedTopic}_${index}`;
            if (!window.topicFileStorage) window.topicFileStorage = {};
            window.topicFileStorage[fileKey] = file;

            entry.innerHTML = `
                <div class="file-info">
                    <i class="fas ${file.type && file.type.startsWith('image/') ? 'fa-file-image' : file.type && file.type === 'application/pdf' ? 'fa-file-pdf' : 'fa-file'}"></i>
                    ${file.name}
                    <span style="color:#8db4cc;font-size:0.65rem;">(${fileSize})</span>
                </div>
                <div class="file-actions">
                    <button class="view-file" onclick="viewTopicFile('${fileKey}')" title="View"><i class="fas fa-eye"></i></button>
                    <button class="edit-file" onclick="editTopicFile('${fileKey}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="download-file" onclick="downloadTopicFile('${fileKey}')" title="Download"><i class="fas fa-download"></i></button>
                    <button class="delete-file" onclick="deleteTopicFile('${currentSubjectId}','${selectedTopic}','${index}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            topicFilesList.appendChild(entry);
        });
    }

    // =====================================================
    //  TOPIC FILE FUNCTIONS
    // =====================================================
    window.viewTopicFile = function(fileKey) {
        const file = window.topicFileStorage ? window.topicFileStorage[fileKey] : null;
        if (!file) {
            alert('File data not found.');
            return;
        }
        const fileObj = { name: file.name, data: file.data, type: file.type, size: file.size };
        openFileViewer(fileObj, null);
    };

    window.editTopicFile = function(fileKey) {
        const file = window.topicFileStorage ? window.topicFileStorage[fileKey] : null;
        if (!file) {
            alert('File data not found.');
            return;
        }
        const fileObj = { name: file.name, data: file.data, type: file.type, size: file.size };
        openFileViewer(fileObj, function(newData) {
            file.data = newData;
            if (window.topicFileStorage) {
                window.topicFileStorage[fileKey] = file;
            }
            const sub = subjects.find(s => s.id === currentSubjectId);
            if (sub && sub.topicFiles && sub.topicFiles[selectedTopic]) {
                const files = sub.topicFiles[selectedTopic];
                const fileIndex = files.findIndex(f => f.name === file.name && f.size === file.size);
                if (fileIndex !== -1) {
                    files[fileIndex].data = newData;
                }
            }
            renderTopicFiles();
            alert('✅ File updated successfully!');
        });
    };

    window.downloadTopicFile = function(fileKey) {
        const file = window.topicFileStorage ? window.topicFileStorage[fileKey] : null;
        if (!file) {
            alert('File data not found.');
            return;
        }
        if (!file.data) {
            alert('No file data to download.');
            return;
        }
        const blob = new Blob([file.data], { type: file.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    window.deleteTopicFile = function(subId, topicName, fileIndex) {
        if (!confirm(`Delete file from topic "${topicName}"?`)) return;
        const sub = subjects.find(s => s.id === subId);
        if (!sub) return;
        if (sub.topicFiles && sub.topicFiles[topicName]) {
            sub.topicFiles[topicName].splice(fileIndex, 1);
            if (sub.topicFiles[topicName].length === 0) {
                delete sub.topicFiles[topicName];
            }
            renderSubjects();
            renderTopicFiles();
            alert('✅ File deleted successfully!');
        }
    };

    // =====================================================
    //  DELETE TOPIC
    // =====================================================
    deleteTopicBtn.addEventListener('click', function() {
        if (!selectedTopic) return;
        const sub = subjects.find(s => s.id === currentSubjectId);
        if (!sub) return;
        if (!confirm(`Delete topic "${selectedTopic}" and all its files?`)) return;
        const topicIndex = sub.topics.indexOf(selectedTopic);
        if (topicIndex !== -1) {
            sub.topics.splice(topicIndex, 1);
            if (sub.topicFiles && sub.topicFiles[selectedTopic]) {
                delete sub.topicFiles[selectedTopic];
            }
            selectedTopic = null;
            deleteTopicBtn.style.display = 'none';
            renderSubjects();
            openSubjectChat(currentSubjectId);
            alert('✅ Topic deleted successfully!');
        }
    });

    // =====================================================
    //  TOPIC FILE UPLOAD
    // =====================================================
    topicFileUploadBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        topicFileInput.click();
    });

    topicFileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (!files.length) return;
        if (!selectedTopic) {
            alert('Please select a topic first.');
            topicFileInput.value = '';
            return;
        }
        const sub = subjects.find(s => s.id === currentSubjectId);
        if (!sub) return;
        if (!sub.topicFiles) sub.topicFiles = {};
        if (!sub.topicFiles[selectedTopic]) sub.topicFiles[selectedTopic] = [];

        let loaded = 0;
        const totalFiles = files.length;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = function(event) {
                sub.topicFiles[selectedTopic].push({
                    name: file.name,
                    data: event.target.result,
                    type: file.type,
                    size: file.size
                });
                loaded++;
                if (loaded === totalFiles) {
                    renderSubjects();
                    renderTopicFiles();
                    notifications.push({
                        id: 'n' + Date.now(),
                        icon: 'fa-file-upload',
                        text: `${totalFiles} file(s) uploaded to topic "${selectedTopic}"`,
                        time: 'Just now',
                        read: false
                    });
                    renderNotifications();
                    if (loggedInUser && loggedInUser.role === 'admin') updateAdminStats();
                    alert(`✅ ${totalFiles} file(s) uploaded to topic "${selectedTopic}"!`);
                }
            };
            reader.readAsArrayBuffer(file);
        }
        topicFileInput.value = '';
    });

    // =====================================================
    //  ADD TOPIC (global)
    // =====================================================
    document.getElementById('addTopicBtn').addEventListener('click', function() {
        const sub = subjects.find(s => s.id === currentSubjectId);
        if (!sub) return alert('Select a subject first');
        const topic = topicInput.value.trim();
        if (!topic) return;
        if (sub.topics.includes(topic)) {
            alert('Topic already exists!');
            return;
        }
        sub.topics.push(topic);
        if (!sub.topicFiles) sub.topicFiles = {};
        sub.topicFiles[topic] = [];
        topicInput.value = '';
        selectedTopic = topic;
        renderSubjects();
        openSubjectChat(currentSubjectId);
        renderTopicFiles();
        alert(`✅ Topic "${topic}" added!`);
    });

    // =====================================================
    //  SUBJECT DOC FUNCTIONS
    // =====================================================
    window.viewSubjectDoc = function(subId, docName) {
        const sub = subjects.find(s => s.id === subId);
        if (!sub) return;
        const doc = sub.docs.find(d => d.name === docName);
        if (!doc) return;
        const fileObj = { name: doc.name, data: doc.data, type: doc.type, size: doc.size };
        openFileViewer(fileObj, function(newData) {
            doc.data = newData;
            openSubjectChat(subId);
            alert('✅ Document updated successfully!');
        });
    };

    window.downloadSubjectDoc = function(subId, docName) {
        const sub = subjects.find(s => s.id === subId);
        if (!sub) return;
        const doc = sub.docs.find(d => d.name === docName);
        if (!doc) return;
        if (!doc.data) {
            alert('No file data available for download.');
            return;
        }
        try {
            const blob = new Blob([doc.data], { type: doc.type || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('✅ File downloaded successfully!');
        } catch (e) {
            alert('Error downloading file: ' + e.message);
        }
    };

    // =====================================================
    //  ADD SUBJECT (Admin only)
    // =====================================================
    function addSubject() {
        try {
            const name = prompt('Enter subject name:');
            if (name === null) return;
            if (!name || name.trim() === '') {
                alert('Subject name cannot be empty.');
                return;
            }
            const yearInput = prompt('Enter year (1-4):', '1');
            if (yearInput === null) return;
            const year = parseInt(yearInput);
            if (isNaN(year) || year < 1 || year > 4) {
                alert('Invalid year. Please enter a number between 1 and 4.');
                return;
            }
            const semInput = prompt('Enter semester (1 or 2):', '1');
            if (semInput === null) return;
            const semester = parseInt(semInput);
            if (isNaN(semester) || semester < 1 || semester > 2) {
                alert('Invalid semester. Please enter 1 or 2.');
                return;
            }

            currentYearFilter = 'all';
            currentSemesterFilter = 'all';
            document.querySelectorAll('[data-year]').forEach(b => b.style.background = '#0a2940');
            document.querySelector('[data-year="all"]').style.background = '#004466';
            document.querySelectorAll('[data-semester]').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-semester="all"]').classList.add('active');

            const newId = 's' + Date.now() + Math.random().toString(36).substring(2, 6);
            const newSub = {
                id: newId,
                name: name.trim(),
                year: year,
                semester: semester,
                topics: [],
                docs: [],
                topicFiles: {}
            };
            subjects.push(newSub);
            renderSubjects();
            openSubjectChat(newId);
            alert(`✅ Subject "${name.trim()}" added successfully!`);
        } catch (err) {
            console.error('Error adding subject:', err);
            alert('An error occurred while adding the subject. Please try again.');
        }
    }

    document.getElementById('addSubjectBtn').addEventListener('click', addSubject);
    adminAddSubjectBtn.addEventListener('click', addSubject);

    // =====================================================
    //  DOC UPLOAD (global)
    // =====================================================
    document.getElementById('docUploadBtn').addEventListener('click', function() {
        const sub = subjects.find(s => s.id === currentSubjectId);
        if (!sub) return alert('Select a subject first');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '*/*';
        fileInput.onchange = function(e) {
            const files = e.target.files;
            if (!files.length) return;
            let loaded = 0;
            for (let f of files) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    sub.docs.push({ name: f.name, data: event.target.result, type: f.type, size: f.size });
                    loaded++;
                    if (loaded === files.length) {
                        renderSubjects();
                        openSubjectChat(currentSubjectId);
                        alert(`✅ Added ${files.length} file(s) to "${sub.name}"`);
                    }
                };
                reader.readAsArrayBuffer(f);
            }
        };
        fileInput.click();
    });

    // =====================================================
    //  YEAR / SEMESTER FILTERS
    // =====================================================
    document.querySelectorAll('[data-year]').forEach(el => {
        el.addEventListener('click', function() {
            document.querySelectorAll('[data-year]').forEach(b => b.style.background = '#0a2940');
            this.style.background = '#004466';
            currentYearFilter = this.dataset.year;
            renderSubjects();
        });
    });
    document.querySelectorAll('[data-semester]').forEach(el => {
        el.addEventListener('click', function() {
            document.querySelectorAll('[data-semester]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSemesterFilter = this.dataset.semester;
            renderSubjects();
        });
    });

    // =====================================================
    //  NOTIFICATIONS
    // =====================================================
    function renderNotifications() {
        if (!notifList) return;
        const unreadCount = notifications.filter(n => !n.read).length;
        notifBadge.textContent = unreadCount;
        const sidebarBadge = document.getElementById('sidebarNotifBadge');
        if (sidebarBadge) {
            if (unreadCount > 0) {
                sidebarBadge.textContent = unreadCount;
                sidebarBadge.style.display = 'inline';
            } else {
                sidebarBadge.textContent = '0';
                sidebarBadge.style.display = 'none';
            }
        }
        if (notifications.length === 0) {
            notifList.innerHTML = '<div class="notif-empty">No notifications.</div>';
            return;
        }
        notifList.innerHTML = '';
        notifications.forEach(notif => {
            const div = document.createElement('div');
            div.className = `notif-item ${notif.read ? '' : 'unread'}`;
            div.dataset.id = notif.id;
            div.innerHTML = `
                <div class="notif-content">
                    <span class="notif-icon"><i class="fas ${notif.icon}"></i></span>
                    <strong>${notif.text}</strong>
                    <span class="notif-time">${notif.time}</span>
                </div>
                <div class="notif-actions">
                    <button class="toggle-read" title="Mark as read/unread"><i class="fas ${notif.read ? 'fa-envelope-open' : 'fa-envelope'}"></i></button>
                    <button class="delete-notif" title="Delete notification"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            notifList.appendChild(div);
        });
    }

    notifList.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const item = target.closest('.notif-item');
        if (!item) return;
        const id = item.dataset.id;
        if (!id) return;

        if (target.classList.contains('toggle-read')) {
            e.stopPropagation();
            const notif = notifications.find(n => n.id === id);
            if (notif) {
                notif.read = !notif.read;
                renderNotifications();
            }
            return;
        }

        if (target.classList.contains('delete-notif')) {
            e.stopPropagation();
            if (confirm('Delete this notification?')) {
                notifications = notifications.filter(n => n.id !== id);
                renderNotifications();
            }
            return;
        }
    });

    notifList.addEventListener('click', function(e) {
        if (e.target.closest('button')) return;
        const item = e.target.closest('.notif-item');
        if (!item) return;
        const id = item.dataset.id;
        const notif = notifications.find(n => n.id === id);
        if (notif) {
            notif.read = !notif.read;
            renderNotifications();
        }
    });

    clearAllNotifsBtn.addEventListener('click', function() {
        if (notifications.length === 0) return;
        if (confirm('Delete all notifications?')) {
            notifications = [];
            renderNotifications();
        }
    });

    adminClearAllNotifs.addEventListener('click', function() {
        if (notifications.length === 0) return;
        if (confirm('Delete all notifications?')) {
            notifications = [];
            renderNotifications();
            if (loggedInUser && loggedInUser.role === 'admin') updateAdminStats();
        }
    });

    // =====================================================
    //  PRIVATE FILES
    // =====================================================
    const filesList = document.getElementById('privateFilesList');
    const fileInput = document.getElementById('fileInput');

    function renderPrivateFiles() {
        if (!privateFiles.length) { filesList.innerHTML = '<p style="color:#8db4cc;text-align:center;">No private files yet.</p>'; return; }
        filesList.innerHTML = '';
        privateFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            const size = (file.size / 1024).toFixed(1);
            div.innerHTML = `
                <span><i class="fas fa-file" style="color:#66d0ff;"></i> ${file.name} <span style="color:#8db4cc;font-size:0.7rem;">(${size} KB)</span></span>
                <div class="file-actions">
                    <button onclick="viewPrivateFile(${index})" title="View/Edit"><i class="fas fa-eye"></i></button>
                    <button onclick="downloadPrivateFile(${index})" title="Download"><i class="fas fa-download"></i></button>
                    <button class="delete-file" onclick="deletePrivateFile(${index})" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            filesList.appendChild(div);
        });
    }

    window.viewPrivateFile = function(index) {
        const file = privateFiles[index];
        if (!file) return;
        const fileObj = { name: file.name, data: file.data, type: file.type, size: file.size };
        openFileViewer(fileObj, function(newData) {
            privateFiles[index].data = newData;
            renderPrivateFiles();
        });
    };

    window.downloadPrivateFile = function(index) {
        const file = privateFiles[index];
        if (!file) return;
        if (!file.data) {
            alert('No file data to download.');
            return;
        }
        try {
            const blob = new Blob([file.data], { type: file.type || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('✅ File downloaded successfully!');
        } catch (e) {
            alert('Error downloading file: ' + e.message);
        }
    };

    window.deletePrivateFile = function(index) {
        if (confirm('Delete this file?')) { privateFiles.splice(index, 1); renderPrivateFiles(); }
    };

    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = function(event) {
                privateFiles.push({ name: file.name, size: file.size, type: file.type, data: event.target.result });
                renderPrivateFiles();
            };
            reader.readAsArrayBuffer(file);
        }
        fileInput.value = '';
    });

    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#00a6ff';
        uploadArea.style.background = '#00a6ff11';
    });
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = '#0088ff55';
        uploadArea.style.background = 'transparent';
    });
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#0088ff55';
        uploadArea.style.background = 'transparent';
        const files = e.dataTransfer.files;
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = function(event) {
                privateFiles.push({ name: file.name, size: file.size, type: file.type, data: event.target.result });
                renderPrivateFiles();
            };
            reader.readAsArrayBuffer(file);
        }
    });

    // =====================================================
    //  PROFILE EDIT
    // =====================================================
    function enableEdit() {
        if (!loggedInUser) return;
        isEditing = true;
        editName.value = loggedInUser.fullName || '';
        editEmail.value = loggedInUser.email || '';
        editContact.value = loggedInUser.contact || '';
        editIndex.value = loggedInUser.index || '';
        profileDisplay.classList.add('hidden');
        profileEdit.classList.add('visible');
        editProfileBtn.textContent = 'Cancel Edit';
        editProfileBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
    }

    function cancelProfileEdit() {
        isEditing = false;
        profileDisplay.classList.remove('hidden');
        profileEdit.classList.remove('visible');
        editProfileBtn.textContent = 'Edit';
        editProfileBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    }

    function saveProfileChanges() {
        if (!loggedInUser) return;
        const name = editName.value.trim();
        const email = editEmail.value.trim();
        const contact = editContact.value.trim();
        const index = editIndex.value.trim();

        if (!name) { alert('Full name cannot be empty.'); return; }
        if (!email) { alert('Gmail cannot be empty.'); return; }
        if (!email.endsWith('@gmail.com')) { alert('Gmail must end with @gmail.com'); return; }

        const emailTaken = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase() && u.username !== loggedInUser.username);
        if (emailTaken) {
            alert('This Gmail is already registered by another user.');
            return;
        }

        const oldUsername = loggedInUser.username;
        const newUsername = email.split('@')[0];
        const userIndex = registeredUsers.findIndex(u => u.username === oldUsername);
        if (userIndex !== -1) {
            registeredUsers[userIndex].fullName = name;
            registeredUsers[userIndex].email = email;
            registeredUsers[userIndex].contact = contact || 'Not provided';
            registeredUsers[userIndex].index = index || 'Not provided';
            if (newUsername !== oldUsername) {
                if (registeredUsers.some(u => u.username === newUsername && u.username !== oldUsername)) {
                    alert('Username (from email) is already taken. Please use a different email.');
                    return;
                }
                registeredUsers[userIndex].username = newUsername;
                loggedInUser.username = newUsername;
            }
            loggedInUser.fullName = name;
            loggedInUser.email = email;
            loggedInUser.contact = contact || 'Not provided';
            loggedInUser.index = index || 'Not provided';
        }

        userDisplay.textContent = loggedInUser.username;
        cancelProfileEdit();
        updateProfileDisplay();
        updateSidebarUser();
        alert('✅ Profile updated successfully!');
    }

    function updateProfileDisplay() {
        if (loggedInUser) {
            document.getElementById('profileName').textContent = loggedInUser.fullName || 'N/A';
            document.getElementById('profileEmail').textContent = loggedInUser.email || 'N/A';
            document.getElementById('profileContact').textContent = loggedInUser.contact || 'N/A';
            document.getElementById('profileIndex').textContent = loggedInUser.index || 'N/A';
            document.getElementById('profileRole').textContent = loggedInUser.role === 'admin' ? 'Admin' : 'User';
            document.getElementById('profileStatus').textContent = 'Logged In';
            editProfileBtn.style.display = 'inline-block';
            if (isEditing) {
                if (profileEdit.classList.contains('visible')) {
                    editName.value = loggedInUser.fullName || '';
                    editEmail.value = loggedInUser.email || '';
                    editContact.value = loggedInUser.contact || '';
                    editIndex.value = loggedInUser.index || '';
                }
            }
        } else {
            document.getElementById('profileName').textContent = 'Not logged in';
            document.getElementById('profileEmail').textContent = 'Not logged in';
            document.getElementById('profileContact').textContent = 'Not logged in';
            document.getElementById('profileIndex').textContent = 'Not logged in';
            document.getElementById('profileRole').textContent = 'User';
            document.getElementById('profileStatus').textContent = 'Guest';
            editProfileBtn.style.display = 'none';
            if (isEditing) cancelProfileEdit();
        }
        updateSidebarUser();
    }

    editProfileBtn.addEventListener('click', function() {
        if (!loggedInUser) return;
        if (isEditing) {
            cancelProfileEdit();
        } else {
            enableEdit();
        }
    });

    cancelEditProfile.addEventListener('click', cancelProfileEdit);
    saveProfileBtn.addEventListener('click', saveProfileChanges);

    // =====================================================
    //  ADMIN FUNCTIONS
    // =====================================================
    function updateAdminStats() {
        document.getElementById('statUsers').textContent = registeredUsers.length;
        document.getElementById('statSubjects').textContent = subjects.length;
        document.getElementById('statMessages').textContent = globalMessages.length;
        document.getElementById('statNotifications').textContent = notifications.length;
    }

    function renderUserList() {
        if (!userListContainer) return;
        if (registeredUsers.length === 0) {
            userListContainer.innerHTML = '<p style="color:#8db4cc;text-align:center;padding:20px 0;">No users registered.</p>';
            return;
        }
        userListContainer.innerHTML = '';
        document.getElementById('userCountDisplay').textContent = registeredUsers.length;

        registeredUsers.forEach((user, index) => {
            const div = document.createElement('div');
            div.className = 'user-list-item';
            const isAdmin = user.role === 'admin';
            const isCurrentUser = loggedInUser && loggedInUser.username === user.username;

            div.innerHTML = `
                <div class="user-info">
                    <span class="name">${user.fullName} ${isAdmin ? '👑' : ''}</span>
                    <span class="email">${user.email} · ${user.username} · ${isAdmin ? 'Admin' : 'User'}</span>
                </div>
                <div class="user-actions">
                    ${!isAdmin ? `<button class="promote-btn" data-username="${user.username}"><i class="fas fa-arrow-up"></i> Promote</button>` : ''}
                    ${!isCurrentUser ? `<button class="danger-btn delete-user-btn" data-username="${user.username}"><i class="fas fa-trash-alt"></i> Delete</button>` : ''}
                    ${isCurrentUser ? `<span style="color:#8db4cc;font-size:0.7rem;">(You)</span>` : ''}
                </div>
            `;
            userListContainer.appendChild(div);
        });

        userListContainer.querySelectorAll('.promote-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.dataset.username;
                const user = registeredUsers.find(u => u.username === username);
                if (user && confirm(`Promote "${user.fullName}" to Admin?`)) {
                    user.role = 'admin';
                    renderUserList();
                    updateAdminStats();
                    notifications.push({
                        id: 'n' + Date.now(),
                        icon: 'fa-user-cog',
                        text: `${user.fullName} was promoted to Admin`,
                        time: 'Just now',
                        read: false
                    });
                    renderNotifications();
                    alert(`✅ ${user.fullName} is now an Admin!`);
                }
            });
        });

        userListContainer.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.dataset.username;
                const user = registeredUsers.find(u => u.username === username);
                if (user && confirm(`Delete user "${user.fullName}"? This cannot be undone.`)) {
                    registeredUsers = registeredUsers.filter(u => u.username !== username);
                    renderUserList();
                    updateAdminStats();
                    notifications.push({
                        id: 'n' + Date.now(),
                        icon: 'fa-user-minus',
                        text: `${user.fullName} was removed from the system`,
                        time: 'Just now',
                        read: false
                    });
                    renderNotifications();
                    alert(`✅ User "${user.fullName}" deleted.`);
                }
            });
        });
    }

    adminRefreshBtn.addEventListener('click', function() {
        if (loggedInUser && loggedInUser.role === 'admin') {
            updateAdminStats();
            renderUserList();
            renderSubjects();
            renderNotifications();
            alert('✅ Data refreshed!');
        }
    });

    // =====================================================
    //  SIDEBAR NAV SYNC
    // =====================================================
    sidebarNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section === 'admin' && loggedInUser && loggedInUser.role !== 'admin') return;

            navIcons.forEach(i => i.classList.remove('active'));
            const mainNav = document.querySelector(`.nav-icon[data-section="${section}"]`);
            if (mainNav) mainNav.classList.add('active');

            sidebarNavLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            Object.keys(sections).forEach(key => {
                sections[key].classList.toggle('section-hidden', key !== section);
            });
            if (section === 'chat') { renderGlobalChat(); setTimeout(() => globalChatInput.focus(), 100); }
            if (section === 'files') renderPrivateFiles();
            if (section === 'profile') { updateProfileDisplay(); updateProfilePhotoDisplay(); }
            if (section === 'notifications') renderNotifications();
            if (section === 'admin' && loggedInUser && loggedInUser.role === 'admin') {
                updateAdminStats();
                renderUserList();
            }

            closeSidebar();
        });
    });

    sidebarLogout.addEventListener('click', function(e) {
        e.preventDefault();
        closeSidebar();
        setTimeout(logout, 200);
    });

    // =====================================================
    //  INIT
    // =====================================================
    loginCard.style.display = 'block';
    mainApp.style.display = 'none';
    document.querySelector('[data-year="all"]').style.background = '#004466';
    updateProfileDisplay();
    updateProfilePhotoDisplay();
    renderNotifications();
    updateSidebarUser();

    window.topicFileStorage = {};

    function updateToggleLabel() {
        const label = document.getElementById('sidebarToggleLabel');
        if (window.innerWidth < 600) {
            label.style.display = 'inline';
        } else {
            label.style.display = 'none';
        }
    }
    updateToggleLabel();
    window.addEventListener('resize', updateToggleLabel);

})();