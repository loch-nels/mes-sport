// ╔══════════════════════════════════════════════════════════════╗
// ║  BASE D'EXERCICES — MES SPORT                                ║
// ║  Poids du corps uniquement. Format circuit chronométré.      ║
// ║  met = MET (Metabolic Equivalent of Task), estimation        ║
// ║  standard pour le calcul de calories — PAS une mesure réelle.║
// ║  Calcul : kcal = met x poids(kg) x duree(heures)              ║
// ╚══════════════════════════════════════════════════════════════╝

const EXERCICES = [
  // ── BAS DU CORPS ──────────────────────────────────────────────
  {id:'squat', nom:'Squats', categorie:'Bas du corps', met:5.0,
   cue:'Pieds largeur épaules, descends comme pour t\'asseoir, dos droit, genoux dans l\'axe des pieds.',
   variante_debutant:'Squat sur chaise (touche l\'assise puis remonte) si l\'amplitude complète est difficile.'},
  {id:'fente', nom:'Fentes alternées', categorie:'Bas du corps', met:4.5,
   cue:'Grand pas en avant, descends jusqu\'à ce que le genou arrière frôle le sol, reviens et alterne.',
   variante_debutant:'Fentes statiques (sans avancer), amplitude réduite.'},
  {id:'hip-thrust', nom:'Pont fessier (hip thrust)', categorie:'Bas du corps', met:3.5,
   cue:'Allongé, pieds à plat, pousse les hanches vers le haut en serrant les fessiers.',
   variante_debutant:'Amplitude réduite, marque une pause courte en haut.'},
  {id:'mollets', nom:'Montées sur la pointe des pieds', categorie:'Bas du corps', met:2.8,
   cue:'Debout, monte sur la pointe des pieds lentement, redescends contrôlé.',
   variante_debutant:'Appui sur un mur ou une chaise pour l\'équilibre.'},
  {id:'squat-sumo', nom:'Squat sumo', categorie:'Bas du corps', met:5.0,
   cue:'Pieds très écartés, pointes vers l\'extérieur, descends en gardant le buste droit.',
   variante_debutant:'Réduis l\'amplitude de descente.'},
  {id:'fente-laterale', nom:'Fentes latérales', categorie:'Bas du corps', met:4.5,
   cue:'Grand pas sur le côté, plie la jambe d\'appui, l\'autre reste tendue.',
   variante_debutant:'Amplitude réduite, vitesse lente.'},

  // ── HAUT DU CORPS ─────────────────────────────────────────────
  {id:'pompe', nom:'Pompes', categorie:'Haut du corps', met:8.0,
   cue:'Mains largeur épaules, corps gainé et aligné, descends poitrine vers le sol.',
   variante_debutant:'Pompes sur les genoux, ou inclinées (mains sur une chaise/canapé).'},
  {id:'dips-chaise', nom:'Dips sur chaise', categorie:'Haut du corps', met:4.5,
   cue:'Mains sur le bord d\'une chaise, jambes tendues devant, descends en pliant les coudes.',
   variante_debutant:'Garde les genoux pliés, jambes plus proches du corps.'},
  {id:'superman', nom:'Superman (extension dorsale)', categorie:'Haut du corps', met:3.0,
   cue:'Allongé sur le ventre, lève bras et jambes en même temps, tiens 1-2 secondes.',
   variante_debutant:'Lève seulement les bras, ou seulement les jambes, en alternance.'},
  {id:'pike-pushup', nom:'Pompes pike (épaules)', categorie:'Haut du corps', met:6.0,
   cue:'Position fessiers en l\'air (V inversé), descends la tête vers le sol entre les mains.',
   variante_debutant:'Réduis l\'amplitude, garde les jambes pliées.'},
  {id:'pompe-diamant', nom:'Pompes diamant', categorie:'Haut du corps', met:8.0,
   cue:'Mains rapprochées sous la poitrine (pouces et index qui se touchent), descends contrôlé.',
   variante_debutant:'Sur les genoux, comme la pompe classique.'},

  // ── CORE / GAINAGE ────────────────────────────────────────────
  {id:'planche', nom:'Planche (gainage)', categorie:'Core', met:3.5,
   cue:'Corps aligné des épaules aux pieds, gaine le ventre et les fessiers, ne creuse pas le dos.',
   variante_debutant:'Planche sur les genoux plutôt que sur les pieds.'},
  {id:'planche-laterale', nom:'Gainage latéral', categorie:'Core', met:3.5,
   cue:'Appui sur un avant-bras, corps aligné sur le côté, hanches ne touchent pas le sol.',
   variante_debutant:'Genou inférieur posé au sol pour plus de stabilité.'},
  {id:'crunch', nom:'Crunchs', categorie:'Core', met:3.8,
   cue:'Allongé, genoux pliés, décolle juste les omoplates en contractant les abdos.',
   variante_debutant:'Amplitude réduite, mouvement lent.'},
  {id:'mountain-climber', nom:'Mountain climbers', categorie:'Core', met:8.0,
   cue:'Position planche, ramène alternativement les genoux vers la poitrine rapidement.',
   variante_debutant:'Ralentis le rythme, garde les hanches stables.'},
  {id:'leve-jambes', nom:'Relevés de jambes', categorie:'Core', met:4.0,
   cue:'Allongé, jambes tendues, lève-les jusqu\'à 90° puis redescends sans toucher le sol.',
   variante_debutant:'Genoux légèrement pliés, amplitude réduite.'},
  {id:'gainage-dynamique', nom:'Planche avec touches d\'épaules', categorie:'Core', met:4.0,
   cue:'En planche haute (sur les mains), touche alternativement l\'épaule opposée avec chaque main.',
   variante_debutant:'Pieds plus écartés pour plus de stabilité.'},

  // ── CARDIO ────────────────────────────────────────────────────
  {id:'jumping-jack', nom:'Jumping jacks', categorie:'Cardio', met:8.0,
   cue:'Saute en écartant bras et jambes, reviens position de départ, rythme régulier.',
   variante_debutant:'Sans saut : alterne pas chassés + bras qui montent.'},
  {id:'burpee', nom:'Burpees', categorie:'Cardio', met:8.0,
   cue:'Squat, pose les mains au sol, jette les pieds en arrière, pompe optionnelle, revient et saute.',
   variante_debutant:'Sans la pompe, sans le saut final — juste la position planche et reviens debout.'},
  {id:'montee-genoux', nom:'Montées de genoux', categorie:'Cardio', met:8.0,
   cue:'Sur place, monte les genoux le plus haut possible, rythme rapide, bras qui accompagnent.',
   variante_debutant:'Ralentis le rythme, amplitude réduite.'},
  {id:'talons-fesses', nom:'Talons-fesses', categorie:'Cardio', met:7.0,
   cue:'Sur place, ramène rapidement les talons vers les fessiers en courant sur place.',
   variante_debutant:'Rythme modéré, sans intensité maximale.'},
  {id:'corde-imaginaire', nom:'Corde à sauter (ou imaginaire)', categorie:'Cardio', met:10.0,
   cue:'Petits sauts réguliers sur la pointe des pieds, avec ou sans corde réelle.',
   variante_debutant:'Sans saut : alterne le poids du corps d\'un pied à l\'autre rapidement.'},
  {id:'skater', nom:'Skaters (fentes latérales sautées)', categorie:'Cardio', met:7.0,
   cue:'Saute latéralement d\'un pied sur l\'autre comme un patineur, garde l\'équilibre à chaque réception.',
   variante_debutant:'Sans saut : grand pas latéral contrôlé d\'un côté à l\'autre.'},
];

// Catégories disponibles, dans l'ordre d'apparition souhaité pour la génération de circuits
const CATEGORIES_ORDRE = ['Cardio', 'Bas du corps', 'Haut du corps', 'Core'];

function getExercice(id) {
  return EXERCICES.find(e => e.id === id);
}

function getExercicesParCategorie(categorie) {
  return EXERCICES.filter(e => e.categorie === categorie);
}