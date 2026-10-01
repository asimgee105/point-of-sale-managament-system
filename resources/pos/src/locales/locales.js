import moment from 'moment';

moment.locale("fr", {
    months: "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split(
        "_"
    ),
    monthsShort:
        "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split(
            "_"
        ),
    monthsParseExact: true,
    weekdays: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
    weekdaysShort: "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
    weekdaysMin: "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
    weekdaysParseExact: true,
    longDateFormat: {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "DD/MM/YYYY",
        LL: "D MMMM YYYY",
        LLL: "D MMMM YYYY HH:mm",
        LLLL: "dddd D MMMM YYYY HH:mm",
    },
    calendar: {
        sameDay: "[Aujourd’hui à] LT",
        nextDay: "[Demain à] LT",
        nextWeek: "dddd [à] LT",
        lastDay: "[Hier à] LT",
        lastWeek: "dddd [dernier à] LT",
        sameElse: "L",
    },
    relativeTime: {
        future: "dans %s",
        past: "il y a %s",
        s: "quelques secondes",
        m: "une minute",
        mm: "%d minutes",
        h: "une heure",
        hh: "%d heures",
        d: "un jour",
        dd: "%d jours",
        M: "un mois",
        MM: "%d mois",
        y: "un an",
        yy: "%d ans",
    },
    dayOfMonthOrdinalParse: /\d{1,2}(er|e)/,
    ordinal: function (number) {
        return number + (number === 1 ? "er" : "e");
    },
    meridiemParse: /PD|MD/,
    isPM: function (input) {
        return input.charAt(0) === "M";
    },
    // In case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example).
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */ ;
    // },
    meridiem: function (hours, minutes, isLower) {
        return hours < 12 ? "PD" : "MD";
    },
    week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4, // Used to determine first week of the year.
    },
});

moment.locale("gr", {
    months: "Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split(
        "_"
    ),
    monthsShort:
        "Jan._Feb._März_Apr._Mai_Juni_Juli_Aug._Sept._Okt._Nov._Dez.".split(
            "_"
        ),
    monthsParseExact: true,
    weekdays:
        "Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split(
            "_"
        ),
    weekdaysShort: "So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),
    weekdaysMin: "So_Mo_Di_Mi_Do_Fr_Sa".split("_"),
    weekdaysParseExact: true,
    longDateFormat: {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "DD.MM.YYYY",
        LL: "D. MMMM YYYY",
        LLL: "D. MMMM YYYY HH:mm",
        LLLL: "dddd, D. MMMM YYYY HH:mm",
    },
    calendar: {
        sameDay: "[Heute um] LT",
        nextDay: "[Morgen um] LT",
        nextWeek: "dddd [um] LT",
        lastDay: "[Gestern um] LT",
        lastWeek: "[Letzten] dddd [um] LT",
        sameElse: "L",
    },
    relativeTime: {
        future: "in %s",
        past: "vor %s",
        s: "ein paar Sekunden",
        m: "eine Minute",
        mm: "%d Minuten",
        h: "eine Stunde",
        hh: "%d Stunden",
        d: "ein Tag",
        dd: "%d Tage",
        M: "ein Monat",
        MM: "%d Monate",
        y: "ein Jahr",
        yy: "%d Jahre",
    },
    dayOfMonthOrdinalParse: /\d{1,2}\./,
    ordinal: function (number) {
        return number + ".";
    },
    meridiemParse: /AM|PM/,
    isPM: function (input) {
        return input === "PM";
    },
    meridiem: function (hours, minutes, isLower) {
        return hours < 12 ? "AM" : "PM";
    },
    week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4, // Used to determine first week of the year.
    },
});

moment.locale("sp", {
    months: "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split(
        "_"
    ),
    monthsShort: "ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_"),
    monthsParseExact: true,
    weekdays: "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),
    weekdaysShort: "dom._lun._mar._mié._jue._vie._sáb.".split("_"),
    weekdaysMin: "do_lu_ma_mi_ju_vi_sá".split("_"),
    weekdaysParseExact: true,
    longDateFormat: {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "DD/MM/YYYY",
        LL: "D [de] MMMM [de] YYYY",
        LLL: "D [de] MMMM [de] YYYY HH:mm",
        LLLL: "dddd, D [de] MMMM [de] YYYY HH:mm",
    },
    calendar: {
        sameDay: "[Hoy a las] LT",
        nextDay: "[Mañana a las] LT",
        nextWeek: "dddd [a las] LT",
        lastDay: "[Ayer a las] LT",
        lastWeek: "[El] dddd [pasado a las] LT",
        sameElse: "L",
    },
    relativeTime: {
        future: "en %s",
        past: "hace %s",
        s: "unos segundos",
        m: "un minuto",
        mm: "%d minutos",
        h: "una hora",
        hh: "%d horas",
        d: "un día",
        dd: "%d días",
        M: "un mes",
        MM: "%d meses",
        y: "un año",
        yy: "%d años",
    },
    dayOfMonthOrdinalParse: /\d{1,2}º/,
    ordinal: "%dº",
    meridiemParse: /AM|PM/,
    isPM: function (input) {
        return input === "PM";
    },
    meridiem: function (hours, minutes, isLower) {
        return hours < 12 ? "AM" : "PM";
    },
    week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4, // Used to determine first week of the year.
    },
});

