import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type Language = 'uz' | 'en' | 'ru';

const dictionary = {
  uz: {
    discover: 'Kashf qilish', home_nav: 'Asosiy', profile_nav: 'Profil', business_panel: "Biznes Panel", discounts: "Chegirmalar", scanner: "Skaner", history: "Tarix",
    my_pass: 'Mening ruxsatnomam', my_profile: 'Mening profilim', saved_offers: 'Saqlanganlar', my_id: 'Mening ID kartam', verified: 'Tasdiqlangan', student_id: 'Talaba ID',
    saved_count: 'saqlangan', redemptions: 'ishlatilgan', upload_photo: 'Rasm yuklash', flip_card: 'Aylantirish', valid_until: 'Amal qilish muddati', issued: 'Berilgan sana',
    scan_barcode: 'Chegirma uchun shtrix kodni ko\'rsating', digital_id_desc: 'Sizning raqamli talaba guvohnomangiz', click_to_flip: 'Aylantirish uchun kartani bosing',
    settings: 'Sozlamalar', change_language: 'Tilni o\'zgartirish', dark_mode: 'Tungi rejim', private_account: 'Yopiq profil', private_account_desc: 'Akkauntni begonalardan yashirish',
    on: 'Yoniq', off_status: 'O\'chiq', help_support: 'Yordam va qo\'llab-quvvatlash', logout: 'Hisobdan chiqish', select_language: 'Tilni tanlang',
    hero_title_1: 'Talabalik hayotingiz,', hero_title_2: 'yanada qiziqarli.', hero_subtitle: 'Tasdiqlangan chegirmalar endi doim yoningizda.', search_placeholder: 'Qidirish...',
    category: 'Kategoriya', area: 'Hudud', all_categories: 'Barchasi', category_cafes: 'Kafelar', category_shops: 'Do\'konlar', category_learning: 'Ta\'lim', category_it: 'Texnika',
    category_services: 'Xizmat ko‘rsatish', category_other: 'Boshqa', everywhere: 'Barcha joyda', offers_nearby: 'Yaqindagi chegirmalar', popular_now: 'Eng mashhur', just_arrived: 'Yangi qo\'shilganlar',
    close_to_you: 'Sizga yaqin', verified_students_only: 'Faqat tasdiqlangan talabalar uchun', every_redemption: 'Har bir chegirma talaba tekshiruvi orqali olinadi.',
    view_your_pass: 'Ruxsatnomani ko\'rish →', matching_offers: 'Topilgan chegirmalar', your_search: 'Sizning qidiruvingiz', popular_with_students: 'Talabalar tanlovi',
    fresh_this_week: 'Bu haftadagi yangiliklar', short_walk_away: 'Bir qadam masofada', clear: 'Tozalash', back_to_discover: 'Asosiyga qaytish', no_offers_found: 'Chegirmalar topilmadi.',
    showing_results: 'Natijalar ko\'rsatilmoqda', nothing_found: 'Hech narsa topilmadi', no_saved_offers: 'Hozircha saqlangan chegirmalar mavjud emas.', offer_not_found: 'Chegirma topilmadi',
    find_us: 'Manzilimiz', open_hours: 'Ish vaqti', check_before_you_go: 'Borishdan oldin tekshiring', verification_notice: 'Talaba maqomi chegirma vaqtida xavfsiz tekshiriladi.',
    redeem_offer: 'Chegirmani olish (QR Kodi)', students_say: 'Talabalar fikri', no_reviews: 'Hozircha sharhlar yo\'q. Birinchi bo\'lib o\'z fikringizni qoldiring.',
    good_to_know: 'Bilib qo\'ygan yaxshi', see_all: 'Barchasini ko\'rish', view_offer: 'Ko\'rish', off: 'CHEGIRMA', discount_amount: 'Chegirma:', service_type: 'XIZMATI',
    removed_from_saved: 'Saqlanganlardan o\'chirildi', added_to_saved: 'Saqlanganlarga qo\'shildi', discount_code_ready: 'Chegirma kodi tayyor', checking: 'Tekshirilmoqda...',
    id_verified: 'Talaba ID tasdiqlandi', valid_at: 'da amal qiladi.', copy_code: 'Kodni nusxalash', verify_failed: 'Guvohnoma tasdiqlanmadi. Qaytadan urining.', qr_title: 'Xarid uchun QR Kod',
    qr_desc: 'Buni do\'konda kadrga tuting', refreshing_in: 'Yangilanishiga', sec: 'soniya', student_verified: 'Talaba maqomi tasdiqlangan', show_this_code: 'Shu kodni ko\'rsating',
    login_btn: 'Kirish', register_btn: "Ro'yxatdan o'tish", continue_btn: "Davom etish", next_btn: "Keyingisi", step: "QADAM", username_label: "Login", username_placeholder: "Biznes uchun login",
    password_label: "Parol", password_placeholder: "Parol kiriting", forgot_password: "Parolni unutdingizmi?", register_here: "Ro'yxatdan o'tish", login_submit: "Tizimga kirish",
    already_have_account: "Allaqachon hisobingiz bormi?", reg_student: "Talaba sifatida ro'yxatdan o'tish", reg_merchant: "Biznes sifatida ro'yxatdan o'tish",
    security_title: "Xavfsizlik", security_desc: "Shaxsiy kabinetingiz uchun login va parol.", pass_strength: "Parol xavfsizligi", confirm_pass_label: "Yangi parolni tasdiqlang",
    confirm_pass_placeholder: "Parolni qayta yozing...", skip_for_now: "Hozircha o'tkazib yuborish", save_and_finish: "Rasmni saqlash va Yakunlash", approved_title: "Tasdiqlandi!",
    checking_title: "Tekshirilmoqda", start_over: "Boshidan boshlash (Chiqish)", upload_image: "Rasm yuklash", merchant_login_title: "Hamkorlar uchun kirish",
    merchant_login_desc: "Do'koningiz boshqaruv paneliga kiring.", no_account_merchant: "Akkauntingiz yo'qmi?", merchant_signup_1: "Biznesingizni", merchant_signup_2: "rivojlantiring",
    merchant_signup_desc: "TalabaPass tizimiga qo'shiling. O'z xizmat va mahsulotlaringizni minglab talabalarga taklif qilib, yangi mijozlarni jalb qiling.", business_type_title: "Faoliyat turi",
    business_type_desc: "Xizmatlaringiz qaysi toifaga kiradi?", store_name_title: "Do'kon nomi", store_name_desc: "Mijozlar sizni shu nom bilan topishadi.", address_time_title: "Manzil va Vaqt",
    address_time_desc: "Mijozlar sizni oson topishlari uchun.", address_label: "Manzil", locate_gps: "GPS orqali kordinatani yangilash", locating: "Xaritadan qidirilmoqda...",
    work_time_label: "Ish vaqti", logo_title: "Do'kon Logotipi", logo_desc: "Do'koningiz ilovada chiroyli ko'rinishi uchun logotip yuklang (ixtiyoriy).",
    approved_desc_merchant: "Do'koningiz muvaffaqiyatli faollashtirildi.", checking_desc_merchant: "Arizangiz administratorga yuborildi. Odatda tekshiruv jarayoni 10-30 daqiqa vaqt oladi.",
    welcome_1: "Xush kelibsiz!", welcome_2: "Tizimga kiring", student_id_placeholder: "ID raqamingizni kiriting", no_account_student: "Hisobingiz yo'qmi?",
    introduce_title: "O'zingizni tanishtiring", full_name_label: "To'liq ismingiz (Ism va Familiya)", student_data_title: "Talaba ma'lumotlari", university_label: "Universitet",
    select_uni: "Universitetni tanlang...", complex_password: "Murakkab Parol", agree_terms: "Men Foydalanish shartlari va Maxfiylik siyosati bilan tanishib chiqdim va rozi bo'laman.",
    id_card_title: "Talaba ID yoki Guvohnoma", id_card_desc: "Talabalik guvohnomangizni rasmga oling yoki elektron versiyasini (screenshot) yuklang.", open_camera: "Kamerani yoqish",
    upload_gallery: "Galeriyadan yuklash", avatar_title: "Profil rasmi", avatar_desc: "Dasturda chiroyli ko'rinishi uchun yuzingiz ko'ringan rasm yuklang.",
    approved_desc_student: "Ma'lumotlaringiz muvaffaqiyatli qabul qilindi.", welcome_biz: "Xush kelibsiz!", total_customers: "Jami mijozlar", active_discounts: "Faol chegirmalar",
    total_views: "Chegirmalaringiz ko'rildi", new_btn: "Yangi", pending: "Kutilmoqda", no_active_discounts: "Hozircha chegirmalar yo'q", new_discount_title: "Yangi chegirma",
    upload_horizontal_img: "Gorizontal rasm yuklang (16:9)", short_desc_label: "Qisqacha Tavsif (Bosh sahifa uchun)", short_desc_placeholder: "Masalan: Barcha kiyimlarga 20% chegirma",
    products_label: "Mahsulotlarni kiriting (Nomidan keyin 2 ta probel bosing)", products_placeholder: "Masalan: Katta Burger  (2 ta probel)", quantity_placeholder: "Soni",
    unlimited: "Cheksiz", discount_percent_label: "Chegirma Foizi (%)", start_date: "Boshlanish", end_date: "Tugash", start_time: "Vaqt (dan)", end_time: "Vaqt (gacha)", cancel: "Bekor qilish",
    post_btn: "Joylash", search_student: "Talabani Qidirish", scan_qr_desc: "ID kartadagi QR kodni ekranga tuting", confirm_purchase: "Tasdiqlash", select_product_desc: "Qaysi mahsulot olinayotganini tanlang",
    no_history: "Hozircha tarix yo'q", no_history_desc: "Mijozlarni skaner qilganingizda shu yerda paydo bo'ladi", edit_store_info: "Do'kon ma'lumotlarini tahrirlash",
    old_password: "Eski parol", new_password: "Yangi parol", save_btn: "Saqlash", store_info_title: "Do'kon ma'lumotlari", change_password_optional: "Parolni o'zgartirish (ixtiyoriy)",
    current_pass_placeholder: "Joriy parol...", new_pass_placeholder: "Yangi parol...",

    // Talaba Profili (Yangi qo'shildi)
    personal_info: "Shaxsiy ma'lumotlar",
    go_admin_panel: "Admin Panelga o'tish",
    first_name_label: "Ism",
    last_name_label: "Familiya",
    install_app: "Ilovani o'rnatish",
    fast_and_easy: "Tez va qulay ishlash uchun"
  },
  
  en: {
    discover: 'Discover', home_nav: 'Home', profile_nav: 'Profile', business_panel: "Business Panel", discounts: "Discounts", scanner: "Scanner", history: "History",
    my_pass: 'My pass', my_profile: 'My profile', saved_offers: 'Saved offers', my_id: 'My ID', verified: 'Verified', student_id: 'Student ID', saved_count: 'saved', redemptions: 'redemptions',
    upload_photo: 'Upload Photo', flip_card: 'Flip Card', valid_until: 'Valid until', issued: 'Issued date', scan_barcode: 'Scan barcode for discount', digital_id_desc: 'Your digital student ID card',
    click_to_flip: 'Click card to flip', settings: 'Settings', change_language: 'Change language', dark_mode: 'Dark mode', private_account: 'Private account', private_account_desc: 'Hide account from others',
    on: 'On', off_status: 'Off', help_support: 'Help and Support', logout: 'Log out', select_language: 'Select language', hero_title_1: 'Your student life,', hero_title_2: 'even better.',
    hero_subtitle: 'Verified discounts always with you.', search_placeholder: 'Search...', category: 'Category', area: 'Area', all_categories: 'All', category_cafes: 'Cafes', category_shops: 'Shops',
    category_learning: 'Education', category_it: 'Technology', category_services: 'Services', category_other: 'Other', everywhere: 'Everywhere', offers_nearby: 'Offers nearby', popular_now: 'Popular now',
    just_arrived: 'New arrivals', close_to_you: 'Close to you', verified_students_only: 'Verified students only', every_redemption: 'Every redemption starts with a student check.',
    view_your_pass: 'View your pass →', matching_offers: 'Matching offers', your_search: 'Your search', popular_with_students: 'Students\' choice', fresh_this_week: 'Fresh this week',
    short_walk_away: 'A short walk away', clear: 'Clear', back_to_discover: 'Back to home', no_offers_found: 'No offers found.', showing_results: 'Showing results', nothing_found: 'Nothing found',
    no_saved_offers: 'No saved offers yet.', offer_not_found: 'Offer not found', find_us: 'FIND US', open_hours: 'OPEN HOURS', check_before_you_go: 'Check before you go',
    verification_notice: 'Student verification happens securely at redemption.', redeem_offer: 'Redeem (QR Code)', students_say: 'Students say', no_reviews: 'No reviews yet. Be the first to leave a note.',
    good_to_know: 'Good to know', see_all: 'See all', view_offer: 'View offer', off: 'OFF', discount_amount: 'Discount:', service_type: 'SERVICE', removed_from_saved: 'Removed from saved',
    added_to_saved: 'Added to saved', discount_code_ready: 'Discount code ready', checking: 'Checking...', id_verified: 'Student ID verified', valid_at: 'valid at', copy_code: 'Copy code',
    verify_failed: 'ID verification failed. Try again.', qr_title: 'QR Code for Purchase', qr_desc: 'Show this code at the store', refreshing_in: 'Refreshing in', sec: 'sec',
    student_verified: 'Student status verified', show_this_code: 'Show this code', login_btn: 'Log in', register_btn: 'Sign up', continue_btn: "Continue", next_btn: "Next", step: "STEP",
    username_label: "Username", username_placeholder: "Business username", password_label: "Password", password_placeholder: "Enter password", forgot_password: "Forgot password?",
    register_here: "Sign up here", login_submit: "Log in", already_have_account: "Already have an account?", reg_student: "Register as a Student", reg_merchant: "Register as a Business",
    security_title: "Security", security_desc: "Login and password for your personal dashboard.", pass_strength: "Password strength", confirm_pass_label: "Confirm new password",
    confirm_pass_placeholder: "Repeat password...", skip_for_now: "Skip for now", save_and_finish: "Save & Finish", approved_title: "Approved!", checking_title: "Under Review",
    start_over: "Start Over (Exit)", upload_image: "Upload Image", merchant_login_title: "Partner Login", merchant_login_desc: "Log in to your store dashboard.", no_account_merchant: "Don't have an account?",
    merchant_signup_1: "Grow your", merchant_signup_2: "business", merchant_signup_desc: "Join TalabaPass. Offer your services and products to thousands of students and attract new customers.",
    business_type_title: "Business Type", business_type_desc: "Which category does your service fall into?", store_name_title: "Store Name", store_name_desc: "Customers will find you by this name.",
    address_time_title: "Address & Time", address_time_desc: "So customers can easily find you.", address_label: "Address", locate_gps: "Locate via GPS", locating: "Searching map...",
    work_time_label: "Working Hours", logo_title: "Store Logo", logo_desc: "Upload a logo so your store looks great in the app (optional).", approved_desc_merchant: "Your store has been successfully activated.",
    checking_desc_merchant: "Your application has been sent to the administrator. Review usually takes 10-30 minutes.", welcome_1: "Welcome!", welcome_2: "Log in to the system",
    student_id_placeholder: "Enter your ID number", no_account_student: "Don't have an account?", introduce_title: "Introduce Yourself", full_name_label: "Full Name (First and Last)",
    student_data_title: "Student Details", university_label: "University", select_uni: "Select University...", complex_password: "Complex Password", agree_terms: "I have read and agree to the Terms of Use and Privacy Policy.",
    id_card_title: "Student ID or Certificate", id_card_desc: "Take a photo of your student ID or upload an electronic version (screenshot).", open_camera: "Open Camera",
    upload_gallery: "Upload from Gallery", avatar_title: "Profile Picture", avatar_desc: "Upload a photo showing your face to look great in the app.", approved_desc_student: "Your data has been successfully accepted.",
    welcome_biz: "Welcome!", total_customers: "Total customers", active_discounts: "Active discounts", total_views: "Total views", new_btn: "New", pending: "Pending",
    no_active_discounts: "No active discounts yet", new_discount_title: "New Discount", upload_horizontal_img: "Upload horizontal image (16:9)", short_desc_label: "Short Description (For homepage)",
    short_desc_placeholder: "E.g: 20% off all clothing", products_label: "Enter products (Double space after name)", products_placeholder: "E.g: Big Burger  (2 spaces)", quantity_placeholder: "Qty",
    unlimited: "Unlimited", discount_percent_label: "Discount Percent (%)", start_date: "Start Date", end_date: "End Date", start_time: "Start Time", end_time: "End Time", cancel: "Cancel",
    post_btn: "Publish", search_student: "Search Student", scan_qr_desc: "Point camera at the QR code on the ID card", confirm_purchase: "Confirm", select_product_desc: "Select the product being purchased",
    no_history: "No history yet", no_history_desc: "Scanned customers will appear here", edit_store_info: "Edit Store Information", old_password: "Old password", new_password: "New password",
    save_btn: "Save", store_info_title: "Store Information", change_password_optional: "Change password (optional)", current_pass_placeholder: "Current password...", new_pass_placeholder: "New password...",
    personal_info: "Personal Information", go_admin_panel: "Go to Admin Panel", first_name_label: "First Name", last_name_label: "Last Name", install_app: "Install App", fast_and_easy: "For faster access"
  },
  
  ru: {
    discover: 'Изучать', home_nav: 'Главная', profile_nav: 'Профиль', business_panel: "Бизнес Панель", discounts: "Скидки", scanner: "Сканер", history: "История",
    my_pass: 'Мой пропуск', my_profile: 'Мой профиль', saved_offers: 'Сохраненные', my_id: 'Мой ID', verified: 'Подтвержден', student_id: 'ID Студента', saved_count: 'сохранено', redemptions: 'использовано',
    upload_photo: 'Загрузить фото', flip_card: 'Перевернуть', valid_until: 'Действителен до', issued: 'Дата выдачи', scan_barcode: 'Покажите штрих-код для скидки', digital_id_desc: 'Ваш цифровой студенческий билет',
    click_to_flip: 'Нажмите на карту, чтобы перевернуть', settings: 'Настройки', change_language: 'Изменить язык', dark_mode: 'Темная тема', private_account: 'Приватный профиль', private_account_desc: 'Скрыть аккаунт от других',
    on: 'Вкл', off_status: 'Выкл', help_support: 'Помощь и поддержка', logout: 'Выйти', select_language: 'Выберите язык', hero_title_1: 'Студенческая жизнь,', hero_title_2: 'еще интереснее.',
    hero_subtitle: 'Проверенные скидки всегда с вами.', search_placeholder: 'Поиск...', category: 'Категория', area: 'Район', all_categories: 'Все', category_cafes: 'Кафе', category_shops: 'Магазины',
    category_learning: 'Обучение', category_it: 'Техника', category_services: 'Услуги', category_other: 'Другое', everywhere: 'Везде', offers_nearby: 'Скидки рядом', popular_now: 'Популярное',
    just_arrived: 'Новинки', close_to_you: 'Близко к вам', verified_students_only: 'Только для студентов', every_redemption: 'Скидка предоставляется после проверки статуса.',
    view_your_pass: 'Посмотреть пропуск →', matching_offers: 'Найденные скидки', your_search: 'Ваш поиск', popular_with_students: 'Выбор студентов', fresh_this_week: 'Новинки недели',
    short_walk_away: 'В двух шагах', clear: 'Очистить', back_to_discover: 'На главную', no_offers_found: 'Скидки не найдены.', showing_results: 'Показаны результаты', nothing_found: 'Ничего не найдено',
    no_saved_offers: 'Пока нет сохраненных скидок.', offer_not_found: 'Скидка не найдена', find_us: 'НАШ АДРЕС', open_hours: 'ЧАСЫ РАБОТЫ', check_before_you_go: 'Уточняйте перед визитом',
    verification_notice: 'Проверка студенческого статуса происходит при получении.', redeem_offer: 'Получить скидку (QR Код)', students_say: 'Отзывы студентов', no_reviews: 'Пока нет отзывов. Оставьте первый комментарий.',
    good_to_know: 'Полезно знать', see_all: 'Смотреть все', view_offer: 'Смотреть', off: 'СКИДКА', discount_amount: 'Скидка:', service_type: 'СЕРВИС', removed_from_saved: 'Удалено из сохраненных',
    added_to_saved: 'Добавлено в сохраненные', discount_code_ready: 'Код скидки готов', checking: 'Проверка...', id_verified: 'Студенческий ID подтвержден', valid_at: 'действителен в', copy_code: 'Копировать код',
    verify_failed: 'Не удалось подтвердить ID. Попробуйте снова.', qr_title: 'QR-Код для покупки', qr_desc: 'Покажите этот код в магазине', refreshing_in: 'Обновление через', sec: 'сек',
    student_verified: 'Статус студента подтвержден', show_this_code: 'Покажите этот код', login_btn: 'Войти', register_btn: 'Регистрация', continue_btn: "Продолжить", next_btn: "Далее", step: "ШАГ",
    username_label: "Логин", username_placeholder: "Логин для бизнеса", password_label: "Пароль", password_placeholder: "Введите пароль", forgot_password: "Забыли пароль?",
    register_here: "Регистрация", login_submit: "Войти в систему", already_have_account: "Уже есть аккаунт?", reg_student: "Регистрация как Студент", reg_merchant: "Регистрация как Бизнес",
    security_title: "Безопасность", security_desc: "Логин и пароль для вашего личного кабинета.", pass_strength: "Сложность пароля", confirm_pass_label: "Подтвердите новый пароль",
    confirm_pass_placeholder: "Повторите пароль...", skip_for_now: "Пропустить пока", save_and_finish: "Сохранить и Завершить", approved_title: "Подтверждено!", checking_title: "На проверке",
    start_over: "Начать сначала (Выйти)", upload_image: "Загрузить фото", merchant_login_title: "Вход для партнеров", merchant_login_desc: "Войдите в панель управления вашего магазина.", no_account_merchant: "Нет аккаунта?",
    merchant_signup_1: "Развивайте свой", merchant_signup_2: "бизнес", merchant_signup_desc: "Присоединяйтесь к TalabaPass. Предлагайте свои услуги тысячам студентов и привлекайте новых клиентов.",
    business_type_title: "Сфера деятельности", business_type_desc: "К какой категории относятся ваши услуги?", store_name_title: "Название магазина", store_name_desc: "Клиенты будут находить вас по этому имени.",
    address_time_title: "Адрес и Время", address_time_desc: "Чтобы клиенты могли легко вас найти.", address_label: "Адрес", locate_gps: "Определить по GPS", locating: "Поиск на карте...",
    work_time_label: "Время работы", logo_title: "Логотип магазина", logo_desc: "Загрузите логотип, чтобы ваш магазин красиво смотрелся в приложении (необязательно).", approved_desc_merchant: "Ваш магазин успешно активирован.",
    checking_desc_merchant: "Ваша заявка отправлена администратору. Обычно проверка занимает 10-30 минут.", welcome_1: "Добро пожаловать!", welcome_2: "Войдите в систему",
    student_id_placeholder: "Введите ваш ID", no_account_student: "Нет аккаунта?", introduce_title: "Представьтесь", full_name_label: "Полное имя (Имя и Фамилия)",
    student_data_title: "Данные студента", university_label: "Университет", select_uni: "Выберите университет...", complex_password: "Сложный Пароль", agree_terms: "Я прочитал и согласен с Условиями использования и Политикой конфиденциальности.",
    id_card_title: "Студенческий ID или Справка", id_card_desc: "Сфотографируйте свой студенческий билет или загрузите электронную версию.", open_camera: "Включить камеру",
    upload_gallery: "Загрузить из галереи", avatar_title: "Фото профиля", avatar_desc: "Загрузите фото с вашим лицом для приложения.", approved_desc_student: "Ваши данные успешно приняты.",
    welcome_biz: "Добро пожаловать!", total_customers: "Всего клиентов", active_discounts: "Активные скидки", total_views: "Просмотры скидок", new_btn: "Новый", pending: "Ожидание",
    no_active_discounts: "Пока нет активных скидок", new_discount_title: "Новая скидка", upload_horizontal_img: "Загрузите гориз. фото (16:9)", short_desc_label: "Краткое описание (для главной)",
    short_desc_placeholder: "Напр: Скидка 20% на всю одежду", products_label: "Введите товары (2 пробела после названия)", products_placeholder: "Напр: Большой Бургер  (2 пробела)", quantity_placeholder: "Кол",
    unlimited: "Безлим", discount_percent_label: "Процент Скидки (%)", start_date: "Начало", end_date: "Конец", start_time: "Время (с)", end_time: "Время (до)", cancel: "Отмена",
    post_btn: "Опубликовать", search_student: "Поиск Студента", scan_qr_desc: "Наведите камеру на QR-код на ID карте", confirm_purchase: "Подтвердить", select_product_desc: "Выберите приобретаемый товар",
    no_history: "Пока нет истории", no_history_desc: "Здесь появятся отсканированные клиенты", edit_store_info: "Редактировать данные магазина", old_password: "Старый пароль", new_password: "Новый пароль",
    save_btn: "Сохранить", store_info_title: "Данные магазина", change_password_optional: "Изменить пароль (необязательно)", current_pass_placeholder: "Текущий пароль...", new_pass_placeholder: "Новый пароль...",
    personal_info: "Личная информация", go_admin_panel: "Перейти в Панель Админа", first_name_label: "Имя", last_name_label: "Фамилия", install_app: "Установить приложение", fast_and_easy: "Для быстрой работы"
  }
};

type ContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof dictionary.uz) => string;
};

const LanguageContext = createContext<ContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('talabapass_lang') as Language) || 'uz';
  });
  
  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem('talabapass_lang', newLang);
    setLangState(newLang);
  }, []);
  
  const t = useCallback((key: keyof typeof dictionary.uz) => {
    return dictionary[lang]?.[key] || dictionary.uz[key] || key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}