// IHUM 242 practice questions, in the ECON 381 drill schema (see tools/practice/questions.js).
//
//   kind     "one" (pick one)
//   pattern  the general rule, shown first after answering
//   steps    the reasoning, revealed one step at a time
//   cards    related flashcards (ids in courses/ihum242/cards.mjs)
//   graph    optional diagram from tools/graphs/ihum242.js
//
// Each wrong option's `why` names the specific confusion that leads to it.
export default {
  "heading": "Practice questions",
  "title": "IHUM 242 practice",
  "sections": [
    { "id": "found", "title": "Foundations", "sub": "2 questions" },
    { "id": "law", "title": "Law & learning", "sub": "2 questions" },
    { "id": "hist", "title": "Empires & history", "sub": "3 questions" },
    { "id": "arts", "title": "Literature & art", "sub": "5 questions" },
    { "id": "modern", "title": "Modern era", "sub": "2 questions" }
  ],
  "questions": [
    {
      "id": "i1", "section": "law", "label": "Q1", "week": 2, "kind": "one",
      "prompt": "An 11th-century Baghdad merchant permanently dedicates the rent from his shops to pay teachers at a new school. What legal instrument is he using?",
      "options": [
        { "t": "Waqf", "right": true, "why": "A perpetual charitable endowment: the shops can never be sold, and their income goes to the purpose in the deed. Waqfs typically funded madrasas, mosques and hospitals." },
        { "t": "Zakat", "why": "Confuses a voluntary, <i>permanent</i> endowment with the obligatory <i>annual</i> alms on wealth (one of the five pillars). Zakat is paid out each year; it doesn’t lock property away forever." },
        { "t": "Jizya", "why": "Confuses giving with taxation: the jizya was the poll tax non-Muslim dhimmis paid to the state, not a gift a Muslim makes to a school." },
        { "t": "Fatwa", "why": "Confuses a legal <i>opinion</i> with a legal <i>instrument</i>. A mufti might issue a fatwa about a waqf, but a fatwa itself transfers no property." }
      ],
      "pattern": "<b>Waqf = permanent + income + named purpose.</b> If property is taken off the market for good and only its income is spent, on a school, mosque, hospital or family, it’s a waqf. Zakat is an annual duty; jizya is a tax; a fatwa is an opinion.",
      "steps": [
        "Note the key word: <i>permanently</i>. That rules out a yearly payment like zakat.",
        "The rent (income), not the shops themselves, goes to the teachers: an endowment.",
        "No state is collecting anything, so it isn’t a tax (jizya).",
        "Answer: <b>waqf</b>, the usual way madrasas like the Nizamiyya were funded."
      ],
      "cards": ["waqf", "madrasa", "pillars", "dhimmi"],
      "graph": "ihum242Waqf"
    },
    {
      "id": "i2", "section": "law", "label": "Q2", "week": 2, "kind": "one",
      "prompt": "A jurist works out whether a new kind of contract is permitted by reasoning from the Qur’an, hadith, scholarly consensus and analogy. This activity is…",
      "options": [
        { "t": "Fiqh", "right": true, "why": "Jurisprudence: the human effort to derive rulings from the sources of law. Consensus (ijma‘) and analogy (qiyas) are among its sources." },
        { "t": "Kalam", "why": "Confuses law with theology. Kalam argues about doctrine (God’s attributes, free will, whether the Qur’an is created), not whether a contract is permitted." },
        { "t": "Falsafa", "why": "Confuses legal reasoning with philosophy in the Greek tradition. Falsafa starts from Aristotle and demonstration, not from Qur’an, hadith, ijma‘ and qiyas." },
        { "t": "Tafsir", "why": "Confuses one input with the whole process. Tafsir is Qur’an commentary; a jurist may use it, but deriving a ruling from all four sources is fiqh." }
      ],
      "pattern": "<b>The four sources (Qur’an → sunna → ijma‘ → qiyas) + a question about what’s allowed = fiqh.</b> Sharia is the ideal law; fiqh is the human reasoning toward it. Kalam = theology, falsafa = philosophy, tafsir = commentary.",
      "steps": [
        "The question is practical: is this act (a contract) permitted? That’s a legal ruling.",
        "The sources named are exactly the classical sources of law (usul al-fiqh).",
        "Theology (kalam) and philosophy (falsafa) answer different questions.",
        "Answer: <b>fiqh</b>; the effort itself is called ijtihad."
      ],
      "cards": ["sharia", "hadith", "falsafa", "ulama"],
      "graph": "ihum242LawLadder"
    },
    {
      "id": "i3", "section": "arts", "label": "Q3", "week": 4, "kind": "one",
      "prompt": "An octagonal shrine with a gilded dome over a rock outcrop in Jerusalem, built under the Umayyad caliph ‘Abd al-Malik around 691–692.",
      "options": [
        { "t": "Dome of the Rock", "right": true, "why": "The earliest major surviving Islamic monument, a domed shrine rather than a congregational mosque." },
        { "t": "Al-Aqsa Mosque", "why": "Mixes up the two buildings on the same platform: al-Aqsa is the nearby congregational mosque, rectangular in plan, not the octagonal domed shrine." },
        { "t": "Great Mosque of Damascus", "why": "Right dynasty, wrong city and ruler: also Umayyad, but in Damascus and built under al-Walid I in the early 8th century." },
        { "t": "Hagia Sophia", "why": "Wrong century and empire: a 6th-century Byzantine church in Constantinople, converted to a mosque only in 1453." }
      ],
      "pattern": "<b>Identify a monument by place + date + patron + plan.</b> Jerusalem + ‘Abd al-Malik + 691–692 + octagon over a rock = Dome of the Rock. Al-Aqsa shares the site but is a rectangular mosque.",
      "steps": [
        "Place: Jerusalem rules out Damascus and Constantinople.",
        "Plan: octagonal and domed, a shrine, not a hall for rows of worshippers.",
        "Date and patron: ‘Abd al-Malik, 691–692 (72 AH).",
        "Answer: <b>the Dome of the Rock</b>."
      ],
      "cards": ["umayyad", "arabesque", "mosqueparts"],
      "graph": { "key": "ihum242Timeline", "args": { "hi": "Umayyad" } }
    },
    {
      "id": "i4", "section": "arts", "label": "Q4", "week": 4, "kind": "one",
      "prompt": "Tiers of small, stacked niches forming a honeycomb-like vault, famous in the Alhambra’s halls.",
      "options": [
        { "t": "Muqarnas", "right": true, "why": "The “stalactite” vaulting typical of Islamic architecture from the 11th–12th c. on." },
        { "t": "Arabesque", "why": "Confuses flat ornament with 3-D vaulting: arabesque is scrolling vegetal pattern on a surface, not stacked niches." },
        { "t": "Iwan", "why": "Confuses a whole space with its decoration: an iwan is a single large vaulted hall open on one side (it may contain muqarnas)." },
        { "t": "Mihrab", "why": "Confuses function with form: the mihrab is the niche showing the direction of prayer. It can contain muqarnas, but it’s a different thing." }
      ],
      "pattern": "<b>Muqarnas = many small niches in projecting tiers (3-D).</b> Arabesque = flat vegetal scroll. Iwan = one big open vault. Mihrab = the qibla niche.",
      "steps": [
        "“Tiers of small, stacked niches” is three-dimensional, so not arabesque.",
        "Many small niches, not one big vaulted hall, so not an iwan.",
        "It’s a vaulting technique, not a liturgical feature, so not the mihrab.",
        "Answer: <b>muqarnas</b>, as in the Hall of the Abencerrajes."
      ],
      "cards": ["muqarnas", "arabesque", "mosqueparts"],
      "graph": "ihum242Muqarnas"
    },
    {
      "id": "i5", "section": "arts", "label": "Q5", "week": 4, "kind": "one",
      "prompt": "A Safavid mosque in Isfahan’s great square with no minaret and no courtyard, built for the royal household (early 17th c.).",
      "options": [
        { "t": "Sheikh Lotfollah Mosque", "right": true, "why": "Its unusual plan, a single domed chamber, reflects its use as a private royal mosque." },
        { "t": "Shah (Imam) Mosque", "why": "Right square, wrong building: the Shah Mosque is the great congregational mosque on the same square, with minarets, four iwans and a courtyard." },
        { "t": "Sultan Ahmed (Blue) Mosque", "why": "Mixes up Safavid and Ottoman: the Blue Mosque is in Istanbul and has six minarets, the opposite of “no minaret”." },
        { "t": "Taj Mahal", "why": "Mixes up Safavid and Mughal, and a tomb with a mosque: the Taj Mahal is a mausoleum in Agra." }
      ],
      "pattern": "<b>Use the clues that exclude.</b> Isfahan = Safavid (not Ottoman Istanbul, not Mughal Agra). “No minaret, no courtyard” excludes a congregational mosque like the Shah Mosque, leaving the private royal mosque.",
      "steps": [
        "Isfahan’s square (Naqsh-e Jahan) belongs to Shah ‘Abbas I’s capital: Safavid.",
        "That rules out the Ottoman Blue Mosque and the Mughal Taj Mahal.",
        "A congregational mosque needs a courtyard; the Shah Mosque has one.",
        "Answer: <b>Sheikh Lotfollah</b>, a domed chamber for the court."
      ],
      "cards": ["gunpowder", "mosqueparts", "sunnishia"],
      "graph": { "key": "ihum242MosquePlan", "args": { "type": "iwan" } }
    },
    {
      "id": "i6", "section": "arts", "label": "Q6", "week": 4, "kind": "one",
      "prompt": "An early 17th-century Ottoman mosque in Istanbul, unusual for having six minarets.",
      "options": [
        { "t": "Sultan Ahmed (Blue) Mosque", "right": true, "why": "Built 1609–1616 for Sultan Ahmed I. Its blue İznik tiles gave the nickname." },
        { "t": "Süleymaniye Mosque", "why": "Right city, wrong date: Sinan’s masterpiece of 1550–1557 for Süleyman, with four minarets." },
        { "t": "Selimiye Mosque", "why": "Right architect’s era, wrong city: Sinan’s late masterpiece is in Edirne (1570s), with four minarets." },
        { "t": "Hagia Sophia", "why": "Confuses a converted church with a purpose-built mosque: its minarets were added after 1453, and there are four." }
      ],
      "pattern": "<b>Match the Ottoman imperial mosques by date and minarets.</b> Süleymaniye 1550–1557 (4), Selimiye in Edirne 1570s (4), Sultan Ahmed 1609–1616 (6).",
      "steps": [
        "Early 17th century rules out Sinan’s 16th-century mosques.",
        "Six minarets is the distinctive clue.",
        "Hagia Sophia was a church until 1453 and has four.",
        "Answer: <b>the Sultan Ahmed (Blue) Mosque</b>."
      ],
      "cards": ["gunpowder", "mosqueparts", "devshirme"],
      "graph": { "key": "ihum242Timeline", "args": { "hi": "Ottoman" } }
    },
    {
      "id": "i7", "section": "hist", "label": "Q7", "week": 3, "kind": "one",
      "prompt": "Ibn Khaldun explains the rise and fall of dynasties through a group’s cohesion, which is strong among desert peoples and weakened by luxury. He calls it…",
      "options": [
        { "t": "‘Asabiyya", "right": true, "why": "Group solidarity, the engine of his cyclical theory in the <i>Muqaddima</i> (1377)." },
        { "t": "Umma", "why": "Confuses the whole community of believers, bound by faith, with the tribal or group solidarity that wins power and then fades." },
        { "t": "Ijma‘", "why": "Confuses a source of law with a social force: ijma‘ is the consensus of scholars." },
        { "t": "Baraka", "why": "Confuses spiritual power with political cohesion: baraka is blessing, often linked to saints and Sufi masters." }
      ],
      "pattern": "<b>Ibn Khaldun’s cycle:</b> a group with strong ‘asabiyya conquers, founds a dynasty, settles into luxury, loses cohesion and is replaced by a tougher group, typically within about three generations.",
      "steps": [
        "The question asks for a <i>social</i> force that rises and decays.",
        "Umma is religious community; ijma‘ is legal consensus; baraka is blessing.",
        "Ibn Khaldun (1332–1406) named group solidarity ‘asabiyya.",
        "Answer: <b>‘asabiyya</b>."
      ],
      "cards": ["umma", "mamluk", "abbasid"],
      "graph": "ihum242Timeline"
    },
    {
      "id": "i8", "section": "hist", "label": "Q8", "week": 3, "kind": "one",
      "prompt": "What happened in 1258?",
      "options": [
        { "t": "The Mongols sacked Baghdad, ending the Abbasid caliphate there", "right": true, "why": "Hülegü’s army took the city and killed the caliph al-Musta‘sim." },
        { "t": "The Ottomans took Constantinople", "why": "Off by two centuries: that was 1453, under Mehmed II." },
        { "t": "The Battle of Karbala", "why": "Confuses the end of the Abbasids with an early Umayyad event: Karbala was 680." },
        { "t": "Granada fell to Castile and Aragon", "why": "Confuses the end of the Abbasids in the east with the end of Muslim rule in Iberia, 1492." }
      ],
      "pattern": "<b>Anchor dates for dynasties:</b> 661 Umayyads, 750 Abbasids, 1258 Mongols take Baghdad, 1260 ‘Ayn Jalut, 1453 Constantinople, 1492 Granada, 1517 Ottomans take Egypt.",
      "steps": [
        "1258 sits in the middle period, after the Seljuks and Crusades.",
        "Karbala (680) is far too early; 1453 and 1492 are far too late.",
        "The Mongols under Hülegü took Baghdad and executed the caliph.",
        "Two years later the Mamluks stopped them at ‘Ayn Jalut (1260)."
      ],
      "cards": ["abbasid", "mamluk", "caliph"],
      "graph": { "key": "ihum242Timeline", "args": { "hi": "Abbasid" } }
    },
    {
      "id": "i9", "section": "found", "label": "Q9", "week": 1, "kind": "one",
      "prompt": "The Sunni–Shi‘i divide began as a disagreement about…",
      "options": [
        { "t": "Who should lead the community after Muhammad", "right": true, "why": "Shi‘is backed ‘Ali and his descendants. Theological and legal differences grew later." },
        { "t": "The text of the Qur’an", "why": "Projects a difference that isn’t there: Sunnis and Shi‘is share the same Qur’an." },
        { "t": "Whether to pray toward Mecca", "why": "Both pray toward Mecca; the qibla is shared, as are the five pillars." },
        { "t": "The legitimacy of Sufism", "why": "Confuses a later, cross-cutting movement with the origin: Sufism exists in both traditions and isn’t the source of the split." }
      ],
      "pattern": "<b>Origin vs later development.</b> The divide began over leadership (‘Ali and his line vs the community’s choice of caliph). Distinct theology, law (the Ja‘fari school) and ritual came later; scripture and pillars are shared.",
      "steps": [
        "Ask what was at stake in 632: who leads now that Muhammad has died?",
        "Sunnis accept the four caliphs in order; Shi‘is hold ‘Ali was designated.",
        "Karbala (680) turned the dispute into a lasting religious identity.",
        "Answer: <b>leadership after Muhammad</b>."
      ],
      "cards": ["sunnishia", "caliph", "quran", "sufism"],
      "graph": "ihum242Succession"
    },
    {
      "id": "i10", "section": "hist", "label": "Q10", "week": 3, "kind": "one",
      "prompt": "The Ottoman practice of levying Christian boys to be converted and trained for the Janissaries and state service is called…",
      "options": [
        { "t": "Devshirme", "right": true, "why": "The “collection”: boys from Christian subjects, mostly in the Balkans, trained for the palace or the Janissary corps." },
        { "t": "Millet", "why": "Confuses Ottoman policies toward non-Muslims: the millets were self-governing religious communities, not a levy of boys." },
        { "t": "Timar", "why": "Confuses two ways of paying for an army: a timar was a land-revenue grant supporting a cavalryman, while the Janissaries were salaried infantry." },
        { "t": "Tanzimat", "why": "Wrong era: the Tanzimat was the 19th-century reform programme, which followed the Janissaries’ abolition in 1826." }
      ],
      "pattern": "<b>Ottoman terms by function:</b> devshirme = recruiting (boys → Janissaries, officials); timar = paying cavalry with land revenue; millet = governing religious communities; Tanzimat = 19th-c. reform.",
      "steps": [
        "The question is about <i>recruitment</i> of soldiers and officials.",
        "Millet (communities) and Tanzimat (reforms) are different institutions.",
        "Timar pays cavalry; it doesn’t recruit boys.",
        "Answer: <b>devshirme</b>."
      ],
      "cards": ["devshirme", "millet", "tanzimat", "mamluk"]
    },
    {
      "id": "i11", "section": "arts", "label": "Q11", "week": 4, "kind": "one",
      "prompt": "A short monorhyme love lyric, in which earthly and divine love often blur, perfected in Persian by Hafez.",
      "options": [
        { "t": "Ghazal", "right": true, "why": "Hafez’s <i>Divan</i> is the classic collection of ghazals." },
        { "t": "Qasida", "why": "Confuses length and purpose: the qasida is the longer, multi-part ode, often praising a patron." },
        { "t": "Ruba‘i", "why": "Confuses forms by line count: a ruba‘i is a single quatrain (four lines), the form of Omar Khayyam’s <i>Rubaiyat</i>." },
        { "t": "Masnavi", "why": "Confuses lyric with narrative: a masnavi is long narrative or didactic poetry in rhyming couplets, like Rumi’s <i>Masnavi</i>." }
      ],
      "pattern": "<b>Persian/Arabic verse forms:</b> qasida = long ode (praise); ghazal = short love lyric, one rhyme; ruba‘i = one quatrain; masnavi = long poem in rhyming couplets.",
      "steps": [
        "“Short” rules out the qasida and the masnavi.",
        "“Love lyric” in many couplets, not a single four-line epigram, rules out the ruba‘i.",
        "Hafez (c. 1325–1390) is the master of the form.",
        "Answer: <b>ghazal</b>."
      ],
      "cards": ["ghazal", "qasida", "sufism"],
      "graph": "ihum242Ghazal"
    },
    {
      "id": "i12", "section": "modern", "label": "Q12", "week": 5, "kind": "one",
      "prompt": "Edward Said’s <i>Orientalism</i> (1978) argues that…",
      "options": [
        { "t": "Western representations of “the Orient” constructed it as an inferior Other, entangled with imperial power", "right": true, "why": "Knowledge and power reinforce each other." },
        { "t": "Middle Eastern societies were unchanged for centuries", "why": "Reverses his argument: the image of a timeless, unchanging East is exactly what Said criticizes." },
        { "t": "Orientalist painters were the most accurate observers of the Middle East", "why": "Reverses his argument: he treats such images as projections of European fantasy, not documents." },
        { "t": "The Ottoman Empire collapsed because of Sufism", "why": "Not his subject: the book is about Western representation, not Ottoman history or religion." }
      ],
      "pattern": "<b>Said’s thesis in one line:</b> the West’s knowledge of “the Orient” was a discourse that made the East exotic and inferior and served imperial rule.",
      "steps": [
        "Said studies Western texts and images, not Middle Eastern history itself.",
        "Options claiming the East was timeless or accurately painted are the views he attacks.",
        "His key move links knowledge to power (after Foucault).",
        "Answer: the first option."
      ],
      "cards": ["orientalism", "sykes", "nahda"],
      "graph": { "key": "ihum242Modern", "args": { "hi": 1978 } }
    },
    {
      "id": "i13", "section": "found", "label": "Q13", "week": 1, "kind": "one",
      "prompt": "Year 1 of the Islamic (AH) calendar corresponds to…",
      "options": [
        { "t": "622 CE, the hijra to Medina", "right": true, "why": "The calendar counts from the emigration, the founding of the community." },
        { "t": "570 CE, Muhammad’s traditional birth year", "why": "Assumes the calendar works like AD (counting from a birth); it counts from the hijra instead." },
        { "t": "610 CE, the first revelation", "why": "Confuses the start of the Qur’an’s revelation with the start of the community: an important date, but not the calendar’s start." },
        { "t": "632 CE, Muhammad’s death", "why": "Confuses the start of the caliphate with the start of the calendar." }
      ],
      "pattern": "<b>AH = “in the year of the hijra”.</b> Year 1 begins in 622, when the community was founded at Medina. Islamic years are lunar (≈ 354 days), so they don’t line up with CE years.",
      "steps": [
        "Order the founding dates: 570 birth, 610 revelation, 622 hijra, 632 death.",
        "The calendar marks the community, not the person or the revelation.",
        "So 1 AH = 622 CE.",
        "Being lunar, AH years run faster: Ramadan moves about 11 days earlier each year."
      ],
      "cards": ["hijra", "umma", "quran"],
      "graph": { "key": "ihum242Map", "args": { "route": true, "hi": ["Mecca", "Medina"] } }
    },
    {
      "id": "i14", "section": "modern", "label": "Q14", "week": 5, "kind": "one",
      "prompt": "The 19th-century Arab literary and cultural revival of printing, journalism and new literary forms is called…",
      "options": [
        { "t": "The Nahda", "right": true, "why": "“Awakening” or “renaissance”, centred on Cairo and Beirut." },
        { "t": "The Tanzimat", "why": "Confuses cultural revival with state reform: the Tanzimat was the Ottoman government’s reorganization (1839–1876)." },
        { "t": "The Jahiliyya", "why": "Wrong era entirely: the Jahiliyya is the pre-Islamic “age of ignorance” in Muslim tradition." },
        { "t": "The Reconquista", "why": "Wrong place and era: the Reconquista was the Christian conquest of al-Andalus, completed in 1492." }
      ],
      "pattern": "<b>Two 19th-century currents:</b> Nahda = Arab cultural and literary revival (presses, journals, the novel); Tanzimat = Ottoman state reform (edicts, courts, codes).",
      "steps": [
        "“Literary and cultural” points away from state reform (Tanzimat).",
        "Jahiliyya and Reconquista are centuries off.",
        "Printing presses (Bulaq), journals and translation define the movement.",
        "Answer: <b>the Nahda</b>."
      ],
      "cards": ["nahda", "tanzimat", "adab", "modernism"]
    }
  ]
};