moment.locale("tr", {
    months: "Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık".split(
        "_"
    ),
    monthsShort: "Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara".split("_"),
    monthsParseExact: true,
    weekdays: "Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi".split(
        "_"
    ),
    weekdaysShort: "Paz_Pts_Sal_Çar_Per_Cum_Cts".split("_"),
    weekdaysMin: "Pz_Pt_Sa_Ça_Pe_Cu_Ct".split("_"),
    weekdaysParseExact: true,
    longDateFormat: {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "DD/MM/YYYY",
        LL: "D MMMM YYYY",
        LLL: "D MMMM YYYY HH:mm",
        LLLL: "dddd, D MMMM YYYY HH:mm",
    },
    calendar: {
        sameDay: "[Bugün saat] LT",
        nextDay: "[Yarın saat] LT",
        nextWeek: "[Next] dddd [saat] LT",
        lastDay: "[Dün saat] LT",
        lastWeek: "[Geçen] dddd [saat] LT",
        sameElse: "L",
    },
    relativeTime: {
        future: "%s içinde",
        past: "%s önce",
        s: "birkaç saniye",
        m: "bir dakika",
        mm: "%d dakika",
        h: "bir saat",
        hh: "%d saat",
        d: "bir gün",
        dd: "%d gün",
        M: "bir ay",
        MM: "%d ay",
        y: "bir yıl",
        yy: "%d yıl",
    },
    dayOfMonthOrdinalParse: /\d{1,2}'(inci|nci|üncü|ncı|uncu|ncı)/,
    ordinal: function (number) {
        var a = number % 10,
            b = (number % 100) - a,
            c = number >= 100 ? 100 : null;
        return (
            (a === 0 || a === 1 || ((a === 8 || a === 9) && b !== 10)
                ? number + "'inci"
                : number + "'nci") + (c ? " yüzyıl" : "")
        );
    },
    meridiemParse: /AM|PM/,
    isPM: function (input) {
        return input === "PM";
    },
    meridiem: function (hours, minutes, isLower) {
        return hours < 12 ? "AM" : "PM";
    },
    week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4, // Used to determine first week of the year.
    },
});

moment.locale("cn", {
    months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split(
        "_"
    ),
    monthsShort: "一_二_三_四_五_六_七_八_九_十_十一_十二".split("_"),
    monthsParseExact: true,
    weekdays: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
    weekdaysShort: "周日_周一_周二_周三_周四_周五_周六".split("_"),
    weekdaysMin: "日_一_二_三_四_五_六".split("_"),
    weekdaysParseExact: true,
    longDateFormat: {
        LT: "HH:mm",
        LTS: "HH:mm:ss",
        L: "YYYY年MM月DD日",
        LL: "YYYY年M月D日",
        LLL: "YYYY年M月D日 HH:mm",
        LLLL: "YYYY年M月D日 dddd HH:mm",
    },
    calendar: {
        sameDay: "[今天] LT",
        nextDay: "[明天] LT",
        nextWeek: "dddd LT",
        lastDay: "[昨天] LT",
        lastWeek: "[上]dddd LT",
        sameElse: "L",
    },
    relativeTime: {
        future: "%s后",
        past: "%s前",
        s: "几秒",
        m: "1 分钟",
        mm: "%d 分钟",
        h: "1 小时",
        hh: "%d 小时",
        d: "1 天",
        dd: "%d 天",
        M: "1 个月",
        MM: "%d 个月",
        y: "1 年",
        yy: "%d 年",
    },
    dayOfMonthOrdinalParse: /\d{1,2}(日|月|年)/,
    ordinal: function (number, period) {
        switch (period) {
            case "d":
            case "D":
            case "DDD":
                return number + "日";
            case "M":
                return number + "月";
            case "y":
            case "Y":
                return number + "年";
            default:
                return number;
        }
    },
    meridiemParse: /上午|下午/,
    isPM: function (input) {
        return input === "下午";
    },
    meridiem: function (hours, minutes, isLower) {
        return hours < 12 ? "上午" : "下午";
    },
    week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4, // Used to determine first week of the year.
    },
});

moment.locale("ne", {
    months: "बैशाख_जेठ_असार_श्रावण_भदौ_असोज_कार्तिक_मंसिर_पौष_माघ_फाल्गुन_चैत्र".split("_"),
    monthsShort: "बै._जे._अ._श्रा._भ._अ._का._मं._पौ._मा._फा._चै.".split("_"),
    monthsParseExact: true,
    weekdays: "आइतबार_सोमबार_मङ्गलबार_बुधबार_बिहिबार_शुक्रबार_शनिबार".split("_"),
    weekdaysShort: "आइ._सो._मङ्._बु._बि._शु._श".split("_"),
    weekdaysMin: "आ._सो._मं._बु._बि._शु._श".split("_"),
    weekdaysParseExact: true,
    longDateFormat: {
        LT: "Aको h:mm बजे",
        LTS: "Aको h:mm:ss बजे",
        L: "DD/MM/YYYY",
        LL: "D MMMM YYYY",
        LLL: "D MMMM YYYY, Aको h:mm बजे",
        LLLL: "dddd, D MMMM YYYY, Aको h:mm बजे",
    },
    calendar: {
        sameDay: "[आज] LT",
        nextDay: "[भोलि] LT",
        nextWeek: "dddd[,] LT",
        lastDay: "[हिजो] LT",
        lastWeek: "[गएको] dddd[,] LT",
        sameElse: "L",
    },
    relativeTime: {
        future: "%s पछि",
        past: "%s अघि",
        s: "केही समय",
        m: "एक मिनेट",
        mm: "%d मिनेट",
        h: "एक घण्टा",
        hh: "%d घण्टा",
        d: "एक दिन",
        dd: "%d दिन",
        M: "एक महिना",
        MM: "%d महिना",
        y: "एक वर्ष",
        yy: "%d वर्ष",
    },
    week: {
        dow: 0, // Sunday is the first day of the week.
        doy: 6, // The week that contains Jan 6th is the first week of the year.
    },
});