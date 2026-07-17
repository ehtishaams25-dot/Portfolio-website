// ============================================================================
// DiaPilot — 1-Click Arabic & RTL Figma Complete Automation Script (V3)
// ============================================================================
// Fixes:
// 1. Double-reversing bug (where running twice un-reversed screens like Clinics in image 2).
//    Uses visual coordinate checks & pluginData to guarantee every card is strictly RTL.
// 2. Swaps paddingLeft & paddingRight when mirroring so arrows have exact balanced padding.
// 3. Rotates directional arrows 180° (<--) so navigation vectors point left in RTL.
// ============================================================================

const ARABIC_TRANSLATIONS = {
  // Brand & Times
  "9:41": "9:41",
  "DiaPilot": "ديا-بايلوت",
  "01": "٠١", "02": "٠٢", "03": "٠٣", "04": "٠٤",
  "05": "٠٥", "06": "٠٦", "07": "٠٧", "08": "٠٨",

  // Main Headers & Taglines
  "Your Smart\nDiabetes\nCompanion": "رفيقك الذكي\nلمرض\nالسكري",
  "Your complete diabetes care hub": "مركزك المتكامل لرعاية السكري",
  "Get instant AI-powered guidance for diabetes, endocrinology & foot care — anytime, anywhere.": "احصل على توجيهات فورية مدعومة بالذكاء الاصطناعي لمرض السكري والغدد الصماء والعناية بالقدم — في أي وقت وفي أي مكان.",
  "Get Started": "ابدأ الآن",

  // Services & Navigation
  "Services": "الخدمات",
  "All Services": "جميع الخدمات",
  "Select a service to begin": "اختر خدمة للبدء",
  "Chat": "المحادثة",
  "Profile": "الملف الشخصي",

  // Topic Counts
  "3 topics available": "٣ مواضيع متاحة",
  "4 topics available": "٤ مواضيع متاحة",
  "5 topics available": "٥ مواضيع متاحة",
  "6 topics available": "٦ مواضيع متاحة",
  "7 topics available": "٧ مواضيع متاحة",
  "8 topics available": "٨ مواضيع متاحة",

  // Categories & Main Clinics
  "Clinics": "العيادات",
  "Diabetes Clinic": "عيادة السكري",
  "Type 1 & Type 2 management": "إدارة النوع الأول والنوع الثاني",
  "Endocrinology Clinic": "عيادة الغدد الصماء",
  "Hormonal health specialists": "أخصائيو الصحة الهرمونية",
  "Diabetic Foot Clinic": "عيادة القدم السكري",
  "Wound care & prevention": "العناية بالجروح والوقاية منها",
  "Ophthalmology Clinic": "عيادة طب العيون",
  "Eye health & retinal screening": "صحة العين وفحص الشبكية",
  "Optometry Clinic": "عيادة البصريات",
  "Vision testing & eyeglasses": "فحص النظر والنظارات الطبية",
  "Clinical Nutrition": "التغذية السريرية",
  "Personalised dietary counseling": "استشارات غذائية مخصصة",
  "Health Education": "التثقيف الصحي",
  "Courses, videos & brochures": "دورات، فيديوهات، ونشرات إرشادية",
  "Oral & Dental Health": "صحة الفم والأسنان",
  "Gum disease & dental care": "أمراض اللثة والعناية بالأسنان",
  "Appointments": "المواعيد",
  "Eye Care & Optometry": "العناية بالعيون والبصريات",
  "Diabetic Foot Care": "العناية بالقدم السكري",
  "Nutrition": "التغذية",
  "Diabetes Management": "إدارة السكري",
  "Living with Diabetes": "التعايش مع السكري",
  "Administration & Support": "الإدارة والدعم",

  // 1. Appointments Sub-items
  "Book an appointment": "حجز موعد",
  "Schedule a new visit": "جدولة زيارة جديدة",
  "Reschedule an appointment": "إعادة جدولة موعد",
  "Change an existing booking": "تغيير موعد حالي",
  "Cancel an appointment": "إلغاء موعد",
  "Cancel an upcoming visit": "إلغاء زيارة قادمة",
  "Appointment inquiries": "استفسارات المواعيد",
  "Questions about your booking": "أسئلة حول حجزك",

  // 2. Eye Care & Optometry Sub-items
  "When do I need an eye examination?": "متى أحتاج إلى فحص للعين؟",
  "Frequency guidelines for diabetics": "إرشادات الفحص الدوري لمرضى السكري",
  "Retinal screening": "فحص الشبكية",
  "Diabetic retinopathy detection": "الكشف عن اعتلال الشبكية السكري",
  "Pediatric optometry": "بصريات الأطفال",
  "Children's eye health": "صحة عيون الأطفال",
  "Eyeglasses": "النظارات الطبية",
  "Prescriptions & frames": "الوصفات الطبية والإطارات",
  "Vision problems": "مشاكل الرؤية",
  "Blurry vision & other concerns": "تشوش الرؤية ومخاوف أخرى",

  // 3. Diabetic Foot Care Sub-items
  "Risk assessment": "تقييم المخاطر",
  "Check your foot health status": "تحقق من حالة صحة قدميك",
  "Daily foot care": "العناية اليومية بالقدم",
  "Inspection & hygiene tips": "نصائح الفحص والنظافة الشخصية",
  "Wound care": "العناية بالجروح",
  "Treatment for cuts & ulcers": "علاج الجروح والقرح",
  "Medical footwear": "الأحذية الطبية",
  "Diabetic-friendly shoes & insoles": "أحذية ونعال مخصصة لمرضى السكري",
  "When should I visit the clinic?": "متى يجب علي زيارة العيادة؟",
  "Warning signs to watch for": "علامات تحذيرية يجب الانتباه لها",

  // 4. Nutrition Sub-items
  "Personalised meal plans": "خطط وجبات مخصصة",
  "Tailored to your health goals": "مصممة خصيصاً لأهدافك الصحية",
  "Carbohydrate counting": "حساب الكربوهيدرات",
  "Managing blood sugar through diet": "التحكم في سكر الدم عبر الغذاء",
  "Healthy meal recommendations": "توصيات لوجبات صحية",
  "Diabetes-friendly recipes": "وصفات صحية لمرضى السكري",
  "Weight management": "إدارة الوزن",
  "Healthy weight for diabetes control": "الوزن الصحي للتحكم في السكري",

  // 5. Diabetes Management Sub-items
  "Low blood sugar (Hypoglycemia)": "انخفاض سكر الدم (هبوط السكر)",
  "Signs, causes & treatment": "الأعراض، الأسباب، والعلاج",
  "High blood sugar (Hyperglycemia)": "ارتفاع سكر الدم",
  "Managing elevated glucose": "التعامل مع ارتفاع الجلوكوز",
  "Insulin": "الأنسولين",
  "Types, storage & administration": "الأنواع، التخزين، وطريقة الاستخدام",
  "Insulin pump": "مضخة الأنسولين",
  "Continuous subcutaneous delivery": "الضخ المستمر تحت الجلد",
  "Continuous Glucose Monitor (CGM)": "جهاز المراقبة المستمرة للجلوكوز (CGM)",
  "Real-time glucose tracking": "تتبع الجلوكوز في الوقت الفعلي",
  "HbA1c": "مخزون السكري (HbA1c)",
  "3-month average blood glucose": "متوسط سكر الدم خلال ٣ أشهر",

  // 6. Oral & Dental Health Sub-items
  "Gum disease": "أمراض اللثة",
  "Periodontitis & the diabetes link": "التهاب اللثة وعلاقته بالسكري",
  "Oral hygiene": "نظافة الفم",
  "Brushing, flossing & care tips": "نصائح تنظيف الأسنان بالفرشاة والخيط",
  "Dental appointments": "مواعيد عيادة الأسنان",
  "Book a dental checkup": "حجز فحص دوري للأسنان",

  // 7. Health Education Sub-items
  "Educational videos": "فيديوهات تعليمية",
  "Watch & learn at your own pace": "شاهد وتعلم بالسرعة التي تناسبك",
  "PDF resources": "مصادر ومستندات PDF",
  "Downloadable patient guides": "أدلة إرشادية للمرضى قابلة للتحميل",
  "Educational brochures": "كتيبات تثقيفية",
  "Quick reference materials": "مواد مرجعية سريعة",
  "Courses": "دورات تدريبية",
  "Structured learning programmes": "برامج تعليمية منظمة",
  "Frequently Asked Questions": "الأسئلة الشائعة",
  "Common diabetes questions answered": "إجابات على أسئلة السكري الشائعة",

  // 8. Living with Diabetes Sub-items
  "💜 \"I'm feeling anxious about living with diabetes.\"": "💜 \"أشعر بالقلق والتوتر بشأن التعايش مع السكري.\"",
  "Share how you're feeling — our AI is here to listen.": "شاركنا بمشاعرك — مساعدنا الذكي هنا للاستماع والمساعدة.",
  "Coping with diabetes": "التأقلم مع السكري",
  "Building resilience day by day": "بناء المرونة النفسية يوماً بعد يوم",
  "Emotional & psychological support": "الدعم النفسي والعاطفي",
  "You don't have to face this alone": "لست مضطراً لمواجهة هذا بمفردك",
  "Living well with diabetes": "الحياة الصحية مع السكري",
  "Thriving, not just managing": "الازدهار، وليس مجرد التعايش",
  "Managing diabetes at school": "إدارة السكري في المدرسة",
  "For children & young adults": "للأطفال والشباب",
  "Travelling with diabetes": "السفر مع السكري",
  "Stay safe while you explore the world": "حافظ على سلامتك أثناء استكشاف العالم",
  "Physical activity & exercise": "النشاط البدني والرياضة",
  "Move well, live well": "تحرك جيداً، تعش بصحة",
  "Managing diabetes during Ramadan": "إدارة السكري خلال شهر رمضان",
  "Fasting safely with expert guidance": "الصيام بأمان مع إرشادات الخبراء",

  // 9. Administration & Support Sub-items
  "Working hours": "ساعات العمل",
  "When we're available": "أوقات توفرنا لخدمتك",
  "Clinic locations": "مواقع العيادات",
  "Find a center near you": "ابحث عن أقرب فرع لك",
  "Complaints": "الشكاوى",
  "Share your concerns": "شاركنا بملاحظاتك وشكاويك",
  "Suggestions": "المقترحات",
  "Help us improve our service": "ساعدنا في تحسين خدماتنا",
  "Contact information": "معلومات الاتصال",
  "Phone, email & more": "الهاتف، البريد الإلكتروني والمزيد",
  "Forms": "النماذج والاستمارات",
  "Patient registration & consent": "تسجيل المرضى ونماذج الموافقة",
  "Electronic services": "الخدمات الإلكترونية",
  "Online portal & digital tools": "البوابة الإلكترونية والأدوات الرقمية",

  // AI Assistant & Chat
  "Ask AI Assistant": "اسأل المساعد الذكي",
  "Get personalised answers instantly": "احصل على إجابات مخصصة فوراً",
  "AI Assistant": "المساعد الذكي",
  "AI Powered · Online": "مدعوم بالذكاء الاصطناعي · متصل",
  "Chat with DiaPilot": "تحدث مع ديا-بايلوت",
  "Ask anything about your health": "اسأل أي شيء عن صحتك",
  "Hello...": "مرحباً...",
  "How can I help you today?": "كيف يمكنني مساعدتك اليوم؟",
  "Type your message...": "اكتب رسالتك هنا...",
  "Try typing something like this, or tap a suggestion below.": "جرب كتابة شيء كهذا، أو اضغط على أحد الاقتراحات أدناه.",

  // Chat Prompts & Messages
  "\"Hello, I'm Mohammed, and I have Type 1 Diabetes.\"": "\"مرحباً، أنا محمد وأعاني من السكري النوع الأول.\"",
  "I'm experiencing pain in my foot.": "أشعر بألم في قدمي.",
  "I'd like to book an appointment.": "أرغب في حجز موعد.",
  "How do I use insulin?": "كيف أستخدم الأنسولين؟",
  "Where is the clinic located?": "أين تقع العيادة؟",
  "My child has diabetes. When should they have an eye examination?": "طفلي مصاب بالسكري. متى يجب إجراء فحص للعين؟",
  "I'd like to speak with a staff member.": "أرغب في التحدث مع أحد موظفي الدعم.",
  "I need information about nutrition.": "أحتاج إلى معلومات حول التغذية.",
  "For foot pain related to diabetes, early assessment is important. Diabetic foot complications can develop quickly. I can help you book an appointment with our Diabetic Foot Clinic — would you like to check available slots?": "بالنسبة لآلام القدم المرتبطة بالسكري، التقييم المبكر أمر بالغ الأهمية حيث يمكن أن تتطور المضاعفات بسرعة. يمكنني مساعدتك في حجز موعد مع عيادة القدم السكري لدينا — هل ترغب في التحقق من الأوقات المتاحة؟"
};

