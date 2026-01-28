export interface State {
  name: string;
  districts: District[];
}

export interface District {
  name: string;
  villages: string[];
}

// Data sourced from Local Government Directory (lgdirectory.gov.in)
// Ministry of Panchayati Raj, Government of India
export const statesData: State[] = [
  {
    name: 'Telangana',
    districts: [
      {
        name: 'Adilabad',
        villages: [
          'Adilabad', 'Nirmal', 'Mancherial', 'Bellampalle', 'Asifabad', 'Utnoor',
          'Luxettipet', 'Jainad', 'Sirpur (T)', 'Kagaznagar', 'Ichoda', 'Bazarhatnoor',
          'Bela', 'Bhimini', 'Boath', 'Chennur', 'Dahegaon', 'Gadiguda', 'Himayathnagar',
          'Jainoor', 'Kaddam', 'Kouthala', 'Laxmanchanda', 'Mudhole', 'Narsapur',
          'Pembi', 'Rebbena', 'Talamadugu', 'Tiryani', 'Vempalli'
        ],
      },
      {
        name: 'Bhadradri Kothagudem',
        villages: [
          'Kothagudem', 'Bhadrachalam', 'Palwancha', 'Yellandu', 'Aswapuram',
          'Burgampadu', 'Chandrugonda', 'Cherla', 'Dammapeta', 'Dummugudem',
          'Gundala', 'Julurpad', 'Kallur', 'Kamepalli', 'Karakagudem', 'Kondamallepalli',
          'Kondapalli', 'Kothagudem', 'Kukkunoor', 'Manuguru', 'Mulakalapalli',
          'Palwancha', 'Pinapaka', 'Sujathanagar', 'Tekulapalli', 'Thirumalayapalem',
          'Vajedu', 'Venkatapuram', 'V.R. Puram', 'Yellandu'
        ],
      },
      {
        name: 'Hyderabad',
        villages: [
          'Hyderabad', 'Secunderabad', 'Charminar', 'Mehdipatnam', 'Begumpet',
          'Hitec City', 'Banjara Hills', 'Jubilee Hills', 'Masab Tank', 'Khairatabad',
          'Nampally', 'Abids', 'Malakpet', 'Kotla Alijah', 'Asifnagar', 'Ameerpet',
          'Gachibowli', 'Kondapur', 'Serilingampally', 'Shaikpet', 'Uppal'
        ],
      },
      {
        name: 'Jagitial',
        villages: [
          'Jagitial', 'Koratla', 'Metpalli', 'Dharpally', 'Gangadhara',
          'Ibrahimpatnam', 'Ibrahimpet', 'Jagitial', 'Kodimial', 'Koratla',
          'Manthani', 'Medipalli', 'Metpalli', 'Mutharam', 'Pegadapalli',
          'Raikal', 'Raipole', 'Ramagiri', 'Rangampet', 'Sarangapur',
          'Sircilla', 'Sultanabad', 'Thimmajipet', 'Veenavanka', 'Velgatoor'
        ],
      },
      {
        name: 'Jangaon',
        villages: [
          'Jangaon', 'Ghanpur', 'Kodakandla', 'Lingala Ghanpur', 'Narmetta',
          'Raghunathpalle', 'Jangaon', 'Dharmasagar', 'Zaffergadh', 'Ghanpur (Stn)',
          'Bachannapet', 'Cherial', 'Devaruppula', 'Ghanpur', 'Kodakandla',
          'Lingala Ghanpur', 'Narmetta', 'Raghunathpalle', 'Tharigoppula'
        ],
      },
      {
        name: 'Jayashankar Bhupalpally',
        villages: [
          'Bhupalpally', 'Mulugu', 'Eturnagaram', 'Tadvai', 'Venkatapur',
          'Bhupalpally', 'Chityal', 'Dharmaram', 'Eturnagaram', 'Mahabubabad',
          'Mulugu', 'Nallabelli', 'Narsampet', 'Regonda', 'Tadvai',
          'Thorrur', 'Venkatapur', 'Yellareddypet'
        ],
      },
      {
        name: 'Jogulamba Gadwal',
        villages: [
          'Gadwal', 'Alampur', 'Wanaparthy', 'Kodangal', 'Dharur',
          'Gadwal', 'Alampur', 'Bomraspet', 'Dharur', 'Gadwal',
          'Ieeza', 'Kodangal', 'Kothakota', 'Malhar', 'Narayanpet',
          'Wanaparthy', 'Yedapally'
        ],
      },
      {
        name: 'Kamareddy',
        villages: [
          'Kamareddy', 'Yellareddy', 'Banswada', 'Pitlam', 'Machareddy',
          'Kamareddy', 'Banswada', 'Bichkunda', 'Birkur', 'Bodhan',
          'Domakonda', 'Lingampet', 'Machareddy', 'Madnoor', 'Nagireddipet',
          'Pitlam', 'Rajampet', 'Yellareddy'
        ],
      },
      {
        name: 'Karimnagar',
        villages: [
          'Karimnagar', 'Sircilla', 'Manakondur', 'Choppadandi', 'Gangadhara',
          'Karimnagar', 'Boenpalli', 'Choppadandi', 'Elkathurthi', 'Gangadhara',
          'Ganneruvaram', 'Huzurabad', 'Jammikunta', 'Kamanpur', 'Karimnagar',
          'Kataram', 'Kesamudram', 'Kodimial', 'Manakondur', 'Manthani',
          'Ramadugu', 'Saidapur', 'Sircilla', 'Sultanabad', 'Thimmapur',
          'Veenavanka', 'Vemulawada'
        ],
      },
      {
        name: 'Khammam',
        villages: [
          'Khammam', 'Kallur', 'Wyra', 'Bonakal', 'Chintakani',
          'Khammam', 'Aswapuram', 'Bonakal', 'Chintakani', 'Enkoor',
          'Kallur', 'Khammam (Rural)', 'Konijerla', 'Kusumanchi', 'Maddulapalli',
          'Mulakalapalli', 'Nelakondapalli', 'Penuballi', 'Sathupalli', 'Tallada',
          'Thallacheruvu', 'Vemsoor', 'Wyra', 'Yerrupalem'
        ],
      },
      {
        name: 'Kumuram Bheem',
        villages: [
          'Asifabad', 'Kerameri', 'Rebbena', 'Sirpur (T)', 'Wankidi',
          'Asifabad', 'Bejjur', 'Dahegaon', 'Jainad', 'Kerameri',
          'Koutala', 'Luxettipet', 'Penchikalpet', 'Rebbena', 'Sirpur (T)',
          'Tiryani', 'Utnoor', 'Wankidi'
        ],
      },
      {
        name: 'Mahabubabad',
        villages: [
          'Mahabubabad', 'Dornakal', 'Gudur', 'Kesamudram', 'Narsampet',
          'Mahabubabad', 'Dornakal', 'Ghanpur', 'Gudur', 'Kesamudram',
          'Kothagudem', 'Mahabubabad', 'Nallabelli', 'Narsampet', 'Regonda',
          'Thorrur', 'Venkatapur'
        ],
      },
      {
        name: 'Mahabubnagar',
        villages: [
          'Mahabubnagar', 'Jadcherla', 'Kodangal', 'Narayanpet', 'Shadnagar',
          'Mahabubnagar', 'Achampet', 'Addakal', 'Amangal', 'Balmoor',
          'Dharur', 'Gadwal', 'Gopalpet', 'Hanwada', 'Jadcherla',
          'Kodangal', 'Koilkonda', 'Maddur', 'Mahabubnagar', 'Narayanpet',
          'Peddamandadi', 'Shadnagar', 'Wanaparthy'
        ],
      },
      {
        name: 'Mancherial',
        villages: [
          'Mancherial', 'Bellampalle', 'Bheemaram', 'Chennur', 'Dandepalli',
          'Mancherial', 'Bazarhatnoor', 'Bellampalle', 'Bheemaram', 'Chennur',
          'Dandepalli', 'Jaipur', 'Jannaram', 'Khanapur', 'Kotapalli',
          'Luxettipet', 'Mancherial', 'Naspur', 'Tandur', 'Vemanpalli'
        ],
      },
      {
        name: 'Medak',
        villages: [
          'Medak', 'Siddipet', 'Zahirabad', 'Gajwel', 'Narsapur',
          'Medak', 'Alladurg', 'Andole', 'Gajwel', 'Jharasangam',
          'Kohir', 'Kulcharam', 'Manoor', 'Medak', 'Munipalle',
          'Narsapur', 'Narsingi', 'Nyalkal', 'Papannapet', 'Ramayampet',
          'Regode', 'Shankarampet (A)', 'Shankarampet (R)', 'Siddipet', 'Tekmal',
          'Toopran', 'Zahirabad'
        ],
      },
      {
        name: 'Medchal–Malkajgiri',
        villages: [
          'Malkajgiri', 'Quthbullapur', 'Medchal', 'Uppal', 'Ghatkesar',
          'Malkajgiri', 'Balanagar', 'Dundigal', 'Ghatkesar', 'Hayathnagar',
          'Keesara', 'Medchal', 'Quthbullapur', 'Shamirpet', 'Uppal'
        ],
      },
      {
        name: 'Mulugu',
        villages: [
          'Mulugu', 'Venkatapur', 'Eturnagaram', 'Tadvai', 'Wazeedu',
          'Mulugu', 'Eturnagaram', 'Lingala Ghanpur', 'Mulugu', 'Narmetta',
          'Tadvai', 'Venkatapur', 'Wazeedu'
        ],
      },
      {
        name: 'Nagarkurnool',
        villages: [
          'Nagarkurnool', 'Achampet', 'Amrabad', 'Kodair', 'Uppununthala',
          'Nagarkurnool', 'Achampet', 'Amrabad', 'Bijinepalle', 'Chinnachintakunta',
          'Damaragidda', 'Kodair', 'Kollapur', 'Maddur', 'Nagarkurnool',
          'Tadoor', 'Thimmajipet', 'Uppununthala', 'Vangoor'
        ],
      },
      {
        name: 'Nalgonda',
        villages: [
          'Nalgonda', 'Suryapet', 'Miryalaguda', 'Bhongir', 'Devarakonda',
          'Nalgonda', 'Chityal', 'Choutuppal', 'Devarakonda', 'Gurrampode',
          'Kanagal', 'Munugode', 'Nalgonda', 'Nampalle', 'Narketpalle',
          'Nidmanoor', 'Peddavoora', 'Rajapet', 'Ramannapet', 'Shaligowraram',
          'Suryapet', 'Thipparthy', 'Thungathurthi', 'Vemulapalle'
        ],
      },
      {
        name: 'Narayanpet',
        villages: [
          'Narayanpet', 'Kodangal', 'Kosgi', 'Maddur', 'Makkala',
          'Narayanpet', 'Bomraspet', 'Dharur', 'Kodangal', 'Kosgi',
          'Maddur', 'Makkala', 'Narayanpet', 'Yedapally'
        ],
      },
      {
        name: 'Nirmal',
        villages: [
          'Nirmal', 'Dilawarpur', 'Khanapur', 'Laxmanchanda', 'Mudhole',
          'Nirmal', 'Bela', 'Dilawarpur', 'Jainoor', 'Kaddam',
          'Khanapur', 'Laxmanchanda', 'Mudhole', 'Nirmal', 'Pembi',
          'Rebbena', 'Talamadugu', 'Tiryani', 'Vempalli'
        ],
      },
      {
        name: 'Nizamabad',
        villages: [
          'Nizamabad', 'Armoor', 'Balkonda', 'Bodhan', 'Yedpalle',
          'Nizamabad', 'Armoor', 'Balkonda', 'Banswada', 'Bichkunda',
          'Birkur', 'Bodhan', 'Domakonda', 'Lingampet', 'Madnoor',
          'Nagireddipet', 'Nizamabad', 'Yedpalle'
        ],
      },
      {
        name: 'Peddapalli',
        villages: [
          'Peddapalli', 'Manthani', 'Ramagiri', 'Sultanabad', 'Julapalle',
          'Peddapalli', 'Julapalle', 'Manthani', 'Ramagiri', 'Sultanabad',
          'Thimmajipet'
        ],
      },
      {
        name: 'Rajanna Sircilla',
        villages: [
          'Sircilla', 'Vemulawada', 'Boinpalli', 'Konaraopet', 'Mustabad',
          'Sircilla', 'Boinpalli', 'Gangadhara', 'Konaraopet', 'Mustabad',
          'Sircilla', 'Vemulawada'
        ],
      },
      {
        name: 'Rangareddy',
        villages: [
          'Rangareddy', 'Shamshabad', 'Hayathnagar', 'Vikarabad', 'Tandur',
          'Rangareddy', 'Balanagar', 'Chevella', 'Hayathnagar', 'Ibrahimpatnam',
          'Kandukur', 'Mominpet', 'Moosapet', 'Pargi', 'Quthbullapur',
          'Rajendranagar', 'Shamirpet', 'Shamshabad', 'Tandur', 'Vikarabad'
        ],
      },
      {
        name: 'Sangareddy',
        villages: [
          'Sangareddy', 'Patancheru', 'Ramachandrapuram', 'Jinnaram', 'Kohir',
          'Sangareddy', 'Ameenpur', 'Jinnaram', 'Kohir', 'Patancheru',
          'Ramachandrapuram', 'Sangareddy', 'Toopran'
        ],
      },
      {
        name: 'Siddipet',
        villages: [
          'Siddipet', 'Gajwel', 'Dubbak', 'Chinnakodur', 'Koheda',
          'Siddipet', 'Chinnakodur', 'Dubbak', 'Gajwel', 'Husnabad',
          'Koheda', 'Markook', 'Munipalle', 'Raikode', 'Siddipet',
          'Thoguta', 'Wargal'
        ],
      },
      {
        name: 'Suryapet',
        villages: [
          'Suryapet', 'Kodad', 'Huzurnagar', 'Thungathurthi', 'Mothkur',
          'Suryapet', 'Chivvemla', 'Huzurnagar', 'Kodad', 'Mellacheruvu',
          'Mothkur', 'Nadigudem', 'Penpahad', 'Suryapet', 'Thungathurthi'
        ],
      },
      {
        name: 'Vikarabad',
        villages: [
          'Vikarabad', 'Tandur', 'Dharur', 'Kodangal', 'Pargi',
          'Vikarabad', 'Basheerabad', 'Dharur', 'Kodangal', 'Mominpet',
          'Pargi', 'Tandur', 'Vikarabad'
        ],
      },
      {
        name: 'Wanaparthy',
        villages: [
          'Wanaparthy', 'Kothakota', 'Pebbair', 'Peddamandadi', 'Gopalpet',
          'Wanaparthy', 'Atmakur', 'Gopalpet', 'Kothakota', 'Pebbair',
          'Peddamandadi', 'Wanaparthy'
        ],
      },
      {
        name: 'Warangal',
        villages: [
          'Warangal', 'Hanamkonda', 'Kazipet', 'Jangaon', 'Geesugonda',
          'Warangal', 'Atmakur', 'Geesugonda', 'Hanamkonda', 'Hasanparthy',
          'Husnabad', 'Jangaon', 'Kazipet', 'Kothagudem', 'Maddur',
          'Narsampet', 'Nekkonda', 'Parkal', 'Raiparthy', 'Shayampet',
          'Thorrur', 'Wardhannapet', 'Warangal'
        ],
      },
      {
        name: 'Warangal Urban',
        villages: [
          'Warangal', 'Hanamkonda', 'Kazipet', 'Hayatnagar', 'Mamunoor',
          'Warangal', 'Hanamkonda', 'Hayatnagar', 'Kazipet', 'Mamunoor',
          'Sangem', 'Warangal'
        ],
      },
      {
        name: 'Yadadri Bhuvanagiri',
        villages: [
          'Bhongir', 'Choutuppal', 'Pochampalle', 'Ramannapet', 'Yadagirigutta',
          'Bhongir', 'Choutuppal', 'Mothkur', 'Nalgonda', 'Pochampalle',
          'Ramannapet', 'Yadagirigutta'
        ],
      },
    ],
  },
  {
    name: 'Andhra Pradesh',
    districts: [
      {
        name: 'Anantapur',
        villages: [
          'Anantapur', 'Dharmavaram', 'Hindupur', 'Kalyandurg', 'Rayadurg',
          'Anantapur', 'Atmakur', 'Bathalapalle', 'Beluguppa', 'Bommanahal',
          'Dharmavaram', 'Garladinne', 'Gooty', 'Gudibanda', 'Hindupur',
          'Kadiri', 'Kalyandurg', 'Kanekal', 'Kothacheruvu', 'Madakasira',
          'Nallamada', 'Narpala', 'Pamidi', 'Penukonda', 'Putlur',
          'Raptadu', 'Rayadurg', 'Singanamala', 'Tadimarri', 'Tadpatri',
          'Uravakonda', 'Vajrakarur', 'Vidapanakal', 'Yellanur'
        ],
      },
      {
        name: 'Chittoor',
        villages: [
          'Chittoor', 'Tirupati', 'Madanapalle', 'Palamaner', 'Punganur',
          'Chittoor', 'B.Kothakota', 'Bangarupalem', 'Chandragiri', 'Chittoor',
          'Gangadhara Nellore', 'Gudipala', 'Irala', 'Karakambadi', 'Kuppam',
          'Madanapalle', 'Nagari', 'Narayanavanam', 'Palasamudram', 'Palamaner',
          'Pichatur', 'Pileru', 'Punganur', 'Puthalapattu', 'Ramachandrapuram',
          'Renigunta', 'Satyavedu', 'Srikalahasti', 'Thottambedu', 'Tirupati',
          'Varadaiahpalem', 'Vayalpad', 'Vedurukuppam', 'Yadamari'
        ],
      },
      {
        name: 'East Godavari',
        villages: [
          'Kakinada', 'Rajahmundry', 'Amalapuram', 'Ramachandrapuram', 'Tuni',
          'Anaparthy', 'Atreyapuram', 'Biccavolu', 'Chagallu',
          'Devipatnam', 'Gokavaram', 'Kapileswarapuram', 'Kajuluru',
          'Katrenikona', 'Korukonda', 'Mandapeta', 'Mummidivaram', 'P.Gannavaram',
          'Pithapuram', 'Rampachodavaram', 'Ravulapalem',
          'Rayavaram', 'Sakhinetipalli', 'Samalkota', 'Tallarevu', 'Thallarevu',
          'Tuni', 'Uppalaguptam', 'Yeleswaram'
        ],
      },
      {
        name: 'Guntur',
        villages: [
          'Guntur', 'Tenali', 'Narasaraopet', 'Chilakaluripet', 'Bapatla',
          'Bapatla', 'Bhattiprolu', 'Chilakaluripet', 'Dachepalle', 'Duggirala',
          'Guntur', 'Kakumanu', 'Kollipara', 'Kollur', 'Krosuru',
          'Macherla', 'Machavaram', 'Mangalagiri', 'Medikonduru', 'Nadendla',
          'Narasaraopet', 'Nekarikallu', 'Nizampatnam', 'Pamidimukkala', 'Parchur',
          'Pedakakani', 'Phirangipuram', 'Ponnur', 'Prathipadu', 'Repalle',
          'Sattenapalle', 'Tadikonda', 'Tenali', 'Thullur', 'Tsundur',
          'Vatticherukuru', 'Veldurthy', 'Vemuru', 'Vinukonda'
        ],
      },
      {
        name: 'Krishna',
        villages: [
          'Vijayawada', 'Machilipatnam', 'Gudivada', 'Nuzvid', 'Jaggayyapet',
          'Avanigadda', 'Bapulapadu', 'Challapalli', 'Gannavaram', 'Gudivada',
          'Gudlavalleru', 'Ibrahimpatnam', 'Jaggayyapet', 'Kanchikacherla', 'Kankipadu',
          'Koduru', 'Machilipatnam', 'Mopidevi', 'Movva', 'Mudinepalli',
          'Musunuru', 'Nagayalanka', 'Nandivada', 'Nidamanuru', 'Nuzvid',
          'Pamarru', 'Penamaluru', 'Penuganchiprolu', 'Reddigudem', 'Thotlavalluru',
          'Unguturu', 'Vatsavai', 'Vejendla', 'Vijayawada', 'Vuyyuru'
        ],
      },
      {
        name: 'Kurnool',
        villages: [
          'Kurnool', 'Nandyal', 'Adoni', 'Yemmiganur', 'Dhone',
          'Allagadda', 'Atmakur', 'Banaganapalle', 'Bandiatmakur',
          'Chagalamarri', 'Cumbum', 'Devanakonda', 'Dornipadu',
          'Gadivemula', 'Gonegandla', 'Gudur', 'Holagunda', 'Kallur',
          'Kodumur', 'Koilkuntla', 'Kosigi', 'Kothapalle', 'Kowthalam',
          'Krishnagiri', 'Mahanandi', 'Mantralayam', 'Nandavaram',
          'Nandikotkur', 'Orvakal', 'Panyam', 'Pattikonda',
          'Peapally', 'Rudravaram', 'Sanjamala', 'Sirivel', 'Tuggali',
          'Uyyalawada', 'Velugodu', 'Veldurthi'
        ],
      },
      {
        name: 'Nellore',
        villages: [
          'Nellore', 'Gudur', 'Kavali', 'Kovur', 'Sullurpeta',
          'Allur', 'Ananthasagaram', 'Atmakur', 'Bogole', 'Buchireddypalem',
          'Chejerla', 'Chillakur', 'Dagadarthi', 'Doravarisatram',
          'Indukurpet', 'Kaluvoya', 'Kandukur', 'Kodavalur',
          'Manubolu', 'Marripadu', 'Muthukur', 'Naidupet',
          'Ozili', 'Podalakur', 'Rapur', 'Sangam',
          'Seetharamapuram', 'Sodam', 'Tada', 'Thotapalligudur',
          'Udayagiri', 'Vakadu', 'Venkatachalam', 'Vinjamur'
        ],
      },
      {
        name: 'Prakasam',
        villages: [
          'Ongole', 'Markapur', 'Giddalur', 'Darsi', 'Chirala',
          'Addanki', 'Ardhaveedu', 'Ballikurava', 'Bestavaripeta', 'Chimakurthy',
          'Chirala', 'Cumbum', 'Darsi', 'Donakonda', 'Giddalur',
          'Gudlur', 'Hanumanthunipadu', 'Inkollu', 'Jangareddigudem', 'Kandukur',
          'Kanigiri', 'Karampudi', 'Kondapi', 'Korisapadu', 'Kurichedu',
          'Markapur', 'Martur', 'Mundlamuru', 'Naguluppalapadu', 'Ongole',
          'Pamur', 'Pedacherlopalle', 'Pedda Araveedu', 'Ponnaluru', 'Pullalacheruvu',
          'Sanjamala', 'Santamaguluru', 'Santhanuthalapadu', 'Singarayakonda', 'Tallur',
          'Tangutur', 'Tarlupadu', 'Tripuranthakam', 'Ulavapadu', 'Veligandla',
          'Vetapalem', 'Voletivaripalem', 'Yerragondapalem', 'Zarugumilli'
        ],
      },
      {
        name: 'Srikakulam',
        villages: [
          'Srikakulam', 'Palakonda', 'Tekkali', 'Pathapatnam', 'Narasannapeta',
          'Amadalavalasa', 'Burja', 'Gara', 'Hiramandalam', 'Jalumuru',
          'Kanchili', 'Kaviti', 'Kotabommali', 'Laveru', 'L.N.Peta',
          'Mandasa', 'Meliyaputti', 'Narasannapeta', 'Palakonda', 'Palasa',
          'Pathapatnam', 'Polaki', 'Ponduru', 'Rajam', 'Ranastalam',
          'Santhabommali', 'Saravakota', 'Sompeta', 'Srikakulam', 'Tekkali',
          'Vajrapukothuru', 'Veeraghattam'
        ],
      },
      {
        name: 'Visakhapatnam',
        villages: [
          'Visakhapatnam', 'Anakapalle', 'Chodavaram', 'Narsipatnam', 'Paderu',
          'Anandapuram', 'Araku Valley', 'Bheemunipatnam', 'Butchayyapeta',
          'Chintapalle', 'Devarapalle', 'Dumbriguda', 'Gajapathinagaram',
          'Golugonda', 'Hukumpeta', 'K.Kotapadu', 'Kothavalasa', 'Madugula',
          'Makavarapalem', 'Munchingiputtu', 'Nakkapalle', 'Nathavaram',
          'Padmanabham', 'Paderu', 'Paravada', 'Payakaraopeta', 'Pedabayalu',
          'Pendurthi', 'Rambilli', 'Ravikamatham', 'Rolugunta', 'S.Rayavaram',
          'Sabbavaram', 'Visakhapatnam (Rural)', 'Yelamanchili'
        ],
      },
      {
        name: 'Vizianagaram',
        villages: [
          'Vizianagaram', 'Bobilli', 'Parvathipuram', 'Salur', 'Cheepurupalli',
          'Badangi', 'Bhogapuram', 'Bobbili', 'Bondapalle', 'Cheepurupalli',
          'Denkada', 'Gajularega', 'Gantyada', 'Garagaparru', 'Garugubilli',
          'Gummalakshmipuram', 'Gurla', 'Jami', 'Kothavalasa', 'Lakkavarapukota',
          'Makkuva', 'Merakamudidam', 'Nellimarla', 'Parvathipuram', 'Pusapatirega',
          'Ramabhadrapuram', 'Regidi Amadalavalasa', 'Salur', 'Seethanagaram', 'Srilakshmipuram',
          'Therlam', 'Vangara', 'Vepada', 'Vizianagaram'
        ],
      },
      {
        name: 'West Godavari',
        villages: [
          'Eluru', 'Bhimavaram', 'Tadepalligudem', 'Tanuku', 'Palakollu',
          'Achanta', 'Akiveedu', 'Attili', 'Bhimavaram', 'Buttayagudem',
          'Chagallu', 'Devarapalle', 'Denduluru', 'Dwarakatirumala', 'Eluru',
          'Ganapavaram', 'Iragavaram', 'Jangareddigudem', 'Kalla', 'Kamavarapukota',
          'Kovvur', 'Lingapalem', 'Mogalthur', 'Nallajerla', 'Narsapur',
          'Nidadavole', 'Nidamarru', 'Palacole', 'Palakoderu', 'Pedapadu',
          'Pedavegi', 'Pentapadu', 'Poduru', 'Polavaram', 'Tadepalligudem',
          'Tanuku', 'T.Narasapuram', 'Undi', 'Undrajavaram', 'Veeravasaram'
        ],
      },
      // Additional districts
      {
        name: 'Kadapa',
        villages: [
          'Kadapa', 'Proddatur', 'Rajampet', 'Jammalamadugu', 'Rayachoty',
          'Badvel', 'B.Kodur', 'Brahmamgarimattam', 'Chakrayapet', 'Chinthakommadinne',
          'Chitvel', 'Galiveedu', 'Jammalamadugu', 'Kadapa', 'Kamalapuram',
          'Khajipet', 'Kondapuram', 'Lakkireddipalle', 'Muddanur', 'Mydukur',
          'Nandalur', 'Obulavaripalle', 'Pendlimarri', 'Porumamilla', 'Proddatur',
          'Pulivendula', 'Rajampet', 'Rajupalem', 'Ramapuram', 'Rayachoty',
          'Siddavatam', 'Sri Avadhutha Kasinayana', 'T Sundupalle', 'Thondur', 'Vallur',
          'Vempalle', 'Veeraballi', 'Veerapunayunipalle', 'Yerraguntla'
        ],
      },
    ],
  },
];

export function getDistrictsByState(stateName: string): District[] {
  const state = statesData.find((s) => s.name === stateName);
  return state?.districts || [];
}

export function getVillagesByDistrict(stateName: string, districtName: string): string[] {
  const state = statesData.find((s) => s.name === stateName);
  const district = state?.districts.find((d) => d.name === districtName);
  // Remove duplicates and sort alphabetically
  const villages = district?.villages || [];
  return [...new Set(villages)].sort();
}
