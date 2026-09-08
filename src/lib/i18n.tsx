import React, { createContext, useContext, useState } from 'react';

type Language = 'uz' | 'en' | 'ru';

const dictionary = {
  uz: {
    // Navigatsiya
    discover: 'Kashf qilish',
    home_nav: 'Asosiy',
    profile_nav: 'Profil',
    
    // Profil va ID Karta
    my_pass: 'Mening ruxsatnomam',
    my_profile: 'Mening profilim',
    saved_offers: 'Saqlanganlar',
    history: 'Tarix',
    my_id: 'Mening ID kartam',
    verified: 'Tasdiqlangan',
    student_id: 'Talaba ID',
    saved_count: 'saqlangan',
    redemptions: 'ishlatilgan',
    upload_photo: 'Rasm yuklash',
    flip_card: 'Aylantirish',
    valid_until: 'Amal qilish muddati',
    issued: 'Berilgan sana',
    scan_barcode: 'Chegirma uchun shtrix kodni ko\'rsating',
    digital_id_desc: 'Sizning raqamli talaba guvohnomangiz',
    click_to_flip: 'Aylantirish uchun kartani bosing',
    
    // Sozlamalar
    settings: 'Sozlamalar',
    change_language: 'Tilni o\'zgartirish',
    dark_mode: 'Tungi mavzu',
    private_account: 'Private akkaunt',
    private_account_desc: 'Yopiq profil rejimi',
    on: 'Yoniq',
    off_status: 'O\'chiq',
    help_support: 'Yordam va ko\'rsatmalar',
    logout: 'Tizimdan chiqish',
    select_language: 'Tilni tanlang',

    // Asosiy sahifa va Kategoriyalar
    hero_title_1: 'Talabalik hayotingiz,',
    hero_title_2: 'biroz arzonroq.',
    hero_subtitle: 'Shahar bo\'ylab tasdiqlangan chegirmalar — talaba ID kartangiz bilan tayyor.',
    search_placeholder: 'Qahva, kurs yoki kerakli narsa qidiring...',
    category: 'Kategoriya',
    area: 'Hudud',
    all_categories: 'Barchasi',
    category_cafes: 'Kafelar',
    category_shops: 'Do\'konlar',
    category_learning: 'Ta\'lim',
    category_it: 'IT Xizmatlar',
    everywhere: 'Har joyda',
    offers_nearby: 'Yaqindagi chegirmalar',
    popular_now: 'Ommabop',
    just_arrived: 'Yangi qo\'shilganlar',
    close_to_you: 'Sizga yaqin',
    verified_students_only: 'Faqat tasdiqlangan talabalar uchun',
    every_redemption: 'Har bir chegirma talaba tekshiruvi orqali olinadi.',
    view_your_pass: 'Ruxsatnomani ko\'rish →',
    matching_offers: 'Mos keluvchi chegirmalar',
    your_search: 'Sizning qidiruvingiz',
    popular_with_students: 'Talabalar tanlovi',
    fresh_this_week: 'Bu haftadagi yangiliklar',
    short_walk_away: 'Bir qadam masofada',
    clear: 'Tozalash',
    back_to_discover: 'Bosh sahifa',
    
    // Xatoliklar va Holatlar
    no_offers_found: 'Chegirmalar topilmadi.',
    showing_results: 'Natijalar ko\'rsatilmoqda',
    nothing_found: 'Hech narsa topilmadi',
    no_saved_offers: 'Hozircha saqlangan chegirmalar mavjud emas.',
    offer_not_found: 'Chegirma topilmadi',

    // Chegirma sahifasi va modallar
    find_us: 'Manzilimiz',
    open_hours: 'Ish vaqti',
    check_before_you_go: 'Borishdan oldin tekshiring',
    verification_notice: 'Talaba maqomi chegirma vaqtida xavfsiz tekshiriladi.',
    redeem_offer: 'Chegirmani olish',
    students_say: 'Talabalar fikri',
    no_reviews: 'Hozircha sharhlar yo\'q. Birinchi bo\'lib o\'z fikringizni qoldiring.',
    good_to_know: 'Bilib qo\'ygan yaxshi',
    see_all: 'Barchasini ko\'rish',
    view_offer: 'Ko\'rish',
    off: 'CHEGIRMA',
    discount_amount: 'Chegirma:',
    service_type: 'XIZMATI',
    
    // Saqlash va Tasdiqlash
    removed_from_saved: 'Saqlanganlardan o\'chirildi',
    added_to_saved: 'Saqlanganlarga qo\'shildi',
    discount_code_ready: 'Chegirma kodi tayyor',
    checking: 'Tekshirilmoqda...',
    id_verified: 'Student ID tasdiqlandi',
    valid_at: 'da amal qiladi.',
    copy_code: 'Kodni nusxalash',
    verify_failed: 'Guvohnoma tasdiqlanmadi. Qaytadan urining.',
    
    // QR va Tasdiqlash
    qr_title: 'Sizning QR kodingiz',
    qr_desc: 'Chegirmani olish uchun ushbu QR kodni kassirga ko\'rsating.',
    refreshing_in: 'Yangilanishiga',
    sec: 'soniya',
    student_verified: 'Talaba maqomi tasdiqlangan',
    show_this_code: 'Shu kodni ko\'rsating',
    
    // Avtorizatsiya tugmalari
    login_btn: 'Kirish',
    register_btn: "Ro'yxatdan o'tish"
  },
  
  en: {
    // Navigation
    discover: 'Discover',
    home_nav: 'Home',
    profile_nav: 'Profile',
    
    // Profile & ID Card
    my_pass: 'My pass',
    my_profile: 'My profile',
    saved_offers: 'Saved offers',
    history: 'History',
    my_id: 'My ID',
    verified: 'Verified',
    student_id: 'Student ID',
    saved_count: 'saved',
    redemptions: 'redemptions',
    upload_photo: 'Upload Photo',
    flip_card: 'Flip Card',
    valid_until: 'Valid until',
    issued: 'Issued date',
    scan_barcode: 'Scan barcode for discount',
    digital_id_desc: 'Your digital student ID card',
    click_to_flip: 'Click card to flip',
    
    // Settings
    settings: 'Settings',
    change_language: 'Change language',
    dark_mode: 'Dark mode',
    private_account: 'Private account',
    private_account_desc: 'Closed profile mode',
    on: 'On',
    off_status: 'Off',
    help_support: 'Help and instructions',
    logout: 'Log out',
    select_language: 'Select language',

    // Home page & Categories
    hero_title_1: 'Your student life,',
    hero_title_2: 'a little less expensive.',
    hero_subtitle: 'Verified offers from places that know the city — ready when your student ID is.',
    search_placeholder: 'Find a coffee, course, or useful thing...',
    category: 'Category',
    area: 'Area',
    all_categories: 'All',
    category_cafes: 'Cafes',
    category_shops: 'Shops',
    category_learning: 'Learning',
    category_it: 'IT Services',
    everywhere: 'Everywhere',
    offers_nearby: 'Offers nearby',
    popular_now: 'Popular now',
    just_arrived: 'Just arrived',
    close_to_you: 'Close to you',
    verified_students_only: 'Verified students only',
    every_redemption: 'Every redemption starts with a student check.',
    view_your_pass: 'View your pass →',
    matching_offers: 'Matching offers',
    your_search: 'Your search',
    popular_with_students: 'Popular with students',
    fresh_this_week: 'Fresh this week',
    short_walk_away: 'A short walk away',
    clear: 'Clear',
    back_to_discover: 'Home',
    
    // States & Errors
    no_offers_found: 'No offers found.',
    showing_results: 'Showing results',
    nothing_found: 'Nothing found',
    no_saved_offers: 'No saved offers yet.',
    offer_not_found: 'Offer not found',

    // Discount detail & modals
    find_us: 'FIND US',
    open_hours: 'OPEN HOURS',
    check_before_you_go: 'Check before you go',
    verification_notice: 'Student verification happens securely at redemption.',
    redeem_offer: 'Redeem this offer',
    students_say: 'Students say',
    no_reviews: 'No reviews yet. Be the first student to leave a note.',
    good_to_know: 'Good to know',
    see_all: 'See all',
    view_offer: 'View offer',
    off: 'OFF',
    discount_amount: 'Discount:',
    service_type: 'SERVICE',

    // Saqlash va Tasdiqlash
    removed_from_saved: 'Removed from saved',
    added_to_saved: 'Added to saved',
    discount_code_ready: 'Discount code ready',
    checking: 'Checking...',
    id_verified: 'Student ID verified',
    valid_at: 'valid at',
    copy_code: 'Copy code',
    verify_failed: 'ID verification failed. Try again.',

    // QR and Verification
    qr_title: 'Your QR Code',
    qr_desc: 'Show this QR code to the cashier to redeem the offer.',
    refreshing_in: 'Refreshing in',
    sec: 'sec',
    student_verified: 'Student status verified',
    show_this_code: 'Show this code',
    
    // Auth buttons
    login_btn: 'Log in',
    register_btn: 'Sign up'
  },
  
  ru: {
    // Навигация
    discover: 'Изучать',
    home_nav: 'Главная',
    profile_nav: 'Профиль',
    
    // Профиль и ID карта
    my_pass: 'Мой пропуск',
    my_profile: 'Мой профиль',
    saved_offers: 'Сохраненные',
    history: 'История',
    my_id: 'Мой ID',
    verified: 'Подтвержден',
    student_id: 'ID Студента',
    saved_count: 'сохранено',
    redemptions: 'использовано',
    upload_photo: 'Загрузить фото',
    flip_card: 'Перевернуть',
    valid_until: 'Действителен до',
    issued: 'Дата выдачи',
    scan_barcode: 'Покажите штрих-код для скидки',
    digital_id_desc: 'Ваш цифровой студенческий билет',
    click_to_flip: 'Нажмите на карту, чтобы перевернуть',
    
    // Настройки
    settings: 'Настройки',
    change_language: 'Изменить язык',
    dark_mode: 'Темная тема',
    private_account: 'Приватный аккаунт',
    private_account_desc: 'Закрытый режим профиля',
    on: 'Вкл',
    off_status: 'Выкл',
    help_support: 'Помощь и инструкции',
    logout: 'Выйти',
    select_language: 'Выберите язык',

    // Главная страница и Категории
    hero_title_1: 'Ваша студенческая жизнь,',
    hero_title_2: 'немного дешевле.',
    hero_subtitle: 'Проверенные скидки от заведений города — доступны по вашему студенческому.',
    search_placeholder: 'Кофе, курсы или что-то полезное...',
    category: 'Категория',
    area: 'Район',
    all_categories: 'Все',
    category_cafes: 'Кафе',
    category_shops: 'Магазины',
    category_learning: 'Обучение',
    category_it: 'IT Услуги',
    everywhere: 'Везде',
    offers_nearby: 'Скидки рядом',
    popular_now: 'Популярное',
    just_arrived: 'Новинки',
    close_to_you: 'Близко к вам',
    verified_students_only: 'Только для студентов',
    every_redemption: 'Скидка предоставляется после проверки статуса.',
    view_your_pass: 'Посмотреть пропуск →',
    matching_offers: 'Подходящие скидки',
    your_search: 'Ваш поиск',
    popular_with_students: 'Выбор студентов',
    fresh_this_week: 'Новинки недели',
    short_walk_away: 'В двух шагах',
    clear: 'Очистить',
    back_to_discover: 'Главная',
    
    // Состояния и ошибки
    no_offers_found: 'Скидки не найдены.',
    showing_results: 'Показаны результаты',
    nothing_found: 'Ничего не найдено',
    no_saved_offers: 'Пока нет сохраненных скидок.',
    offer_not_found: 'Скидка не найдена',

    // Страница скидки и модальные окна
    find_us: 'НАШ АДРЕС',
    open_hours: 'ЧАСЫ РАБОТЫ',
    check_before_you_go: 'Уточняйте перед визитом',
    verification_notice: 'Проверка студенческого статуса происходит при получении.',
    redeem_offer: 'Получить скидку',
    students_say: 'Отзывы студентов',
    no_reviews: 'Пока нет отзывов. Оставьте первый комментарий.',
    good_to_know: 'Полезно знать',
    see_all: 'Смотреть все',
    view_offer: 'Смотреть',
    off: 'СКИДКА',
    discount_amount: 'Скидка:',
    service_type: 'СЕРВИС',

    // Saqlash va Tasdiqlash
    removed_from_saved: 'Удалено из сохраненных',
    added_to_saved: 'Добавлено в сохраненные',
    discount_code_ready: 'Код скидки готов',
    checking: 'Проверка...',
    id_verified: 'Студенческий ID подтвержден',
    valid_at: 'действителен в',
    copy_code: 'Копировать код',
    verify_failed: 'Не удалось подтвердить ID. Попробуйте снова.',

    // QR and Verification
    qr_title: 'Ваш QR-код',
    qr_desc: 'Покажите этот QR-код кассиру для получения скидки.',
    refreshing_in: 'Обновление через',
    sec: 'сек',
    student_verified: 'Статус студента подтвержден',
    show_this_code: 'Покажите этот код',
    
    // Кнопки авторизации
    login_btn: 'Войти',
    register_btn: 'Регистрация'
  }
};

type ContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof dictionary.uz) => string;
};

const LanguageContext = createContext<ContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('uz');
  
  const t = (key: keyof typeof dictionary.uz) => {
    return dictionary[lang][key] || dictionary.uz[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}