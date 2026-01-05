
export type Language = 'English' | 'Khmer' | 'Vietnam' | 'China';

// Fix: Added missing Vietnam and China translations to satisfy the Record<Language, ...> type requirement.
const translations: Record<Language, Record<string, string>> = {
  English: {
    nav_dashboard: 'Dashboard',
    nav_pdf_mgmt: 'PDF Management',
    nav_user_mgmt: 'User Management',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    nav_my_docs: 'My Documents',
    dashboard_title: 'System Dashboard',
    dashboard_subtitle: 'Central control hub for LDC~Hub secure assets',
    dashboard_total_pdfs: 'Total PDFs',
    dashboard_total_users: 'Users',
    dashboard_recent: 'Recent',
    dashboard_total_views: 'Total Views',
    dashboard_quick_actions: 'Quick Actions',
    dashboard_health: 'System Health',
    pdf_mgmt_title: 'PDF Management',
    pdf_mgmt_subtitle: 'Manage existing files or perform bulk uploads',
    user_mgmt_title: 'User Management',
    user_mgmt_subtitle: 'Manage single users or bulk import via Excel',
    settings_title: 'Settings',
    settings_desc: 'Personalize your DocuHub experience',
    settings_theme: 'Display Mode',
    settings_lang: 'Language',
    upload_drop: 'Drop files here',
    upload_bulk: 'Bulk Upload',
    upload_manage: 'Manage Index',
    confirm_lang_title: 'Change Language?',
    confirm_lang_desc: 'Are you sure you want to change the system language to ',
    btn_confirm: 'Confirm Change',
    btn_cancel: 'Cancel',
    logged_in_as: 'Logged in as',
    login_title: 'LDC~Hub Login',
    login_subtitle: 'Securely access your corporate documents',
    login_id_label: 'Identification ID',
    login_pass_label: 'Password',
    login_btn: 'Access Secure Portal',
    login_error: 'Invalid ID or password. Please try again.',
    search_placeholder: 'Search...',
    btn_add_user: 'Add User',
    btn_export: 'Export',
    btn_view: 'View',
    btn_download: 'Download',
    btn_discard_all: 'Discard all',
    action_required: 'Action Required',
    user_queue: 'User Queue',
    upload_queue: 'Upload Queue'
  },
  Khmer: {
    nav_dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    nav_pdf_mgmt: 'ការគ្រប់គ្រង PDF',
    nav_user_mgmt: 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់',
    nav_settings: 'ការកំណត់',
    nav_logout: 'ចាកចេញ',
    nav_my_docs: 'ឯកសាររបស់ខ្ញុំ',
    dashboard_title: 'ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ',
    dashboard_subtitle: 'មជ្ឈមណ្ឌលគ្រប់គ្រងកណ្តាលសម្រាប់ទ្រព្យសម្បត្តិសុវត្ថិភាព LDC~Hub',
    dashboard_total_pdfs: 'ចំនួន PDF សរុប',
    dashboard_total_users: 'អ្នកប្រើប្រាស់',
    dashboard_recent: 'ថ្មីៗ',
    dashboard_total_views: 'ការចូលមើលសរុប',
    dashboard_quick_actions: 'សកម្មភាពរហ័ស',
    dashboard_health: 'សុខភាពប្រព័ន្ធ',
    pdf_mgmt_title: 'ការគ្រប់គ្រង PDF',
    pdf_mgmt_subtitle: 'គ្រប់គ្រងឯកសារដែលមានស្រាប់ ឬបង្ហោះឯកសារក្នុងបរិមាណច្រើន',
    user_mgmt_title: 'ការគ្រប់គ្រងអ្នកប្រើប្រាស់',
    user_mgmt_subtitle: 'គ្រប់គ្រងអ្នកប្រើប្រាស់ម្នាក់ៗ ឬនាំចូលក្នុងបរិមាណច្រើនតាមរយៈ Excel',
    settings_title: 'ការកំណត់',
    settings_desc: 'កំណត់បទពិសោធន៍ DocuHub ផ្ទាល់ខ្លួនរបស់អ្នក',
    settings_theme: 'របៀបបង្ហាញ',
    settings_lang: 'ភាសា',
    upload_drop: 'ទម្លាក់ឯកសារនៅទីនេះ',
    upload_bulk: 'ការបង្ហោះច្រើន',
    upload_manage: 'គ្រប់គ្រងលិបិក្រម',
    confirm_lang_title: 'ផ្លាស់ប្តូរភាសា?',
    confirm_lang_desc: 'តើអ្នកប្រាកដថាចង់ផ្លាស់ប្តូរភាសាប្រព័ន្ធទៅជា ',
    btn_confirm: 'បញ្ជាក់ការផ្លាស់ប្តូរ',
    btn_cancel: 'បោះបង់',
    logged_in_as: 'ចូលប្រើដោយ',
    login_title: 'ការចូលប្រើ LDC~Hub',
    login_subtitle: 'ចូលប្រើឯកសារសាជីវកម្មរបស់អ្នកដោយសុវត្ថិភាព',
    login_id_label: 'លេខសម្គាល់អត្តសញ្ញាណ',
    login_pass_label: 'ពាក្យសម្ងាត់',
    login_btn: 'ចូលទៅកាន់វិបផតថលសុវត្ថិភាព',
    login_error: 'លេខសម្គាល់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។ សូមព្យាយាមម្តងទៀត។',
    search_placeholder: 'ស្វែងរក...',
    btn_add_user: 'បន្ថែមអ្នកប្រើប្រាស់',
    btn_export: 'នាំចេញ',
    btn_view: 'មើល',
    btn_download: 'ទាញយក',
    btn_discard_all: 'បោះបង់ទាំងអស់',
    action_required: 'សកម្មភាពដែលត្រូវការ',
    user_queue: 'ជួរអ្នកប្រើប្រាស់',
    upload_queue: 'ជួរបង្ហោះ'
  },
  Vietnam: {
    nav_dashboard: 'Bảng điều khiển',
    nav_pdf_mgmt: 'Quản lý PDF',
    nav_user_mgmt: 'Quản lý người dùng',
    nav_settings: 'Cài đặt',
    nav_logout: 'Đăng xuất',
    nav_my_docs: 'Tài liệu của tôi',
    dashboard_title: 'Bảng điều khiển hệ thống',
    dashboard_subtitle: 'Trung tâm kiểm soát tài sản an toàn của LDC~Hub',
    dashboard_total_pdfs: 'Tổng số PDF',
    dashboard_total_users: 'Người dùng',
    dashboard_recent: 'Gần đây',
    dashboard_total_views: 'Tổng lượt xem',
    dashboard_quick_actions: 'Hành động nhanh',
    dashboard_health: 'Sức khỏe hệ thống',
    pdf_mgmt_title: 'Quản lý PDF',
    pdf_mgmt_subtitle: 'Quản lý tệp hiện có hoặc tải lên hàng loạt',
    user_mgmt_title: 'Quản lý người dùng',
    user_mgmt_subtitle: 'Quản lý người dùng đơn lẻ hoặc nhập hàng loạt qua Excel',
    settings_title: 'Cài đặt',
    settings_desc: 'Cá nhân hóa trải nghiệm DocuHub của bạn',
    settings_theme: 'Chế độ hiển thị',
    settings_lang: 'Ngôn ngữ',
    upload_drop: 'Thả tệp vào đây',
    upload_bulk: 'Tải lên hàng loạt',
    upload_manage: 'Quản lý chỉ mục',
    confirm_lang_title: 'Thay đổi ngôn ngữ?',
    confirm_lang_desc: 'Bạn có chắc chắn muốn thay đổi ngôn ngữ hệ thống sang ',
    btn_confirm: 'Xác nhận thay đổi',
    btn_cancel: 'Hủy',
    logged_in_as: 'Đăng nhập với tư cách',
    login_title: 'Đăng nhập LDC~Hub',
    login_subtitle: 'Truy cập an toàn vào tài liệu của công ty bạn',
    login_id_label: 'ID định danh',
    login_pass_label: 'Mật khẩu',
    login_btn: 'Truy cập Cổng thông tin An toàn',
    login_error: 'ID hoặc mật khẩu không hợp lệ. Vui lòng thử lại.',
    search_placeholder: 'Tìm kiếm...',
    btn_add_user: 'Thêm người dùng',
    btn_export: 'Xuất',
    btn_view: 'Xem',
    btn_download: 'Tải xuống',
    btn_discard_all: 'Hủy tất cả',
    action_required: 'Hành động bắt buộc',
    user_queue: 'Hàng chờ người dùng',
    upload_queue: 'Hàng chờ tải lên'
  },
  China: {
    nav_dashboard: '仪表板',
    nav_pdf_mgmt: 'PDF 管理',
    nav_user_mgmt: '用户管理',
    nav_settings: '设置',
    nav_logout: '登出',
    nav_my_docs: '我的文档',
    dashboard_title: '系统仪表板',
    dashboard_subtitle: 'LDC~Hub 安全资产中央控制中心',
    dashboard_total_pdfs: '总 PDF 数',
    dashboard_total_users: '用户',
    dashboard_recent: '最近',
    dashboard_total_views: '总浏览量',
    dashboard_quick_actions: '快速操作',
    dashboard_health: '系统健康状况',
    pdf_mgmt_title: 'PDF 管理',
    pdf_mgmt_subtitle: '管理现有文件或执行批量上传',
    user_mgmt_title: '用户管理',
    user_mgmt_subtitle: '管理单个用户或通过 Excel 批量导入',
    settings_title: '设置',
    settings_desc: '个性化您的 DocuHub 体验',
    settings_theme: '显示模式',
    settings_lang: '语言',
    upload_drop: '将文件拖到此处',
    upload_bulk: '批量上传',
    upload_manage: '管理索引',
    confirm_lang_title: '更改语言？',
    confirm_lang_desc: '您确定要将系统语言更改为 ',
    btn_confirm: '确认更改',
    btn_cancel: '取消',
    logged_in_as: '登录身份为',
    login_title: 'LDC~Hub 登录',
    login_subtitle: '安全访问您的公司文档',
    login_id_label: '身份 ID',
    login_pass_label: '密码',
    login_btn: '访问安全门户',
    login_error: 'ID 或密码无效。请重试。',
    search_placeholder: '搜索...',
    btn_add_user: '添加用户',
    btn_export: '导出',
    btn_view: '查看',
    btn_download: '下载',
    btn_discard_all: '放弃全部',
    action_required: '需要采取行动',
    user_queue: '用户队列',
    upload_queue: '上传队列'
  }
};

let currentLanguage: Language = (localStorage.getItem('docuhub_lang') as Language) || 'English';

/**
 * Fix: Exporting getTranslation, setLanguage, and getCurrentLanguage to resolve module errors in components.
 */

/**
 * Get the translation for a given key in the current language
 */
export const getTranslation = (key: string): string => {
  return translations[currentLanguage][key] || key;
};

/**
 * Set the system language and trigger an update via a custom event
 */
export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('docuhub_lang', lang);
  window.dispatchEvent(new Event('languageChange'));
};

/**
 * Get the current system language
 */
export const getCurrentLanguage = (): Language => {
  return currentLanguage;
};
