export type ArticleContent = {
  title: string
  summary: string
  tag: string
  readTime: string
  date: string
  author: string
  content: string // HTML content
}

export type Article = {
  slug: string
  ar: ArticleContent
  en: ArticleContent
}

export const ARTICLES: Article[] = [
  {
    slug: 'knee-arthroscopy-guide',
    ar: {
      title: 'دليل المريض الشامل لجراحات المفاصل والمنظار',
      summary: 'كل ما تحتاج معرفته عن كيفية التحضير لعملية المنظار وما يمكن توقعه في مرحلة التعافي.',
      tag: 'جراحة العظام',
      readTime: '5',
      date: '2026-05-18',
      author: 'د. خالد بترجي',
      content: `
        <h2>مقدمة حول جراحة منظار المفصل</h2>
        <p>تعتبر جراحة منظار المفصل (Arthroscopy) واحدة من أكبر الثورات الطبية في مجال جراحة العظام والمفاصل. هي إجراء جراحي قليل التوغل يتيح للجراحين رؤية داخل المفصل وتشخيص المشاكل وعلاجها باستخدام كاميرا صغيرة جداً وأدوات جراحية دقيقة تُدخل عبر شقوق صغيرة لا تتعدى بضعة مليمترات.</p>

        <h2>لماذا يُنصح بمنظار المفصل؟</h2>
        <p>يتم اللجوء للمنظار لتشخيص وعلاج مجموعة واسعة من مشاكل المفاصل، وأهمها مفصل الركبة والكتف، وتشمل:</p>
        <ul>
          <li>تمزق الغضروف الهلالي (Meniscal Tears).</li>
          <li>تمزق الرباط الصليبي الأمامي أو الخلفي (ACL/PCL Tears).</li>
          <li>التهاب بطانة المفصل وتراكم السوائل المستمر.</li>
          <li>وجود أجزاء سائبة من العظام أو الغضاريف داخل المفصل.</li>
          <li>مشاكل أوتار الكتف ومتلازمة الانحشار.</li>
        </ul>

        <h2>التحضير للعملية الجراحية: خطوة بخطوة</h2>
        <p>التحضير السليم يضمن نجاح الجراحة ويقلل من احتمالية حدوث أي مضاعفات. إليك أهم التوجيهات:</p>
        <ol>
          <li><strong>الفحوصات الطبية:</strong> سيطلب منك الطبيب إجراء تحاليل دم كاملة، وتخطيط للقلب، وأشعة سينية أو رنين مغناطيسي للمفصل للتخطيط الدقيق.</li>
          <li><strong>الأدوية الحالية:</strong> يجب إبلاغ الطبيب بكل الأدوية والمكملات التي تتناولها. قد يطلب منك إيقاف مسيلات الدم (مثل الأسبرين) قبل العملية بـ 5 إلى 7 أيام.</li>
          <li><strong>الصيام:</strong> يجب الامتناع تماماً عن الأكل والشرب لمدة 8 ساعات قبل موعد العملية (عادة بدءاً من منتصف الليلة السابقة).</li>
          <li><strong>التجهيز للمنزل:</strong> رتّب بيتك مسبقاً بحيث تكون الأغراض الضرورية قريبة منك، وتأكد من وجود شخص يرافقك للمنزل بعد العملية لأنك لن تتمكن من القيادة.</li>
        </ol>

        <h2>ماذا يحدث أثناء العملية?</h2>
        <p>تستغرق العملية عادة بين 30 إلى 90 دقيقة حسب نوع الإصابة، وتتم تحت تأثير التخدير النصفي أو العام. يقوم الجراح بعمل شقين أو ثلاثة شقوق صغيرة جداً، ويتم ضخ سائل معقم لتوسيع المفصل وتوضيح الرؤية للكاميرا، ثم يتم إصلاح الضرر باستخدام أدوات جراحية متناهية الصغر.</p>

        <h2>مرحلة التعافي والعودة للحياة الطبيعية</h2>
        <p>تتميز جراحات المنظار بسرعة التعافي مقارنة بالجراحة المفتوحة، ولكن الالتزام بالتعليمات التالية ضروري:</p>
        <ul>
          <li><strong>العناية بالشقوق:</strong> حافظ على جفاف ونظافة الضمادات. سيتم إزالة الغرز الطبية عادة خلال 10 إلى 14 يوماً.</li>
          <li><strong>بروتوكول R.I.C.E:</strong>
            <ul>
              <li><strong>الراحة (Rest):</strong> تجنب إجهاد المفصل في الأيام الأولى.</li>
              <li><strong>الثلج (Ice):</strong> ضع كمادات ثلج لمدة 20 دقيقة عدة مرات يومياً لتقليل التورم.</li>
              <li><strong>الضغط (Compression):</strong> استخدم المشد أو الرباط الضاغط لتثبيت المفصل وتقليل تجمع السوائل.</li>
              <li><strong>الرفع (Elevation):</strong> ارفع الساق بحيث تكون أعلى من مستوى القلب عند الاستلقاء.</li>
            </ul>
          </li>
          <li><strong>العلاج الطبيعي والتأهيل:</strong> يبدأ برنامج التأهيل الحركي مبكراً (أحياناً في اليوم التالي للعملية) لتقوية العضلات المحيطة بالمفصل واستعادة المدى الحركي الكامل.</li>
        </ul>

        <h2>متى يجب عليك الاتصال بالطبيب فوراً؟</h2>
        <p>رغم أمان العملية العالي، يجب التواصل مع المركز فوراً إذا لاحظت:</p>
        <ul>
          <li>ارتفاع في درجة حرارة الجسم (حمى).</li>
          <li>ألم حاد لا يستجيب للمسكنات الموصوفة.</li>
          <li>تزايد التورم أو الاحمرار حول المفصل بشكل ملحوظ.</li>
          <li>تسرب سوائل أو صديد من شقوق الجراحة.</li>
          <li>ضيق في التنفس أو ألم في ربلة الساق (السمانة).</li>
        </ul>
      `
    },
    en: {
      title: 'Comprehensive Patient Guide to Joint and Arthroscopic Surgery',
      summary: 'Everything you need to know about preparing for arthroscopic surgery and what to expect during recovery.',
      tag: 'Orthopedic Surgery',
      readTime: '5',
      date: '2026-05-18',
      author: 'Dr. Khalid Batterjee',
      content: `
        <h2>Introduction to Joint Arthroscopy</h2>
        <p>Arthroscopic surgery is a major medical revolution in orthopedics. It is a minimally invasive surgical procedure that allows surgeons to view inside the joint, diagnose problems, and treat them using a very small camera and precise surgical instruments inserted through tiny incisions no larger than a few millimeters.</p>

        <h2>Why is Arthroscopic Surgery Recommended?</h2>
        <p>Arthroscopy is used to diagnose and treat a wide range of joint conditions, most commonly in the knee and shoulder, including:</p>
        <ul>
          <li>Meniscal tears.</li>
          <li>Anterior or posterior cruciate ligament tears (ACL/PCL).</li>
          <li>Inflammation of the joint lining and chronic fluid buildup.</li>
          <li>Loose fragments of bone or cartilage inside the joint.</li>
          <li>Shoulder tendon problems and impingement syndrome.</li>
        </ul>

        <h2>Preparing for Surgery: Step-by-Step</h2>
        <p>Proper preparation ensures the success of the surgery and minimizes potential complications. Here are the key guidelines:</p>
        <ol>
          <li><strong>Medical Tests:</strong> Your doctor will request full blood analysis, an ECG, and X-rays or MRI of the joint for precise planning.</li>
          <li><strong>Current Medications:</strong> Inform your doctor of all medicines and supplements. You may need to stop blood thinners (like aspirin) 5 to 7 days before surgery.</li>
          <li><strong>Fasting:</strong> Abstain completely from food and drink for 8 hours before the procedure (usually starting from midnight the night before).</li>
          <li><strong>Home Preparation:</strong> Arrange your home beforehand so essential items are close by, and ensure someone accompanies you home since you cannot drive.</li>
        </ol>

        <h2>What Happens During the Procedure?</h2>
        <p>The surgery usually takes between 30 to 90 minutes depending on the injury, performed under regional or general anesthesia. The surgeon makes two or three tiny incisions, pumps sterile fluid to expand the joint and clear the view for the camera, then repairs the damage using micro-instruments.</p>

        <h2>Recovery Phase and Return to Normal Life</h2>
        <p>Arthroscopic surgeries feature faster recovery times compared to open surgery, but adherence to these guidelines is crucial:</p>
        <ul>
          <li><strong>Incision Care:</strong> Keep the dressings dry and clean. Sutures are typically removed in 10 to 14 days.</li>
          <li><strong>R.I.C.E Protocol:</strong>
            <ul>
              <li><strong>Rest:</strong> Avoid straining the joint during the first few days.</li>
              <li><strong>Ice:</strong> Apply cold packs for 20 minutes several times a day to reduce swelling.</li>
              <li><strong>Compression:</strong> Use a brace or compression bandage to stabilize the joint and reduce fluid retention.</li>
              <li><strong>Elevation:</strong> Elevate the leg above heart level when lying down.</li>
            </ul>
          </li>
          <li><strong>Physical Therapy & Rehab:</strong> The rehab program starts early (sometimes the day after surgery) to strengthen the surrounding muscles and restore full range of motion.</li>
        </ul>

        <h2>When to Contact Your Doctor Immediately?</h2>
        <p>Despite the high safety profile of the procedure, contact the medical center immediately if you experience:</p>
        <ul>
          <li>High body temperature (fever).</li>
          <li>Severe pain unresponsive to prescribed painkillers.</li>
          <li>Significantly increased swelling or redness around the joint.</li>
          <li>Fluid or pus discharge from the incisions.</li>
          <li>Shortness of breath or pain in the calf muscle.</li>
        </ul>
      `
    }
  },
  {
    slug: 'muscle-pain-vs-rheumatism',
    ar: {
      title: 'طرق التمييز بين آلام العضلات والروماتيزم',
      summary: 'دليل مبسط لمساعدتك في فهم طبيعة الألم ومتى يتعين عليك استشارة طبيب روماتيزم متخصص.',
      tag: 'الروماتيزم',
      readTime: '3',
      date: '2026-05-24',
      author: 'د. خالد بترجي',
      content: `
        <h2>مقدمة حول آلام الجهاز الحركي</h2>
        <p>يواجه الكثير من الأشخاص آلاماً في المفاصل أو العضلات، وغالباً ما يختلط الأمر عليهم في التمييز بين الإجهاد العضلي العادي وبين الأمراض الروماتيزمية. من الضروري فهم الفروقات الأساسية بينهما لضمان الحصول على التشخيص الصحيح والعلاج المناسب في الوقت المناسب وتجنب تدهور الحالة.</p>

        <h2>أولاً: آلام العضلات (الإجهاد العضلي)</h2>
        <p>تنشأ آلام العضلات عادة نتيجة لإصابة مباشرة، أو إجهاد بدني زائد، أو ممارسة رياضة جديدة، أو اتخاذ وضعية جلوس خاطئة لفترات طويلة.</p>
        <h3>أهم علامات الألم العضلي:</h3>
        <ul>
          <li><strong>الارتباط بالنشاط البدني:</strong> يبدأ الألم بعد مجهود عضلي أو حركة مفاجئة ويتركز في العضلة المستهدفة.</li>
          <li><strong>المدة الزمنية:</strong> ألم مؤقت يزول تدريجياً خلال أيام قليلة (عادة من 3 إلى 7 أيام) مع الراحة.</li>
          <li><strong>التأثر بالراحة:</strong> يقل الألم بشكل ملحوظ عند إراحة العضلة المصابة، ويزداد عند تشغيلها أو الضغط عليها يدوياً.</li>
          <li><strong>غياب الأعراض الجهازية:</strong> لا يرافقه ارتفاع في درجة الحرارة، أو فقدان الوزن، أو تورم في المفاصل.</li>
        </ul>

        <h2>ثانياً: الآلام الروماتيزمية</h2>
        <p>الروماتيزم مصطلح واسع يشمل مجموعة من الأمراض الالتهابية والمناعية التي تؤثر على المفاصل والأنسجة المحيطة بها، مثل التهاب المفاصل الروماتويدي والذئبة الحمراء والتهاب الفقار اللاصق.</p>
        <h3>أهم علامات الآلام الروماتيزمية:</h3>
        <ul>
          <li><strong>التصلب الصباحي (Morning Stiffness):</strong> الشعور بتيبس وثقل في المفاصل عند الاستيقاظ صباحاً يستمر لأكثر من 30 دقيقة، ويتحسن تدريجياً مع الحركة والنشاط خلال اليوم.</li>
          <li><strong>التناظر والانتشار:</strong> غالباً ما يؤثر الألم على نفس المفاصل في جانبي الجسم (مثل التهاب مفاصل اليدين اليمنى واليسرى معاً).</li>
          <li><strong>التورم والاحمرار:</strong> يرافق الألم تورم واضح في المفاصل وسخونة في الجلد المحيط بها نتيجة للالتهاب الداخلي.</li>
          <li><strong>الأعراض المصاحبة:</strong> قد يرافق الروماتيزم إرهاق عام شديد، أو ارتفاع طفيف في الحرارة، أو طفح جلدي، أو جفاف في العين والفم.</li>
        </ul>

        <h2>جدول مقارنة سريع ومبسط</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;" border="1">
          <thead>
            <tr style="background-color: var(--primary-subtle); text-align: right;">
              <th style="padding: 0.75rem;">وجه المقارنة</th>
              <th style="padding: 0.75rem;">ألم العضلات</th>
              <th style="padding: 0.75rem;">ألم الروماتيزم</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 0.75rem; fontWeight: bold;">السبب الرئيسي</td>
              <td style="padding: 0.75rem;">إجهاد، حركة خاطئة، رياضة زائدة</td>
              <td style="padding: 0.75rem;">التهاب مناعي أو تآكل في الغضاريف والمفاصل</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; fontWeight: bold;">وقت التيبس</td>
              <td style="padding: 0.75rem;">خفيف ومؤقت يزول سريعاً بالاستطالة</td>
              <td style="padding: 0.75rem;">شديد صباحاً يستمر لأكثر من 30 دقيقة عند الاستيقاظ</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; fontWeight: bold;">الحركة والراحة</td>
              <td style="padding: 0.75rem;">يتحسن بالراحة ويزداد مع المجهود والحركة</td>
              <td style="padding: 0.75rem;">يتحسن بالحركة والتمارين ويزداد مع الراحة والخمول</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; fontWeight: bold;">التورم الخارجي</td>
              <td style="padding: 0.75rem;">نادر جداً، قد يظهر انتفاخ طفيف في العضلة</td>
              <td style="padding: 0.75rem;">شائع وملاحظ في المفصل المصاب مع احمرار وسخونة</td>
            </tr>
          </tbody>
        </table>

        <h2>متى يجب زيارة طبيب العظام أو الروماتيزم؟</h2>
        <p>يُنصح باستشارة الطبيب المتخصص فوراً إذا استمرت الآلام لأكثر من أسبوعين دون تحسن، أو إذا رافقها تورم واضح في المفاصل، أو إذا كان الألم يؤثر بشكل كبير على قدرتك على أداء المهام اليومية البسيطة مثل النوم أو الإمساك بالأشياء.</p>
      `
    },
    en: {
      title: 'Distinguishing Between Muscle Pain and Rheumatism',
      summary: 'A simple guide to help you understand the nature of your pain and when to consult a specialized rheumatologist.',
      tag: 'Rheumatism',
      readTime: '3',
      date: '2026-05-24',
      author: 'Dr. Khalid Batterjee',
      content: `
        <h2>Introduction to Musculoskeletal Pain</h2>
        <p>Many people experience joint or muscle pain and often get confused distinguishing between standard muscle strain and rheumatic diseases. It is essential to understand the core differences between them to ensure correct diagnosis and timely treatment, preventing conditions from worsening.</p>

        <h2>First: Muscle Pain (Muscle Strain)</h2>
        <p>Muscle pain typically arises from direct injury, physical overexertion, starting a new sport, or sitting in an incorrect posture for long periods.</p>
        <h3>Key Signs of Muscle Pain:</h3>
        <ul>
          <li><strong>Association with Activity:</strong> Pain starts after physical effort or a sudden movement and is localized to the target muscle.</li>
          <li><strong>Duration:</strong> Temporary pain that gradually subsides within a few days (usually 3 to 7 days) with rest.</li>
          <li><strong>Effect of Rest:</strong> Pain decreases significantly when resting the muscle, and increases when using or pressing it.</li>
          <li><strong>Absence of Systemic Symptoms:</strong> It is not accompanied by fever, weight loss, or joint swelling.</li>
        </ul>

        <h2>Second: Rheumatic Pain</h2>
        <p>Rheumatism is a broad term encompassing inflammatory and autoimmune diseases affecting joints and surrounding tissues, such as rheumatoid arthritis, lupus, and ankylosing spondylitis.</p>
        <h3>Key Signs of Rheumatic Pain:</h3>
        <ul>
          <li><strong>Morning Stiffness:</strong> Feeling stiff and heavy in the joints upon waking in the morning, lasting more than 30 minutes, and gradually improving with movement and activity during the day.</li>
          <li><strong>Symmetry and Distribution:</strong> Pain often affects the same joints on both sides of the body (e.g., left and right wrists simultaneously).</li>
          <li><strong>Swelling and Redness:</strong> Pain is accompanied by visible joint swelling and warmth in the surrounding skin due to internal inflammation.</li>
          <li><strong>Associated Symptoms:</strong> Rheumatism can be accompanied by severe fatigue, mild fever, skin rashes, or dry eyes and mouth.</li>
        </ul>

        <h2>Quick Comparison Table</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;" border="1">
          <thead>
            <tr style="background-color: var(--primary-subtle); text-align: left;">
              <th style="padding: 0.75rem;">Comparison</th>
              <th style="padding: 0.75rem;">Muscle Pain</th>
              <th style="padding: 0.75rem;">Rheumatic Pain</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 0.75rem; fontWeight: bold;">Primary Cause</td>
              <td style="padding: 0.75rem;">Fatigue, wrong movement, excessive sports</td>
              <td style="padding: 0.75rem;">Autoimmune inflammation or wear of cartilage and joints</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; fontWeight: bold;">Stiffness Time</td>
              <td style="padding: 0.75rem;">Mild and temporary, resolves quickly with stretching</td>
              <td style="padding: 0.75rem;">Severe in the morning, lasting more than 30 minutes upon waking</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; fontWeight: bold;">Movement & Rest</td>
              <td style="padding: 0.75rem;">Improves with rest, worsens with effort and movement</td>
              <td style="padding: 0.75rem;">Improves with movement/exercise, worsens with rest/inactivity</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; fontWeight: bold;">External Swelling</td>
              <td style="padding: 0.75rem;">Very rare, mild swelling may appear in the muscle</td>
              <td style="padding: 0.75rem;">Common and noticeable in the affected joint with redness/warmth</td>
            </tr>
          </tbody>
        </table>

        <h2>When to Consult an Orthopedist or Rheumatologist?</h2>
        <p>It is advised to consult a specialist if the pain persists for more than two weeks without improvement, if it is accompanied by visible joint swelling, or if the pain significantly hinders daily tasks like sleeping or holding objects.</p>
      `
    }
  },
  {
    slug: 'lower-back-exercises',
    ar: {
      title: 'تمارين وقائية لتقوية أسفل الظهر وحماية العمود الفقري',
      summary: 'مجموعة من التمارين اليومية البسيطة التي تقي من الانزلاق الغضروفي وتخفف آلام الجلوس الطويل.',
      tag: 'العمود الفقري',
      readTime: '4',
      date: '2026-05-30',
      author: 'د. خالد بترجي',
      content: `
        <h2>مقدمة حول صحة العمود الفقري</h2>
        <p>يعتبر ألم أسفل الظهر من الشكاوى الشائعة للغاية في عصرنا الحالي، وتعود النسبة الكبرى منها إلى ضعف العضلات الداعمة للعمود الفقري (عضلات الجذع والظهر) بسبب قلة الحركة والجلوس الطويل خلف المكاتب. لحسن الحظ، يمكن للتمارين الوقائية اليومية البسيطة أن تحمي ظهرك وتقيك من مشاكل الانزلاق الغضروفي والشد العضلي المستمر.</p>

        <h2>القواعد الذهبية قبل البدء بالتمارين</h2>
        <ul>
          <li>احرص على أداء التمارين ببطء وبدون حركات مفاجئة أو عنيفة.</li>
          <li>تنفس بشكل طبيعي وتجنب حبس أنفاسك أثناء التمرين.</li>
          <li><strong>قاعدة الألم:</strong> يجب ألا تتسبب هذه التمارين في زيادة الألم. إذا شعرت بألم حاد أو تنميل يمتد إلى الساق، فتوقف فوراً واستشر الطبيب.</li>
        </ul>

        <h2>أفضل 4 تمارين وقائية لتقوية الظهر</h2>

        <h3>1. تمرين الجسر (Glute Bridge)</h3>
        <p>يعمل هذا التمرين على تقوية عضلات الأرداف وأسفل الظهر والجذع، وهي العضلات الأساسية التي تدعم استقامة العمود الفقري.</p>
        <ul>
          <li>استلقِ على ظهرك مع ثني الركبتين ووضع القدمين بشكل مسطح على الأرض.</li>
          <li>ارفع حوضك للأعلى حتى يشكل جسمك خطاً مستقيماً من ركبتيك إلى كتفيك.</li>
          <li>شد عضلات بطنك وأرادافك واثبت لمدة 5 ثوانٍ، ثم اهبط ببطء.</li>
          <li>كرر التمرين 10 إلى 12 مرة (3 مجموعات).</li>
        </ul>

        <h3>2. تمرين الكلب الطائر (Bird Dog)</h3>
        <p>تمرين رائع لتحسين التوازن وتقوية العضلات الممتدة على طول العمود الفقري والبطن دون الضغط على الفقرات.</p>
        <ul>
          <li>اتخذ وضعية السجود (على اليدين والركبتين) مع الحفاظ على استقامة الظهر.</li>
          <li>ارفع ذراعك اليمنى للأمور وساقك اليسرى للخلف في نفس الوقت حتى تصبحا بمستوى ظهرك.</li>
          <li>حافظ على التوازن واثبت لمدة 3 ثوانٍ، ثم عد لوضع البداية وكرر مع الجانب الآخر.</li>
          <li>كرر التمرين 10 مرات لكل جانب (مجموعتان).</li>
        </ul>

        <h3>3. تمرين القطة والجمل (Cat-Cow Stretch)</h3>
        <p>تمرين إحماء وتمدد ممتاز لزيادة مرونة العمود الفقري وتخفيف الضغط والتيبس بين الفقرات.</p>
        <ul>
          <li>ابدأ على يديك وركبتيك.</li>
          <li><strong>وضعية القطة:</strong> اخفض رأسك وادفع منتصف ظهرك للأعلى مقوساً إياه كشكل القطة الغاضبة، واثبت لثانيتين.</li>
          <li><strong>وضعية البقرة:</strong> ارفع رأسك للأعلى ببطء واسمح لبطنك بالهبوط للأسفل مقوساً ظهرك بالاتجاه المعاكس، واثبت لثانيتين.</li>
          <li>كرر التحرك بين الوضعيتين ببطء 10 مرات متتالية.</li>
        </ul>

        <h3>4. تمرين البلانك المعدل (Modified Plank)</h3>
        <p>تقوية عضلات البطن العميقة (الـ Core) هي خط الدفاع الأول لحماية العمود الفقري من الأحمال الزائدة.</p>
        <ul>
          <li>استلقِ على بطنك ثم ارفع جسمك مستنداً على الساعدين والركبتين (أو مشط القدمين للمستوى المتقدم).</li>
          <li>حافظ على جسمك مستقيماً تماماً كلوح خشب متجنباً هبوط الحوض للأسفل.</li>
          <li>شد عضلات بطنك بقوة واثبت في هذه الوضعية لمدة 20 إلى 30 ثانية.</li>
          <li>كرر التمرين 3 مرات مع أخذ راحة بينها.</li>
        </ul>

        <h2>نصائح يومية لحماية العمود الفقري</h2>
        <p>إلى جانب التمارين، يلعب أسلوب الحياة دوراً محورياً في حماية ظهرك:</p>
        <ol>
          <li><strong>قاعدة الـ 30 دقيقة:</strong> لا تجلس متواصلًا لأكثر من 30 دقيقة؛ قف وتحرك أو تمدد لمدة دقيقتين على الأقل.</li>
          <li><strong>الطريقة الصحيحة لرفع الأشياء:</strong> لا تنحنِ بظهرك للأمام عند رفع حمولة من الأرض، بل اثنِ ركبتيك واهبط بجسمك مستخدماً قوة عضلات الساقين للرفع مع إبقاء الحمولة قريبة من جسمك.</li>
          <li><strong>وضعية الجلوس:</strong> تأكد من وجود دعم كافٍ لمنطقة أسفل الظهر (مسند قطني) وحافظ على استواء القدمين على الأرض ومستوى الشاشة موازياً لمستوى العين.</li>
        </ol>
      `
    },
    en: {
      title: 'Preventative Exercises to Strengthen the Lower Back & Protect the Spine',
      summary: 'A set of simple daily exercises that prevent herniated discs and relieve pain from prolonged sitting.',
      tag: 'Spine',
      readTime: '4',
      date: '2026-05-30',
      author: 'Dr. Khalid Batterjee',
      content: `
        <h2>Introduction to Spine Health</h2>
        <p>Lower back pain is extremely common today, and most cases stem from weak supporting core muscles due to physical inactivity and long hours of desk sitting. Fortunately, simple preventative daily exercises can protect your back and save you from disc herniations and chronic muscle strain.</p>

        <h2>Golden Rules Before Starting the Exercises</h2>
        <ul>
          <li>Perform exercises slowly, avoiding any sudden or violent movements.</li>
          <li>Breathe naturally; do not hold your breath during exercises.</li>
          <li><strong>Pain Rule:</strong> These exercises should not cause pain. If you feel sharp pain or numbness extending down the leg, stop immediately and consult a doctor.</li>
        </ul>

        <h2>The Top 4 Preventative Exercises for Back Strength</h2>

        <h3>1. Glute Bridge</h3>
        <p>This exercise strengthens the glutes, lower back, and core, which are the main muscles supporting the alignment of the spine.</p>
        <ul>
          <li>Lie on your back with knees bent and feet flat on the floor.</li>
          <li>Raise your hips until your body forms a straight line from knees to shoulders.</li>
          <li>Contract your abdominal and glute muscles, hold for 5 seconds, then lower slowly.</li>
          <li>Repeat 10 to 12 times (3 sets).</li>
        </ul>

        <h3>2. Bird Dog</h3>
        <p>A great exercise for improving balance and strengthening the muscles along the spine and core without loading the vertebrae.</p>
        <ul>
          <li>Get on your hands and knees (tabletop position), keeping your back straight.</li>
          <li>Extend your right arm forward and left leg backward simultaneously until they align with your back.</li>
          <li>Maintain balance, hold for 3 seconds, return to start, and alternate.</li>
          <li>Repeat 10 times per side (2 sets).</li>
        </ul>

        <h3>3. Cat-Cow Stretch</h3>
        <p>An excellent warm-up stretch to increase spinal flexibility and relieve pressure and stiffness between vertebrae.</p>
        <ul>
          <li>Start on your hands and knees.</li>
          <li><strong>Cat Position:</strong> Drop your head, pull your belly button up, and round your back upward, holding for 2 seconds.</li>
          <li><strong>Cow Position:</strong> Lift your head and allow your chest and belly to sink toward the floor, arching your back, holding for 2 seconds.</li>
          <li>Slowly move between the two positions 10 times.</li>
        </ul>

        <h3>4. Modified Plank</h3>
        <p>Strengthening the deep abdominal muscles (the Core) is the first line of defense to protect the spine from excess load.</p>
        <ul>
          <li>Lie on your stomach, then push up onto your forearms and knees.</li>
          <li>Keep your body straight like a plank, avoiding hip sagging.</li>
          <li>Engage your core muscles and hold for 20 to 30 seconds.</li>
          <li>Repeat 3 times with short rests.</li>
        </ul>

        <h2>Daily Tips to Protect the Spine</h2>
        <p>Alongside exercises, lifestyle plays a major role in back protection:</p>
        <ol>
          <li><strong>30-Minute Rule:</strong> Do not sit for more than 30 minutes continuously; stand up, walk, or stretch for at least two minutes.</li>
          <li><strong>Correct Lifting Method:</strong> Do not bend from your back when lifting loads. Bend your knees, drop your hips, and use your leg muscles, keeping the load close to your body.</li>
          <li><strong>Sitting Posture:</strong> Ensure sufficient support for the lower back (lumbar support), keep feet flat on the floor, and keep the monitor at eye level.</li>
        </ol>
      `
    }
  }
]