async function runArabicRTLAutomation() {
  const page = figma.currentPage;
  const allTopFrames = page.children.filter(n => n.type === 'FRAME');

  figma.notify('🌐 Fixing RTL order, right-alignment, and arrow rotations...');

  // 1. Process existing frames that have "Arabic Version" in their name (or user selection if any)
  let targetFrames = allTopFrames.filter(f => f.name.includes('Arabic Version'));
  
  // If user explicitly selected specific Arabic frames, prioritize those
  const selectedArabicFrames = page.selection.filter(n => n.type === 'FRAME' && n.name.includes('Arabic Version'));
  if (selectedArabicFrames.length > 0) {
    targetFrames = selectedArabicFrames;
  }

  if (targetFrames.length > 0) {
    for (const arabicFrame of targetFrames) {
      await convertNodeToArabicRTL(arabicFrame);
    }
  } else {
    // 2. Only if no Arabic duplicate exists on the page at all, clone English frames
    const englishFrames = allTopFrames.filter(f => !f.name.includes('Arabic Version'));
    for (const frame of englishFrames) {
      const hasDuplicateBelow = allTopFrames.some(
        af => af.name.includes('Arabic Version') && Math.abs(af.x - frame.x) < 50 && af.y > frame.y
      );

      if (!hasDuplicateBelow) {
        const arabicFrame = frame.clone();
        arabicFrame.name = `${frame.name} - Arabic Version`;
        arabicFrame.y = frame.y + frame.height + 200;
        arabicFrame.x = frame.x;
        await convertNodeToArabicRTL(arabicFrame);
      }
    }
  }

  figma.notify('✅ Successfully fixed RTL right-alignment, section layout, and back arrows across all screens!');
}

