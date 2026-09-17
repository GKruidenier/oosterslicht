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
$ONTVANGER  = 'info@oosterslicht.nl';

// Namens wie de server mailt. Dit MOET een adres op het eigen domein zijn.
// Hetzelfde adres als hierboven gebruiken mag en is de eenvoudigste keuze.
$AFZENDER   = 'info@oosterslicht.nl';

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
$onderwerp  = veld('onderwerp-type');
$bericht    = trim((string)($_POST['bericht'] ?? ''));

// Minimale controle. De browser controleert dit ook al, maar een POST kan
// buiten het formulier om binnenkomen.
$emailOk = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
if ($voornaam === '' || $achternaam === '' || !$emailOk || $bericht === '') {
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
];

$regels = [];
$regels[] = 'Naam        : ' . $voornaam . ' ' . $achternaam;
$regels[] = 'E-mail      : ' . $email;
$regels[] = 'Onderwerp   : ' . ($onderwerp !== '' ? $onderwerp : 'niet opgegeven');
$regels[] = '';

$lampen = $_POST['lamp'] ?? [];
if (is_array($lampen) && $lampen) {
    $n = 0;
    foreach (array_keys($lampen) as $i) {
        $n++;
        $regels[] = '--- Lamp ' . $n . ' ---';
        foreach ($labels as $sleutel => $label) {
            $waarde = $_POST[$sleutel][$i] ?? '';
            if (!is_string($waarde)) continue;
            $waarde = trim(str_replace(["\r", "\n", "\0"], ' ', $waarde));
            if ($waarde === '') continue;
            $regels[] = str_pad($label, 12) . ': ' . $waarde;
        }
        $regels[] = '';
    }
}

$regels[] = '--- Bericht ---';
$regels[] = $bericht;
$regels[] = '';
$regels[] = '---';
$regels[] = 'Verstuurd via het formulier op oosterslicht.nl';
$regels[] = 'Datum: ' . date('d-m-Y H:i');

$body = implode("\n", $regels);

$titel = ($onderwerp === 'bestellen' ? 'Bestelling' : 'Vraag')
       . ' via de website - ' . $voornaam . ' ' . $achternaam;

// Codering expliciet, anders komen accenten en het euroteken verminkt aan.
$headers = [
    'From: OostersLicht website <' . $AFZENDER . '>',
    'Reply-To: ' . $voornaam . ' ' . $achternaam . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'MIME-Version: 1.0',
    'X-Mailer: PHP/' . phpversion(),
];

$verzonden = mail(
    $ONTVANGER,
    '=?UTF-8?B?' . base64_encode($titel) . '?=',
    $body,
    implode("\r\n", $headers),
    '-f' . $AFZENDER
);

header('Location: ' . ($verzonden ? $BEDANKT : $FOUT), true, 303);
exit;
