<?php
/**
 * Contactformulier OostersLicht.
 *
 * Verwerkt de inzending van contact.html en mailt hem door. Er komt geen
 * externe dienst aan te pas: de gegevens gaan van de bezoeker naar de server
 * van KeurigOnline in Groningen en daarvandaan naar de eigen mailbox.
 *
 * INSTELLEN — pas deze twee regels aan en het werkt:
 */

// Waar de aanvragen heen gaan. Hier mag elk adres staan, ook een persoonlijk
// adres bij Gmail of Outlook; de mail wordt gewoon daarheen bezorgd.
$ONTVANGER  = 'giadakruidenier@gmail.com';

// Namens wie de server mailt. Dit MOET een adres op het eigen domein zijn.
// Hetzelfde adres als hierboven gebruiken mag en is de eenvoudigste keuze.
$AFZENDER   = 'noreply@oosterslicht.nl';

/*
 * Waarom de afzender geen privéadres mag zijn: de server van KeurigOnline mag
 * alleen mailen namens oosterslicht.nl. Staat hier bijvoorbeeld een adres bij
 * gmail.com, dan doet de server alsof hij Google is, faalt de SPF-controle en
 * belandt de eigen aanvraag in de spammap of wordt hij geweigerd — zonder dat
 * iemand dat merkt, want er komt simpelweg niets binnen.
 *
 * Het adres van de bezoeker staat daarom in Reply-To. Op "Beantwoorden"
 * drukken werkt dus gewoon, ook al is de afzender een eigen adres.
 *
 * Aanvragen liever in een persoonlijke mailbox? Zet dan een doorstuurregel in
 * het klantenpaneel van KeurigOnline, in plaats van hierboven een privéadres
 * in te vullen. Dan blijft alles ook in de domeinmailbox staan.
 */

// Krijgt de bezoeker een bevestiging van zijn eigen aanvraag? Op false
// zetten schakelt hem uit; er verandert verder niets.
$BEVESTIGING = true;

// Het adres dat in die bevestiging staat als iemand wil reageren. Zet hier
// geen noreply-adres neer: dan schrijft iemand met een aanvulling in het
// luchtledige. Het mag hetzelfde adres zijn als $ONTVANGER.
$ANTWOORDADRES = $ONTVANGER;

$BEDANKT = 'bedankt.html';
$FOUT    = 'contact.html?fout=1#formulier';

/* ---------------------------------------------------------------------- */

// Alleen POST. Wie dit bestand in de browser opent, hoort geen formulier te zien.
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: contact.html', true, 303);
    exit;
}

// Honeypot: dit veld is voor mensen onzichtbaar. Ingevuld betekent een bot.
// We doen alsof het gelukt is, zodat de bot niets leert van een foutmelding.
if (trim($_POST['_gotcha'] ?? '') !== '') {
    header('Location: ' . $BEDANKT, true, 303);
    exit;
}

/** Haalt een tekstveld op, ontdaan van regeleindes die headers kunnen vervalsen. */
function veld($naam) {
    $v = $_POST[$naam] ?? '';
    if (!is_string($v)) return '';
    return trim(str_replace(["\r", "\n", "\0"], ' ', $v));
}

$voornaam   = veld('voornaam');
$achternaam = veld('achternaam');
$email      = veld('email');
$soort      = veld('onderwerp-type');
$onderwerp  = veld('onderwerp');
$bericht    = trim((string)($_POST['bericht'] ?? ''));

$bestelling = ($soort === 'bestellen');

// Minimale controle. De browser controleert dit ook al, maar een POST kan
// buiten het formulier om binnenkomen.
//
// Bij een bestelling mogen onderwerp en bericht leeg blijven: het onderwerpveld
// staat er niet eens, en de lampgegevens hieronder zeggen al wat er nodig is.
// Bij een vraag is dit juist alles wat er staat, dus moeten ze allebei gevuld
// zijn.
$emailOk = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
if ($voornaam === '' || $achternaam === '' || !$emailOk
    || (!$bestelling && ($bericht === '' || $onderwerp === ''))) {
    header('Location: ' . $FOUT, true, 303);
    exit;
}