// Helper to identify directional arrows, chevrons, and navigation back icons
function isDirectionalArrowNode(node) {
  if (!node || node.type === 'TEXT' || node.type === 'PAGE') return false;
  if (node.name.includes('Arabic Version')) return false;
  // If a frame has multiple children that are cards or text, it is not an arrow icon
  if ('children' in node && node.children && node.children.length > 2) return false;

  const lower = node.name.toLowerCase();
  const parentLower = (node.parent && node.parent.type !== 'PAGE') ? node.parent.name.toLowerCase() : '';
  const grandParentLower = (node.parent && node.parent.parent && node.parent.parent.type !== 'PAGE') ? node.parent.parent.name.toLowerCase() : '';

  const arrowKeywords = [
    'arrow', 'chevron', 'back', 'next', 'forward', 'caret', 'direction',
    'nav-right', 'arrow_forward', 'arrow_back', 'arrow-right', 'arrow-left'
  ];

  // Check node name, parent name, or grandparent name for directional keywords
  if (arrowKeywords.some(kw => lower.includes(kw))) return true;
  if ((node.type === 'VECTOR' || node.type === 'INSTANCE') && arrowKeywords.some(kw => parentLower.includes(kw) || grandParentLower.includes(kw))) return true;

  return false;
}

// Helper to check and rotate arrows 180° so right-pointing arrows point left (<-- / back)
function checkAndRotateArrow(node) {
  if (!isDirectionalArrowNode(node)) return;

  try {
    // If rotation is close to 0° (pointing right in LTR), rotate 180° so it points left in RTL
    if (Math.abs(node.rotation) < 5 || node.rotation > 355) {
      let centerX = node.x;
      let centerY = node.y;
      if ('width' in node && 'height' in node) {
        centerX = node.x + node.width / 2;
        centerY = node.y + node.height / 2;
      }

      node.rotation = (node.rotation + 180) % 360;

      // Re-center if inside a fixed/absolute container so the arrow doesn't shift out of its button circle
      if (node.parent && node.parent.layoutMode === 'NONE' && 'width' in node && 'height' in node) {
        node.x = centerX + node.width / 2;
        node.y = centerY + node.height / 2;
      }

      node.setPluginData('arrowRotated', 'true');
    }
  } catch (rotErr) {
    console.error(`Error rotating arrow "${node.name}":`, rotErr);
  }
}

