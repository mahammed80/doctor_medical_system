'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'ar' | 'en'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
  isRtl: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  ar: {
    // Navigation
    nav_home: 'الرئيسية',
    nav_about: 'عن الدكتور',
    nav_steps: 'خطوات الحجز',
    nav_packages: 'الباقات',
    nav_testimonials: 'آراء المرضى',
    nav_faq: 'الأسئلة الشائعة',
    nav_start: 'ابدأ الاستشارة',
    logo_sub: 'استشاري جراحة العظام والمفاصل أونلاين',
    footer_desc: 'منصة استشارات طبية متكاملة مع د. خالد بترجي، لتقديم رعاية صحية ممتازة وتجربة استشارية آمنة وموثوقة من منزلك.',
    footer_links: 'روابط سريعة',
    footer_rights: 'جميع الحقوق محفوظة',

    // Hero Section
    hero_badge: 'مركز بترجي للاستشارات الطبية التخصصية',
    hero_title_dr: 'د. خالد بترجي',
    hero_title_title: 'استشاري جراحة العظام والمفاصل',
    hero_title_sub: 'رعاية طبية فائقة لجراحات الركبة والمفاصل الصناعية والمناظير أونلاين من منزلك',
    hero_para: 'أول منصة استشارات طبية متكاملة تجمع بين خبرة الاستشاريين وسهولة التقنية. احجز استشارتك المرئية في دقائق، وارفع فحوصاتك وتقاريرك بخصوصية تامة وتلقى التشخيص والخطة العلاجية من منزلك.',
    hero_btn_start: 'ابدأ الاستشارة الآن',
    hero_btn_about: 'تعرّف على الدكتور',
    hero_status_online: 'رئيس مجلس إدارة المركز (متاح للحجز)',

    // Hero Stats
    stat_experience_num: '35+',
    stat_experience_label: 'سنة من الخبرة',
    stat_experience_desc: 'في جراحة العظام والمفاصل',
    stat_online_num: '100%',
    stat_online_label: 'استشارة أون لاين',
    stat_online_desc: 'مرئية، آمنة ومريحة',
    stat_satisfaction_num: '1,500+',
    stat_satisfaction_label: 'مريض تم علاجهم',
    stat_satisfaction_desc: 'بنسبة رضا تفوق 98%',

    // Expertise Bar
    exp_joints: 'جراحة العظام والمفاصل',
    exp_scopes: 'المناظير الجراحية',
    exp_pain: 'علاج الآلام المزمنة',
    exp_rehab: 'تأهيل ما بعد العمليات',
    exp_online: 'استشارات أون لاين',

    // Achievement Counters
    counter_patients_label: 'مريض',
    counter_patients_sub: 'تمت استشارتهم',
    counter_experience_label: 'عاماً',
    counter_experience_sub: 'خبرة في المجال الطبي',
    counter_satisfaction_label: 'رضا المرضى',
    counter_satisfaction_sub: 'نسبة تقييمات إيجابية',
    counter_response_label: 'ساعة',
    counter_response_sub: 'الرد على الاستفسارات',

    // Doctor Qualifications
    qual_label: 'المؤهلات العلمية',
    qual_title: 'خبرة تمتد لأكثر من ثلاثة عقود',
    qual_desc: 'يتمتع الدكتور خالد بترجي بسيرة ذاتية حافلة بالإنجازات الأكاديمية والعملية في مجال جراحة العظام والمفاصل، مع أكثر من 35 عاماً من الخبرة المتراكمة.',
    qual_btn: 'احجز استشارتك',
    qual_1991_title: 'تأسيس مركز بترجي الطبي',
    qual_1991_inst: 'رؤية لتقديم أفضل الخدمات الطبية التخصصية',
    qual_2012_title: 'إطلاق العيادات المتكاملة',
    qual_2012_inst: 'توسعة الأقسام لتشمل العمود الفقري والروماتيزم والتأهيل',
    qual_2020_title: 'التكامل الرقمي الكامل',
    qual_2020_inst: 'تحويل جميع الاستشارات إلى استشارات مرئية تفاعلية عن بعد',
    qual_2026_title: 'نظام الاستشارات المطور',
    qual_2026_inst: 'إطلاق المنصة الجديدة وتفعيل ميزات التخزين الطبي الآمن وتوصيل الأدوية',

    // How it Works
    steps_label: 'خطوات الحجز',
    steps_title: 'كيف تعمل الخدمة؟',
    steps_subtitle: 'من التسجيل إلى الجلسة مع الدكتور في 4 خطوات بسيطة',
    step1_title: 'احجز الاستشارة',
    step1_desc: 'اختر الباقة الطبية المناسبة لحالتك لبدء حجز موعدك',
    step2_title: 'سجّل بياناتك الطبية',
    step2_desc: 'املأ معلوماتك الشخصية وارفع الأشعة والتحاليل في دقائق',
    step3_title: 'سدد الرسوم بأمان',
    step3_desc: 'ادفع عبر بوابات الدفع الإلكتروني المعتمدة والسريعة',
    step4_title: 'احجز موعدك وتواصل',
    step4_desc: 'اختر الموعد المناسب لجلستك المرئية المباشرة مع الطبيب',

    // Packages & Pricing
    pricing_label: 'الباقات والأسعار',
    pricing_title: 'اختر الباقة المناسبة لك',
    pricing_subtitle: 'استشارات مرنة بأسعار تنافسية تناسب جميع الحالات',
    pkg_popular: 'الأكثر طلباً',
    pkg_basic_label: 'باقة أساسية',
    pkg_advanced_label: 'باقة مطورة',
    pkg_btn_choose: 'اختر الباقة',
    pkg_btn_book: 'احجز الآن',
    currency_sar: 'ريال',
    
    pkg_basic_title: 'الكشف الأساسي',
    pkg_basic_desc: 'جلسة استشارية شاملة لمدة 30 دقيقة مع الطبيب لتقييم حالتك وتشخيصها بدقة.',
    pkg_basic_f1: 'كشفية أساسية مع الاستشاري',
    pkg_basic_f2: 'عرض وتحليل الأشعة والتحاليل',
    pkg_basic_f3: 'تشخيص طبي دقيق للحالة',
    pkg_basic_f4: 'مدة الجلسة: 30 دقيقة',
    pkg_basic_f5: 'متابعة مجانية لمدة 10 أيام',

    pkg_comprehensive_title: 'الكشف الشامل والخطة العلاجية',
    pkg_comprehensive_desc: 'استشارة موسعة مع إعداد برنامج علاجي متكامل وتقييم الحاجة للجراحة.',
    pkg_comprehensive_f1: 'كل ما في الباقة الأساسية',
    pkg_comprehensive_f2: 'إعداد برنامج علاجي متكامل',
    pkg_comprehensive_f3: 'تقييم الحاجة للجراحة',
    pkg_comprehensive_f4: 'مناقشة الخيارات البديلة والجراحية',
    pkg_comprehensive_f5: 'متابعة أولى مجانية بعد العملية',

    pkg_followup_title: 'باقات المتابعة المتعددة',
    pkg_followup_desc: 'جلسات متعددة بسعر مخفّض للمرضى المحتاجين لمتابعة مستمرة بعد العمليات.',
    pkg_followup_f1_template: 'باقة 3 جلسات بقيمة {p3} ريال',
    pkg_followup_f2_template: 'باقة 4 جلسات بقيمة {p4} ريال',
    pkg_followup_f3: 'توفير يصل إلى 200 ريال',
    pkg_followup_f4: 'متابعة ما بعد الجراحة وإصابات الملاعب',
    pkg_followup_f5: 'مرونة عالية في حجز المواعيد',

    // Why Choose Us
    why_label: 'لماذا د. خالد بترجي؟',
    why_title: 'رعاية طبية بمعايير عالمية من منزلك',
    why_desc: 'نضعك في قلب الرعاية الصحية. منصة متكاملة تجمع بين الخبرة الطبية والتقنية الحديثة لتوفير تجربة استشارية سلسة وآمنة.',
    why_btn: 'ابدأ الآن',
    why_stat_patients: 'مريض',
    why_stat_satisfaction: 'رضا المرضى',
    why_stat_response: 'ساعة للرد',
    why_trust_p1_num: 'بورد معتمد',
    why_trust_p1_label: 'بورد كندي وزمالة بريطانية',
    why_trust_p2_num: 'أمان تام',
    why_trust_p2_label: 'تشفير وحماية سرية الملفات',
    why_trust_p3_num: 'وصفة ذكية',
    why_trust_p3_label: 'وصفتك الطبية معتمدة رقمياً',
    
    why_f1_title: 'خبرة طبية عريقة',
    why_f1_desc: 'يحمل د. خالد بترجي درجات البورد والزمالات الكندية والبريطانية مع خبرة طبية تفوق 35 عاماً.',
    why_f2_title: 'خصوصية تامة للملفات',
    why_f2_desc: 'تشفير كامل لملفاتك وأشعاتك الطبية وفقاً لأعلى معايير الأمن السيبراني الطبية.',
    why_f3_title: 'جدولة مواعيد فورية',
    why_f3_desc: 'اختر وقتك المناسب مباشرة من جدول الطبيب المتاح دون فترات انتظار.',
    why_f4_title: 'دعم جميع الصيغ الطبية',
    why_f4_desc: 'ارفع تقاريرك وأشعاتك بسهولة فائقة بمختلف الصيغ الطبية بما فيها ملفات DICOM.',
    why_f5_title: 'توصيل الوصفة للمنزل',
    why_f5_desc: 'نوفر خدمة إرسال وصفتك الطبية المعتمدة رقمياً وتوصيل الأدوية مباشرة لباب بيتك.',
    why_f6_title: 'بوابة دفع آمنة ومعتمدة',
    why_f6_desc: 'خيارات دفع سعودية موثوقة تدعم بطاقات مدى، فيزا، ماستركارد، وأبل باي.',

    // Testimonials
    test_label: 'آراء المرضى',
    test_title: 'ماذا يقول مرضانا؟',
    test_1_text: 'المركز يقدم رعاية ممتازة جداً وخبرة طبية متميزة. استشرت د. خالد بترجي بخصوص عملية الركبة وكان تشخيصه دقيقاً جداً وأراحني كثيراً. وفر علي عناء السفر.',
    test_1_name: 'عبدالرحمن العتيبي',
    test_1_title: 'مريض (عيادة جراحة المفاصل)',
    test_2_text: 'تجربة حجز سهلة وسريعة للغاية، والأروع هو إمكانية رفع الأشعة وملفات الرنين المغناطيسي ليقوم د. خالد بترجي بتحليلها ووصف العلاج المناسب لي دون الحاجة لمغادرة المنزل.',
    test_2_name: 'نورة الدوسري',
    test_2_title: 'مريضة (جراحة العظام)',
    test_3_text: 'بعد إصابتي في الركبة، تواصلت مع د. خالد بترجي وأعدّ لي برنامج تأهيل حركي منزلي رائع وتابع معي خطوة بخطوة حتى عدت لممارسة الرياضة بشكل طبيعي.',
    test_3_name: 'فهد السبيعي',
    test_3_title: 'مريض (جراحة العظام والمفاصل)',

    // Medical Library
    lib_label: 'المكتبة الطبية',
    lib_title: 'موارد صحية لك',
    lib_desc: 'مقالات وإرشادات طبية من إعداد د. خالد بترجي لمساعدتك في رحلة علاجك',
    read_time_suffix: 'دقائق قراءة',

    // FAQ
    faq_label: 'الأسئلة الشائعة',
    faq_title: 'كل ما تريد معرفته عن الاستشارة',
    faq_desc: 'إجابات سريعة عن أكثر الأسئلة شيوعاً. إن كان لديك سؤال آخر، لا تتردد في التواصل معنا.',
    faq_1_q: 'كيف يمكنني حجز استشارة في مركز بترجي؟',
    faq_1_a: 'العملية بسيطة للغاية وتستغرق أقل من 5 دقائق: املأ بياناتك الطبية وأرفق الأشعة إن وجدت، قم بسداد رسوم الاستشارة بأمان، ثم اختر الموعد المناسب لك من جدول الطبيب المباشر لتلقي رابط الجلسة المرئية.',
    faq_2_q: 'ما هي تكلفة الاستشارة الطبية؟',
    faq_2_a_template: 'تختلف التكلفة حسب مستوى الكشف المختار: الكشف الأساسي بقيمة {p1} ريال، الكشف الشامل وإعداد الخطة العلاجية بقيمة {p2} ريال، كما تتوفر باقات للمتابعات المتعددة تبدأ من {p3} ريال لـ 3 جلسات.',
    faq_3_q: 'هل يمكنني مراجعة الطبيب مجاناً بعد الجلسة؟',
    faq_3_a: 'نعم، تشمل جميع الاستشارات الطبية كفترة مراجعة (متابعة مجانية) صالحة لمدة 10 أيام من تاريخ الجلسة الأساسية لمناقشة نتائج التحاليل أو تحديث خطة العلاج.',
    faq_4_q: 'هل خدمة توصيل الأدوية متاحة لجميع المرضى؟',
    faq_4_a: 'نعم، بعد استشارتك مع الطبيب، إذا قرر لك وصفة علاجية، يتم إرسالها لك إلكترونياً، ونوفر خيار توصيل الأدوية لباب منزلك بالتعاون مع كبرى الصيدليات المعتمدة.',
    faq_5_q: 'كيف أرفع الفحوصات وصور الأشعة الخاصة بي؟',
    faq_5_a: 'أثناء تعبئة نموذج الاستشارة، ستجد منطقة مخصصة لرفع الملفات، حيث يمكنك سحب وإفلات التقارير الطبية وصور الأشعة. يدعم نظامنا جميع الصيغ المعتمدة مثل PDF وJPG وPNG بالإضافة لصيغة DICOM للأشعات المتخصصة.',

    // Final CTA
    cta_badge: 'ابدأ رحلة علاجك اليوم',
    cta_title: 'استشر طبيبك الاستشاري من منزلك اليوم',
    cta_desc: 'احجز استشارتك الآن خلال دقائق وابدأ رحلة علاجك مع طبيبك الاستشاري. رعاية طبية تخصصية بمعايير عالمية في متناول يدك.',
    cta_btn: 'ابدأ الاستشارة',
    art_not_found: 'المقال غير موجود',
    art_not_found_desc: 'عذراً، المقال الذي تبحث عنه غير متوفر حالياً أو قد تم نقله.',
    art_back: 'العودة للرئيسية',
    art_written_by: 'كتب بواسطة:',
    art_published_in: 'نُشر في:',
    art_sidebar_q: 'هل تعاني من آلام المفاصل؟',
    art_sidebar_desc: 'احجز استشارتك الآن مع الدكتور خالد بترجي من منزلك لتلقي التشخيص الدقيق والخطة العلاجية المناسبة عبر محادثة آمنة.',
    art_sidebar_btn: 'ابدأ الاستشارة الآن',
    art_related: 'مقالات ذات صلة',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_about: 'About Dr.',
    nav_steps: 'Steps',
    nav_packages: 'Packages',
    nav_testimonials: 'Testimonials',
    nav_faq: 'FAQ',
    nav_start: 'Start Consultation',
    logo_sub: 'Orthopedic & Joint Consultant Online',
    footer_desc: 'An integrated medical consultation platform with Dr. Khalid Batterjee, providing excellent healthcare and a secure, reliable consultation experience from your home.',
    footer_links: 'Quick Links',
    footer_rights: 'All rights reserved',

    // Hero Section
    hero_badge: 'Batterjee Center for Specialized Medical Consultations',
    hero_title_dr: 'Dr. Khalid Batterjee',
    hero_title_title: 'Consultant Orthopedic & Joint Surgeon',
    hero_title_sub: 'Premium medical care for knee surgery, joint replacements, and arthroscopy online from your home',
    hero_para: 'The first integrated medical consultation platform combining consultant expertise with ease of technology. Book your video consultation in minutes, upload your medical files in complete privacy, and receive your diagnosis and treatment plan from home.',
    hero_btn_start: 'Start Consultation Now',
    hero_btn_about: 'Meet the Doctor',
    hero_status_online: 'Board Chairman (Available for booking)',

    // Hero Stats
    stat_experience_num: '35+',
    stat_experience_label: 'Years of Experience',
    stat_experience_desc: 'In orthopedic and joint surgery',
    stat_online_num: '100%',
    stat_online_label: 'Online Consultations',
    stat_online_desc: 'Video, secure & convenient',
    stat_satisfaction_num: '1,500+',
    stat_satisfaction_label: 'Patients Treated',
    stat_satisfaction_desc: 'With satisfaction rate exceeding 98%',

    // Expertise Bar
    exp_joints: 'Orthopedics & Joint Surgery',
    exp_scopes: 'Arthroscopic Surgery',
    exp_pain: 'Chronic Pain Treatment',
    exp_rehab: 'Post-Operative Rehab',
    exp_online: 'Online Consultations',

    // Achievement Counters
    counter_patients_label: 'Patients',
    counter_patients_sub: 'Consulted online',
    counter_experience_label: 'Years',
    counter_experience_sub: 'Of experience in medicine',
    counter_satisfaction_label: 'Satisfaction Rate',
    counter_satisfaction_sub: 'Exceeding 98% positive reviews',
    counter_response_label: 'Hours',
    counter_response_sub: 'Response time for queries',

    // Doctor Qualifications
    qual_label: 'Qualifications',
    qual_title: 'Experience extending over three decades',
    qual_desc: 'Dr. Khalid Batterjee has a rich biography of academic and practical achievements in the field of orthopedic and joint surgery, with more than 35 years of cumulative experience.',
    qual_btn: 'Book Consultation',
    qual_1991_title: 'Establishment of Batterjee Medical Center',
    qual_1991_inst: 'A vision to provide the best specialized medical services',
    qual_2012_title: 'Launching Integrated Clinics',
    qual_2012_inst: 'Expanding departments to include spine, rheumatology, and rehabilitation',
    qual_2020_title: 'Complete Digital Integration',
    qual_2020_inst: 'Converting all consultations into interactive remote video consultations',
    qual_2026_title: 'Developed Consultation System',
    qual_2026_inst: 'Launching the new platform, enabling secure medical storage and medicine delivery',

    // How it Works
    steps_label: 'How it Works',
    steps_title: 'Simple Steps to Book',
    steps_subtitle: 'From registration to the session with the doctor in 4 simple steps',
    step1_title: 'Book Consultation',
    step1_desc: 'Choose the medical package suitable for your condition to start booking',
    step2_title: 'Record Medical Data',
    step2_desc: 'Fill in your personal information and upload x-rays and lab tests in minutes',
    step3_title: 'Pay Securely',
    step3_desc: 'Pay via secure and fast electronic payment gateways',
    step4_title: 'Book Appointment & Connect',
    step4_desc: 'Choose the suitable appointment for your direct video session with the doctor',

    // Packages & Pricing
    pricing_label: 'Packages & Pricing',
    pricing_title: 'Choose the Right Package',
    pricing_subtitle: 'Flexible consultations at competitive prices to suit all cases',
    pkg_popular: 'Most Popular',
    pkg_basic_label: 'Basic Package',
    pkg_advanced_label: 'Premium Package',
    pkg_btn_choose: 'Choose Package',
    pkg_btn_book: 'Book Now',
    currency_sar: 'SAR',

    pkg_basic_title: 'Basic Consultation',
    pkg_basic_desc: 'A comprehensive 30-minute consultation session with the doctor to accurately evaluate and diagnose your condition.',
    pkg_basic_f1: 'Basic checkup with the consultant',
    pkg_basic_f2: 'Review and analysis of x-rays and lab tests',
    pkg_basic_f3: 'Accurate medical diagnosis of the condition',
    pkg_basic_f4: 'Session duration: 30 minutes',
    pkg_basic_f5: 'Free follow-up for 10 days',

    pkg_comprehensive_title: 'Comprehensive Consultation & Plan',
    pkg_comprehensive_desc: 'An extended consultation with the preparation of an integrated treatment program and evaluation of the need for surgery.',
    pkg_comprehensive_f1: 'All features of the basic package',
    pkg_comprehensive_f2: 'Preparation of an integrated treatment plan',
    pkg_comprehensive_f3: 'Evaluation of the need for surgery',
    pkg_comprehensive_f4: 'Discussion of surgical and alternative options',
    pkg_comprehensive_f5: 'First follow-up free after surgery',

    pkg_followup_title: 'Multiple Follow-up Packages',
    pkg_followup_desc: 'Multiple sessions at a discounted price for patients requiring continuous follow-up after surgery.',
    pkg_followup_f1_template: '3-session package for {p3} SAR',
    pkg_followup_f2_template: '4-session package for {p4} SAR',
    pkg_followup_f3: 'Savings up to 200 SAR',
    pkg_followup_f4: 'Post-operative and sports injury follow-ups',
    pkg_followup_f5: 'High flexibility in booking appointments',

    // Why Choose Us
    why_label: 'Why Dr. Batterjee?',
    why_title: 'World-class medical care from your home',
    why_desc: 'We put you at the heart of healthcare. An integrated platform combining medical expertise with modern technology to provide a seamless and secure consultation experience.',
    why_btn: 'Start Now',
    why_stat_patients: 'Patients',
    why_stat_satisfaction: 'Satisfaction',
    why_stat_response: 'Hours Response',
    why_trust_p1_num: 'Certified Board',
    why_trust_p1_label: 'Canadian Board & British Fellowship',
    why_trust_p2_num: 'Secure Data',
    why_trust_p2_label: 'Full privacy & file encryption',
    why_trust_p3_num: 'Digital Rx',
    why_trust_p3_label: 'Digitally approved prescriptions',
    
    why_f1_title: 'Vast Medical Experience',
    why_f1_desc: 'Dr. Khalid Batterjee holds Canadian and British board certifications and fellowships with over 35 years of experience.',
    why_f2_title: 'Complete File Privacy',
    why_f2_desc: 'Full encryption of your medical files and x-rays in accordance with the highest medical cybersecurity standards.',
    why_f3_title: 'Instant Booking',
    why_f3_desc: 'Choose your convenient time directly from the doctor\'s live schedule with no waiting times.',
    why_f4_title: 'All Medical Formats Supported',
    why_f4_desc: 'Upload your reports and x-rays with ease in various medical formats, including DICOM files.',
    why_f5_title: 'Home Prescription Delivery',
    why_f5_desc: 'We send your digitally certified medical prescription and arrange home delivery of medicines.',
    why_f6_title: 'Secure & Certified Payment',
    why_f6_desc: 'Trusted Saudi payment options supporting Mada, Visa, Mastercard, and Apple Pay.',

    // Testimonials
    test_label: 'Patient Reviews',
    test_title: 'What Do Our Patients Say?',
    test_1_text: 'The center provides excellent care and distinguished medical expertise. I consulted Dr. Khalid Batterjee regarding my knee surgery, and his diagnosis was highly accurate, saving me the trouble of traveling.',
    test_1_name: 'Abdulrahman Al-Otaibi',
    test_1_title: 'Patient (Joint Surgery Clinic)',
    test_2_text: 'An extremely easy and fast booking experience. The best part is the ability to upload x-rays and MRI files for Dr. Khalid Batterjee to analyze and prescribe the right treatment without leaving home.',
    test_2_name: 'Noura Al-Dossari',
    test_2_title: 'Patient (Orthopedic Surgery)',
    test_3_text: 'Following my knee injury, I contacted Dr. Khalid Batterjee. He prepared a wonderful home rehabilitation program and followed up with me step-by-step until I returned to sports naturally.',
    test_3_name: 'Fahd Al-Subeaei',
    test_3_title: 'Patient (Orthopedic & Joint Surgery)',

    // Medical Library
    lib_label: 'Medical Library',
    lib_title: 'Health Resources for You',
    lib_desc: 'Medical articles and guidelines prepared by Dr. Khalid Batterjee to help you in your treatment journey',
    read_time_suffix: 'min read',

    // FAQ
    faq_label: 'FAQ',
    faq_title: 'Everything You Need to Know',
    faq_desc: 'Quick answers to the most common questions. If you have another question, feel free to contact us.',
    faq_1_q: 'How can I book a consultation at Batterjee Center?',
    faq_1_a: 'The process is simple and takes less than 5 minutes: fill in your medical details, attach your x-rays if any, pay the consultation fees securely, and choose your appointment from the doctor\'s live schedule to receive the video session link.',
    faq_2_q: 'What is the cost of a medical consultation?',
    faq_2_a_template: 'Costs vary depending on the checkup package: Basic checkup is {p1} SAR, Comprehensive checkup is {p2} SAR, and multiple follow-up packages start at {p3} SAR for 3 sessions.',
    faq_3_q: 'Can I follow up with the doctor for free after the session?',
    faq_3_a: 'Yes, all medical consultations include a free follow-up period valid for 10 days from the main session date to discuss test results or update the treatment plan.',
    faq_4_q: 'Is medicine delivery available for all patients?',
    faq_4_a: 'Yes, after your consultation, if the doctor writes a prescription, it is sent electronically, and we offer home delivery of medications in cooperation with major pharmacies.',
    faq_5_q: 'How do I upload my medical files and x-rays?',
    faq_5_a: 'While filling out the booking form, you will find a dedicated upload area where you can drag and drop reports and x-rays. Our system supports all major formats including PDF, JPG, PNG, and DICOM.',

    // Final CTA
    cta_badge: 'Start Your Treatment Today',
    cta_title: 'Consult Your Consultant Doctor from Home Today',
    cta_desc: 'Book your consultation now in minutes and start your treatment journey with your consultant doctor. World-class specialized medical care is at your fingertips.',
    cta_btn: 'Start Consultation',
    art_not_found: 'Article Not Found',
    art_not_found_desc: 'Sorry, the article you are looking for is currently unavailable or has been moved.',
    art_back: 'Back to Home',
    art_written_by: 'Written by:',
    art_published_in: 'Published in:',
    art_sidebar_q: 'Do you suffer from joint pain?',
    art_sidebar_desc: 'Book your consultation now with Dr. Khalid Batterjee from home to receive an accurate diagnosis and treatment plan via secure chat.',
    art_sidebar_btn: 'Start Consultation Now',
    art_related: 'Related Articles',
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ar')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('lang') as Language
      if (savedLang === 'ar' || savedLang === 'en') {
        setTimeout(() => {
          setLang(savedLang)
        }, 0)
      }
    }
  }, [])

  const handleSetLang = (newLang: Language) => {
    setLang(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', newLang)
    }
  }

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const t = (key: string): string => {
    const dict = translations[lang] as Record<string, string>
    return dict[key] || key
  }

  const isRtl = lang === 'ar'

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