// De lampblokken komen binnen als arrays met dezelfde sleutels, omdat de
// bezoeker er meerdere kan toevoegen: lamp[1], lamp[2], enzovoort.
$labels = [
    'lamp'         => 'Lamp',
    'afmeting'     => 'Afmeting',
    'aantal'       => 'Aantal',
    'houtsoort'    => 'Houtsoort',
    'papier'       => 'Japans papier',
    'blad'         => 'Blad in het papier',
    'tape'         => 'Kleur van de tape',
    'detaillering' => 'Detaillering',
    'beschrijving' => 'Het idee',
];

/* --- Bijlagen ------------------------------------------------------------
 *
 * Bij een lamp volledig op maat mag iemand een schets of een foto van de
 * ruimte meesturen. PHP levert die aan als bestanden[lampnummer][volgnummer],
 * en $_FILES draait die nesting binnenstebuiten: niet één rij per bestand,
 * maar één rij per eigenschap. Deze functie zet het terug naar een lijst van
 * bestanden.
 *
 * Wat er niet door komt: te grote bestanden, een type dat niet in de lijst
 * staat, en alles boven de vijf. Het soort wordt aan de inhoud getoetst en
 * niet aan de naam, want die kan alles beweren.
 */
const BIJLAGE_MAX_BYTES  = 5 * 1024 * 1024;
const BIJLAGE_MAX_AANTAL = 5;

$BIJLAGE_TYPES = [
    'image/jpeg'      => 'jpg',
    'image/png'       => 'png',
    'image/webp'      => 'webp',
    'image/heic'      => 'heic',
    'image/heif'      => 'heif',
    'application/pdf' => 'pdf',
];

/** Platte lijst van geuploade bestanden, hoe diep $_FILES ze ook heeft genest. */
function verzamelUploads($tak) {
    if (!is_array($tak) || !isset($tak['name'])) return [];
    $uit = [];
    $loop = function ($naam, $type, $tmp, $fout, $grootte) use (&$loop, &$uit) {
        if (is_array($naam)) {
            foreach ($naam as $k => $_) {
                $loop($naam[$k], $type[$k] ?? '', $tmp[$k] ?? '',
                      $fout[$k] ?? UPLOAD_ERR_NO_FILE, $grootte[$k] ?? 0);
            }
            return;
        }
        $uit[] = ['name' => $naam, 'type' => $type, 'tmp_name' => $tmp,
                  'error' => $fout, 'size' => $grootte];
    };
    $loop($tak['name'], $tak['type'] ?? '', $tak['tmp_name'] ?? '',
          $tak['error'] ?? UPLOAD_ERR_NO_FILE, $tak['size'] ?? 0);
    return $uit;
}

$bijlagen = [];
$bijlagenGeweigerd = [];

foreach (verzamelUploads($_FILES['bestanden'] ?? null) as $bestand) {
    if ($bestand['error'] === UPLOAD_ERR_NO_FILE) continue;

    $naam = basename((string)$bestand['name']);
    $naam = preg_replace('/[^A-Za-z0-9._ -]/', '_', $naam);
    if ($naam === '' || $naam === null) $naam = 'bijlage';

    if ($bestand['error'] !== UPLOAD_ERR_OK) {
        $bijlagenGeweigerd[] = $naam . ' (uploaden mislukt)';
        continue;
    }
    if (!is_uploaded_file($bestand['tmp_name'])) {
        $bijlagenGeweigerd[] = $naam . ' (geen geldige upload)';
        continue;
    }
    if ($bestand['size'] > BIJLAGE_MAX_BYTES) {
        $bijlagenGeweigerd[] = $naam . ' (groter dan 5 MB)';
        continue;
    }
    if (count($bijlagen) >= BIJLAGE_MAX_AANTAL) {
        $bijlagenGeweigerd[] = $naam . ' (meer dan vijf bestanden)';
        continue;
    }

    // Het soort uit de inhoud halen, niet uit de bestandsnaam.
    $soort = '';
    if (function_exists('finfo_open')) {
        $fi = finfo_open(FILEINFO_MIME_TYPE);
        if ($fi) {
            $soort = (string)finfo_file($fi, $bestand['tmp_name']);
            finfo_close($fi);
        }
    }
    if ($soort === '' || !isset($BIJLAGE_TYPES[$soort])) {
        $bijlagenGeweigerd[] = $naam . ' (bestandstype niet toegestaan)';
        continue;
    }

    $inhoud = file_get_contents($bestand['tmp_name']);
    if ($inhoud === false) {
        $bijlagenGeweigerd[] = $naam . ' (kon niet gelezen worden)';
        continue;
    }

    $bijlagen[] = ['naam' => $naam, 'soort' => $soort, 'inhoud' => $inhoud];
}