async function convertNodeToArabicRTL(node) {
  // A. Text Translation & Strict Right Alignment (Headings, Body Text, Subtitles)
  if (node.type === 'TEXT') {
    const originalText = node.characters.trim();
    if (originalText && ARABIC_TRANSLATIONS[originalText]) {
      try {
        let targetFont = node.fontName;
        if (!targetFont || targetFont === figma.mixed) {
          targetFont = { family: 'Inter', style: 'Regular' };
        }

        try {
          await figma.loadFontAsync(targetFont);
          node.fontName = targetFont;
        } catch (fontErr) {
          await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
          node.fontName = { family: 'Inter', style: 'Regular' };
        }

        node.characters = ARABIC_TRANSLATIONS[originalText];
      } catch (err) {
        console.error(`Error translating text node "${node.name}":`, err);
      }
    }

    // Always enforce RIGHT horizontal alignment for any text inside Arabic RTL screens
    try {
      node.textAlignHorizontal = 'RIGHT';
      
      // If inside a vertical stack, align the text node to the right edge (MAX)
      if (node.parent && 'layoutMode' in node.parent && node.parent.layoutMode === 'VERTICAL') {
        if ('layoutAlign' in node && node.layoutAlign === 'MIN') {
          node.layoutAlign = 'MAX';
        }
      }
    } catch (alignErr) {
      console.error(`Error right-aligning text node "${node.name}":`, alignErr);
    }
  }

  // B. Vertical Auto Layout Right-Alignment (Title + Body Text stacks, sections)
  if ('layoutMode' in node && node.layoutMode === 'VERTICAL') {
    try {
      // In vertical auto layout, counterAxisAlignItems controls horizontal child alignment across width.
      // MIN = left (LTR), MAX = right (RTL).
      if (node.counterAxisAlignItems === 'MIN' || node.counterAxisAlignItems === 'CENTER') {
        node.counterAxisAlignItems = 'MAX';
      }
      if (node.children) {
        for (const child of node.children) {
          if ('layoutAlign' in child && child.layoutAlign === 'MIN') {
            child.layoutAlign = 'MAX';
          }
        }
      }
    } catch (vLayoutErr) {
      console.error(`Error adjusting vertical auto layout alignment for "${node.name}":`, vLayoutErr);
    }
  }

  // C. Horizontal Auto Layout Mirroring (Cards, Header Bars, Rows)
  if ('layoutMode' in node && node.layoutMode === 'HORIZONTAL') {
    if (node.children && node.children.length > 1) {
      try {
        // Pack horizontal items from right-to-left
        if (node.primaryAxisAlignItems === 'MIN') {
          node.primaryAxisAlignItems = 'MAX';
        }

        const firstChild = node.children[0];
        const lastChild = node.children[node.children.length - 1];

        // Helper to check if a node contains number prefix (like "01", "٠١") or text title
        const isNumberOrTitle = (n) => {
          if (n.type === 'TEXT') {
            const txt = n.characters.trim();
            return /^[0-9٠-٩]+/.test(txt) || txt.length > 0;
          }
          if ('children' in n && n.children) {
            return n.children.some(c => c.type === 'TEXT' && /^[0-9٠-٩]+/.test(c.characters.trim()));
          }
          return false;
        };

        // Helper to check if a child is or contains the directional/back arrow button
        const isArrowButton = (n) => {
          if (isDirectionalArrowNode(n)) return true;
          if ('children' in n && n.children && n.children.length <= 2) {
            return n.children.some(c => isDirectionalArrowNode(c));
          }
          return false;
        };

        // Semantic check: In LTR, number/title is on left (children[0]) and arrow/chevron is on right (children[last]).
        // In RTL, arrow/back button MUST be on the left (children[0]), and number/title MUST be on the right (children[last]).
        const isSemanticLTR = (isNumberOrTitle(firstChild) && isArrowButton(lastChild)) ||
                              (isArrowButton(lastChild) && !isArrowButton(firstChild));
        const isSemanticRTL = isArrowButton(firstChild) && isNumberOrTitle(lastChild);
        const isAlreadyMirrored = node.getPluginData('isMirrored') === 'true';

        // Reverse children if semantically in LTR order, or if unmirrored and not already in RTL order
        if (isSemanticLTR || (!isAlreadyMirrored && !isSemanticRTL)) {
          const childrenCopy = [...node.children];
          for (let i = childrenCopy.length - 1; i >= 0; i--) {
            node.appendChild(childrenCopy[i]);
          }

          // Swap paddingLeft and paddingRight so the back arrow on left and title/number on right get exact balanced margins
          if ('paddingLeft' in node && 'paddingRight' in node) {
            const tempPadding = node.paddingLeft;
            node.paddingLeft = node.paddingRight;
            node.paddingRight = tempPadding;
          }

          node.setPluginData('isMirrored', 'true');
        }
      } catch (layoutErr) {
        console.error(`Error mirroring horizontal layout for "${node.name}":`, layoutErr);
      }
    }
  }

  // D. Directional Arrow & Vector Rotation (Flip 180° so arrows point left <--)
  if (node.type === 'VECTOR' || node.type === 'INSTANCE' || node.type === 'FRAME' || node.type === 'GROUP') {
    checkAndRotateArrow(node);
  }

  // Recursively process children
  if ('children' in node && node.children) {
    for (const child of node.children) {
      await convertNodeToArabicRTL(child);
    }
  }
}

// Execute script
if (typeof figma !== 'undefined') {
  runArabicRTLAutomation().then(() => {
    if (typeof figma.closePlugin === 'function') figma.closePlugin();
  });
}
