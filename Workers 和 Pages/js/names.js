/* 美国地址生成器 - 多国别语料库
 * COUNTRIES：36 个国家/地区的元数据（中英文名、地区标签、电话格式、邮箱域名、
 *            内置街道池、门牌号风格）；真实城市/邮编在 js/countries_data.js。
 * LOCALES：  各语种人名池（姓/名/称谓/姓名顺序）。
 * 生成字段为随机虚构，仅用于开发测试。 */
(function () {
  "use strict";

  const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const dg = (n) => { let s = ""; for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; };
  const rand = (a) => a[Math.floor(Math.random() * a.length)];

  /* ================= 内置街道池（OSM 不可用时的回退） ================= */
  const US_STREETS = ["Main Street", "Oak Avenue", "Maple Avenue", "Washington Avenue", "Park Street", "Elm Street", "Cedar Avenue", "Pine Street", "Broadway", "Church Street", "Lake Avenue", "Hill Road", "River Road", "Mill Street", "Franklin Street", "Jackson Street", "Jefferson Avenue", "Lincoln Avenue", "Madison Avenue", "Center Street", "Chestnut Street", "Walnut Street", "Spring Street", "Cherry Street", "Willow Street", "Sunset Boulevard", "Greenwood Drive", "Meadow Lane", "Highland Avenue", "Victoria Drive", "Hampton Court", "Westview Terrace", "Orchard Lane", "Crystal Drive", "Birchwood Drive", "Cottonwood Circle", "Deerfield Drive", "Pleasant Street", "Liberty Street", "Union Street", "Market Street", "Bridge Street", "School Street", "Grove Street", "Summit Avenue", "Prospect Street", "Pearl Street", "Riverside Drive", "Lakeview Drive", "Hillcrest Road", "Woodland Avenue", "Aspen Way", "Redwood Drive", "Sycamore Street", "Magnolia Avenue", "Hawthorne Street", "Belmont Avenue", "Fairview Avenue"];

  const GB_STREETS = ["High Street", "Church Road", "Station Road", "Victoria Road", "Park Lane", "Mill Lane", "Green Lane", "School Lane", "George Street", "Albert Road", "King Street", "Queen Street", "London Road", "Church Street", "Chapel Street", "Mill Road", "Station Approach", "Manchester Road", "Victoria Street", "York Road", "Albany Road", "Clarence Street", "Crescent Road", "Grove Road", "Windsor Road", "Beach Road", "Castle Street", "Priory Road", "Brook Lane", "Woodland Rise"];

  const DE_STREETS = ["Hauptstraße", "Bahnhofstraße", "Kirchenstraße", "Schulstraße", "Gartenstraße", "Bergstraße", "Waldstraße", "Wiesenstraße", "Lindenstraße", "Rosenstraße", "Ringstraße", "Poststraße", "Mühlenstraße", "Kirchplatz", "Am Markt", "Marktplatz", "Seestraße", "Talstraße", "Dorfstraße", "Mozartstraße", "Goethestraße", "Schillerstraße", "Ahornweg", "Birkenweg", "Eichenweg", "Rosenweg", "Brunnenweg", "Quellenweg", "Am Sportplatz", "An der Kirche"];

  const FR_STREETS = ["Rue de la Gare", "Rue de l'Église", "Rue de la Mairie", "Rue Victor Hugo", "Rue Jean Jaurès", "Rue de la République", "Avenue de la Gare", "Rue Pasteur", "Rue de l'École", "Grande Rue", "Rue du Commerce", "Boulevard Victor Hugo", "Avenue Jean Moulin", "Rue des Fleurs", "Rue du Stade", "Chemin des Vignes", "Rue Gambetta", "Rue de Verdun", "Allée des Peupliers", "Rue Louis Pasteur", "Place du Marché", "Rue des Écoles", "Rue du Château", "Rue des Lilas", "Avenue de la Liberté", "Rue Gambetta", "Impasse des Roses", "Rue du Bac", "Rue de la Paix"];

  const IT_STREETS = ["Via Roma", "Via Garibaldi", "Via Dante Alighieri", "Via Giuseppe Mazzini", "Via Camillo Cavour", "Via Giuseppe Verdi", "Via Giosuè Carducci", "Via Giovanni Pascoli", "Corso Vittorio Emanuele", "Corso Italia", "Piazza della Repubblica", "Via dei Fiori", "Via delle Rose", "Via San Marco", "Via San Giuseppe", "Via dell'Indipendenza", "Viale della Libertà", "Via Montello", "Via XX Settembre", "Via Torino", "Via Milano", "Via Napoli", "Via Villarey", "Via Pietro Nenni"];

  const ES_STREETS = ["Calle Mayor", "Calle de Alcalá", "Gran Vía", "Calle Real", "Calle de la Iglesia", "Avenida de la Constitución", "Avenida de España", "Calle del Carmen", "Calle de Santa María", "Calle Nueva", "Calle del Sol", "Calle de los Jardines", "Paseo del Prado", "Calle Serrano", "Calle Goya", "Calle de Velázquez", "Avenida de la Libertad", "Calle San Juan", "Calle de la Fuente", "Calle del Parque", "Calle Cervantes", "Calle Lope de Vega", "Rambla Principal", "Calle Ancha"];

  const NL_STREETS = ["Dorpsstraat", "Kerkstraat", "Schoolstraat", "Molenstraat", "Stationsstraat", "Beukenlaan", "Eikenlaan", "Rozenstraat", "Acacialaan", "Wilgenweg", "Wilhelminastraat", "Julianastraat", "Oranjestraat", "Oosterstraat", "Westerstraat", "Noorderstraat", "Zuidstraat", "Hoofdstraat", "Raadhuisstraat", "Keizersgracht", "Herengracht", "Prinsengracht", "Kalverstraat", "Lindengracht"];

  const PL_STREETS = ["ul. Marszałkowska", "ul. Długa", "ul. Krótka", "ul. Polna", "ul. Ogrodowa", "ul. Kwiatowa", "ul. Słoneczna", "ul. Lipowa", "ul. Klonowa", "ul. Parkowa", "ul. Szkolna", "ul. Kościelna", "ul. Dworcowa", "al. Niepodległości", "ul. Mickiewicza", "ul. Sienkiewicza", "ul. Chopina", "ul. Reymonta", "ul. Sikorskiego", "ul. Wiśniowa", "ul. Brzoskwiniowa", "ul. Malinowa", "ul. Wiosenna", "ul. Złota"];

  const SE_STREETS = ["Storgatan", "Kyrkogatan", "Parkgatan", "Södergatan", "Norrgatan", "Östergatan", "Västergatan", "Biblioteksgatan", "Drottninggatan", "Kungsgatan", "Skolgatan", "Stationsgatan", "Nygatan", "Långgatan", "Bredgatan", "Rosengatan", "Solgatan", "Ringgatan", "Vasagatan", "Ekgatan", "Björkgatan", "Ångermanlandsgatan"];

  const NO_STREETS = ["Storgata", "Kirkegata", "Skolegata", "Strandgata", "Torvgata", "Elvegata", "Bergveien", "Solheimveien", "Parkveien", "Kongens gate", "Dronningens gate", "Nedre gate", "Øvre gate", "Havnegata", "Kirkeveien", "Sjøgata", "Bakklandet", "Mellomveien"];

  const DK_STREETS = ["Hovedgaden", "Kirkegade", "Skolegade", "Storegade", "Bredgade", "Nørregade", "Søndergade", "Østergade", "Vestergade", "Stationsvej", "Parkvej", "Rosenvej", "Egevej", "Bøgevej", "Kastanievej", "Møllegade", "Havevej", "Ahornvej", "Kirkevej", "Strandvejen"];

  const RU_STREETS = ["ул. Ленина", "ул. Мира", "ул. Советская", "ул. Молодёжная", "ул. Школьная", "ул. Садовая", "ул. Луговая", "ул. Полевая", "ул. Центральная", "ул. Победы", "пр. Ленина", "ул. Гагарина", "ул. Пушкина", "ул. Чехова", "ул. Гоголя", "ул. Крылова", "ул. Строителей", "ул. Заводская", "ул. Кооперативная", "ул. Заречная", "ул. Лесная", "ул. Цветочная"];

  const TR_STREETS = ["Atatürk Caddesi", "İstiklal Caddesi", "Cumhuriyet Caddesi", "Gazi Caddesi", "İnönü Caddesi", "Mimar Sinan Caddesi", "Fevzi Çakmak Caddesi", "Bahçe Sokak", "Çiçek Sokak", "Gül Sokak", "Papatya Sokak", "Menekşe Sokak", "Zeytinlik Sokak", "Kavak Sokak", "Lale Sokak", "Yıldız Sokak"];

  const CN_STREETS = ["中山路", "人民路", "建设路", "解放路", "和平路", "文化路", "新华路", "光明路", "朝阳路", "长江路", "黄河路", "学院路", "青年路", "幸福路", "振兴路", "团结路", "康乐路", "迎宾大道", "望江路", "桂花路", "滨河路", "广场路"];

  const KO_STREETS = ["세종대로", "강남대로", "테헤란로", "영동대로", "올림픽로", "한강대로", "을지로", "종로", "충정로", "왕십리로", "송파대로", "목동로", "봉은사로", "언주로", "역삼로", "퇴계로", "천호대로", "첨담산로"];

  const MY_STREETS = ["Jalan Merdeka", "Jalan Mawar", "Jalan Melati", "Jalan Kenanga", "Jalan Cempaka", "Jalan Anggerik", "Jalan Dahlia", "Jalan Pasar", "Jalan Besar", "Jalan Sekolah", "Jalan Masjid", "Jalan Pantai", "Jalan Bukit", "Jalan Sungai", "Jalan Durian", "Jalan Rambutan"];

  const ID_STREETS = ["Jalan Merdeka", "Jalan Diponegoro", "Jalan Sudirman", "Jalan Gatot Subroto", "Jalan Ahmad Yani", "Jalan Kartini", "Jalan Pahlawan", "Jalan Melati", "Jalan Mawar", "Jalan Kenanga", "Jalan Cempaka", "Jalan Anggrek", "Jalan Pasar", "Jalan Sekolah", "Jalan Bahari", "Jalan Pantai Indah"];

  const TH_STREETS = ["Thanon Sukhumvit", "Thanon Phahonyothin", "Thanon Ratchadapisek", "Thanon Lat Phrao", "Thanon Ramkhamhaeng", "Thanon Sathorn", "Thanon Silom", "Thanon Rama IX", "Thanon Ekkamai", "Thanon Thong Lo", "Thanon Charoen Krung", "Thanon Phetchaburi", "Thanon Ngamwongwan", "Thanon Tiwanon"];

  const VI_STREETS = ["Đường Nguyễn Trãi", "Đường Lê Lợi", "Đường Nguyễn Huệ", "Đường Trần Hưng Đạo", "Đường Hai Bà Trưng", "Đường Lý Thường Kiệt", "Đường Nguyễn Đình Chiểu", "Đường Điện Biên Phủ", "Đường Cách Mạng Tháng Tám", "Đường Nguyễn Thị Minh Khai", "Đường Hoàng Diệu", "Đường Lê Duẩn", "Đường Pasteur", "Đường Võ Văn Tần"];

  const PH_STREETS = ["Rizal Street", "Mabini Street", "Bonifacio Drive", "Luna Street", "del Pilar Street", "Magsaysay Road", "Quezon Avenue", "Recto Avenue", "Taft Avenue", "Aguinaldo Highway", "Katipunan Avenue", "Sampaguita Street", "Molave Street", "Narra Street", "Acacia Avenue", "Mahogany Street", "Delgado Street", "San Agustin Street"];

  const IN_STREETS = ["M.G. Road", "Station Road", "Gandhi Road", "Market Road", "Temple Street", "Church Road", "Civil Lines", "Mall Road", "Nehru Road", "Tagore Road", "Jawahar Road", "Patel Road", "Gandhi Nagar Main Road", "Lake View Road", "Hill Street", "Bazaar Street"];

  const AR_STREETS = ["شارع الملك فهد", "طريق الملك عبدالله", "طريق الأمير سلطان", "شارع التحلية", "شارع العليا", "طريق الشيخ زايد", "شارع الحمرا", "شارع الكورنيش", "طريق الملك عبدالعزيز", "شارع الأمير راشد"];

  const HE_STREETS = ["רחוב הרצל", "רחוב ביאליק", "רחוב אלנבי", "דרך מנחם בגין", "רחוב ויצמן", "שדרות רוטשילד", "רחוב אחד העם", "רחוב ז'בוטינסקי", "דרך בן גוריון", "רחוב החשמונאים", "רחוב הירדן", "רחוב ורבורג"];

  const BR_STREETS = ["Rua das Flores", "Rua XV de Novembro", "Avenida Brasil", "Rua Sete de Setembro", "Avenida Paulista", "Rua da Bahia", "Avenida Rio Branco", "Rua do Comércio", "Rua São João", "Avenida Getúlio Vargas", "Rua Barão do Rio Branco", "Rua José Bonifácio", "Avenida Central", "Rua Marechal Deodoro"];

  /* ================= 语种人名池 ================= */
  // order: 'fl' = 名 姓（西式）；'lf' = 姓 名（中日韩）
  // asciiLast: 姓氏转 ASCII（邮箱用）；缺省 = NFD 去变音符号
  const LOCALES = {
    en: {
      order: "fl",
      m: ["James", "Robert", "John", "Michael", "David", "William", "Richard", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy", "Ronald", "Edward", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Gregory", "Alexander", "Frank", "Patrick", "Raymond", "Jack", "Dennis", "Tyler", "Aaron", "Adam", "Nathan", "Henry", "Douglas", "Peter", "Kyle", "Ethan", "Noah", "Jeremy", "Keith", "Roger", "Terry", "Austin", "Sean", "Gerald", "Owen", "Liam", "Mason", "Logan", "Caleb"],
      f: ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Carol", "Amanda", "Dorothy", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia", "Kathleen", "Amy", "Angela", "Shirley", "Anna", "Ruth", "Brenda", "Pamela", "Nicole", "Katherine", "Samantha", "Christine", "Catherine", "Virginia", "Rachel", "Janet", "Emma", "Carolyn", "Maria", "Heather", "Diane", "Julie", "Joyce", "Victoria", "Kelly", "Christina", "Joan", "Evelyn", "Lauren", "Judith", "Megan", "Cheryl", "Andrea", "Hannah", "Jacqueline", "Martha", "Gloria", "Teresa", "Ann", "Sara", "Madison", "Chloe", "Zoe"],
      l: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Murphy", "Cook", "Rogers", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ward", "Richardson", "Watson", "Brooks", "Wood", "Bennett", "Gray", "Hughes", "Price", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez"],
      tm: ["Mr.", "Mr.", "Mr.", "Dr.", "Prof."],
      tf: ["Ms.", "Ms.", "Mrs.", "Dr.", "Prof."]
    },
    de: {
      order: "fl",
      m: ["Lukas", "Jonas", "Felix", "Maximilian", "Julian", "Paul", "Leon", "Niklas", "Tim", "Jan", "Florian", "Alexander", "Michael", "Stefan", "Thomas", "Daniel", "Sebastian", "Matthias", "Tobias", "Martin", "Klaus", "Werner", "Hans", "Peter"],
      f: ["Anna", "Lena", "Julia", "Laura", "Sarah", "Lisa", "Hannah", "Sophie", "Marie", "Lea", "Katharina", "Johanna", "Emma", "Mia", "Clara", "Franziska", "Nadine", "Katrin", "Sabine", "Petra", "Ursula", "Ingrid", "Helga", "Monika"],
      l: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Hoffmann", "Schulz", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Braun", "Krüger", "Hofmann", "Lange", "Werner", "Krause", "Lehmann", "Köhler", "Herrmann", "König", "Walter", "Huber", "Kaiser", "Fuchs", "Peters", "Lang", "Scholz", "Weiss", "Jung", "Hahn", "Vogel", "Friedrich", "Keller"],
      tm: ["Herr", "Herr", "Herr", "Dr.", "Prof."],
      tf: ["Frau", "Frau", "Frau", "Dr.", "Prof."]
    },
    fr: {
      order: "fl",
      m: ["Lucas", "Hugo", "Léo", "Louis", "Théo", "Nathan", "Enzo", "Mathis", "Maxime", "Antoine", "Julien", "Nicolas", "Pierre", "Thomas", "Alexandre", "Romain", "Olivier", "Guillaume", "Vincent", "Laurent", "Philippe", "Alain", "Christophe", "Stéphane"],
      f: ["Emma", "Léa", "Manon", "Chloé", "Camille", "Inès", "Sarah", "Jade", "Louise", "Juliette", "Mathilde", "Céline", "Sophie", "Julie", "Marion", "Laura", "Anaïs", "Alice", "Nathalie", "Isabelle", "Catherine", "Valérie", "Sylvie", "Martine"],
      l: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard", "André", "Lefèvre", "Mercier", "Dupont", "Lambert", "Bonnet", "François", "Martinez", "Legrand", "Garnier", "Faure", "Rousseau", "Blanc", "Guérin"],
      tm: ["M.", "M.", "M.", "Dr", "Prof."],
      tf: ["Mme", "Mme", "Mlle", "Dr", "Prof."]
    },
    it: {
      order: "fl",
      m: ["Lorenzo", "Francesco", "Alessandro", "Andrea", "Matteo", "Gabriele", "Riccardo", "Tommaso", "Giuseppe", "Antonio", "Marco", "Luca", "Davide", "Federico", "Stefano", "Roberto", "Simone", "Giovanni", "Vincenzo", "Pietro", "Domenico", "Salvatore"],
      f: ["Giulia", "Sofia", "Aurora", "Alice", "Ginevra", "Francesca", "Chiara", "Martina", "Sara", "Alessia", "Elena", "Valentina", "Laura", "Anna", "Federica", "Silvia", "Giorgia", "Elisa", "Maria", "Rosa", "Angela", "Lucia"],
      l: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Costa", "Giordano", "Mancini", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone"],
      tm: ["Sig.", "Sig.", "Sig.", "Dr.", "Prof."],
      tf: ["Sig.ra", "Sig.ra", "Sig.na", "Dr.ssa", "Prof.ssa"]
    },
    es: {
      order: "fl",
      m: ["Hugo", "Martín", "Pablo", "Lucas", "Mateo", "Alejandro", "Daniel", "Manuel", "Adrián", "Álvaro", "David", "Mario", "Diego", "Javier", "Marcos", "Iván", "Sergio", "Carlos", "Fernando", "Jorge", "Luis", "Miguel", "Rafael", "Ángel"],
      f: ["Lucía", "María", "Martina", "Sofía", "Paula", "Valeria", "Carla", "Sara", "Julia", "Noa", "Alba", "Emma", "Claudia", "Carmen", "Ana", "Elena", "Isabel", "Laura", "Rocío", "Nerea", "Irene", "Cristina"],
      l: ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Álvarez", "Romero", "Alonso", "Gutiérrez", "Navarro", "Torres", "Domínguez", "Vázquez", "Ramos", "Gil", "Ramírez", "Serrano", "Blanco", "Molina", "Morales", "Suárez", "Ortega"],
      tm: ["Sr.", "Sr.", "Sr.", "Dr.", "Prof."],
      tf: ["Sra.", "Sra.", "Srta.", "Dra.", "Prof."]
    },
    pt: {
      order: "fl",
      m: ["João", "Tiago", "Diogo", "Pedro", "Miguel", "Lucas", "Gabriel", "Rui", "Carlos", "António", "Manuel", "Francisco", "Gonçalo", "Ricardo", "André", "Bruno", "Nuno", "Sérgio", "Fernando", "Vítor"],
      f: ["Maria", "Ana", "Beatriz", "Mariana", "Matilde", "Leonor", "Carolina", "Inês", "Sofia", "Joana", "Catarina", "Madalena", "Teresa", "Rita", "Sara", "Marta", "Cristina", "Paula", "Helena", "Cláudia"],
      l: ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Sousa", "Fernandes", "Gonçalves", "Gomes", "Lopes", "Marques", "Alves", "Almeida", "Ribeiro", "Pinto", "Carvalho", "Teixeira", "Moreira", "Correia", "Mendes", "Nunes", "Soares", "Vieira", "Monteiro", "Cardoso"],
      tm: ["Sr.", "Sr.", "Sr.", "Dr.", "Prof."],
      tf: ["Sra.", "Sra.", "Dr.a", "Dra.", "Prof.a"]
    },
    br: {
      order: "fl",
      m: ["Miguel", "Arthur", "Theo", "Heitor", "Davi", "Gabriel", "Bernardo", "Lucas", "Matheus", "Pedro", "Rafael", "Bruno", "Felipe", "Thiago", "Rodrigo", "Carlos", "Marcos", "João", "Vinícius", "Eduardo"],
      f: ["Helena", "Alice", "Laura", "Maria", "Sophia", "Manuela", "Isabella", "Júlia", "Luiza", "Ana", "Beatriz", "Camila", "Fernanda", "Larissa", "Gabriela", "Letícia", "Aline", "Paula", "Mariana", "Rafaela"],
      l: ["Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira", "Costa", "Almeida", "Nascimento", "Araujo", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha", "Fernandes", "Barbosa", "Alves", "Duarte", "Campos", "Cardoso", "Teixeira", "Correia", "Moraes"],
      tm: ["Sr.", "Sr.", "Sr.", "Dr.", "Prof."],
      tf: ["Sra.", "Sra.", "Srta.", "Dra.", "Prof."]
    },
    nl: {
      order: "fl",
      m: ["Daan", "Sem", "Lars", "Levi", "Bram", "Thijs", "Jesse", "Ruben", "Tim", "Sven", "Jasper", "Niels", "Bas", "Joost", "Wouter", "Mark", "Peter", "Koen", "Jan", "Pieter"],
      f: ["Emma", "Julia", "Sophie", "Lotte", "Eva", "Anna", "Sanne", "Lisa", "Femke", "Anne", "Saskia", "Iris", "Noor", "Marloes", "Kim", "Lieke", "Nina", "Roos", "Fleur", "Anouk"],
      l: ["De Jong", "Jansen", "De Vries", "Van den Berg", "Van Dijk", "Bakker", "Visser", "Janssen", "Smit", "Meijer", "De Boer", "Mulder", "De Groot", "Bos", "Vos", "Peters", "Hendriks", "Van Leeuwen", "Dekker", "Brouwer", "De Wit", "Dijkstra", "Smeets", "Kuipers"],
      tm: ["Dhr.", "Dhr.", "Dhr.", "Dr.", "Prof."],
      tf: ["Mevr.", "Mevr.", "Mevr.", "Drs.", "Prof."]
    },
    pl: {
      order: "fl",
      m: ["Jakub", "Jan", "Piotr", "Marek", "Tomasz", "Kacper", "Adam", "Mateusz", "Wojciech", "Paweł", "Michał", "Krzysztof", "Andrzej", "Stanisław", "Bartosz", "Filip", "Łukasz", "Dawid", "Rafał", "Sebastian"],
      f: ["Anna", "Katarzyna", "Maria", "Agnieszka", "Magdalena", "Julia", "Zofia", "Aleksandra", "Natalia", "Marta", "Karolina", "Barbara", "Ewa", "Beata", "Monika", "Joanna", "Kinga", "Paulina", "Izabela", "Weronika"],
      l: ["Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Krawczyk", "Piotrowski", "Grabowski", "Pawłowski", "Michalski", "Król", "Zając", "Wieczorek", "Jabłoński", "Wróbel"],
      tm: ["Pan", "Pan", "Pan", "Dr", "Prof."],
      tf: ["Pani", "Pani", "Pani", "Dr", "Prof."]
    },
    se: {
      order: "fl",
      m: ["Erik", "Lars", "Karl", "Anders", "Johan", "Per", "Mikael", "Jan", "Magnus", "Fredrik", "Henrik", "Andreas", "Jonas", "Peter", "Mats", "Daniel", "Niklas", "Emil", "Gustav", "Olof"],
      f: ["Anna", "Maria", "Eva", "Kristina", "Karin", "Sara", "Lena", "Emma", "Johanna", "Åsa", "Elisabeth", "Marie", "Sofia", "Linda", "Jenny", "Camilla", "Cecilia", "Helena", "Klara", "Elin"],
      l: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson", "Pettersson", "Jonsson", "Jansson", "Hansson", "Bengtsson", "Lindberg", "Lindqvist", "Lindström", "Berg", "Axelsson", "Lundberg", "Bergström"],
      tm: ["Herr", "Herr", "Herr", "Dr.", "Prof."],
      tf: ["Fru", "Fru", "Fröken", "Dr.", "Prof."]
    },
    no: {
      order: "fl",
      m: ["Jan", "Per", "Bjørn", "Ole", "Lars", "Kjetil", "Thomas", "Kristian", "Martin", "Andreas", "Espen", "Erik", "Magnus", "Jonas", "Henrik", "Sondre", "Marius", "Alexander", "Even", "Håkon"],
      f: ["Anne", "Ingrid", "Kari", "Liv", "Marit", "Emma", "Nora", "Sofie", "Julie", "Marte", "Silje", "Camilla", "Hanne", "Kristine", "Maria", "Linda", "Anna", "Elin", "Thea", "Ida"],
      l: ["Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Pedersen", "Nilsen", "Kristiansen", "Jensen", "Karlsen", "Johnsen", "Pettersen", "Eriksen", "Berg", "Haugen", "Johannessen", "Andreassen", "Jacobsen", "Dahl", "Jørgensen"],
      tm: ["Herr", "Herr", "Dr."],
      tf: ["Fru", "Fru", "Dr."]
    },
    dk: {
      order: "fl",
      m: ["Jens", "Lars", "Søren", "Mikkel", "Thomas", "Henrik", "Jesper", "Anders", "Martin", "Christian", "Jonas", "Mathias", "Frederik", "Emil", "Rasmus", "Nikolaj", "Kasper", "Mads", "Casper", "Bo"],
      f: ["Anne", "Karen", "Mette", "Helle", "Camilla", "Louise", "Charlotte", "Ida", "Emma", "Sofie", "Freja", "Signe", "Anna", "Marie", "Lene", "Pia", "Trine", "Sara", "Maja", "Cecilie"],
      l: ["Jensen", "Nielsen", "Hansen", "Pedersen", "Andersen", "Christensen", "Larsen", "Olsen", "Sørensen", "Rasmussen", "Jørgensen", "Poulsen", "Madsen", "Kristensen", "Knudsen", "Holm", "Simonsen", "Jacobsen", "Friis", "Vestergaard"],
      tm: ["Hr.", "Hr.", "Dr."],
      tf: ["Fr.", "Fr.", "Dr."]
    },
    ru: {
      order: "fl",
      m: ["Alexander", "Dmitri", "Maxim", "Sergey", "Andrey", "Alexey", "Artem", "Ilya", "Kirill", "Mikhail", "Nikita", "Matvey", "Roman", "Egor", "Denis", "Evgeny", "Pavel", "Anton", "Vladimir", "Igor"],
      f: ["Anastasia", "Maria", "Daria", "Anna", "Elizaveta", "Polina", "Victoria", "Ekaterina", "Sofia", "Alexandra", "Varvara", "Alisa", "Ksenia", "Irina", "Elena", "Natalia", "Olga", "Tatiana", "Svetlana", "Yulia"],
      l: ["Ivanov", "Smirnov", "Kuznetsov", "Popov", "Vasiliev", "Petrov", "Sokolov", "Mikhailov", "Novikov", "Fedorov", "Morozov", "Volkov", "Alekseev", "Lebedev", "Semenov", "Egorov", "Pavlov", "Kozlov", "Stepanov", "Nikolaev"],
      tm: ["Г-н", "Г-н", "Г-н", "Проф."],
      tf: ["Г-жа", "Г-жа", "Г-жа", "Проф."]
    },
    tr: {
      order: "fl",
      m: ["Mehmet", "Mustafa", "Ahmet", "Emir", "Yusuf", "Kerem", "Burak", "Can", "Emre", "Mert", "Baran", "Kaan", "Ali", "Hüseyin", "İbrahim", "Osman", "Furkan", "Arda"],
      f: ["Elif", "Zeynep", "Defne", "Azra", "Eylül", "Ayşe", "Fatma", "Esra", "Merve", "Kübra", "Melis", "Derya", "Gamze", "Ceren", "Selin", "İrem", "Nihan", "Hande"],
      l: ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek"],
      tm: ["Sn.", "Sn.", "Sn.", "Dr."],
      tf: ["Sn.", "Sn.", "Sn.", "Dr."]
    },
    zh: {
      order: "lf",
      m: ["伟", "强", "磊", "军", "洋", "勇", "杰", "涛", "明", "超", "刚", "平", "辉", "鹏", "华", "飞", "鑫", "波", "斌", "宇"],
      f: ["芳", "娜", "敏", "静", "丽", "娟", "艳", "雪", "燕", "玲", "婷", "慧", "晓", "萍", "琳", "欣", "雨", "倩", "晶", "云"],
      l: ["王", "李", "张", "刘", "陈", "杨", "黄", "赵", "吴", "周", "徐", "孙", "马", "朱", "胡", "郭", "何", "林", "罗", "郑"],
      asciiLast: { "王": "wang", "李": "li", "张": "zhang", "刘": "liu", "陈": "chen", "杨": "yang", "黄": "huang", "赵": "zhao", "吴": "wu", "周": "zhou", "徐": "xu", "孙": "sun", "马": "ma", "朱": "zhu", "胡": "hu", "郭": "guo", "何": "he", "林": "lin", "罗": "luo", "郑": "zheng" },
      tm: ["先生", "先生", "先生", "博士"],
      tf: ["女士", "女士", "女士", "博士"]
    },
    ja: {
      order: "lf",
      m: ["Haruto", "Yuto", "Sota", "Ren", "Hayato", "Riku", "Kaito", "Yuki", "Takumi", "Rui", "Hiroto", "Daiki", "Ryusei", "Kenta", "Shota", "Ken", "Takashi", "Yuya"],
      f: ["Yui", "Hina", "Yuna", "Sakura", "Aoi", "Rin", "Hikari", "Mio", "Mei", "Saki", "Nanami", "Ayumi", "Yuki", "Riko", "Hana", "Misaki", "Haruka", "Emi"],
      l: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Yamashita"],
      tm: ["さん", "さん", "さん", "先生"],
      tf: ["さん", "さん", "さん", "先生"]
    },
    ko: {
      order: "lf",
      m: ["Min-jun", "Seo-jun", "Do-yun", "Ha-joon", "Eun-woo", "Ji-ho", "Ju-won", "Ye-jun", "Ji-hoon", "Jun-seo", "Seung-min", "Tae-yang", "Hyun-woo", "Sang-hoon", "Jae-min", "Dong-hyun", "Young-min", "Kyung-mo"],
      f: ["Seo-yeon", "Ha-eun", "Ji-woo", "Soo-ah", "Ha-yoon", "Ji-yoo", "Yu-jin", "Da-eun", "Ji-min", "Na-eun", "Ye-rin", "So-yeon", "Min-seo", "Chae-won", "Eun-ji", "Hye-jin", "Su-jeong", "Yu-ra"],
      l: ["Kim", "Lee", "Park", "Choi", "Jeong", "Kang", "Cho", "Yoon", "Jang", "Lim", "Han", "Oh", "Seo", "Shin", "Kwon", "Hwang", "Ahn", "Song", "Hong", "Jeon"],
      tm: ["님", "님", "님", "박사"],
      tf: ["님", "님", "님", "박사"]
    },
    ms: {
      order: "fl",
      m: ["Muhammad", "Ahmad", "Amir", "Daniel", "Adam", "Irfan", "Zulkifli", "Hafiz", "Faiz", "Khairul", "Ridzuan", "Azlan", "Farid", "Aiman", "Syafiq", "Hakim", "Danish", "Arif"],
      f: ["Nur", "Siti", "Aisyah", "Fatimah", "Aina", "Sarah", "Farah", "Nurul", "Hafizah", "Diana", "Melissa", "Amy", "Liyana", "Izzah", "Aqilah", "Batrisyia", "Nadia", "Zulaikha"],
      l: ["Abdullah", "Ahmad", "Tan", "Lim", "Lee", "Ong", "Chan", "Yap", "Wong", "Goh", "Ng", "Chong", "Ismail", "Rahman", "Hashim", "Osman", "Hamid", "Samad", "Bakar", "Ali"],
      tm: ["Tn.", "Tn.", "Dr."],
      tf: ["Pn.", "Pn.", "Dr."]
    },
    id: {
      order: "fl",
      m: ["Adi", "Budi", "Agus", "Rizky", "Andi", "Dimas", "Fajar", "Bagus", "Yoga", "Putra", "Dwi", "Hendra", "Bayu", "Raka", "Arif", "Dedi", "Eko", "Galih"],
      f: ["Putri", "Sari", "Dewi", "Ayu", "Rina", "Fitri", "Wati", "Lestari", "Ratna", "Maya", "Indah", "Sri", "Novi", "Rahma", "Dian", "Mega", "Yuni", "Ani"],
      l: ["Santoso", "Wibowo", "Pratama", "Wijaya", "Saputra", "Hidayat", "Nugroho", "Setiawan", "Kusuma", "Putra", "Maulana", "Firmansyah", "Ramadhan", "Permana", "Gunawan", "Halim", "Siregar", "Nasution", "Simanjuntak", "Tanjung"],
      tm: ["Tn.", "Tn.", "Dr."],
      tf: ["Ny.", "Ny.", "Dr."]
    },
    th: {
      order: "fl",
      m: ["Somchai", "Anucha", "Kittipong", "Nattapong", "Worapon", "Somsak", "Prasert", "Thanakorn", "Chaiwat", "Apichat", "Kritsada", "Jirayu", "Noppadol", "Preecha", "Suriya", "Tanawat", "Watcharapon", "Yodchai"],
      f: ["Somporn", "Kanya", "Malee", "Nongnut", "Pensri", "Siriporn", "Wanida", "Anchalee", "Kannika", "Natthida", "Piyada", "Rattana", "Sasithorn", "Thanyaporn", "Waraporn", "Yupaporn", "Chalisa", "Ploy"],
      l: ["Saetang", "Srisawat", "Chaiyasit", "Wongchai", "Boonmee", "Suwanno", "Phromma", "Kaewkla", "Thongchai", "Rattanakorn", "Srisuk", "Jaidee", "Chaiyaporn", "Phuangthong", "Klinprathum", "Sombatcharoen", "Saelee", "Yangyuen"],
      tm: ["คุณ", "คุณ", "ดร."],
      tf: ["คุณ", "คุณ", "ดร."]
    },
    vi: {
      order: "fl",
      m: ["Minh", "Anh", "Tuấn", "Hùng", "Nam", "Thành", "Long", "Đức", "Quang", "Hoàng", "Vinh", "Tâm", "Phúc", "Trung", "Dũng", "Kiên", "Cường", "Hải"],
      f: ["Lan", "Hương", "Mai", "Trang", "Thảo", "Nga", "Hằng", "Linh", "Ngọc", "Thủy", "Vân", "Hoa", "Yến", "Nhung", "Quỳnh", "Chi", "Phương", "Hà"],
      l: ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Đinh", "Lý", "Mai", "Trịnh", "Đào"],
      tm: ["Ông", "Ông", "Dr."],
      tf: ["Bà", "Bà", "Dr."]
    },
    tl: {
      order: "fl",
      m: ["Jose", "Juan", "Antonio", "Ramon", "Ernesto", "Ricardo", "Roberto", "Eduardo", "Dennis", "Mark", "Anthony", "Joseph", "Michael", "Christopher", "Jericho", "Emmanuel", "Rafael", "Danilo"],
      f: ["Maria", "Josefa", "Ana", "Carmen", "Rosa", "Teresa", "Ligaya", "Jocelyn", "Grace", "Karen", "Michelle", "Angelica", "Kristine", "Marites", "Rowena", "Liezl", "Charmaine", "Divina"],
      l: ["Dela Cruz", "Garcia", "Reyes", "Ramos", "Mendoza", "Santos", "Flores", "Gonzales", "Bautista", "Villanueva", "Fernandez", "De Guzman", "Castillo", "Rivera", "Aquino", "Navarro", "Salazar", "Mercado"],
      tm: ["G.", "G.", "Dr."],
      tf: ["Gng.", "Gng.", "Dr."]
    },
    hi: {
      order: "fl",
      m: ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Rohan", "Rahul", "Vikram", "Amit", "Rajesh", "Suresh", "Anil", "Deepak"],
      f: ["Ananya", "Aadhya", "Diya", "Myra", "Sara", "Pari", "Anika", "Navya", "Priya", "Neha", "Pooja", "Sneha", "Kavya", "Meera", "Lakshmi", "Divya", "Ritu", "Shreya"],
      l: ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Shah", "Mehta", "Joshi", "Mishra", "Agarwal", "Nair", "Reddy", "Rao", "Iyer", "Das", "Chatterjee", "Banerjee", "Kapoor", "Malhotra"],
      tm: ["Shri", "Shri", "Dr."],
      tf: ["Smt.", "Smt.", "Dr."]
    },
    ar: {
      order: "fl",
      m: ["Mohammed", "Ahmed", "Ali", "Omar", "Khalid", "Abdullah", "Fahad", "Saud", "Abdulaziz", "Faisal", "Sultan", "Rashid", "Hamdan", "Tariq", "Nasser", "Majed", "Yousef", "Bilal"],
      f: ["Fatima", "Aisha", "Mariam", "Sara", "Noor", "Layla", "Hind", "Reem", "Latifa", "Mona", "Salma", "Hessa", "Shamma", "Amna", "Khadija", "Zainab", "Rania", "Dana"],
      l: ["Al Qahtani", "Al Harbi", "Al Tamimi", "Al Ghamdi", "Al Shehri", "Al Otaibi", "Al Dosari", "Al Zahrani", "Al Anazi", "Al Mutairi", "Al Mansouri", "Al Hashimi", "Al Marzouqi", "Al Suwaidi", "Al Rashidi", "Al Amri", "Al Shammari", "Al Balushi"],
      tm: ["السيد", "السيد", "د."],
      tf: ["السيدة", "السيدة", "د."]
    },
    he: {
      order: "fl",
      m: ["David", "Yosef", "Avraham", "Daniel", "Yehuda", "Moshe", "Yitzhak", "Noam", "Yonatan", "Eitan", "Amit", "Ori", "Tal", "Guy", "Shai", "Ron", "Tomer", "Nadav"],
      f: ["Tamar", "Noa", "Sarah", "Rivka", "Shira", "Yael", "Maya", "Talia", "Michal", "Roni", "Adi", "Shir", "Lian", "Hila", "Dana", "Neta", "Gal", "Eden"],
      l: ["Cohen", "Levi", "Mizrahi", "Peretz", "Biton", "Katz", "Shapira", "Ohana", "Amsalem", "Malka", "Azulay", "Chen", "Davidov", "Ben David", "Haddad", "Nissan", "Twito", "Rosenberg"],
      tm: ["Mr.", "Mr.", "Dr."],
      tf: ["Ms.", "Ms.", "Dr."]
    }
  };

  /* ================= 美国专用（区号 / 56 地区 / 免税州） ================= */
  const AREA_CODES = {
    "US": {
      AL: ["205", "251", "256", "334", "659", "938"], AK: ["907"],
      AZ: ["480", "520", "602", "623", "928"], AR: ["479", "501", "870"],
      CA: ["209", "213", "279", "310", "323", "341", "408", "415", "510", "530", "559", "562", "619", "626", "628", "650", "657", "661", "669", "707", "714", "747", "760", "805", "818", "820", "831", "840", "858", "909", "916", "925", "949", "951"],
      CO: ["303", "719", "720", "970", "983"], CT: ["203", "475", "860", "959"],
      DE: ["302"], DC: ["202"],
      FL: ["239", "305", "321", "352", "386", "407", "561", "727", "754", "772", "786", "813", "850", "863", "904", "941", "954"],
      GA: ["229", "404", "470", "478", "678", "706", "762", "770", "912", "943"],
      HI: ["808"], ID: ["208", "986"],
      IL: ["217", "224", "309", "312", "331", "447", "464", "618", "630", "708", "730", "773", "779", "815", "847", "872"],
      IN: ["219", "260", "317", "463", "574", "765", "812", "930"],
      IA: ["319", "515", "563", "641", "712"], KS: ["316", "620", "785", "913"],
      KY: ["270", "364", "502", "606", "859"], LA: ["225", "318", "337", "504", "985"],
      ME: ["207"], MD: ["240", "301", "410", "443", "667"],
      MA: ["339", "351", "413", "508", "617", "774", "781", "857", "978"],
      MI: ["231", "248", "269", "313", "517", "586", "616", "679", "734", "810", "906", "947", "989"],
      MN: ["218", "320", "507", "612", "651", "763", "952"], MS: ["228", "601", "662", "769"],
      MO: ["314", "417", "557", "573", "636", "660", "816", "975"], MT: ["406"],
      NE: ["308", "402", "531"], NV: ["702", "725", "775"], NH: ["603"],
      NJ: ["201", "551", "609", "640", "732", "848", "856", "862", "908", "973"],
      NM: ["505", "575"], NY: ["212", "315", "332", "347", "363", "516", "518", "585", "607", "631", "646", "680", "716", "718", "838", "845", "914", "917", "929"],
      NC: ["252", "336", "472", "743", "828", "910", "919", "980", "984"], ND: ["701"],
      OH: ["216", "220", "234", "283", "326", "330", "380", "419", "436", "440", "513", "567", "614", "740", "937"],
      OK: ["405", "539", "572", "580", "918"], OR: ["458", "503", "541", "971"],
      PA: ["215", "223", "267", "272", "412", "445", "484", "570", "582", "610", "717", "724", "814", "878"],
      RI: ["401"], SC: ["803", "839", "854", "864"], SD: ["605"],
      TN: ["423", "615", "629", "731", "865", "901", "931"],
      TX: ["210", "214", "254", "281", "325", "346", "361", "409", "430", "432", "469", "512", "682", "713", "726", "737", "806", "817", "830", "832", "903", "915", "936", "940", "945", "956", "972", "979"],
      UT: ["385", "435", "801"], VT: ["802"],
      VA: ["276", "434", "540", "571", "703", "757", "804", "826", "948"],
      WA: ["206", "253", "360", "425", "509", "564"], WV: ["304", "681"],
      WI: ["262", "274", "353", "414", "534", "608", "715", "920"], WY: ["307"],
      PR: ["787", "939"], GU: ["671"], VI: ["340"], AS: ["684"], MP: ["670"]
    },
    "CA": {
      "Ontario": ["416", "647", "905", "289", "519", "226", "365", "249", "683"],
      "Quebec": ["514", "438", "450", "579", "819", "873", "468"],
      "British Columbia": ["604", "778", "236", "250", "672"],
      "Alberta": ["403", "780", "587", "825", "368"],
      "Manitoba": ["204", "431", "584"], "Saskatchewan": ["306", "639", "474"],
      "Nova Scotia": ["902", "782"], "New Brunswick": ["506", "428"],
      "Newfoundland and Labrador": ["709", "879"], "Prince Edward Island": ["902", "782"],
      "Yukon": ["867"], "Northwest Territories": ["867"], "Nunavut": ["867"]
    }
  };

  const US_STATES = {
    AL: { name: "Alabama", free: false }, AK: { name: "Alaska", free: true },
    AZ: { name: "Arizona", free: false }, AR: { name: "Arkansas", free: false },
    CA: { name: "California", free: false }, CO: { name: "Colorado", free: false },
    CT: { name: "Connecticut", free: false }, DE: { name: "Delaware", free: true },
    DC: { name: "District of Columbia", free: false },
    FL: { name: "Florida", free: false }, GA: { name: "Georgia", free: false },
    HI: { name: "Hawaii", free: false }, ID: { name: "Idaho", free: false },
    IL: { name: "Illinois", free: false }, IN: { name: "Indiana", free: false },
    IA: { name: "Iowa", free: false }, KS: { name: "Kansas", free: false },
    KY: { name: "Kentucky", free: false }, LA: { name: "Louisiana", free: false },
    ME: { name: "Maine", free: false }, MD: { name: "Maryland", free: false },
    MA: { name: "Massachusetts", free: false }, MI: { name: "Michigan", free: false },
    MN: { name: "Minnesota", free: false }, MS: { name: "Mississippi", free: false },
    MO: { name: "Missouri", free: false }, MT: { name: "Montana", free: true },
    NE: { name: "Nebraska", free: false }, NV: { name: "Nevada", free: false },
    NH: { name: "New Hampshire", free: true }, NJ: { name: "New Jersey", free: false },
    NM: { name: "New Mexico", free: false }, NY: { name: "New York", free: false },
    NC: { name: "North Carolina", free: false }, ND: { name: "North Dakota", free: false },
    OH: { name: "Ohio", free: false }, OK: { name: "Oklahoma", free: false },
    OR: { name: "Oregon", free: true }, PA: { name: "Pennsylvania", free: false },
    RI: { name: "Rhode Island", free: false }, SC: { name: "South Carolina", free: false },
    SD: { name: "South Dakota", free: false }, TN: { name: "Tennessee", free: false },
    TX: { name: "Texas", free: false }, UT: { name: "Utah", free: false },
    VT: { name: "Vermont", free: false }, VA: { name: "Virginia", free: false },
    WA: { name: "Washington", free: false }, WV: { name: "West Virginia", free: false },
    WI: { name: "Wisconsin", free: false }, WY: { name: "Wyoming", free: false },
    PR: { name: "Puerto Rico", free: true }, GU: { name: "Guam", free: true },
    VI: { name: "U.S. Virgin Islands", free: true }, AS: { name: "American Samoa", free: true },
    MP: { name: "Northern Mariana Islands", free: true }
  };

  /* ================= 国家元数据 =================
   * num 门牌号风格:
   *  first  - "123 Main St"      after - "Hauptstraße 123"
   *  comma  - "ул. Ленина, 12"   tr    - "Atatürk Caddesi No:12"
   *  id     - "Jalan Melati No. 12"  cn  - "中山路12号"
   *  jp     - "2-3-1 市区名"（日本街区式，不使用街道名）
   */
  const COUNTRIES = {
    US: { zh: "美国", name: "United States", locale: "en", regionLabel: ["州", "State"], num: "first", streets: US_STREETS,
      email: ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "aol.com", "icloud.com", "proton.me", "comcast.net", "live.com"],
      phone: (a, h) => `(${a}) ${h.ri(200, 999)}-${String(h.ri(0, 9999)).padStart(4, "0")}` },
    CA: { zh: "加拿大", name: "Canada", locale: "en", regionLabel: ["省", "Province"], num: "first", streets: GB_STREETS, areas: ["416", "604", "403", "514", "613", "780"],
      email: ["gmail.com", "hotmail.com", "yahoo.ca", "outlook.com", "shaw.ca", "rogers.com"],
      phone: (a, h) => `(${a}) ${h.ri(200, 999)}-${String(h.ri(0, 9999)).padStart(4, "0")}` },
    MX: { zh: "墨西哥", name: "Mexico", locale: "es", regionLabel: ["州", "State"], num: "comma", streets: ES_STREETS, areas: ["55", "81", "33", "222", "664", "998", "811", "477"],
      email: ["gmail.com", "hotmail.com", "prodigy.net.mx", "yahoo.com.mx", "outlook.com"],
      phone: (a, h) => `(${a}) ${h.dg(4)}-${h.dg(4)}` },
    BR: { zh: "巴西", name: "Brazil", locale: "br", regionLabel: ["州", "State"], num: "comma", streets: BR_STREETS, areas: ["11", "21", "31", "41", "51", "61", "62", "71", "81", "85", "27", "48"],
      email: ["gmail.com", "hotmail.com", "uol.com.br", "bol.com.br", "terra.com.br", "yahoo.com.br"],
      phone: (a, h) => Math.random() < 0.7 ? `(${a}) 9${h.dg(4)}-${h.dg(4)}` : `(${a}) ${h.rand(["2", "3", "4", "5"])}${h.dg(3)}-${h.dg(4)}` },
    AR: { zh: "阿根廷", name: "Argentina", locale: "es", regionLabel: ["省", "Province"], num: "comma", streets: ES_STREETS, areas: ["11", "351", "261", "341", "381", "299", "221"],
      email: ["gmail.com", "hotmail.com", "yahoo.com.ar", "outlook.com"],
      phone: (a, h) => `(${a}) ${h.dg(4)}-${h.dg(4)}` },
    CL: { zh: "智利", name: "Chile", locale: "es", regionLabel: ["大区", "Region"], num: "comma", streets: ES_STREETS, areas: ["2", "32", "33", "41", "45", "51", "55", "63"],
      email: ["gmail.com", "hotmail.com", "vtr.net", "entelchile.net", "outlook.com"],
      phone: (a, h) => `(${a}) ${h.dg(4)}-${h.dg(4)}` },
    CO: { zh: "哥伦比亚", name: "Colombia", locale: "es", regionLabel: ["省", "Department"], num: "comma", streets: ES_STREETS,
      email: ["gmail.com", "hotmail.com", "une.net.co", "outlook.com", "yahoo.com"],
      phone: (a, h) => Math.random() < 0.6 ? `3${h.rand(["0", "1", "2"])}${h.dg(2)} ${h.dg(3)} ${h.dg(4)}` : `(${h.rand(["1", "4", "2", "5", "7", "8"])}) ${h.dg(7)}` },
    GB: { zh: "英国", name: "United Kingdom", locale: "en", regionLabel: ["地区", "Nation"], num: "first", streets: GB_STREETS, areas: ["20", "121", "161", "113", "141", "151", "131", "117", "29", "28", "1902", "1509"],
      email: ["gmail.com", "hotmail.co.uk", "yahoo.co.uk", "outlook.com", "btinternet.com", "sky.com"],
      phone: (a, h) => `0${a} ${h.dg(4)} ${h.dg(4)}` },
    IE: { zh: "爱尔兰", name: "Ireland", locale: "en", regionLabel: ["郡", "County"], num: "first", streets: GB_STREETS,
      email: ["gmail.com", "eircom.net", "outlook.com", "yahoo.com"],
      phone: (a, h) => Math.random() < 0.65 ? `08${h.rand(["3", "5", "6", "7", "8", "9"])} ${h.dg(3)} ${h.dg(4)}` : `0${h.rand(["1", "21", "61", "91", "41", "42"])} ${h.dg(7)}` },
    FR: { zh: "法国", name: "France", locale: "fr", regionLabel: ["大区", "Region"], num: "first", streets: FR_STREETS, areas: ["01", "02", "03", "04", "05"],
      email: ["gmail.com", "orange.fr", "free.fr", "wanadoo.fr", "laposte.net", "hotmail.fr"],
      phone: (a, h) => { const p = () => h.ri(10, 99); return Math.random() < 0.35 ? `0${h.rand(["6", "7"])} ${p()} ${p()} ${p()} ${p()}` : `${a} ${p()} ${p()} ${p()} ${p()}`; } },
    BE: { zh: "比利时", name: "Belgium", locale: "fr", regionLabel: ["大区", "Region"], num: "first", streets: NL_STREETS, areas: ["2", "3", "9", "4", "10", "11"],
      email: ["gmail.com", "skynet.be", "telenet.be", "hotmail.com", "outlook.com"],
      phone: (a, h) => Math.random() < 0.45 ? `04${h.rand(["7", "8", "9"])}${h.dg(1)} ${h.dg(2)} ${h.dg(2)} ${h.dg(2)}` : `0${a} ${h.dg(2)} ${h.dg(2)} ${h.dg(2)}` },
    NL: { zh: "荷兰", name: "Netherlands", locale: "nl", regionLabel: ["省", "Province"], num: "after", streets: NL_STREETS, areas: ["20", "10", "30", "40", "50", "70", "23", "35"],
      email: ["gmail.com", "hotmail.com", "ziggo.nl", "kpnmail.nl", "outlook.com"],
      phone: (a, h) => `0${a} ${h.dg(7)}` },
    DE: { zh: "德国", name: "Germany", locale: "de", regionLabel: ["联邦州", "State"], num: "after", streets: DE_STREETS, areas: ["30", "89", "40", "69", "221", "711", "211", "351", "911", "511"],
      email: ["gmail.com", "web.de", "gmx.de", "t-online.de", "freenet.de", "hotmail.de"],
      phone: (a, h) => Math.random() < 0.35 ? `017${h.ri(0, 9)} ${h.ri(1000000, 99999999)}` : `0${a} ${h.dg(h.ri(6, 8))}` },
    AT: { zh: "奥地利", name: "Austria", locale: "de", regionLabel: ["州", "State"], num: "after", streets: DE_STREETS, areas: ["1", "316", "512", "662", "732", "4222"],
      email: ["gmail.com", "gmx.at", "aon.at", "chello.at", "hotmail.com"],
      phone: (a, h) => Math.random() < 0.5 ? `0664 ${h.dg(4)} ${h.dg(4)}` : `0${a} ${h.dg(7)}` },
    CH: { zh: "瑞士", name: "Switzerland", locale: "de", regionLabel: ["州", "Canton"], num: "after", streets: DE_STREETS, areas: ["44", "43", "22", "31", "61", "71", "41", "91"],
      email: ["gmail.com", "bluewin.ch", "gmx.ch", "sunrise.ch", "hotmail.com"],
      phone: (a, h) => Math.random() < 0.5 ? `07${h.rand(["6", "7", "8", "9"])} ${h.dg(3)} ${h.dg(2)} ${h.dg(2)}` : `0${a} ${h.dg(3)} ${h.dg(2)} ${h.dg(2)}` },
    IT: { zh: "意大利", name: "Italy", locale: "it", regionLabel: ["大区", "Region"], num: "after", streets: IT_STREETS, areas: ["06", "02", "081", "055", "011", "045", "051", "091", "010", "071"],
      email: ["gmail.com", "libero.it", "virgilio.it", "hotmail.it", "tiscali.it"],
      phone: (a, h) => Math.random() < 0.4 ? `3${h.dg(2)} ${h.dg(3)} ${h.dg(4)}` : `${a} ${h.dg(h.ri(6, 7))}` },
    ES: { zh: "西班牙", name: "Spain", locale: "es", regionLabel: ["自治区", "Community"], num: "after", streets: ES_STREETS, areas: ["91", "93", "96", "95", "94", "97"],
      email: ["gmail.com", "hotmail.es", "yahoo.es", "outlook.com"],
      phone: (a, h) => Math.random() < 0.4 ? `${h.rand(["6", "7"])}${h.dg(2)} ${h.dg(3)} ${h.dg(3)}` : `${a} ${h.dg(3)} ${h.dg(4)}` },
    PT: { zh: "葡萄牙", name: "Portugal", locale: "pt", regionLabel: ["大区", "District"], num: "after", streets: ["Rua das Flores", "Rua de Santa Catarina", "Avenida da Liberdade", "Rua Augusta", "Rua do Carmo", "Rua Nova", "Rua Direita", "Rua de São João", "Avenida da República", "Rua 5 de Outubro", "Rua do Campo", "Rua Formosa", "Rua de Cedofeita", "Rua de Santo António", "Rua Dr. Barbosa de Castro", "Praça do Comércio"], areas: ["21", "22", "23", "25", "26", "28", "29"],
      email: ["gmail.com", "sapo.pt", "hotmail.com", "mail.pt", "outlook.com"],
      phone: (a, h) => Math.random() < 0.5 ? `9${h.dg(2)} ${h.dg(3)} ${h.dg(3)}` : `${a} ${h.dg(3)} ${h.dg(3)}` },
    PL: { zh: "波兰", name: "Poland", locale: "pl", regionLabel: ["省", "Voivodeship"], num: "after", streets: PL_STREETS, areas: ["22", "61", "12", "32", "71", "58", "81", "91"],
      email: ["gmail.com", "wp.pl", "onet.pl", "o2.pl", "interia.pl"],
      phone: (a, h) => Math.random() < 0.5 ? `${h.rand(["5", "6", "7", "8"])}${h.dg(2)} ${h.dg(3)} ${h.dg(3)}` : `(${a}) ${h.dg(3)}-${h.dg(2)}-${h.dg(2)}` },
    SE: { zh: "瑞典", name: "Sweden", locale: "se", regionLabel: ["省", "County"], num: "after", streets: SE_STREETS, areas: ["8", "31", "40", "46", "18", "911"],
      email: ["gmail.com", "telia.com", "spray.se", "hotmail.com", "outlook.com"],
      phone: (a, h) => Math.random() < 0.55 ? `07${h.rand(["0", "2", "3", "6"])}-${h.dg(3)} ${h.dg(2)} ${h.dg(2)}` : `0${a}-${h.dg(3)} ${h.dg(2)} ${h.dg(2)}` },
    NO: { zh: "挪威", name: "Norway", locale: "no", regionLabel: ["郡", "County"], num: "after", streets: NO_STREETS,
      email: ["gmail.com", "online.no", "hotmail.com", "outlook.com"],
      phone: (a, h) => Math.random() < 0.7 ? `${h.rand(["4", "9"])}${h.dg(2)} ${h.dg(2)} ${h.dg(3)}` : `${h.rand(["2", "3", "5", "6", "7"])}${h.dg(1)} ${h.dg(2)} ${h.dg(2)} ${h.dg(2)}` },
    DK: { zh: "丹麦", name: "Denmark", locale: "dk", regionLabel: ["大区", "Region"], num: "after", streets: DK_STREETS,
      email: ["gmail.com", "mail.dk", "hotmail.com", "outlook.com"],
      phone: (a, h) => `${h.rand(["2", "3", "5", "6", "7", "8", "9"])}${h.dg(2)} ${h.dg(2)} ${h.dg(2)} ${h.dg(2)}` },
    RU: { zh: "俄罗斯", name: "Russia", locale: "ru", regionLabel: ["州", "Region"], num: "comma", streets: RU_STREETS,
      email: ["mail.ru", "yandex.ru", "gmail.com", "rambler.ru", "inbox.ru"],
      phone: (a, h) => Math.random() < 0.55 ? `+7 (${h.rand(["903", "916", "925", "905", "926", "962", "981", "951", "913", "963"])}) ${h.dg(3)}-${h.dg(2)}-${h.dg(2)}` : `+7 (${h.rand(["495", "499", "812", "383", "343", "843", "861", "473", "381", "342"])}) ${h.dg(3)}-${h.dg(2)}-${h.dg(2)}` },
    TR: { zh: "土耳其", name: "Türkiye", locale: "tr", regionLabel: ["省", "Province"], num: "tr", streets: TR_STREETS,
      email: ["gmail.com", "hotmail.com", "mynet.com", "yahoo.com", "outlook.com"],
      phone: (a, h) => `05${h.rand(["3", "4", "5"])}${h.dg(1)} ${h.dg(3)} ${h.dg(2)} ${h.dg(2)}` },
    CN: { zh: "中国", name: "China", locale: "zh", regionLabel: ["省", "Province"], num: "cn", streets: CN_STREETS,
      email: ["qq.com", "163.com", "126.com", "sina.com", "gmail.com", "hotmail.com"],
      phone: (a, h) => Math.random() < 0.45 ? `1${h.rand(["3", "5", "7", "8"])}${h.dg(2)}-${h.dg(4)}-${h.dg(4)}` : `${h.rand(["010", "021", "020", "022", "023", "027", "028", "0755", "0571", "024"])}-${h.dg(8)}` },
    JP: { zh: "日本", name: "Japan", locale: "ja", regionLabel: ["都道府県", "Prefecture"], num: "jp", streets: [],
      email: ["gmail.com", "yahoo.co.jp", "docomo.ne.jp", "ezweb.ne.jp", "hotmail.co.jp"],
      phone: (a, h) => Math.random() < 0.55 ? `0${h.rand(["90", "80", "70"])}-${h.dg(4)}-${h.dg(4)}` : `0${h.rand(["3", "6"])}-${h.dg(4)}-${h.dg(4)}` },
    KR: { zh: "韩国", name: "South Korea", locale: "ko", regionLabel: ["广域市·道", "Province"], num: "after", streets: KO_STREETS,
      email: ["naver.com", "daum.net", "gmail.com", "hanmail.net", "kakao.com"],
      phone: (a, h) => Math.random() < 0.6 ? `010-${h.dg(4)}-${h.dg(4)}` : `${h.rand(["02", "031", "051", "053", "062", "042"])}-${h.dg(3)}-${h.dg(4)}` },
    MY: { zh: "马来西亚", name: "Malaysia", locale: "ms", regionLabel: ["州", "State"], num: "first", streets: MY_STREETS,
      email: ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"],
      phone: (a, h) => Math.random() < 0.65 ? `01${h.rand(["1", "2", "3", "6", "9"])}-${h.dg(3)}-${h.dg(4)}` : `0${h.rand(["3", "4", "5", "6", "7"])}-${h.dg(7)}` },
    ID: { zh: "印度尼西亚", name: "Indonesia", locale: "id", regionLabel: ["省", "Province"], num: "id", streets: ID_STREETS,
      email: ["gmail.com", "yahoo.co.id", "hotmail.com", "outlook.com"],
      phone: (a, h) => Math.random() < 0.7 ? `08${h.rand(["11", "12", "13", "21", "22", "38", "78", "57"])}-${h.dg(4)}-${h.dg(4)}` : `0${h.rand(["21", "22", "31", "24", "61"])}-${h.dg(7)}` },
    TH: { zh: "泰国", name: "Thailand", locale: "th", regionLabel: ["府", "Province"], num: "first", streets: TH_STREETS,
      email: ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"],
      phone: (a, h) => `0${h.rand(["8", "9", "6"])}${h.dg(2)}-${h.dg(3)}-${h.dg(4)}` },
    PH: { zh: "菲律宾", name: "Philippines", locale: "tl", regionLabel: ["地区", "Region"], num: "first", streets: PH_STREETS,
      email: ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"],
      phone: (a, h) => Math.random() < 0.7 ? `0${h.rand(["905", "906", "915", "917", "918", "919", "920", "921", "926", "928"])} ${h.dg(3)} ${h.dg(4)}` : `0${h.rand(["2", "32", "82", "33", "88"])} ${h.dg(7)}` },
    IN: { zh: "印度", name: "India", locale: "hi", regionLabel: ["邦", "State"], num: "first", streets: IN_STREETS,
      email: ["gmail.com", "yahoo.com", "rediffmail.com", "outlook.com", "hotmail.com"],
      phone: (a, h) => Math.random() < 0.65 ? `${h.rand(["9", "8", "7"])}${h.dg(4)} ${h.dg(5)}` : `0${h.rand(["11", "22", "33", "44", "80", "40", "20", "79"])} ${h.dg(8)}` },
    AE: { zh: "阿联酋", name: "United Arab Emirates", locale: "ar", regionLabel: ["酋长国", "Emirate"], num: "after", streets: AR_STREETS,
      email: ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"],
      phone: (a, h) => Math.random() < 0.7 ? `+971 5${h.rand(["0", "2", "4", "5", "6"])} ${h.dg(3)} ${h.dg(4)}` : `+971 ${h.rand(["2", "4", "6", "3", "9", "7"])} ${h.dg(3)} ${h.dg(4)}` },
    ZA: { zh: "南非", name: "South Africa", locale: "en", regionLabel: ["省", "Province"], num: "first", streets: GB_STREETS,
      email: ["gmail.com", "webmail.co.za", "yahoo.com", "outlook.com"],
      phone: (a, h) => `0${h.rand(["6", "7", "8"])}${h.dg(2)} ${h.dg(3)} ${h.dg(4)}` },
    NZ: { zh: "新西兰", name: "New Zealand", locale: "en", regionLabel: ["大区", "Region"], num: "first", streets: GB_STREETS,
      email: ["gmail.com", "yahoo.co.nz", "outlook.com", "xtra.co.nz"],
      phone: (a, h) => Math.random() < 0.6 ? `02${h.rand(["1", "7", "9"])} ${h.dg(3)} ${h.dg(4)}` : `(0${h.rand(["9", "4", "3", "6", "7"])}) ${h.dg(3)}-${h.dg(4)}` },
    AU: { zh: "澳大利亚", name: "Australia", locale: "en", regionLabel: ["州", "State"], num: "first", streets: GB_STREETS,
      email: ["gmail.com", "hotmail.com", "yahoo.com.au", "outlook.com", "bigpond.com"],
      phone: (a, h) => Math.random() < 0.6 ? `04${h.dg(2)} ${h.dg(3)} ${h.dg(3)}` : `(0${h.rand(["2", "3", "7", "8"])}) ${h.dg(4)} ${h.dg(4)}` }
  };

  /* ================= 热门城市中文名 / 快捷旗标 ================= */
  const FAMOUS_ZH = {
    "New York": "纽约", "Los Angeles": "洛杉矶", "Chicago": "芝加哥", "Houston": "休斯敦",
    "Phoenix": "凤凰城", "Philadelphia": "费城", "San Antonio": "圣安东尼奥", "San Diego": "圣迭戈",
    "Dallas": "达拉斯", "San Jose": "圣何塞", "Austin": "奥斯汀", "Seattle": "西雅图",
    "Denver": "丹佛", "Boston": "波士顿", "Washington": "华盛顿", "Las Vegas": "拉斯维加斯",
    "Toronto": "多伦多", "Vancouver": "温哥华", "Montréal": "蒙特利尔", "Montreal": "蒙特利尔", "Calgary": "卡尔加里", "Ottawa": "渥太华",
    "London": "伦敦", "Manchester": "曼彻斯特", "Birmingham": "伯明翰", "Liverpool": "利物浦",
    "Edinburgh": "爱丁堡", "Glasgow": "格拉斯哥", "Bristol": "布里斯托", "Leeds": "利兹",
    "Berlin": "柏林", "Hamburg": "汉堡", "München": "慕尼黑", "Köln": "科隆",
    "Frankfurt am Main": "法兰克福", "Düsseldorf": "杜塞尔多夫", "Stuttgart": "斯图加特", "Dresden": "德累斯顿",
    "Paris": "巴黎", "Marseille": "马赛", "Lyon": "里昂", "Toulouse": "图卢兹", "Nice": "尼斯", "Bordeaux": "波尔多",
    "Roma": "罗马", "Milano": "米兰", "Napoli": "那不勒斯", "Torino": "都灵", "Firenze": "佛罗伦萨", "Venezia": "威尼斯",
    "Madrid": "马德里", "Barcelona": "巴塞罗那", "Valencia": "瓦伦西亚", "Sevilla": "塞维利亚", "Zaragoza": "萨拉戈萨",
    "Amsterdam": "阿姆斯特丹", "Rotterdam": "鹿特丹", "Utrecht": "乌得勒支", "Den Haag": "海牙",
    "Wien": "维也纳", "Linz": "林茨", "Graz": "格拉茨",
    "Zürich": "苏黎世", "Genève": "日内瓦", "Bern": "伯尔尼",
    "Bruxelles": "布鲁塞尔", "Antwerpen": "安特卫普",
    "Warszawa": "华沙", "Kraków": "克拉科夫", "Gdańsk": "格但斯克",
    "Stockholm": "斯德哥尔摩", "Göteborg": "哥德堡", "Oslo": "奥斯陆", "København": "哥本哈根",
    "Москва": "莫斯科", "Санкт-Петербург": "圣彼得堡", "Новосибирск": "新西伯利亚",
    "İstanbul": "伊斯坦布尔", "Ankara": "安卡拉", "İzmir": "伊兹密尔",
    "Beijing": "北京", "Shanghai": "上海", "Guangzhou": "广州", "Shenzhen": "深圳",
    "Hangzhou": "杭州", "Chengdu": "成都", "Wuhan": "武汉", "Nanjing": "南京",
    "Ginza": "银座", "Akasaka": "赤坂", "Marunochi": "丸之内", "Shinjuku": "新宿", "Shibuya": "涩谷",
    "Yokohama": "横滨", "Osaka": "大阪", "Kyoto": "京都", "Sapporo": "札幌", "Fukuoka": "福冈",
    "서울특별시": "首尔", "부산광역시": "釜山", "인천광역시": "仁川",
    "São Paulo": "圣保罗", "Rio de Janeiro": "里约热内卢", "Brasília": "巴西利亚", "Salvador": "萨尔瓦多",
    "İstanbul": "伊斯坦布尔", "Dubai": "迪拜", "Abu Dhabi": "阿布扎比",
    "Mumbai": "孟买", "Delhi": "德里", "Bangalore": "班加罗尔", "Chennai": "金奈", "Hyderabad": "海得拉巴",
    "Bangkok": "曼谷", "Jakarta": "雅加达", "Kuala Lumpur": "吉隆坡", "Manila": "马尼拉",
    "Buenos Aires": "布宜诺斯艾利斯", "Santiago": "圣地亚哥", "Bogotá": "波哥大",
    "Johannesburg": "约翰内斯堡", "Cape Town": "开普敦", "Sydney": "悉尼", "Melbourne": "墨尔本",
    "Brisbane": "布里斯班", "Perth": "珀斯", "Auckland": "奥克兰", "Wellington": "惠灵顿",
    "Dublin": "都柏林", "Lisboa": "里斯本", "Porto": "波尔图", "Krung Thep": "曼谷"
  };

  const POPULAR_CC = ["US", "CA", "GB", "DE", "FR", "IT", "ES", "JP", "CN", "KR", "AU", "BR"];

  window.ADDR_NAMES = {
    LOCALES, AREA_CODES, US_STATES, COUNTRIES, FAMOUS_ZH, POPULAR_CC,
    HAIR: ["Blonde", "Brown", "Black", "Dark Brown", "Light Brown", "Red", "Auburn", "Gray", "Chestnut", "Sandy"],
    OCCUPATIONS: ["Software Engineer", "Registered Nurse", "Elementary School Teacher", "Real Estate Appraiser", "Accountant", "Marketing Manager", "Truck Driver", "Electrician", "Dental Hygienist", "Pharmacist", "Physical Therapist", "Civil Engineer", "Financial Analyst", "Graphic Designer", "Human Resources Manager", "Insurance Agent", "Attorney", "Librarian", "Logistics Manager", "Automotive Mechanic", "Medical Assistant", "Network Administrator", "Paramedic", "Airline Pilot", "Plumber", "Police Officer", "Project Manager", "Property Manager", "Psychologist", "Receptionist", "Sales Manager", "Social Worker", "Data Analyst", "Land Surveyor", "Tax Preparer", "Urban Planner", "Veterinary Technician", "Web Developer", "Welder", "Executive Chef", "Barber", "Bank Teller", "Bookkeeper", "Bus Driver", "Carpenter", "Cashier", "Chemist", "Childcare Worker", "Chiropractor", "Claims Adjuster", "Construction Manager", "Cosmetologist", "Customer Service Representative", "Database Administrator", "Dietitian", "Dispatcher", "Physician", "Editor", "Environmental Scientist", "Cost Estimator", "Event Planner", "Firefighter", "Fitness Trainer", "Flight Attendant", "Forester", "Funeral Director", "Geologist", "Home Health Aide", "Hotel Manager", "Insurance Underwriter", "Interior Designer", "Interpreter", "Journalist", "Landscape Architect", "Locksmith", "Machinist", "Mail Carrier", "Massage Therapist", "Nurse Practitioner", "Occupational Therapist", "Optometrist", "House Painter", "Paralegal", "Photographer", "Physician Assistant", "Preschool Teacher", "Radiologic Technologist", "Real Estate Agent", "Roofer", "Security Guard", "Sheet Metal Worker", "Speech-Language Pathologist", "Taxi Driver", "Teaching Assistant", "Translator", "Veterinarian", "Waiter", "Store Manager", "Statistical Analyst"],
    COMPANY_A: ["Blue Ridge", "Silverline", "Northstar", "Harbor Point", "Summit", "Cascade", "Redwood", "Ironwood", "Brightside", "Clearwater", "Pinnacle", "Stonebridge", "Falcon Ridge", "Maplewood", "Crestview", "Lakeshore", "Pinehurst", "Goldleaf", "Riverbend", "Whitman", "Harrington", "Carter", "Bellamy", "Kingsford", "Ashford", "Westbrook", "Fairchild", "Lockhart", "Merritt", "Vanderbilt"],
    COMPANY_B: ["Holdings", "Group", "Consulting", "Solutions", "Enterprises", "Partners", "Industries", "Logistics", "Technologies", "Management", "Ventures", "Associates", "Systems", "Services LLC", "Group Inc.", "International", "Corporation", "Capital", "Resources", "Development Co."],
    CARD_BRANDS: ["Visa", "Mastercard", "American Express", "Discover"],
    US_STREETS
  };
})();