$regels = [];
$regels[] = 'Naam        : ' . $voornaam . ' ' . $achternaam;
$regels[] = 'E-mail      : ' . $email;
$regels[] = 'Soort       : ' . ($bestelling ? 'bestelling' : 'vraag');
// Het onderwerpveld werd hiervoor helemaal niet gelezen: wat iemand daar
// intikte verdween. Bij een bestelling staat het veld er niet meer.
if ($onderwerp !== '') {
    $regels[] = 'Onderwerp   : ' . $onderwerp;
}
$regels[] = '';

// Alleen bij een bestelling. Bij een vraag staat het lampblok in de pagina
// verborgen, maar de velden zitten nog wel in het formulier en worden dus
// meegestuurd — inclusief de standaard "1" bij Aantal. Zonder deze controle
// komt er bij elke vraag een zinloos "Lamp 1" in de mail te staan.
$lampen = $bestelling ? ($_POST['lamp'] ?? []) : [];
if (is_array($lampen) && $lampen) {
    $n = 0;
    foreach (array_keys($lampen) as $i) {
        $n++;
        $regels[] = '--- Lamp ' . $n . ' ---';
        foreach ($labels as $sleutel => $label) {
            $waarde = $_POST[$sleutel][$i] ?? '';
            if (!is_string($waarde)) continue;
            // Een beschrijving mag meerdere regels beslaan: die komt in de body
            // terecht en niet in een header, dus hoeven de regeleindes er niet
            // uit. Alleen het nulbyte moet altijd weg.
            $meerregelig = ($sleutel === 'beschrijving' || $sleutel === 'detaillering');
            $waarde = str_replace("\0", '', $waarde);
            if (!$meerregelig) {
                $waarde = str_replace(["\r", "\n"], ' ', $waarde);
            } else {
                $waarde = str_replace("\r\n", "\n", $waarde);
            }
            $waarde = trim($waarde);
            if ($waarde === '') continue;
            if ($meerregelig && strpos($waarde, "\n") !== false) {
                $regels[] = $label . ':';
                $regels[] = $waarde;
            } else {
                $regels[] = str_pad($label, 12) . ': ' . $waarde;
            }
        }
        $regels[] = '';
    }
}

if ($bijlagen) {
    $regels[] = '--- Bijlagen ---';
    foreach ($bijlagen as $b) {
        $regels[] = $b['naam'];
    }
    $regels[] = '';
}
if ($bijlagenGeweigerd) {
    $regels[] = '--- Niet meegestuurd ---';
    foreach ($bijlagenGeweigerd as $r) {
        $regels[] = $r;
    }
    $regels[] = '';
}

if ($bericht !== '') {
    $regels[] = '--- Bericht ---';
    $regels[] = $bericht;
    $regels[] = '';
}
$regels[] = '---';
$regels[] = 'Verstuurd via het formulier op oosterslicht.nl';
$regels[] = 'Datum: ' . date('d-m-Y H:i');

$body = implode("\n", $regels);

// De platte versie apart houden: hieronder wordt $body bij bijlagen
// omgebouwd tot een multipart-bericht, en die vorm is onbruikbaar voor
// de bevestiging aan de bezoeker.
$samenvatting = $body;

$titel = ($bestelling ? 'Bestelling' : 'Vraag')
       . ' via de website - ' . $voornaam . ' ' . $achternaam;

// Codering expliciet, anders komen accenten en het euroteken verminkt aan.
$headers = [
    'From: OostersLicht website <' . $AFZENDER . '>',
    'Reply-To: ' . $voornaam . ' ' . $achternaam . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'X-Mailer: PHP/' . phpversion(),
];

