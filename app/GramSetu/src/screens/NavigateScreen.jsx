import React, { useRef, useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WebViewNavigateMap = ({ route, navigation }) => {
    const webViewRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [satelliteView, setSatelliteView] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [destinationNode, setDestinationNode] = useState(null);
    const [shortestPath, setShortestPath] = useState([]);
    const [shortestPathDistance, setShortestPathDistance] = useState(0);
    const [graph, setGraph] = useState({});

    // Get params from previous screen
    const { latitude, longitude, shopName } = route.params || {};

    console.log('Received params:', { latitude, longitude, shopName });

    // Node 2 coordinates (fixed starting point)
    const START_NODE = {
        id: 2,
        lat: 21.772242646056295,
        lng: 69.4555401802245
    };

    // Important points data
    const IMPORTANT_POINTS = [
        { id: 1, lat: 21.774255418335215, lng: 69.45293033122199, name: "Temple" },
        { id: 2, lat: 21.77445966710036, lng: 69.45247435568946, name: "Bus Stand" },
        { id: 3, lat: 21.774843255458624, lng: 69.4523187875666, name: "Hospital" },
        { id: 4, lat: 21.77586449219043, lng: 69.45234560965675, name: "High School" },
        { id: 5, lat: 21.77397644394217, lng: 69.45096695422309, name: "Primary School" },
        { id: 6, lat: 21.773921645336927, lng: 69.45118689536231, name: "Bank" },
        { id: 7, lat: 21.774066114341974, lng: 69.45139610766547, name: "Panchayat Office" },
        { id: 8, lat: 21.77445468542662, lng: 69.45128345488685, name: "Water Source 1" },
        { id: 9, lat: 21.775969106274324, lng: 69.45362234114783, name: "Water Source 2" },
        { id: 10, lat: 21.771515467757045, lng: 69.45499563216346, name: "Police Station" },
        { id: 11, lat: 21.77029990928745, lng: 69.45522093772071, name: "Power Station" },
        { id: 12, lat: 21.77514713641679, lng: 69.45104742049354, name: "Lake" },
        { id: 13, lat: 21.772790796718663, lng: 69.45556962489265, name: "Petrol Pump" },
        { id: 14, lat: 21.76219326586959, lng: 69.44299542903083, name: "Beach" },
        { id: 15, lat: 21.76205694312832, lng: 69.45050883291516, name: "Dam 1" },
        { id: 16, lat: 21.76632676092553, lng: 69.44546949863026, name: "Dam 2" },
        { id: 17, lat: 21.773432442330364, lng: 69.45283913611549, name: "Post Office" }
    ];

    // All 224 nodes data
    const NODE_DATA = [
        { id: 1, lat: 21.771091857040823, lng: 69.4563341140929 },
        { id: 2, lat: 21.772242646056295, lng: 69.4555401802245 },
        { id: 3, lat: 21.772790637580858, lng: 69.45534706117542 },
        { id: 4, lat: 21.77347313318878, lng: 69.45520758630666 },
        { id: 5, lat: 21.774833133002076, lng: 69.45497691633136 },
        { id: 6, lat: 21.775605288329146, lng: 69.45472478868398 },
        { id: 7, lat: 21.776098469233567, lng: 69.45439219476611 },
        { id: 8, lat: 21.77650696122386, lng: 69.4539898634139 },
        { id: 9, lat: 21.77689054410675, lng: 69.45352315904529 },
        { id: 10, lat: 21.777194420727238, lng: 69.45294916631612 },
        { id: 11, lat: 21.777373757447048, lng: 69.4522786140624 },
        { id: 12, lat: 21.777453462583868, lng: 69.45157587530049 },
        { id: 13, lat: 21.777508259839728, lng: 69.45073902608783 },
        { id: 14, lat: 21.777548112376305, lng: 69.45006847383411 },
        { id: 15, lat: 21.777612872724603, lng: 69.44943547250661 },
        { id: 16, lat: 21.777851987603484, lng: 69.44734871389302 },
        { id: 17, lat: 21.77736102675292, lng: 69.44743454458148 },
        { id: 18, lat: 21.77645935922766, lng: 69.44797098638446 },
        { id: 19, lat: 21.77546303492766, lng: 69.44864153863819 },
        { id: 20, lat: 21.7752089711237, lng: 69.44890439512166 },
        { id: 21, lat: 21.775079448226908, lng: 69.44915652276904 },
        { id: 22, lat: 21.774974833494117, lng: 69.44944083692464 },
        { id: 23, lat: 21.774890145321216, lng: 69.44978415967854 },
        { id: 24, lat: 21.774790512112588, lng: 69.45030450822743 },
        { id: 25, lat: 21.77469087883478, lng: 69.45111453534992 },
        { id: 26, lat: 21.774476667053086, lng: 69.45241272451314 },
        { id: 27, lat: 21.774322235105046, lng: 69.45274531843098 },
        { id: 28, lat: 21.773664652045635, lng: 69.4527828693572 },
        { id: 29, lat: 21.77347534727271, lng: 69.45287406446369 },
        { id: 30, lat: 21.77320135307997, lng: 69.45314764978322 },
        { id: 31, lat: 21.773007065971626, lng: 69.45338368417652 },
        { id: 32, lat: 21.772882522815028, lng: 69.45352852346332 },
        { id: 33, lat: 21.77274303435129, lng: 69.45368945600421 },
        { id: 34, lat: 21.77262347270298, lng: 69.45386111738117 },
        { id: 35, lat: 21.772553728362098, lng: 69.45393085481555 },
        { id: 36, lat: 21.77142286896, lng: 69.45530951024921 },
        { id: 37, lat: 21.771069162206697, lng: 69.45588886739644 },
        { id: 38, lat: 21.77072043638489, lng: 69.4545692205611 },
        { id: 39, lat: 21.7703816733463, lng: 69.45418298246297 },
        { id: 40, lat: 21.76979381793974, lng: 69.45348024370107 },
        { id: 41, lat: 21.76960948990095, lng: 69.45325493814381 },
        { id: 42, lat: 21.769425161625353, lng: 69.45295989515218 },
        { id: 43, lat: 21.769355415729567, lng: 69.45258438589009 },
        { id: 44, lat: 21.769250796822348, lng: 69.45228397848042 },
        { id: 45, lat: 21.768832320430562, lng: 69.4517207145873 },
        { id: 46, lat: 21.768005327781218, lng: 69.45182263852985 },
        { id: 47, lat: 21.76771637741861, lng: 69.45168316366107 },
        { id: 48, lat: 21.766600425727383, lng: 69.45094287397296 },
        { id: 49, lat: 21.765554213134628, lng: 69.45027232171924 },
        { id: 50, lat: 21.76467239945396, lng: 69.45001482965382 },
        { id: 51, lat: 21.75947606530084, lng: 69.45573329927358 },
        { id: 52, lat: 21.756053257299495, lng: 69.46001946927936 },
        { id: 53, lat: 21.754349296254336, lng: 69.46192383767993 },
        { id: 54, lat: 21.751175490340504, lng: 69.46561992170246 },
        { id: 55, lat: 21.75181822907082, lng: 69.46780323984059 },
        { id: 56, lat: 21.751110718060822, lng: 69.46845769884023 },
        { id: 57, lat: 21.75095127847871, lng: 69.4676423072997 },
        { id: 58, lat: 21.768538389854214, lng: 69.45583522321613 },
        { id: 59, lat: 21.76967923567321, lng: 69.45499300958545 },
        { id: 60, lat: 21.76851846233572, lng: 69.4554704427901 },
        { id: 61, lat: 21.768981776424894, lng: 69.45471405984792 },
        { id: 62, lat: 21.769096359248444, lng: 69.45432245733174 },
        { id: 63, lat: 21.76929563350622, lng: 69.45397913457784 },
        { id: 64, lat: 21.76930559721183, lng: 69.45364117624196 },
        { id: 65, lat: 21.769345452027416, lng: 69.45331931116017 },
        { id: 66, lat: 21.767985400188678, lng: 69.45366263391408 },
        { id: 67, lat: 21.769798799775344, lng: 69.45138275625142 },
        { id: 68, lat: 21.77016247330684, lng: 69.45107162000568 },
        { id: 69, lat: 21.770605854858413, lng: 69.45065319539937 },
        { id: 70, lat: 21.770864908613902, lng: 69.45103406907948 },
        { id: 71, lat: 21.770984471727903, lng: 69.45123255254659 },
        { id: 72, lat: 21.771089089370903, lng: 69.45142567159564 },
        { id: 73, lat: 21.771148870846943, lng: 69.45153295995625 },
        { id: 74, lat: 21.77132821512556, lng: 69.45181190969379 },
        { id: 75, lat: 21.771352501312716, lng: 69.45187062025981 },
        { id: 76, lat: 21.77148265029694, lng: 69.45208549501332 },
        { id: 77, lat: 21.77169686654974, lng: 69.45240199567708 },
        { id: 78, lat: 21.771721775395587, lng: 69.45250928403766 },
        { id: 79, lat: 21.77187621014329, lng: 69.45273995401296 },
        { id: 80, lat: 21.7719359912913, lng: 69.45287942888172 },
        { id: 81, lat: 21.772214969652687, lng: 69.45336759092243 },
        { id: 82, lat: 21.772359440376594, lng: 69.4527667761031 },
        { id: 83, lat: 21.772324568146207, lng: 69.45241272451314 },
        { id: 84, lat: 21.77248896572951, lng: 69.4522786140624 },
        { id: 85, lat: 21.772496749701308, lng: 69.45273950696448 },
        { id: 86, lat: 21.772703180479592, lng: 69.45293843748006 },
        { id: 87, lat: 21.77267266735158, lng: 69.45271819830852 },
        { id: 88, lat: 21.77267266735158, lng: 69.45246607066112 },
        { id: 89, lat: 21.772630322591766, lng: 69.45222198964076 },
        { id: 90, lat: 21.77262347270298, lng: 69.45206940175923 },
        { id: 91, lat: 21.772767943015477, lng: 69.45182800294788 },
        { id: 92, lat: 21.77268325353959, lng: 69.45157051088246 },
        { id: 93, lat: 21.772638417914457, lng: 69.45142567159564 },
        { id: 94, lat: 21.773046919758887, lng: 69.45131301881702 },
        { id: 95, lat: 21.773022011143134, lng: 69.45113599302204 },
        { id: 96, lat: 21.773208202941177, lng: 69.45103645325618 },
        { id: 97, lat: 21.773659670344287, lng: 69.45099115373525 },
        { id: 98, lat: 21.773973517191415, lng: 69.4510930776778 },
        { id: 99, lat: 21.774013370710158, lng: 69.45120573045644 },
        { id: 100, lat: 21.774033297465397, lng: 69.45132911207111 },
        { id: 101, lat: 21.77414289456964, lng: 69.45209622384938 },
        { id: 102, lat: 21.77380413961318, lng: 69.45218741895587 },
        { id: 103, lat: 21.77339065821448, lng: 69.45277750493916 },
        { id: 104, lat: 21.773126627300204, lng: 69.45277214052113 },
        { id: 105, lat: 21.773116663859966, lng: 69.45287406446369 },
        { id: 106, lat: 21.772894354419552, lng: 69.45291936398463 },
        { id: 107, lat: 21.77288439096318, lng: 69.45271283389049 },
        { id: 108, lat: 21.77121363408452, lng: 69.45376992227466 },
        { id: 109, lat: 21.771059198623536, lng: 69.45420444013509 },
        { id: 110, lat: 21.770585927627085, lng: 69.45376455785663 },
        { id: 111, lat: 21.770730399991564, lng: 69.4534856081191 },
        { id: 112, lat: 21.770984471727903, lng: 69.45323348047168 },
        { id: 113, lat: 21.770810108820022, lng: 69.45302963258655 },
        { id: 114, lat: 21.77052614591647, lng: 69.45326030256184 },
        { id: 115, lat: 21.770341818818583, lng: 69.45342123510272 },
        { id: 116, lat: 21.77019236424103, lng: 69.45314764978322 },
        { id: 117, lat: 21.770605854858413, lng: 69.45277214052113 },
        { id: 118, lat: 21.770003054885972, lng: 69.45289015771777 },
        { id: 119, lat: 21.77044643693023, lng: 69.45250391961963 },
        { id: 120, lat: 21.77169686654974, lng: 69.4528955221358 },
        { id: 121, lat: 21.77197086361615, lng: 69.45344805719289 },
        { id: 122, lat: 21.771846319559923, lng: 69.45351243020923 },
        { id: 123, lat: 21.771572322255647, lng: 69.45297598840627 },
        { id: 124, lat: 21.77137803294095, lng: 69.45310473443898 },
        { id: 125, lat: 21.771627121758367, lng: 69.45361435415181 },
        { id: 126, lat: 21.77142286896, lng: 69.45366799833211 },
        { id: 127, lat: 21.771195575107743, lng: 69.45322245360332 },
        { id: 128, lat: 21.772409257833857, lng: 69.45122718812856 },
        { id: 129, lat: 21.772982157348952, lng: 69.45106089116963 },
        { id: 130, lat: 21.77285761417074, lng: 69.45074439050586 },
        { id: 131, lat: 21.77295226699604, lng: 69.45060491563709 },
        { id: 132, lat: 21.773165858339436, lng: 69.45060998202281 },
        { id: 133, lat: 21.772982157348952, lng: 69.45004165174396 },
        { id: 134, lat: 21.77274303435129, lng: 69.4495964050475 },
        { id: 135, lat: 21.772165152127947, lng: 69.4491672516051 },
        { id: 136, lat: 21.772060535269667, lng: 69.44923698903949 },
        { id: 137, lat: 21.771283379076934, lng: 69.44963932039174 },
        { id: 138, lat: 21.770605854858413, lng: 69.45050835611256 },
        { id: 139, lat: 21.771343160471996, lng: 69.44814264776141 },
        { id: 140, lat: 21.77294728526996, lng: 69.44853425027759 },
        { id: 141, lat: 21.77357996309917, lng: 69.44793879987628 },
        { id: 142, lat: 21.773923700277404, lng: 69.44900631906421 },
        { id: 143, lat: 21.774212638137836, lng: 69.44990217687518 },
        { id: 144, lat: 21.77431725342654, lng: 69.45014357568654 },
        { id: 145, lat: 21.773325895959733, lng: 69.45006847383411 },
        { id: 146, lat: 21.773669633746817, lng: 69.45032596589955 },
        { id: 147, lat: 21.773829048093113, lng: 69.45064783098134 },
        { id: 148, lat: 21.77138799650195, lng: 69.44777250291736 },
        { id: 149, lat: 21.771392978282186, lng: 69.44753110410603 },
        { id: 150, lat: 21.771069162206697, lng: 69.44679081441791 },
        { id: 151, lat: 21.770665636535824, lng: 69.4457447529021 },
        { id: 152, lat: 21.76987850912141, lng: 69.44519758226306 },
        { id: 153, lat: 21.76967923567321, lng: 69.44472551347646 },
        { id: 154, lat: 21.77058094581882, lng: 69.44355607034596 },
        { id: 155, lat: 21.770974508138867, lng: 69.44229006769093 },
        { id: 156, lat: 21.77149261385067, lng: 69.44134056569965 },
        { id: 157, lat: 21.77196090009562, lng: 69.44016575815112 },
        { id: 158, lat: 21.771821410735704, lng: 69.43867444993886 },
        { id: 159, lat: 21.771472686742516, lng: 69.43681299688251 },
        { id: 160, lat: 21.770959562754033, lng: 69.43552553655537 },
        { id: 161, lat: 21.769564653315168, lng: 69.43637311460408 },
        { id: 162, lat: 21.768772537989232, lng: 69.43512856962117 },
        { id: 163, lat: 21.7681099475966, lng: 69.43410396577748 },
        { id: 164, lat: 21.7681099475966, lng: 69.43366944791705 },
        { id: 165, lat: 21.768005327781218, lng: 69.43347096444995 },
        { id: 166, lat: 21.767950526895085, lng: 69.43326711656483 },
        { id: 167, lat: 21.767362661527418, lng: 69.4330632686797 },
        { id: 168, lat: 21.767811033635958, lng: 69.43768739702136 },
        { id: 169, lat: 21.76586807771336, lng: 69.43886756898792 },
        { id: 170, lat: 21.764413334517972, lng: 69.44020867349538 },
        { id: 171, lat: 21.763302339200862, lng: 69.44123327733907 },
        { id: 172, lat: 21.76288882753677, lng: 69.44148004056842 },
        { id: 173, lat: 21.762420511683256, lng: 69.44159805776509 },
        { id: 174, lat: 21.76219133528318, lng: 69.44238126279743 },
        { id: 175, lat: 21.762206281581303, lng: 69.44300889970692 },
        { id: 176, lat: 21.769425161625353, lng: 69.44488108159932 },
        { id: 177, lat: 21.769106322967907, lng: 69.44483280183704 },
        { id: 178, lat: 21.768463661645587, lng: 69.44627583028706 },
        { id: 179, lat: 21.76846864352737, lng: 69.44783151151569 },
        { id: 180, lat: 21.768662936782125, lng: 69.4483894109908 },
        { id: 181, lat: 21.76771637741861, lng: 69.45033669473561 },
        { id: 182, lat: 21.763915131403554, lng: 69.44896876813802 },
        { id: 183, lat: 21.763416926559614, lng: 69.44949448110494 },
        { id: 184, lat: 21.76285395300459, lng: 69.45008993150623 },
        { id: 185, lat: 21.762276030951938, lng: 69.45054054262074 },
        { id: 186, lat: 21.762031908006428, lng: 69.45045471193225 },
        { id: 187, lat: 21.763770652176863, lng: 69.44855034353169 },
        { id: 188, lat: 21.763865310996987, lng: 69.44787442685994 },
        { id: 189, lat: 21.764562795115037, lng: 69.44748282434375 },
        { id: 190, lat: 21.765419699533574, lng: 69.44625437261493 },
        { id: 191, lat: 21.765952771212227, lng: 69.44570720197589 },
        { id: 192, lat: 21.766366274047737, lng: 69.44543361665639 },
        { id: 193, lat: 21.77814811310771, lng: 69.4474023580733 },
        { id: 194, lat: 21.77820789164169, lng: 69.44754719736012 },
        { id: 195, lat: 21.77874589732626, lng: 69.44746136667163 },
        { id: 196, lat: 21.77910954817352, lng: 69.44782078267963 },
        { id: 197, lat: 21.779831865614533, lng: 69.44823384286794 },
        { id: 198, lat: 21.779542939074727, lng: 69.44713413717182 },
        { id: 199, lat: 21.780564142340648, lng: 69.44648504259023 },
        { id: 200, lat: 21.781968907632727, lng: 69.44620072843463 },
        { id: 201, lat: 21.782008758929628, lng: 69.44678544999988 },
        { id: 202, lat: 21.782188089628573, lng: 69.44711804391773 },
        { id: 203, lat: 21.782232922268268, lng: 69.44812655450733 },
        { id: 204, lat: 21.782397308493863, lng: 69.4494515657607 },
        { id: 205, lat: 21.781864297925697, lng: 69.44931209089192 },
        { id: 206, lat: 21.781321322505814, lng: 69.44907069208058 },
        { id: 207, lat: 21.782546750353582, lng: 69.44995045663747 },
        { id: 208, lat: 21.782671285117704, lng: 69.45151686670216 },
        { id: 209, lat: 21.782775894235964, lng: 69.45250391961963 },
        { id: 210, lat: 21.782666303729208, lng: 69.45306718351276 },
        { id: 211, lat: 21.782427196878267, lng: 69.45396304132375 },
        { id: 212, lat: 21.78202868457391, lng: 69.45464968683156 },
        { id: 213, lat: 21.78183939084133, lng: 69.45530414583118 },
        { id: 214, lat: 21.78160028261139, lng: 69.45563673974902 },
        { id: 215, lat: 21.781291433890885, lng: 69.45587277414235 },
        { id: 216, lat: 21.780723549023485, lng: 69.45592105390462 },
        { id: 217, lat: 21.780310087573593, lng: 69.45585668088825 },
        { id: 218, lat: 21.77964755047534, lng: 69.45549726488025 },
        { id: 219, lat: 21.77883058322237, lng: 69.45510029794605 },
        { id: 220, lat: 21.778073389905174, lng: 69.45473551752002 },
        { id: 221, lat: 21.77711194789274, lng: 69.45451557638081 },
        { id: 222, lat: 21.77647430403947, lng: 69.4545316696349 },
        { id: 223, lat: 21.77560750238018, lng: 69.4538664817992 },
        { id: 224, lat: 21.774526483775055, lng: 69.4529008865538 }
    ];

    // Path data
    const PATH_DATA = [
        { id: 1, name: 'Main Highway', type: 'highway', nodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
        { id: 2, name: 'Main Road', type: 'mainRoad', nodes: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 1] },
        { id: 3, name: 'Road1', type: 'mainRoad', nodes: [36, 38, 39, 40, 41, 42, 43, 44, 45] },
        { id: 4, name: 'Road2', type: 'mainRoad', nodes: [69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 35] },
        { id: 5, name: 'Road3', type: 'mainRoad', nodes: [135, 134, 133, 145, 146, 147, 98, 99, 100, 101, 27] },
        { id: 6, name: 'Road4', type: 'mainRoad', nodes: [54, 53, 52, 51, 50, 49, 48, 47, 46, 45, 67, 68, 69, 138, 137, 136, 135] },
        { id: 7, name: 'street1', type: 'street', nodes: [56, 55, 54] },
        { id: 8, name: 'street2', type: 'street', nodes: [39, 110, 111, 112] },
        { id: 9, name: 'street3', type: 'street', nodes: [113, 114, 115] },
        { id: 10, name: 'street4', type: 'street', nodes: [76, 117, 116, 40] },
        { id: 11, name: 'street5', type: 'street', nodes: [74, 119, 118, 41] },
        { id: 12, name: 'street6', type: 'street', nodes: [71, 43] },
        { id: 13, name: 'street7', type: 'street', nodes: [110, 115, 116, 118] },
        { id: 14, name: 'street8', type: 'street', nodes: [112, 113, 117, 119] },
        { id: 15, name: 'street9', type: 'street', nodes: [79, 120, 123, 124, 127] },
        { id: 16, name: 'street10', type: 'street', nodes: [81, 121, 122, 125, 126, 108, 109, 38] },
        { id: 17, name: 'street11', type: 'street', nodes: [120, 121] },
        { id: 18, name: 'street12', type: 'street', nodes: [122, 123] },
        { id: 19, name: 'street13', type: 'street', nodes: [124, 125] },
        { id: 20, name: 'street14', type: 'street', nodes: [126, 127] },
        { id: 21, name: 'street15', type: 'street', nodes: [34, 82, 83] },
        { id: 22, name: 'street16', type: 'street', nodes: [33, 85, 84] },
        { id: 23, name: 'street17', type: 'street', nodes: [32, 86, 87, 88, 89, 90, 91] },
        { id: 24, name: 'street18', type: 'street', nodes: [79, 83, 84, 89] },
        { id: 25, name: 'street19', type: 'street', nodes: [80, 82, 85, 87, 107] },
        { id: 26, name: 'street20', type: 'street', nodes: [107, 106] },
        { id: 27, name: 'street21', type: 'street', nodes: [105, 106, 31] },
        { id: 28, name: 'street22', type: 'street', nodes: [104, 105, 30] },
        { id: 29, name: 'street23', type: 'street', nodes: [91, 92, 93] },
        { id: 30, name: 'street24', type: 'street', nodes: [77, 92] },
        { id: 31, name: 'street25', type: 'street', nodes: [93, 94] },
        { id: 32, name: 'street26', type: 'street', nodes: [94, 95, 129] },
        { id: 33, name: 'street27', type: 'street', nodes: [75, 128, 129] },
        { id: 34, name: 'street28', type: 'street', nodes: [95, 96, 97, 98] },
        { id: 35, name: 'street29', type: 'street', nodes: [96, 132, 133] },
        { id: 36, name: 'street30', type: 'street', nodes: [135, 140, 141, 142, 143, 144, 24] },
        { id: 37, name: 'street31', type: 'street', nodes: [99, 25] },
        { id: 38, name: 'street32', type: 'street', nodes: [16, 193, 194, 195, 196, 197] },
        { id: 39, name: 'street33', type: 'street', nodes: [195, 198, 199, 200, 201, 202, 203, 204, 205, 206] },
        { id: 40, name: 'street34', type: 'street', nodes: [204, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 27] },
        { id: 41, name: 'street35', type: 'street', nodes: [47, 181, 180, 179, 178, 177, 176, 153] },
        { id: 42, name: 'street36', type: 'street', nodes: [136, 139, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161] },
        { id: 43, name: 'street37', type: 'street', nodes: [161, 168, 169, 170, 171, 172, 173, 174, 175] },
        { id: 44, name: 'street38', type: 'street', nodes: [50, 182, 183, 184, 185, 186] },
        { id: 45, name: 'street39', type: 'street', nodes: [182, 187, 188] },
        { id: 46, name: 'street40', type: 'street', nodes: [29, 103, 105] },
        { id: 47, name: 'track1', type: 'track', nodes: [54, 57] },
        { id: 48, name: 'track2', type: 'track', nodes: [58, 59, 39] },
        { id: 49, name: 'track3', type: 'track', nodes: [58, 60, 61, 62, 63, 64, 65] },
        { id: 50, name: 'track4', type: 'track', nodes: [41, 65] },
        { id: 51, name: 'track5', type: 'track', nodes: [42, 65] },
        { id: 52, name: 'track6', type: 'track', nodes: [65, 66] },
        { id: 53, name: 'track7', type: 'track', nodes: [161, 162, 163, 164, 165, 166, 167] },
        { id: 54, name: 'track8', type: 'track', nodes: [188, 189, 190, 191, 192] },
    ];

    // Calculate distance
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const formatDistance = (meters) => {
        if (meters < 1000) return `${Math.round(meters)}m`;
        return `${(meters / 1000).toFixed(2)}km`;
    };

    // Dijkstra's algorithm
    const dijkstra = (graph, startNode, endNode) => {
        if (!graph || !startNode || !endNode) {
            return { path: [], distance: Infinity };
        }

        const start = startNode.toString();
        const end = endNode.toString();

        const distances = {};
        const previous = {};
        const nodes = Object.keys(graph);

        nodes.forEach(node => {
            distances[node] = Infinity;
            previous[node] = null;
        });

        if (!distances.hasOwnProperty(start)) {
            return { path: [], distance: Infinity };
        }

        distances[start] = 0;
        const unvisited = new Set(nodes);

        while (unvisited.size > 0) {
            let minNode = null;
            let minDistance = Infinity;

            unvisited.forEach(node => {
                if (distances[node] < minDistance) {
                    minDistance = distances[node];
                    minNode = node;
                }
            });

            if (minNode === null || minDistance === Infinity) break;
            if (minNode === end) break;

            unvisited.delete(minNode);

            const neighbors = graph[minNode] || {};
            Object.keys(neighbors).forEach(neighbor => {
                if (unvisited.has(neighbor)) {
                    const newDistance = distances[minNode] + neighbors[neighbor];
                    if (newDistance < distances[neighbor]) {
                        distances[neighbor] = newDistance;
                        previous[neighbor] = minNode;
                    }
                }
            });
        }

        const path = [];
        let currentNode = end;

        while (currentNode !== null) {
            path.unshift(parseInt(currentNode));
            currentNode = previous[currentNode];
        }

        if (path.length === 0 || path[0] !== parseInt(start)) {
            return { path: [], distance: Infinity };
        }

        return {
            path,
            distance: distances[end]
        };
    };

    // Build graph
    const buildGraph = () => {
        const graph = {};

        NODE_DATA.forEach(node => {
            graph[node.id] = {};
        });

        PATH_DATA.forEach(path => {
            for (let i = 0; i < path.nodes.length - 1; i++) {
                const node1 = path.nodes[i];
                const node2 = path.nodes[i + 1];

                const coord1 = NODE_DATA.find(n => n.id === node1);
                const coord2 = NODE_DATA.find(n => n.id === node2);

                if (coord1 && coord2) {
                    const distance = calculateDistance(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
                    graph[node1][node2] = distance;
                    graph[node2][node1] = distance;
                }
            }
        });

        return graph;
    };

    // Find nearest node
    const findNearestNode = (lat, lng) => {
        let minDistance = Infinity;
        let nearest = null;

        NODE_DATA.forEach(node => {
            const distance = calculateDistance(lat, lng, node.lat, node.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = node.id;
            }
        });

        return nearest;
    };

    // Initialize graph
    useEffect(() => {
        const g = buildGraph();
        setGraph(g);
    }, []);

    // Handle destination from ShopsScreen
    useEffect(() => {
        if (latitude && longitude) {
            console.log('Setting destination:', { latitude, longitude, shopName });

            setDestinationCoords({ lat: latitude, lng: longitude });
            const destNode = findNearestNode(latitude, longitude);
            setDestinationNode(destNode);

            // Wait for map to be ready and then calculate path
            setTimeout(() => {
                if (webViewRef.current && destNode) {
                    calculateAndShowRoute(destNode, latitude, longitude);
                }
            }, 2000);
        }
    }, [latitude, longitude, shopName]);

    // Calculate and show route
    const calculateAndShowRoute = (endNodeId, destLat, destLng) => {
        const result = dijkstra(graph, START_NODE.id, endNodeId);

        if (result.path.length > 1) {
            setShortestPath(result.path);
            setShortestPathDistance(result.distance);

            const jsCode = `
                // Clear existing markers
                if (window.clearRouting) window.clearRouting();
                
                // Set start marker (Node 2)
                if (window.setStartMarker) window.setStartMarker(${START_NODE.lat}, ${START_NODE.lng});
                
                // Add destination marker with shop name
                if (window.createShopIcon) {
                    const destMarker = L.marker([${destLat}, ${destLng}], {
                        icon: window.createShopIcon('${shopName || 'Destination'}')
                    }).addTo(map);
                    destMarker.bindPopup('${shopName || 'Destination'}').openPopup();
                }
                
                // Set destination marker
                if (window.setDestinationMarker) window.setDestinationMarker(${destLat}, ${destLng});
                
                // Draw the shortest path
                if (window.drawShortestPath) window.drawShortestPath(${JSON.stringify(result.path)});
                
                // Fit bounds to show both markers
                const bounds = L.latLngBounds([
                    [${START_NODE.lat}, ${START_NODE.lng}],
                    [${destLat}, ${destLng}]
                ]);
                map.fitBounds(bounds, { padding: [50, 50] });
            `;

            webViewRef.current?.injectJavaScript(jsCode);
        } else {
        }
    };

    // HTML content for WebView with all necessary functions
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        #map { width: 100vw; height: 100vh; }
        
        .start-marker { 
          background: #10b981; 
          border: 1px solid white; 
          border-radius: 50%; 
          width: 10px; 
          height: 10px; 
          box-shadow: 0 0 20px rgba(16,185,129,0.8);
          animation: pulse 1.5s infinite;
        }
        
        .destination-marker { 
          background: #ef4444; 
          border: 1px solid white; 
          border-radius: 50%; 
          width: 10px; 
          height: 10px; 
          box-shadow: 0 0 20px rgba(239,68,68,0.8);
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
          70% { box-shadow: 0 0 0 20px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <script>
        // Data arrays
        const IMPORTANT_POINTS = ${JSON.stringify(IMPORTANT_POINTS)};
        const NODE_DATA = ${JSON.stringify(NODE_DATA)};
        const PATH_DATA = ${JSON.stringify(PATH_DATA)};

        const pathStyles = {
          highway: { color: '#dc2626', weight: 8, opacity: 0.9 },
          mainRoad: { color: '#3b82f6', weight: 5, opacity: 0.85 },
          street: { color: '#10b981', weight: 3, opacity: 0.8 },
          footpath: { color: '#6b7280', weight: 2, opacity: 0.7, dashArray: '5, 5' },
          track: { color: '#b45309', weight: 3, opacity: 0.8, dashArray: '10, 5' },
          shortestPath: { color: '#f59e0b', weight: 6, opacity: 1 }
        };

        // Create map
        const map = L.map('map').setView([21.77, 69.45], 14);

        // Base layers
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles © Esri',
          maxZoom: 19
        });

        // Create shop icon function
        window.createShopIcon = (name) => {
          return L.divIcon({
            className: 'shop-marker',
            iconSize: [36, 56],
            iconAnchor: [18, 56],
            popupAnchor: [0, -56],
          });
        };

        // Create start icon
        const createStartIcon = () => {
          return L.divIcon({
            className: 'start-marker',
            html: '<div class="start-marker"></div>',
            iconAnchor: [14, 14],
          });
        };

        // Create destination icon
        const createDestinationIcon = () => {
          return L.divIcon({
            className: 'destination-marker',
            html: '<div class="destination-marker"></div>',
            iconAnchor: [14, 14],
          });
        };

        // Add Paths
        PATH_DATA.forEach(path => {
          const coordinates = path.nodes.map(id => {
            const node = NODE_DATA.find(n => n.id === id);
            return node ? [node.lat, node.lng] : null;
          }).filter(c => c);
          
          if (coordinates.length > 1) {
            const style = pathStyles[path.type] || pathStyles.street;
            L.polyline(coordinates, style).addTo(map);
          }
        });

        // Routing markers and path
        let startMarker = null;
        let destMarker = null;
        let pathLayer = null;

        window.setStartMarker = (lat, lng) => {
          if (startMarker) map.removeLayer(startMarker);
          startMarker = L.marker([lat, lng], { icon: createStartIcon() }).addTo(map);
          startMarker.bindPopup('Start (Node 2)');
        };

        window.setDestinationMarker = (lat, lng) => {
          if (destMarker) map.removeLayer(destMarker);
          destMarker = L.marker([lat, lng], { icon: createDestinationIcon() }).addTo(map);
          destMarker.bindPopup('Destination');
        };

        window.drawShortestPath = (pathNodes) => {
          if (pathLayer) map.removeLayer(pathLayer);
          const coords = pathNodes.map(id => {
            const node = NODE_DATA.find(n => n.id === id);
            return node ? [node.lat, node.lng] : null;
          }).filter(c => c);
          if (coords.length > 1) {
            pathLayer = L.polyline(coords, pathStyles.shortestPath).addTo(map);
          }
        };

        window.clearRouting = () => {
          if (startMarker) map.removeLayer(startMarker);
          if (destMarker) map.removeLayer(destMarker);
          if (pathLayer) map.removeLayer(pathLayer);
          startMarker = null;
          destMarker = null;
          pathLayer = null;
        };

        window.toggleSatellite = (useSatellite) => {
          if (useSatellite) {
            map.removeLayer(osmLayer);
            map.addLayer(satelliteLayer);
          } else {
            map.removeLayer(satelliteLayer);
            map.addLayer(osmLayer);
          }
        };

        // Signal map ready
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      </script>
    </body>
    </html>
  `;

    // Handle messages from WebView
    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'mapReady') {
                setLoading(false);
                // Auto-calculate route if destination exists
                if (destinationCoords && destinationNode) {
                    setTimeout(() => {
                        calculateAndShowRoute(destinationNode, destinationCoords.lat, destinationCoords.lng);
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };

    const toggleSatelliteView = () => {
        setSatelliteView(!satelliteView);
        webViewRef.current?.injectJavaScript(`
            window.toggleSatellite(${!satelliteView});
        `);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#3b82f6" />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>
                        Navigate to {shopName || 'Destination'}
                    </Text>
                    {destinationCoords && (
                        <Text style={styles.headerSubtitle}>
                            From Node 2 • {formatDistance(calculateDistance(
                                START_NODE.lat, START_NODE.lng,
                                destinationCoords.lat, destinationCoords.lng
                            ))}
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={styles.infoButton}>
                    <Icon name="info" size={24} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Loading map...</Text>
                </View>
            )}

            <WebView
                ref={webViewRef}
                source={{ html: htmlContent }}
                style={styles.webview}
                onMessage={handleMessage}
                onLoad={() => setLoading(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
            />

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
                <TouchableOpacity
                    style={[styles.controlButton, satelliteView && styles.activeButton]}
                    onPress={toggleSatelliteView}
                >
                    <Icon name={satelliteView ? 'map' : 'satellite'} size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Info Panel */}
            {showInfo && (
                <View style={styles.infoPanel}>
                    <ScrollView>
                        <Text style={styles.infoTitle}>📍 Navigation Info</Text>

                        <View style={styles.infoRow}>
                            <Icon name="my-location" size={16} color="#10b981" />
                            <Text style={styles.infoText}>
                                Start: Node 2 ({START_NODE.lat.toFixed(6)}, {START_NODE.lng.toFixed(6)})
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Icon name="location-on" size={16} color="#ef4444" />
                            <Text style={styles.infoText}>
                                Destination: {destinationCoords ?
                                    `${destinationCoords.lat.toFixed(6)}, ${destinationCoords.lng.toFixed(6)}` :
                                    'Loading...'}
                            </Text>
                        </View>

                        {shortestPath.length > 0 && (
                            <View style={styles.pathInfo}>
                                <Text style={styles.pathTitle}>Route Information</Text>
                                <Text style={styles.pathDistance}>
                                    Distance: <Text style={styles.distanceValue}>{formatDistance(shortestPathDistance)}</Text>
                                </Text>
                                <Text style={styles.pathNodes}>
                                    Path: {shortestPath.join(' → ')}
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}
        </SafeAreaView>
    );
};

// StyleSheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        elevation: 3,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
    },
    headerText: {
        flex: 1,
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    infoButton: {
        padding: 8,
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#3b82f6',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 25,
        padding: 5,
        elevation: 5,
        zIndex: 15,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
    },
    activeButton: {
        backgroundColor: '#f59e0b',
    },
    infoPanel: {
        position: 'absolute',
        top: 80,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 15,
        borderRadius: 8,
        maxHeight: 300,
        elevation: 5,
        zIndex: 20,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 14,
        flex: 1,
    },
    pathInfo: {
        backgroundColor: '#fef3c7',
        padding: 10,
        borderRadius: 6,
        marginTop: 8,
    },
    pathTitle: {
        fontWeight: 'bold',
        color: '#92400e',
    },
    pathDistance: {
        marginTop: 4,
    },
    distanceValue: {
        fontWeight: 'bold',
        color: '#f59e0b',
    },
    pathNodes: {
        fontSize: 10,
        marginTop: 4,
    },
});

export default WebViewNavigateMap;