/* Zonder bijlagen blijft het bericht wat het altijd was: platte tekst. Pas
   wanneer er een schets of foto bij zit wordt het een multipart-bericht, met
   de tekst als eerste deel en elk bestand daarachter. Base64 omdat een mail
   geen ruwe bytes verdraagt, in regels van 76 tekens zoals de standaard
   voorschrijft. */
if ($bijlagen) {
    $grens = 'oosterslicht-' . bin2hex(random_bytes(16));

    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $grens . '"';

    $delen = [];
    $delen[] = '--' . $grens;
    $delen[] = 'Content-Type: text/plain; charset=UTF-8';
    $delen[] = 'Content-Transfer-Encoding: 8bit';
    $delen[] = '';
    $delen[] = $body;

    foreach ($bijlagen as $b) {
        $delen[] = '--' . $grens;
        $delen[] = 'Content-Type: ' . $b['soort'] . '; name="' . $b['naam'] . '"';
        $delen[] = 'Content-Transfer-Encoding: base64';
        $delen[] = 'Content-Disposition: attachment; filename="' . $b['naam'] . '"';
        $delen[] = '';
        $delen[] = chunk_split(base64_encode($b['inhoud']), 76, "\r\n");
    }

    $delen[] = '--' . $grens . '--';
    $body = implode("\r\n", $delen);
} else {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: 8bit';
}

$verzonden = mail(
    $ONTVANGER,
    '=?UTF-8?B?' . base64_encode($titel) . '?=',
    $body,
    implode("\r\n", $headers),
    '-f' . $AFZENDER
);

/* --- Bevestiging aan de bezoeker ---------------------------------------
 *
 * Alleen versturen als de aanvraag zelf is aangenomen. Een bevestiging van
 * iets dat nooit is aangekomen is erger dan helemaal geen bevestiging.
 *
 * Mislukt deze mail wel, dan merkt de bezoeker daar niets van en gaat hij
 * gewoon naar de bedankpagina. Zijn aanvraag ligt er immers; hem een fout
 * voorschotelen zou hem laten denken dat er niets verstuurd is.
 *
 * Auto-Submitted vertelt mailservers dat dit een automatisch antwoord is,
 * zodat een afwezigheidsmelding aan de andere kant geen pingpong begint.
 */
if ($BEVESTIGING && $verzonden) {
    $bregels = [];
    $bregels[] = 'Dag ' . $voornaam . ',';
    $bregels[] = '';
    $bregels[] = $bestelling
        ? 'Dank voor je bestelling. Hij is goed aangekomen en ik neem zo snel'
        : 'Dank voor je bericht. Het is goed aangekomen en ik laat zo snel';
    $bregels[] = $bestelling
        ? 'mogelijk contact met je op.'
        : 'mogelijk van me horen.';
    $bregels[] = '';
    $bregels[] = 'Hieronder staat wat je hebt ingestuurd, zodat je het kunt nalezen.';
    $bregels[] = 'Klopt er iets niet, of wil je iets aanvullen? Antwoord dan op deze';
    $bregels[] = 'mail, of schrijf naar ' . $ANTWOORDADRES . '.';
    $bregels[] = '';
    $bregels[] = str_repeat('-', 62);
    $bregels[] = '';
    $bregels[] = $samenvatting;
    $bregels[] = '';
    $bregels[] = 'Hartelijke groet,';
    $bregels[] = 'OostersLicht';

    $btitel = $bestelling
        ? 'Je bestelling bij OostersLicht'
        : 'Je bericht aan OostersLicht';

    $bheaders = [
        'From: OostersLicht <' . $AFZENDER . '>',
        'Reply-To: ' . $ANTWOORDADRES,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'Auto-Submitted: auto-replied',
        'X-Auto-Response-Suppress: All',
    ];

    mail(
        $email,
        '=?UTF-8?B?' . base64_encode($btitel) . '?=',
        implode("\n", $bregels),
        implode("\r\n", $bheaders),
        '-f' . $AFZENDER
    );
}

header('Location: ' . ($verzonden ? $BEDANKT : $FOUT), true, 303);
exit;
